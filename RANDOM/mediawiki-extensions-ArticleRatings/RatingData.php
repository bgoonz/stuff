<?php

class RatingData {
	public static function getJSON() {
		$json = wfMessage( 'are-ratings' )->plain();
		if ( empty( $json ) ) {
			trigger_error( 'ARE Error: empty JSON' );
		}
		return json_decode( $json, true );
	}

	public static function getAllRatings() {
		$JSON = self::getJSON();

		$returners = [];

		foreach ( $JSON as $data ) {
			$returners[] = new Rating( $data['codename'] );
		}

		return $returners;
	}

	public static function getDefaultRating() {
		$JSON = self::getJSON();

		return new Rating( $JSON[0]['codename'] );
	}
}
