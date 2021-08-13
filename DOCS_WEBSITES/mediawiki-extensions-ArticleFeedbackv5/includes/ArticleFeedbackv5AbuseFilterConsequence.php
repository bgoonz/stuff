<?php

use MediaWiki\Extension\AbuseFilter\Consequences\Consequence\Consequence;
use MediaWiki\Extension\AbuseFilter\Consequences\Parameters;

class ArticleFeedbackv5AbuseFilterConsequence extends Consequence {
	/** @var string */
	private $autoFlagKey;

	/**
	 * @param Parameters $parameters
	 * @param string $consName
	 */
	public function __construct( Parameters $parameters, string $consName ) {
		parent::__construct( $parameters );
		switch ( $consName ) {
			case 'aftv5resolve':
				$this->autoFlagKey = 'resolve';
				break;
			case 'aftv5flagabuse':
				$this->autoFlagKey = 'flag';
				break;
			case 'aftv5hide':
				$this->autoFlagKey = 'hide';
				break;
			case 'aftv5request':
				$this->autoFlagKey = 'request';
				break;
			default:
				throw new AssertionError( "Invalid consequence name? $consName" );
		}
	}

	/**
	 * @inheritDoc
	 */
	public function execute(): bool {
		ApiArticleFeedbackv5::$abuseFilterFlags[$this->autoFlagKey] = $this->parameters->getFilter()->getName();
		return true;
	}
}
