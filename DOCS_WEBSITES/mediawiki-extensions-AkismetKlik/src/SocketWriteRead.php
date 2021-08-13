<?php

/**
 * Used internally by Akismet
 *
 * This class is used by Akismet to do the actual sending and receiving of data.
 * It opens a connection to a remote host, sends some data and the reads the
 * response and makes it available to the calling program.
 *
 * The code that makes up this class originates in the Akismet WordPress plugin,
 * which is {@link http://akismet.com/download/ available on the Akismet website}.
 *
 * N.B. It is not necessary to call this class directly to use the Akismet class.
 *
 * @package    akismet
 * @name    SocketWriteRead
 * @version    0.5
 * @author    Alex Potsides
 * @link    http://www.achingbrain.net/
 */
class SocketWriteRead implements AkismetRequestSender {
	private $response;
	private $errorNumber;
	private $errorString;

	public function __construct() {
		$this->errorNumber = 0;
		$this->errorString = '';
	}

	/**
	 *  Sends the data to the remote host.
	 *
	 * @param string $host The host to send/receive data.
	 * @param int $port The port on the remote host.
	 * @param string $request The data to send.
	 * @param int $responseLength The amount of data to read.  Defaults to 1160 bytes.
	 * @throws MWException An exception is thrown if a connection cannot be made to the remote host.
	 * @return string The server response
	 */
	public function send( $host, $port, $request, $responseLength = 1160 ) {
		$response = '';

		$fs = fsockopen( $host, $port, $this->errorNumber, $this->errorString, 3 );

		if ( $this->errorNumber != 0 ) {
			throw new MWException( 'Error connecting to host: ' . $host .
				' Error number: ' . $this->errorNumber . ' Error message: ' . $this->errorString );
		}

		if ( $fs !== false ) {
			Wikimedia\suppressWarnings();
			fwrite( $fs, $request );
			Wikimedia\restoreWarnings();

			while ( !feof( $fs ) ) {
				$response .= fgets( $fs, $responseLength );
			}

			fclose( $fs );
		}

		return $response;
	}

	/**
	 * Returns the server response text
	 *
	 * @return string
	 */
	public function getResponse() {
		return $this->response;
	}

	/**
	 * Returns the error number
	 *
	 * If there was no error, 0 will be returned.
	 *
	 * @return int
	 */
	public function getErrorNumner() {
		return $this->errorNumber;
	}

	/**
	 * Returns the error string
	 *
	 * If there was no error, an empty string will be returned.
	 *
	 * @return string
	 */
	public function getErrorString() {
		return $this->errorString;
	}
}
