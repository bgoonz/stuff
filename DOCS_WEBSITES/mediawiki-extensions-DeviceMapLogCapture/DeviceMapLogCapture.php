<?php

/*
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
*/

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'DeviceMapLogCapture' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['DeviceMapLogCapture'] = __DIR__ . '/i18n';
	wfWarn(
		'Deprecated PHP entry point used for the DeviceMapLogCapture extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the DeviceMapLogCapture extension requires MediaWiki 1.29+' );
}
