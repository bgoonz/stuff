Auth_remoteuser
===============

Auth_remoteuser is an extension for MediaWiki 1.27 and up which logs-in
users into mediawiki automatically if they are already authenticated by
a remote source. This can be anything ranging from webserver environment
variables to request headers to arbitrary external sources if at least
the remote user name maps to an existing user name in the local wiki
database (or it can be created if the extension has the permissions to
do so). The external source takes total responsibility in authenticating
an authorized user.

Because it is implemented as a SessionProvider in MediaWikis AuthManager
stack, which was introduced with MediaWiki 1.27, you need a version of
Auth_remoteuser below 2.0.0 to use this extension in MediaWiki 1.26 and
below.


Requirements
------------

* MediaWiki 1.27+


Installation
------------

Either copy this extension directory `Auth_remoteuser/` into your
mediawiki extension folder `extensions/` or, when installing with
Composer, add an appropriate required package link to your
`composer.local.json` file:

    "require": { "mediawiki/auth-remoteuser": "~2" }

Then, enable the extension in MediaWiki by adding the following to your
global configuration file `LocalSettings.php`:

    wfLoadExtension( 'Auth_remoteuser' );

Take account of MediaWikis global permissions for account creation
inside your `LocalSettings.php`. At least one of them must be `true` for
anonymous users to let this extension create accounts for users as of
yet unknown to the wiki database. If you set this to `false`, then
automatic login works only for users who have a wiki account already:

    $wgGroupPermissions['*']['createaccount'] = true;

    // If account creation by anonymous users is forbidden, then allow
    // it to be created automatically.
    $wgGroupPermissions['*']['createaccount'] = false;
    $wgGroupPermissions['*']['autocreateaccount'] = true;

    // Only login users automatically if known to the wiki already.
    $wgGroupPermissions['*']['createaccount'] = false;
    $wgGroupPermissions['*']['autocreateaccount'] = false;


Configuration
-------------

You can adjust the behaviour of the extension to suit your needs by
using a set of global configuration variables all starting with
`$wgAuthRemoteuser`. Just add them to your `LocalSettings.php`. Default
values, which you don't have to set explicitly are marked with the
`// default` comment.

* Set the name(s) to use for mapping into the local wiki user database.
  This can either be a simple string, a closure or a mixed array of
  strings and/or closures. If the value is `null`, the extension
  defaults to using the environment variables `REMOTE_USER` and
  `REDIRECT_REMOTE_USER`. The first name name in the given list, which
  can be used as a valid MediaWiki user name, will be taken for login
  (either by login to an existing wiki account or by creating first).
  Examples:

        $wgAuthRemoteuserUserName = null; // default

        // Same behaviour as default `null`.
        $wgAuthRemoteuserUserName = [
            $_SERVER[ 'REMOTE_USER' ],
            $_SERVER[ 'REDIRECT_REMOTE_USER' ]
        ];

        // Another remote source for user name(s).
        $wgAuthRemoteuserUserName = $_SERVER[ 'LOGON_USER' ];

        $wgAuthRemoteuserUserName = ""; // Will evaluate to nothing.
        $wgAuthRemoteuserUserName = []; // Will evaluate to nothing.

        // This is not advised, because it will evaluate every visitor
        // to the same wiki user 'Everybody'.
        $wgAuthRemoteuserUserName = "Everybody";

        // Create a closure instead of providing strings directly.
        $wgAuthRemoteuserUserName = function() {
            $credentials = explode( ':',$_SERVER['HTTP_AUTHORIZATION']);
            $username = $credentials[0];
            $password = $credentials[1];
            return MyOwnAuthorizer::authenticate( $username, $password )
                ? $username : "";
        };

* When you need to process your remote user name before it can be used
  as an identifier into the wiki user list, for example to strip a
  Kerberos principal from the end, replacing invalid characters, or
  blacklisting some names, use the hook `AuthRemoteuserFilterUserName`
  provided by this extension. Just have a look at MediaWikis Hook
  documentation on how to register additional functions to this hook. It
  provides as first parameter the remote user name by reference to the
  hook function. If the function returns false, the remote user name
  will be ignored for automatic login.

