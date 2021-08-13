<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

$cfg['directory_list'] = array_merge(
	$cfg['directory_list'],
	[
		'../../extensions/Comments',
		'../../extensions/RandomGameUnit',
		'../../extensions/SocialProfile',
		'../../extensions/VoteNY',
		'../../extensions/Video',
	]
);

$cfg['exclude_analysis_directory_list'] = array_merge(
	$cfg['exclude_analysis_directory_list'],
	[
		'../../extensions/Comments',
		'../../extensions/RandomGameUnit',
		'../../extensions/SocialProfile',
		'../../extensions/VoteNY',
		'../../extensions/Video',
	]
);

return $cfg;
