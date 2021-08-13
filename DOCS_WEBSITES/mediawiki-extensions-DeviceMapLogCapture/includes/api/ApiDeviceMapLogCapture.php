<?php
/**
 * DeviceMap Log Capture API module
 *
 * @file
 * @ingroup API
 */

use Wikimedia\IPUtils;

class ApiDeviceMapLogCapture extends ApiBase {

	/**
	 * API devicemaplogcapture action
	 *
	 * Parameters:
	 * 		eventid: event name
	 * 		token: unique identifier for a user session
	 *
	 * @see includes/api/ApiBase#execute()
	 */
	public function execute() {
		$params = $this->extractRequestParams();
		$eventId = $params['eventid'];
		$token = $params['token'];
		$site = $params['site'];
		$deviceMap = $params['dmap'];
		$countryCode = null;
		$ip = $this->getRequest()->getVal( 'ip', $this->getRequest()->getIP() );
		if ( IPUtils::isValid( $ip ) ) {
			if ( function_exists( 'geoip_country_code_by_name' ) ) {
				$countryCode = geoip_country_code_by_name( $ip );
			}
		}
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		DeviceMapLogCaptureHooks::recordDevice(
			$eventId,
			$token,
			$site,
			$deviceMap,
			$countryCode,
			$userAgent
		);

		$result = $this->getResult();
		$data = [];
		$data['dmap'] = $deviceMap;
		$data['country_code'] = $countryCode;
		$result->addValue( 'query', $this->getModuleName(), $data );
	}

	/**
	 * @inheritDoc
	 */
	public function getAllowedParams() {
		return [
			'eventid' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'site' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'token' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'dmap' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
		];
	}
}