* This extension comes with predefined remote user name filters (which
  are using the hook mentioned above). If you want to replace something,
  set an array of search and replacement patterns to the following
  configuration variable (Each pattern can be a regular expression in
  PCRE syntax too):

        $wgAuthRemoteuserUserNameReplaceFilter = null; // default

        $wgAuthRemoteuserUserNameReplaceFilter = [
            '_' => ' ',                  // replace underscores with
                                         // spaces
            '@INTRA.EXAMPLE.COM$' => '', // strip Kerberos principal
                                         // from back
            '^domain\\' => '',           // strip NTLM domain from front
            'johndoe' => 'Admin',        // rewrite user johndoe
            '/JaNeDoE/i' => 'Admin',     // rewrite all case-insensitive
                                         // versions of janedoe
            '^(.*)$' => 'auto_$1',       // prepend string 'auto_'
            '^cn=(.*),dc=com$' => '$1',  // get nested user name
            '^([^,]*),(.*)$' => '$2 $1'  // reorder names
        ];

* If you want to prevent some names from beeing logged in automatically,
  blacklist them with the following filter. It accepts a list of names,
  where each name can also be a regular expression in PCRE syntax:

        $wgAuthRemoteuserUserNameBlacklistFilter = null; // default

        $wgAuthRemoteuserUserNameBlacklistFilter = [
            'johndoe',
            'janedoe',
            '/john/i', // matches all case-insensitive versions of john
            '^f_'      // matches all users starting wit 'f_'
        ];

* The opposite of the `UserNameBlacklistFilter` can be achieved by using
  the following filter, which permits the automatic login instead of
  preventing it:

        $wgAuthRemoteuserUserNameWhitelistFilter = null; // default

        $wgAuthRemoteuserUserNameWhitelistFilter = [
            'john',
            'jane'
        ];

* When you have further user information available in your environment,
  which can be tied to a created user, for example email address or real
  name, then use one of the following configuration variables. Either
  `UserPrefs` or `UserPrefsForced`, which applies them to new users only
  or force them by applying them on each request. This can be useful if
  you don't want the user to change this preference inside MediaWiki
  (for example your company email address given by a remote source).
  They are expecting an array of key value pairs of which 'realname' and
  'email' corresponds to the new users real name and email address. Any
  further key value pair specified gets mapped to a user preference of
  the same name. But take note of MediaWikis `$wgDefaultUserOptions` and
  `$wgHiddenPrefs`for declaring user preference options. In most cases
  these globals are better suited for a definition of a default value
  and disabling their modifiability:

        $wgAuthRemoteuserUserPrefs = null;       // default
        $wgAuthRemoteuserUserPrefsForced = null; // default

        $wgAuthRemoteuserUserPrefs = [
            'realname' => $_SERVER[ 'AUTHENTICATE_DISPLAYNAME' ],
            'language' => 'en',
            'disablemail' => 0
        ];
        // Users email address should not be changed inside MediaWiki.
        $wgAuthRemoteuserUserPrefsForced = [
            'email' => $_SERVER[ 'AUTHENTICATE_MAIL' ]
        ];

        // Instead use MediaWiki global for the preference option.
        $wgDefaultUserOptions[ 'disablemail' ] = 0;
        // And disable it from being changed by the user.
        $wgHiddenPrefs[] = 'disablemail';
        // But change it depending on type of remote user (uses the
        // closure feature described below). For example if there are
        // guest accounts identified by a leading 'g_' existing at your
        // remote source, which have no valid email address, then
        // disable the option specifically for these type of accounts.
        $wgAuthRemoteuserUserPrefsForced = [
            'disablemail' => function ( $metadata ) {
                $name = $metadata[ 'remoteUserName' ];
                return ( preg_match( '/^g_/', $name ) ) ? 1 : 0;
            }
        ];

  You can specify an anonymous function for the values too. These
  closures getting called when the actual value is needed, and not when
  it is declared inside your `LocalSettings.php`. The first parameter
  given to the function is an associative array with the following keys:
  * `userId` - id of user in local wiki database or 0 if new/anonymous
  * `remoteUserName` - value as given by the environment
  * `filteredUserName` - after running hook for filtering user names
  * `canonicalUserName` - representation in the local wiki database
  * `canonicalUserNameUsed` - the user name used for the current session

  Take the following as an example in which a cost-intensive function
  (in a timely manner) is getting executed only once per user and not on
  every request:

        $wgAuthRemoteuserUserPrefs = [
            'email' => function( $metadata ) use ( $rpc ) {
                $name = $metadata[ 'remoteUserName' ];
                // costly remote procedure call to get email address
                return $rpc->query( 'email', $name );
            }
        ];

