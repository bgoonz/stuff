#EtherpadLite

[View on mediawiki.org](https://www.mediawiki.org/wiki/Extension:EtherpadLite)

The extension adds a tag "eplite" to the MediaWiki parser and
provides a method to embed Etherpad Lite pads on MediaWiki pages.
An Etherpad Lite server is not part of the extension.

It's written by Thomas Gries and dual licensed under the
[MIT](http://www.opensource.org/licenses/mit-license.php) and
[GPL v2](http://www.gnu.org/licenses/gpl-2.0) license.

## Prerequisite

You need at least one Etherpad Lite host server
The shown one is a test server: it is not meant for production.

``$wgEtherpadLiteDefaultPadUrl = "http://beta.etherpad.org/p/";``

For setting up your own Etherpad Lite server (based on node.js) see
Etherpad Lite homepage:
https://github.com/Pita/etherpad-lite

This extension is based on:

https://github.com/johnyma22/etherpad-lite-jquery-plugin

https://github.com/Pita/etherpad-lite/wiki/Embed-Parameters

The present MediaWiki extension does not require jquery. It adds an iframe.

## Installation

To install this extension to your Wikimedia instance append
```php
wfLoadExtensions( 'EtherpadLite' );

// The shown one is a test server: it is not meant for production.
$wgEtherpadLiteDefaultPadUrl    = "http://beta.etherpad.org/p/";
$wgEtherpadLiteDefaultWidth     = "600px";
$wgEtherpadLiteDefaultHeigth    = "400px";
```
to your *LocalSettings.php* and check if everything works at
the *Special:Version* page

## Usage

```html
<eplite id="padid" />
<eplite id="myPseudoSecretPadHash-7ujHvhq06g" />
<eplite id="padid" height="200px" width="600px" />
<eplite id="padid" src="http://www.another-pad-server.org/p/" />
```

## Configuration

**$wgEtherpadLiteDefaultPadUrl**

Define a default Etherpad Lite server Url and base path

**$wgEtherpadLiteUrlWhitelist**

Whitelist of allowed Etherpad Lite server Urls

If there are items in the array, and the user supplied URL is not in the array,
the url will not be allowed.

Urls are case-sensitively tested against values in the array.
They must exactly match including any trailing "/" character.

**Warning:** Allowing all urls (not setting a whitelist)
may be a security concern.

An empty or non-existent array means: no whitelist defined
this is the default: an empty whitelist. No servers are allowed by default.

``$wgEtherpadLiteUrlWhitelist = array();``

Include "*" if you expressly want to allow all urls (you should not do this)!

``$wgEtherpadLiteUrlWhitelist = array( "*" );``