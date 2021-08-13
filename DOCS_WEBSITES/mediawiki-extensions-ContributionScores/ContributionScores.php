<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'ContributionScores' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessageDirs['ContributionScores'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['ContributionScoresAlias'] = __DIR__ . '/ContributionScores.alias.php';
	$wgExtensionMessagesFiles['ContributionScoresMagic'] = __DIR__ . '/ContributionScores.i18n.magic.php';
	wfWarn(
		'Deprecated PHP entry point used for ContributionScores extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
} else {
	die( 'This version of the ContributionScores extension requires MediaWiki 1.29+' );
}
