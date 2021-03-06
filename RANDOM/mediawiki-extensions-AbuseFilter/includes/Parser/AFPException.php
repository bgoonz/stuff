<?php

namespace MediaWiki\Extension\AbuseFilter\Parser;

use MWException;

abstract class AFPException extends MWException {

	/**
	 * Serialize data for edit stash
	 * @return array
	 */
	public function toArray(): array {
		return [
			'class' => static::class,
			'message' => $this->getMessage(),
		];
	}

	/**
	 * Deserialize data from edit stash
	 * @param array $value
	 * @return static
	 */
	public static function fromArray( array $value ) {
		[ 'class' => $cls, 'message' => $message ] = $value;
		return new $cls( $message );
	}

}
