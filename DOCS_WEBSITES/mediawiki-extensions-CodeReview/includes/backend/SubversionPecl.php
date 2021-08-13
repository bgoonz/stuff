<?php

/**
 * Using the SVN PECL extension...
 */
class SubversionPecl extends SubversionAdaptor {

	public function __construct( $repoPath ) {
		parent::__construct( $repoPath );
		global $wgSubversionUser, $wgSubversionPassword;
		if ( $wgSubversionUser ) {
			svn_auth_set_parameter( SVN_AUTH_PARAM_DEFAULT_USERNAME, $wgSubversionUser );
			svn_auth_set_parameter( SVN_AUTH_PARAM_DEFAULT_PASSWORD, $wgSubversionPassword );
		}
	}

	/**
	 * Just return true for now. svn_info() is too slow to be useful...
	 *
	 * Using undocumented svn_info function. Looking at the source, this has
	 * existed since version 0.3 of the Pecl extension (per release notes).
	 * Nobody ever bothered filling in the documentation on php.net though.
	 * The function returns a big array of a bunch of info about the repository
	 * It throws a warning if the repository does not exist.
	 * @return true
	 */
	public function canConnect() {
		// Wikimedia\suppressWarnings();
		// $result = svn_info( $this->mRepoPath );
		// Wikimedia\restoreWarnings();
		return true;
	}

	public function getFile( $path, $rev = null ) {
		return svn_cat( $this->mRepoPath . $path, $rev );
	}

	public function getDiff( $path, $rev1, $rev2 ) {
		list( $fout, $ferr ) = svn_diff(
			$this->mRepoPath . $path, $rev1,
			$this->mRepoPath . $path, $rev2 );

		if ( $fout ) {
			// We have to read out the file descriptors. :P
			$out = '';
			while ( !feof( $fout ) ) {
				$out .= fgets( $fout );
			}
			fclose( $fout );
			fclose( $ferr );

			return $out;
		} else {
			return new Exception( "Diffing error" );
		}
	}

	public function getDirList( $path, $rev = null ) {
		return svn_ls( $this->mRepoPath . $path,
			$this->_rev( $rev, SVN_REVISION_HEAD ) );
	}

	public function getLog( $path, $startRev = null, $endRev = null ) {
		Wikimedia\suppressWarnings();
		$log = svn_log( $this->mRepoPath . $path,
			$this->_rev( $startRev, SVN_REVISION_INITIAL ),
			$this->_rev( $endRev, SVN_REVISION_HEAD ) );
		Wikimedia\restoreWarnings();
		return $log;
	}
}
