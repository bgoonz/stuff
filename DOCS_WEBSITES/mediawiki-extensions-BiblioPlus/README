--------------------------------------------------------------------------
	README for the BiblioPlus extension
	License: GNU General Public Licence (GPL)
--------------------------------------------------------------------------

  BiblioPlus is a MediaWiki extension that performs automated
  retrieval of citations from Pub Med and the ISBN database. It
  formats these citations for inclusion in a reference section at
  the bottom of a page, and automatically numbers and formats in-text
  citations.

  License
  =======

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
  USA.

  Authors:
  =======

  The BiblioPlus extension is a modification of the Biblio extension, which was
  originally developed by Martin Jambon and several contributors:
    Jason Stajich (reference formatting),
    Austin Che (parser issues),
    Alexandre Gattiker (cache for PubMed & ISBN DB queries)

  Modifications were written by Karen Eddy, and are indicated in the code comments.

  Acknowledgement:
  ===============
  Coding of BiblioPlus was supported by faculty funding to the laboratory of
  Prof. Harry Brumer at the Michael Smith Laboratories and Department of Chemistry,
  University of British Columbia, Vancouver, Canada.

  Background:
  ==========

  BiblioPlus was created to correct an error in some PubMed references
  containing special characters. The original Biblio extension used the
  National Center for Biotechnology Information (NCBI)'s SOAP service, which
  returns data in ISO 8859-1, but does not specify this encoding type in the
  XML header. Therefore, the SOAP parser reads the data as UTF-8 (the default),
  which results in incorrect output of some special characters.

  BiblioPlus uses the NCBI's eUtilities service instead, which returns XML data
  in UTF-8, solving the problem with special characters.

  BiblioPlus uses the same tags as the Biblio extension, so if you are currently
  using Biblio, you can switch to using BiblioPlus without having to change the
  code in your pages. However, you must delete or comment out the include
  statement for Biblio, as you cannot run both simultaneously.

  Setup instructions
  ==================

  Requirements:

  It is recommended that MediaWiki be configured to use APC
  or another cache mechanism. Otherwise the PubMed / ISBN
  databases will need to be contacted upon each request, which
  will considerably slow down the site.

  To activate the extension:

  1) Place the BiblioPlus folder in the extensions subdirectory of your
     MediaWiki installation

  2) Make sure you have $wgSitename and $wgEmergencyContact set to your
     site name and email address, respectively, in LocalSettings.php. These
     variables are used to make the call to the PubMed database.

  3) You are strongly encouraged to register your site name and
     email address with the NCBI. The reason for this is outlined here:
     http://www.ncbi.nlm.nih.gov/books/NBK25497/ (See Frequency, Timing and
     Registration of E-utility URL Requests). The values you register with them
     must be the values of variables $wgSitename and $wgEmergencyContact that
     you set in LocalSettings.php. To do this, simply send an e-mail to
     eutilities@ncbi.nlm.nih.gov including these values, along with a contact name.

  4) Get an access key for the ISBN database (isbndb.com). It is highly
     recommended since the daily quota of queries is by default
     limited to 500. Otherwise, you would share a key with everyone else.
     Follow this link, register and create a key:

         https://isbndb.com/account/create.html

     Please contact support@isbndb.com if you want to increase your quota.
     Tell them you are using the BiblioPlus extension for Mediawiki,
     and that it links each ISBN-referenced book to their site.

  5) Update your LocalSettings.php file with these lines, in that order:

         $wgBiblioPlusIsbnDbKey = '12345678'; // your access key
         require_once("extensions/BiblioPlus/BiblioPlus.php");

  Optionally:

  If $BiblioForce is set to false, references that are present
  in the <biblio> section (possibly included from a template)
  are listed only if they are actually cited in the text or
  forced using <nocite>.

  Features:
  ========

  This module provides tags "cite" and "biblio".
 
  "cite" tags create a citation within the text. You must create a unique key
  (can be any string with no spaces) for each citation. You can put 1 or more keys,
  separated by spaces, inside a <cite> tag. The keys do not have to be numbers;
  the citations are automatically numbered in order.

  You must also list these keys in the "biblio" section, inside the <biblio> tag.
  There is at most one "biblio" section on the page and it must come after
  the last citation.

  Notes to be added after a reference should be separated from the biblio key listing
  by //, as in the example below.

  Example:

  In-text citation:
  As reported previously <cite>key1 key2</cite>, the authors have determined that
  money can indeed buy happiness <cite>key3</cite>.

  <biblio>
  #key1 [http://www.wikipedia.org Wikipedia]
  #key2 pmid=12345678
  #key3 isbn=0-4714-1761-0 // figure 5, page 72 is particularly interesting
  </biblio>

  Please see the BiblioPlus extension page for further information on usage.
  https://www.mediawiki.org/wiki/Extension:BiblioPlus