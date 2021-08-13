<?php

abstract class SubversionAdaptor {
	/**
	 * @var string
	 */
	protected $mRepoPath;

	/**
	 * @param string $repo
	 * @return SubversionAdaptor
	 */
	public static function newFromRepo( $repo ) {
		global $wgSubversionProxy, $wgSubversionProxyTimeout;
		if ( $wgSubversionProxy ) {
			return new SubversionProxy( $repo, $wgSubversionProxy, $wgSubversionProxyTimeout );
		} elseif ( function_exists( 'svn_log' ) ) {
			return new SubversionPecl( $repo );
		} else {
			return new SubversionShell( $repo );
		}
	}

	/**
	 * @param string $repoPath Path to SVN Repo
	 */
	public function __construct( $repoPath ) {
		$this->mRepoPath = $repoPath;
	}

	abstract public function canConnect();

	abstract public function getFile( $path, $rev = null );

	abstract public function getDiff( $path, $rev1, $rev2 );

	abstract public function getDirList( $path, $rev = null );

	abstract public function getLog( $path, $startRev = null, $endRev = null );

	protected function _rev( $rev, $default ) {
		if ( $rev === null ) {
			return $default;
		} else {
			return intval( $rev );
		}
	}
}
