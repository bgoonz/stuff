<?php

namespace MediaWiki\Extension\AbuseFilter;

use BadMethodCallException;
use DeferredUpdates;
use IBufferingStatsdDataFactory;
use InvalidArgumentException;
use MediaWiki\Config\ServiceOptions;
use MediaWiki\Extension\AbuseFilter\ChangeTags\ChangeTagger;
use MediaWiki\Extension\AbuseFilter\Consequences\ConsequencesExecutorFactory;
use MediaWiki\Extension\AbuseFilter\Filter\ExistingFilter;
use MediaWiki\Extension\AbuseFilter\Hooks\AbuseFilterHookRunner;
use MediaWiki\Extension\AbuseFilter\Parser\AbuseFilterCachingParser;
use MediaWiki\Extension\AbuseFilter\Parser\ParserFactory;
// phpcs:ignore MediaWiki.Classes.UnusedUseStatement.UnusedUse
use MediaWiki\Extension\AbuseFilter\Parser\ParserStatus;
use MediaWiki\Extension\AbuseFilter\VariableGenerator\VariableGeneratorFactory;
use MediaWiki\Extension\AbuseFilter\Variables\LazyVariableComputer;
use MediaWiki\Extension\AbuseFilter\Variables\VariableHolder;
use MediaWiki\Extension\AbuseFilter\Variables\VariablesManager;
use MediaWiki\Extension\AbuseFilter\Watcher\Watcher;
use Psr\Log\LoggerInterface;
use Status;
use Title;
use User;

/**
 * This class contains the logic for executing abuse filters and their actions. The entry points are
 * run() and runForStash(). Note that run() can only be executed once on a given instance.
 * @internal Not stable yet
 */
class FilterRunner {
	public const CONSTRUCTOR_OPTIONS = [
		'AbuseFilterValidGroups',
		'AbuseFilterCentralDB',
		'AbuseFilterIsCentral',
		'AbuseFilterConditionLimit',
	];

	/** @var AbuseFilterHookRunner */
	private $hookRunner;
	/** @var FilterProfiler */
	private $filterProfiler;
	/** @var ChangeTagger */
	private $changeTagger;
	/** @var FilterLookup */
	private $filterLookup;
	/** @var ParserFactory */
	private $parserFactory;
	/** @var ConsequencesExecutorFactory */
	private $consExecutorFactory;
	/** @var AbuseLoggerFactory */
	private $abuseLoggerFactory;
	/** @var EmergencyCache */
	private $emergencyCache;
	/** @var Watcher[] */
	private $watchers;
	/** @var EditStashCache */
	private $stashCache;
	/** @var LoggerInterface */
	private $logger;
	/** @var IBufferingStatsdDataFactory */
	private $statsdDataFactory;
	/** @var VariablesManager */
	private $varManager;
	/** @var VariableGeneratorFactory */
	private $varGeneratorFactory;
	/** @var ServiceOptions */
	private $options;

	/**
	 * @var AbuseFilterCachingParser
	 * @private Temporarily public for BC
	 */
	public $parser;

	/**
	 * @var User The user who performed the action being filtered
	 */
	protected $user;
	/**
	 * @var Title The title where the action being filtered was performed
	 */
	protected $title;
	/**
	 * @var VariableHolder The variables for the current action
	 */
	protected $vars;
	/**
	 * @var string The group of filters to check (as defined in $wgAbuseFilterValidGroups)
	 */
	protected $group;
	/**
	 * @var string The action we're filtering
	 */
	protected $action;

