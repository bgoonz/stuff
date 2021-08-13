<?php

use MediaWiki\MediaWikiServices;

/**
 * Wrapper around ReadOnlyMode that implements extension logic.
 *
 * We extend ReadOnlyMode so that code which checks instanceof can continue to work properly.
 * However, we do not actually call any methods of our parent class, as the service passed to
 * us in our constructor may have already been replaced by some other service manipulator or
 * a service redefinition. As such, we proxy calls to the passed-in service instead.
 */
class AbsenteeLandlordReadOnlyMode extends ReadOnlyMode {

	/** @var ReadOnlyMode */
	private $baseService;

	/**
	 * @param ReadOnlyMode $baseService
	 */
	public function __construct( ReadOnlyMode $baseService ) {
		// Despite the above note, we do still need to properly construct our parent instance just in
		// case future changes add more methods to ReadOnlyMode which we are not set up to proxy over
		// to $this->baseService.
		$services = MediaWikiServices::getInstance();
		parent::__construct( $services->getConfiguredReadOnlyMode(), $services->getDBLoadBalancer() );
		$this->baseService = $baseService;
	}

	/**
	 * @return string
	 */
	public function getReason() {
		$reason = $this->baseService->getReason();
		if ( $reason === false ) {
			$config = MediaWikiServices::getInstance()->getMainConfig();
			$maxDays = $config->get( 'AbsenteeLandlordMaxDays' );
			// # days * 24 hours * 60 minutes * 60 seconds
			$timeout = $maxDays * 24 * 60 * 60;
			$lastTouched = filemtime( __DIR__ . '/lasttouched.txt' );
			$check = time() - $lastTouched;

			if ( $check >= $timeout ) {
				$groups = RequestContext::getMain()->getUser()->getGroups();

				if ( !in_array( 'sysop', $groups ) ) {
					$reason = wfMessage( 'absenteelandlord-reason' )->text();
					// to speed up future checks in the same request, save this reason
					$this->setReason( $reason );
				}
			}
		}

		return $reason;
	}

	/**
	 * @param string $msg
	 */
	public function setReason( $msg ) {
		$this->baseService->setReason( $msg );
	}
}
