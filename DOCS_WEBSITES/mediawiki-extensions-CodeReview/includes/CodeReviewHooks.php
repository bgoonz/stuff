<?php
/**
 * Class containing hooked functions used by the CodeReview extension.
 * All functions are public and static.
 *
 * @file
 */
class CodeReviewHooks {

	/**
	 * Performs database updates (initial table creation on first install,
	 * addition of new tables/fields/indexes for old installs that are being
	 * upgraded) when the user runs the core MediaWiki updater script,
	 * /maintenance/update.php.
	 *
	 * Only MySQL(/MariaDB) and SQLite are supported at the moment.
	 *
	 * @param DatabaseUpdater $updater
	 */
	public static function onLoadExtensionSchemaUpdates( DatabaseUpdater $updater ) {
		$base = __DIR__ . '/..';
		switch ( $updater->getDB()->getType() ) {
		case 'mysql':
			// Initial install tables
			$updater->addExtensionTable( 'code_rev', "$base/sql/codereview.sql" );

			$updater->addExtensionField( 'code_rev', 'cr_diff',
				"$base/archives/codereview-cr_diff.sql" );
			$updater->addExtensionIndex( 'code_relations', 'repo_to_from',
				"$base/archives/code_relations_index.sql" );

			if ( !$updater->updateRowExists( 'make cr_status varchar' ) ) {
				$updater->modifyExtensionField( 'code_rev', 'cr_status',
					"$base/archives/codereview-cr_status_varchar.sql" );
			}

			$updater->addExtensionTable( 'code_bugs', "$base/archives/code_bugs.sql" );

			$updater->addExtensionTable( 'code_signoffs', "$base/archives/code_signoffs.sql" );

			$updater->addExtensionField( 'code_signoffs', 'cs_user',
				"$base/archives/code_signoffs_userid.sql" );
			$updater->addExtensionField( 'code_signoffs', 'cs_timestamp_struck',
				"$base/archives/code_signoffs_timestamp_struck.sql" );

			$updater->addExtensionIndex( 'code_comment', 'cc_author',
				"$base/archives/code_comment_author-index.sql" );

			$updater->addExtensionIndex( 'code_prop_changes', 'cpc_author',
				"$base/archives/code_prop_changes_author-index.sql" );

			if ( !$updater->updateRowExists( 'make cp_action char' ) ) {
				$updater->modifyExtensionField( 'code_paths', 'cp_action',
					"$base/archives/codereview-cp_action_char.sql" );
			}

			if ( !$updater->updateRowExists( 'make cpc_attrib varchar' ) ) {
				$updater->modifyExtensionField( 'code_prop_changes', 'cpc_attrib',
					"$base/archives/codereview-cpc_attrib_varchar.sql" );
			}

			$updater->addExtensionIndex( 'code_paths', 'repo_path',
				"$base/archives/codereview-repopath.sql" );

			$updater->addExtensionIndex( 'code_rev', 'cr_repo_status_author',
				"$base/archives/code_revs_status_author-index.sql" );

			$updater->dropExtensionField( 'code_comment', 'cc_review',
				"$base/archives/code_drop_cc_review.sql" );

			$updater->dropExtensionTable( 'code_test_suite',
				"$base/archives/code_drop_test.sql" );

			$updater->addExtensionField( 'code_authors', 'ca_user',
				"$base/archives/code_authors_add_ca_user.sql" );

			$updater->dropExtensionIndex(
				'code_authors',
				'ca_repo_author',
				"$base/archives/code_author-drop-ca_repo_author.sql"
			);
			break;
		case 'sqlite':
			$updater->addExtensionTable( 'code_rev', "$base/sql/codereview.sql" );
			$updater->addExtensionTable( 'code_signoffs', "$base/archives/code_signoffs.sql" );
			$updater->addExtensionField( 'code_signoffs', 'cs_user',
				"$base/archives/code_signoffs_userid-sqlite.sql" );
			$updater->addExtensionField( 'code_signoffs', 'cs_timestamp_struck',
				"$base/archives/code_signoffs_timestamp_struck.sql" );
			$updater->addExtensionIndex( 'code_paths', 'repo_path',
				"$base/archives/codereview-repopath.sql" );
			$updater->addExtensionField( 'code_authors', 'ca_user',
				"$base/archives/code_authors_add_ca_user.sql" );
			break;
		case 'postgres':
			// TODO
			break;
		}
	}

	/**
	 * Sets the wgCodeReviewRepository JavaScript variable to the name of the
	 * current repository when we're on Special:Code, or to be more specific,
	 * a subpage of a repository on Special:Code.
	 *
	 * @param array &$values
	 * @param OutputPage $out
	 */
	public static function onMakeGlobalVariablesScript( &$values, $out ) {
		# Bleugh, this is horrible
		$title = $out->getTitle();
		if ( $title->isSpecial( 'Code' ) ) {
			$bits = explode( '/', $title->getText() );
			if ( isset( $bits[1] ) ) {
				$values['wgCodeReviewRepository'] = $bits[1];
			}
		}
	}

	/**
	 * For integration with the Renameuser extension.
	 *
	 * @param RenameuserSQL $renameUserSQL
	 */
	public static function onRenameUserSQL( $renameUserSQL ) {
		foreach ( self::$userTables as $table => $fields ) {
			$renameUserSQL->tables[$table] = $fields;
		}
	}

	private static $userTables = [
		'code_authors' => [ 'ca_user_text', 'ca_user' ],
		'code_comment' => [ 'cc_user_text', 'cc_user' ],
		'code_prop_changes' => [ 'cpc_user_text', 'cpc_user' ],
		'code_signoffs' => [ 'cs_user_text', 'cs_user' ]
	];

	/**
	 * For integration with the UserMerge extension.
	 *
	 * @param array &$updateFields
	 */
	public static function onUserMergeAccountFields( &$updateFields ) {
		// array( tableName, idField, textField )
		foreach ( self::$userTables as $table => $fields ) {
			$updateFields[] = [ $table, $fields[1], $fields[0] ];
		}
	}
}