	/**
	 * @param AbuseFilterHookRunner $hookRunner
	 * @param FilterProfiler $filterProfiler
	 * @param ChangeTagger $changeTagger
	 * @param FilterLookup $filterLookup
	 * @param ParserFactory $parserFactory
	 * @param ConsequencesExecutorFactory $consExecutorFactory
	 * @param AbuseLoggerFactory $abuseLoggerFactory
	 * @param VariablesManager $varManager
	 * @param VariableGeneratorFactory $varGeneratorFactory
	 * @param EmergencyCache $emergencyCache
	 * @param Watcher[] $watchers
	 * @param EditStashCache $stashCache
	 * @param LoggerInterface $logger
	 * @param IBufferingStatsdDataFactory $statsdDataFactory
	 * @param ServiceOptions $options
	 * @param User $user
	 * @param Title $title
	 * @param VariableHolder $vars
	 * @param string $group
	 * @throws InvalidArgumentException If $group is invalid or the 'action' variable is unset
	 */
	public function __construct(
		AbuseFilterHookRunner $hookRunner,
		FilterProfiler $filterProfiler,
		ChangeTagger $changeTagger,
		FilterLookup $filterLookup,
		ParserFactory $parserFactory,
		ConsequencesExecutorFactory $consExecutorFactory,
		AbuseLoggerFactory $abuseLoggerFactory,
		VariablesManager $varManager,
		VariableGeneratorFactory $varGeneratorFactory,
		EmergencyCache $emergencyCache,
		array $watchers,
		EditStashCache $stashCache,
		LoggerInterface $logger,
		IBufferingStatsdDataFactory $statsdDataFactory,
		ServiceOptions $options,
		User $user,
		Title $title,
		VariableHolder $vars,
		string $group
	) {
		$this->hookRunner = $hookRunner;
		$this->filterProfiler = $filterProfiler;
		$this->changeTagger = $changeTagger;
		$this->filterLookup = $filterLookup;
		$this->parserFactory = $parserFactory;
		$this->consExecutorFactory = $consExecutorFactory;
		$this->abuseLoggerFactory = $abuseLoggerFactory;
		$this->varManager = $varManager;
		$this->varGeneratorFactory = $varGeneratorFactory;
		$this->emergencyCache = $emergencyCache;
		$this->watchers = $watchers;
		$this->stashCache = $stashCache;
		$this->logger = $logger;
		$this->statsdDataFactory = $statsdDataFactory;

		$options->assertRequiredOptions( self::CONSTRUCTOR_OPTIONS );
		if ( !in_array( $group, $options->get( 'AbuseFilterValidGroups' ), true ) ) {
			throw new InvalidArgumentException( "Group $group is not a valid group" );
		}
		$this->options = $options;
		if ( !$vars->varIsSet( 'action' ) ) {
			throw new InvalidArgumentException( "The 'action' variable is not set." );
		}
		$this->user = $user;
		$this->title = $title;
		$this->vars = $vars;
		$this->group = $group;
		$this->action = $vars->getComputedVariable( 'action' )->toString();
	}

	/**
	 * Inits variables and parser right before running
	 */
	private function init() {
		// Add vars from extensions
		$this->hookRunner->onAbuseFilter_filterAction(
			$this->vars,
			$this->title
		);
		$this->hookRunner->onAbuseFilterAlterVariables(
			$this->vars,
			$this->title,
			$this->user
		);
		$generator = $this->varGeneratorFactory->newGenerator( $this->vars );
		$this->vars = $generator->addGenericVars()->getVariableHolder();

		$this->vars->forFilter = true;
		$this->vars->setVar( 'timestamp', (int)wfTimestamp( TS_UNIX ) );
		$this->parser = $this->parserFactory->newParser( $this->vars );
		$this->parser->setStatsd( $this->statsdDataFactory );
	}

