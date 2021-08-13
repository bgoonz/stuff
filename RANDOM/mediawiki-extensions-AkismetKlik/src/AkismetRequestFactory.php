<?php

/**
 * Used internally by the Akismet class and to mock the Akismet anti spam service in
 * the unit tests.
 *
 * N.B. It is not necessary to implement this class to use the Akismet class.
 *
 * @package    akismet
 * @name    AkismetRequestFactory
 * @version    0.5
 * @author    Alex Potsides
 * @link    http://www.achingbrain.net/
 */
interface AkismetRequestFactory {

	public function createRequestSender();
}
