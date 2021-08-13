<?php

/**
 * Using a remote JSON proxy
 */
class SubversionProxy extends SubversionAdaptor {
	public function __construct( $repo, $proxy, $timeout = 30 ) {
		parent::__construct( $repo );
		$this->mProxy = $proxy;
		$this->mTimeout = $timeout;
	}

	public function canConnect() {
		// TODO!
		return true;
	}

	public function getFile( $path, $rev = null ) {
		throw new Exception( 'NYI' );
	}

	public function getDiff( $path, $rev1, $rev2 ) {
		return $this->_proxy( [
			'action' => 'diff',
			'base' => $this->mRepoPath,
			'path' => $path,
			'rev1' => $rev1,
			'rev2' => $rev2
		] );
	}

	public function getLog( $path, $startRev = null, $endRev = null ) {
		return $this->_proxy( [
			'action' => 'log',
			'base' => $this->mRepoPath,
			'path' => $path,
			'start' => $startRev,
			'end' => $endRev
		] );
	}

	public function getDirList( $path, $rev = null ) {
		return $this->_proxy( [
			'action' => 'list',
			'base' => $this->mRepoPath,
			'path' => $path,
			'rev' => $rev
		] );
	}

	protected function _proxy( $params ) {
		foreach ( $params as $key => $val ) {
			if ( $val === null ) {
				// Don't pass nulls to remote
				unset( $params[$key] );
			}
		}
		$target = $this->mProxy . '?' . wfArrayToCgi( $params );
		$blob = Http::get( $target, $this->mTimeout );
		if ( $blob === false ) {
			throw new Exception( 'SVN proxy error' );
		}
		$data = unserialize( $blob );
		return $data;
	}
}