	/**
	 * The main entry point of this class. This method runs all filters and takes their consequences.
	 *
	 * @param bool $allowStash Whether we are allowed to check the cache to see if there's a cached
	 *  result of a previous execution for the same edit.
	 * @throws BadMethodCallException If run() was already called on this instance
	 * @return Status Good if no action has been taken, a fatal otherwise.
	 */
	public function run( $allowStash = true ): Status {
		$this->init();

		$skipReasons = [];
		$shouldFilter = $this->hookRunner->onAbuseFilterShouldFilterAction(
			$this->vars, $this->title, $this->user, $skipReasons
		);
		if ( !$shouldFilter ) {
			$this->logger->info(
				'Skipping action {action}. Reasons provided: {reasons}',
				[ 'action' => $this->action, 'reasons' => implode( ', ', $skipReasons ) ]
			);
			return Status::newGood();
		}

		$useStash = $allowStash && $this->action === 'edit';

		$runnerData = null;
		if ( $useStash ) {
			$cacheData = $this->stashCache->seek( $this->vars );
			if ( $cacheData !== false ) {
				// Use cached vars (T176291) and profiling data (T191430)
				$this->vars = VariableHolder::newFromArray( $cacheData['vars'] );
				$runnerData = RunnerData::fromArray( $cacheData['data'] );
			}
		}

		if ( $runnerData === null ) {
			$runnerData = $this->checkAllFiltersInternal();
		}

		// hack until DI for DeferredUpdates is possible (T265749)
		if ( defined( 'MW_PHPUNIT_TEST' ) ) {
			$this->profileExecution( $runnerData );
			$this->updateEmergencyCache( $runnerData->getMatchesMap() );
		} else {
			DeferredUpdates::addCallableUpdate( function () use ( $runnerData ) {
				$this->profileExecution( $runnerData );
				$this->updateEmergencyCache( $runnerData->getMatchesMap() );
			} );
		}

		// Tag the action if the condition limit was hit
		if ( $runnerData->getTotalConditions() > $this->options->get( 'AbuseFilterConditionLimit' ) ) {
			$this->changeTagger->addConditionsLimitTag( $this->getSpecsForTagger() );
		}

		$matchedFilters = $runnerData->getMatchedFilters();

		if ( count( $matchedFilters ) === 0 ) {
			return Status::newGood();
		}

		$executor = $this->consExecutorFactory->newExecutor(
			$this->user,
			$this->title,
			$this->vars
		);
		$status = $executor->executeFilterActions( $matchedFilters );
		$actionsTaken = $status->getValue();

		// Note, it's important that we create an AbuseLogger now, after all lazy-loaded variables
		// requested by active filters have been computed
		$abuseLogger = $this->abuseLoggerFactory->newLogger( $this->title, $this->user, $this->vars );
		[
			'local' => $loggedLocalFilters,
			'global' => $loggedGlobalFilters
		] = $abuseLogger->addLogEntries( $actionsTaken );

		foreach ( $this->watchers as $watcher ) {
			$watcher->run( $loggedLocalFilters, $loggedGlobalFilters, $this->group );
		}

		return $status;
	}

	/**
	 * Similar to run(), but runs in "stash" mode, which means filters are executed, no actions are
	 *  taken, and the result is saved in cache to be later reused. This can only be used for edits,
	 *  and not doing so will throw.
	 *
	 * @throws InvalidArgumentException
	 * @return Status Always a good status, since we're only saving data.
	 */
	public function runForStash(): Status {
		if ( $this->action !== 'edit' ) {
			throw new InvalidArgumentException(
				__METHOD__ . " can only be called for edits, called for action {$this->action}."
			);
		}

		$this->init();

		$skipReasons = [];
		$shouldFilter = $this->hookRunner->onAbuseFilterShouldFilterAction(
			$this->vars, $this->title, $this->user, $skipReasons
		);
		if ( !$shouldFilter ) {
			// Don't log it yet
			return Status::newGood();
		}

		// XXX: We need a copy here because the cache key is computed
		// from the variables, but some variables can be loaded lazily
		// which would store the data with a key distinct from that
		// computed by seek() in ::run().
		// TODO: Find better way to generate the cache key.
		$origVars = clone $this->vars;

		$runnerData = $this->checkAllFiltersInternal();
		// Save the filter stash result and do nothing further
		$cacheData = [
			'vars' => $this->varManager->dumpAllVars( $this->vars ),
			'data' => $runnerData->toArray(),
		];

		$this->stashCache->store( $origVars, $cacheData );

		return Status::newGood();
	}

