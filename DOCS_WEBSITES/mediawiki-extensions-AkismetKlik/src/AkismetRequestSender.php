<?php

/**
 * Used internally by the Akismet class and to mock the Akismet anti spam service in
 * the unit tests.
 *
 * N.B. It is not necessary to implement this class to use the Akismet class.
 *
 * @package    akismet
 * @name    AkismetRequestSender
 * @version    0.5
 * @author    Alex Potsides
 * @link    http://www.achingbrain.net/
 */
interface AkismetRequestSender {

	/**
	 *  Sends the data to the remote host.
	 *
	 * @param string $host The host to send/receive data.
	 * @param int $port The port on the remote host.
	 * @param string $request The data to send.
	 * @param int $responseLength The amount of data to read.  Defaults to 1160 bytes.
	 * @throws MWException An exception is thrown if a connection cannot be made to the remote host.
	 * @return string    The server response
	 */
	public function send( $host, $port, $request, $responseLength = 1160 );
}
