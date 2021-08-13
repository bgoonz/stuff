<?php

class CodePropChange {

	public $attrib, $removed, $added, $user, $userText, $timestamp;

	/**
	 * @var CodeRevision
	 */
	public $rev;

	/**
	 * @param CodeRevision $rev
	 */
	public function __construct( $rev ) {
		$this->rev = $rev;
	}

	/**
	 * @param CodeRevision $rev
	 * @param stdClass $row
	 * @return CodePropChange
	 */
	public static function newFromRow( $rev, $row ) {
		return self::newFromData( $rev, get_object_vars( $row ) );
	}

	/**
	 * @param CodeRevision $rev
	 * @param array $data
	 * @return CodePropChange
	 */
	public static function newFromData( $rev, $data ) {
		$change = new CodePropChange( $rev );
		$change->attrib = $data['cpc_attrib'];
		$change->removed = $data['cpc_removed'];
		$change->added = $data['cpc_added'];
		$change->user = $data['cpc_user'];
		// We'd prefer the up to date user table name
		$change->userText = $data['user_name'] ?? $data['cpc_user_text'];
		$change->timestamp = wfTimestamp( TS_MW, $data['cpc_timestamp'] );
		return $change;
	}
}