	/**
	 * Run all filters and return information about matches and profiling
	 *
	 * @return RunnerData
	 */
	protected function checkAllFiltersInternal(): RunnerData {
		// Ensure that we start fresh, see T193374
		$this->parser->resetCondCount();
		// Ensure there's no extra time leftover
		LazyVariableComputer::$profilingExtraTime = 0;

		$data = new RunnerData();

		foreach ( $this->filterLookup->getAllActiveFiltersInGroup( $this->group, false ) as $filter ) {
			[ $status, $profiling ] = $this->checkFilter( $filter );
			$data->record( $filter->getID(), false, $status, $profiling );
		}

		if ( $this->options->get( 'AbuseFilterCentralDB' ) && !$this->options->get( 'AbuseFilterIsCentral' ) ) {
			foreach ( $this->filterLookup->getAllActiveFiltersInGroup( $this->group, true ) as $filter ) {
				[ $status, $profiling ] = $this->checkFilter( $filter, true );
				$data->record( $filter->getID(), true, $status, $profiling );
			}
		}

		return $data;
	}

	/**
	 * Returns an associative array of filters which were tripped
	 *
	 * @protected Public for back compat only; this will actually be made protected in the future.
	 * @return bool[] Map of (filter ID => bool)
	 */
	public function checkAllFilters(): array {
		return $this->checkAllFiltersInternal()->getMatchesMap();
	}

	/**
	 * Check the conditions of a single filter, and profile it
	 *
	 * @param ExistingFilter $filter
	 * @param bool $global
	 * @return array
	 * @phan-return array{0:ParserStatus,1:array{time:float,conds:int}}
	 */
	protected function checkFilter( ExistingFilter $filter, bool $global = false ): array {
		$filterName = GlobalNameUtils::buildGlobalName( $filter->getID(), $global );

		$startConds = $this->parser->getCondCount();
		$startTime = microtime( true );
		$origExtraTime = LazyVariableComputer::$profilingExtraTime;

		$this->parser->setFilter( $filterName );
		$status = $this->parser->checkConditions( $filter->getRules(), $filterName );

		$actualExtra = LazyVariableComputer::$profilingExtraTime - $origExtraTime;
		$timeTaken = 1000 * ( microtime( true ) - $startTime - $actualExtra );
		$condsUsed = $this->parser->getCondCount() - $startConds;

		$profiling = [
			'time' => $timeTaken,
			'conds' => $condsUsed,
		];

		return [ $status, $profiling ];
	}

	/**
	 * @param RunnerData $data
	 */
	protected function profileExecution( RunnerData $data ) {
		$allFilters = $data->getAllFilters();
		$matchedFilters = $data->getMatchedFilters();
		$this->filterProfiler->checkResetProfiling( $this->group, $allFilters );
		$this->filterProfiler->recordRuntimeProfilingResult(
			count( $allFilters ),
			$data->getTotalConditions(),
			$data->getTotalRunTime()
		);
		$this->filterProfiler->recordPerFilterProfiling( $this->title, $data->getProfilingData() );
		$this->filterProfiler->recordStats(
			$this->group,
			$data->getTotalConditions(),
			$data->getTotalRunTime(),
			(bool)$matchedFilters
		);
	}

	/**
	 * @param bool[] $matches
	 */
	protected function updateEmergencyCache( array $matches ): void {
		$filters = $this->emergencyCache->getFiltersToCheckInGroup( $this->group );
		foreach ( $filters as $filter ) {
			if ( array_key_exists( "$filter", $matches ) ) {
				$this->emergencyCache->incrementForFilter( $filter, $matches["$filter"] );
			}
		}
	}

	/**
	 * @return array
	 */
	private function getSpecsForTagger(): array {
		return [
			'action' => $this->action,
			'username' => $this->user->getName(),
			'target' => $this->title,
			'accountname' => $this->varManager->getVar(
				$this->vars,
				'accountname',
				VariablesManager::GET_BC
			)->toNative()
		];
	}
}
