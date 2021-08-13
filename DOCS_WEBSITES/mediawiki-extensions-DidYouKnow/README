These is the readme file for the Did You Know extension.

Extension page on mediawiki.org: https://www.mediawiki.org/wiki/Extension:Did_You_Know
Latest version of the readme file: https://gerrit.wikimedia.org/r/gitweb?p=mediawiki/extensions/DidYouKnow.git;a=blob;f=README

== About ==

This extension allows for displaying a "did you know" box in articles (using some wikitext construct)
and other interfaces such as special pages (by using the PHP interface from another extension).

The did you know (DYK) box consists of a header "Did you know... ?", followed by content pulled
from a wiki page. The wiki page gets randomly selected from a list of pages within a certain
category (this category can be configured in LocalSettings). A "type" parameter can also be provided,
which causes the lookup for the page to happen in a different category, for example
[[Category:Did you know/$type]], where $type gets replaced by the value of the type parameter.
If there are no pages in this category, the selection mechanism falls back to the default category.