* You can replace urls in MediaWiki, if your remote source is better
  suited for handling specific behaviour. For example by default no
  automatically logged-in user is allowed to logout (because he will be
  logged-in automatically again with the next request). But maybe your
  remote source should handle that logout (so that with the next request
  there isn't a remote user name provided anymore to this extension).
  Set an appropriate url to one of the following keys of the associative
  array `wgAuthRemoteuserUserUrls`:
  * `logout` - Provide a redirect url for the user logout. Depending on
    your other extension configuration settings this will either replace
    the link of the logout button in the user's personal url bar or
    redirect after a call to the special page `Special:UserLogout`.
    Accepts a string or a closure. If of type closure, then it should
    return a string with a valid url (either external or internal). The
    closure gets as first parameter the same array as closures for the
    user preferences (see description there).

  Examples:

        $wgAuthRemoteuserUserUrls = null; // default

        // Redirect to company domain controller host for logout.
        $wgAuthRemoteuserUserUrls = [
            'logout' => function( $metadata ) {
                $user = $metadata[ 'remoteUserName' ];
                return 'https://company.example.com/?logout=' . $user;
            }
        ];

        // Redirect to user login page instead of default logout page.
        // This is the default behaviour if user switching is allowed.
        $wgAuthRemoteuserUserUrls = [
            'logout' => function( $metadata ) {
                return 'Special:UserLogin';
            }
        ];


* By default this extension mimics the behaviour of Auth_remoteuser
  versions prior 2.0.0, which prohibits using another local user then
  the one identified by the remote source. You can change this behaviour
  with the following configuration:

        $wgAuthRemoteuserAllowUserSwitch = false; // default

        $wgAuthRemoteuserAllowUserSwitch = true;

* As an immutable SessionProvider (see `AllowUserSwitch` config above)
  all special pages and login/logout links for authentication aren't
  needed anymore by the identified user. If you still want them to be
  shown, for example if you are using other session providers besides
  this one, then set the following accordingly:

        $wgAuthRemoteuserRemoveAuthPagesAndLinks = true; // default

        $wgAuthRemoteuserRemoveAuthPagesAndLinks = false;

* If you are using other SessionProvider extensions besides this one,
  you have to specify their significance by using an ascending priority:

        $wgAuthRemoteuserPriority = 50; // default

        $wgAuthRemoteuserPriority = SessionInfo::MAX_PRIORITY;


Upgrade
-------

This extension doesn't use any database entries, therefore you don't
need that extension to be enabled while upgrading. Just disable it and
after you have upgraded your wiki, reenable this extension.


Upgrading from versions prior 2.0.0
-----------------------------------

All legacy configuration parameters are still fully supported. You don't
have to rewrite your old `LocalSettings.php` settings. But to assist you
in transitioning of old configuration parameters to new ones, the
following list can guide you:

* `$wgAuthRemoteuserAuthz` - This parameter has no equivalent new
  parameter, because you can achive the same with not loading the
  extension at all.
* `$wgAuthRemoteuserName` - Superseded by `$wgRemoteuserUserPrefs`.
* `$wgAuthRemoteuserMail` - Superseded by `$wgRemoteuserUserPrefs`.
* `$wgAuthRemoteuserNotify` - Superseded by `$wgRemoteuserUserPrefs`.
* `$wgAuthRemoteuserDomain` - Superseded by
  `$wgRemoteuserUserNameReplaceFilter`.
* `$wgAuthRemoteuserMailDomain` - Superseded by `$wgRemoteuserUserPrefs`.


Additional notes
----------------

For a complete list of authors and any further documentation see the
file `extension.json` or the `Special:Version` page on your wiki
installation after you have enabled this extension.

For the license see the file `COPYING`.
