BreadCrumbs
===========

A Mediawiki Extension to provide a user-browsing history breadcrumb 
trail on wiki pages.


INSTALLING
--------------------------------------------------------------------------

Copy the BreadCrumbs directory into the extensions folder of your
MediaWiki installation. Then add the following lines to your
LocalSettings.php file (near the end):

    wfLoadExtension( 'BreadCrumbs' );


PARAMETERS/APPEARANCE
--------------------------------------------------------------------------

To customize the design of the breadcrumb trail, there are several user-
accessible options (default values given):

    # Whether to provide breadcrumbs to users by default
    $wgDefaultUserOptions['breadcrumbs-showcrumbs'] = true;

    # Delimiter string between BreadCrumbs
    $wgDefaultUserOptions['breadcrumbs-delimiter'] = '>';

    # Number of breadcrumbs to show
    $wgDefaultUserOptions['breadcrumbs-numberofcrumbs'] = 5;

    # Whether to show the breadcrumbs' namespaces
    $wgDefaultUserOptions['breadcrumbs-namespaces'] = true;

    # Whether to ignore pages that are already in breadcrumbs
    $wgDefaultUserOptions['breadcrumbs-filter-duplicates'] = false;

    # Text to appear before breadcrumbs
    $wgDefaultUserOptions['breadcrumbs-preceding-text'] = '';

Additionally, there are some configurations available to administrators

    # Whether to ignore page refreshes
    $wgBreadCrumbsIgnoreRefreshes = true;

    # Whether to provide the links also for anonymous users
    $wgBreadCrumbsShowAnons = false;
    
    # Whether users should be allowed to configure BreadCrumbs Options
    $wgBreadCrumbsAllowUPOs = true;

Any of these may be overridden in LocalSettings.php.


BUGS, CONTACT
--------------------------------------------------------------------------

Write us on https://www.mediawiki.org/wiki/Extension_talk:BreadCrumbs and
we'll see what we can do for you.

Alternatively you can reach me (Tony Boyles) [by e-mail](mailto:ABoyles@milcord.com)

The description page of this extension can be found at:
https://www.mediawiki.org/wiki/Extension:BreadCrumbs


ATTRIBUTION
--------------------------------------------------------------------------

This software was originally written by Manuel Schneider. It was modified 
(and is maintained) by Tony Boyles to add functionality for a project by
[Milcord llc.](http://milcord.com)