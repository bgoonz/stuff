<?php

/**
 * Used internally by the Akismet class and to mock the Akismet anti spam service in
 * the unit tests.
 *
 * N.B. It is not necessary to call this class directly to use the Akismet class.
 *
 * @package    akismet
 * @name    SocketWriteReadFactory
 * @version    0.5
 * @author    Alex Potsides
 * @link    http://www.achingbrain.net/
 */
class SocketWriteReadFactory implements AkismetRequestFactory {

	/**
	 * @return SocketWriteRead
	 */
	public function createRequestSender() {
		return new SocketWriteRead();
	}
}
