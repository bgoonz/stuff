<?php // Carp.php //

/*
	------------------------------------------------------------------------------------------------
	Carp, a MediaWiki extension providing error reporting and stack unwinding to other extensions.
	Copyright (C) 2012 Van de Bugger.

	This program is free software: you can redistribute it and/or modify it under the terms
	of the GNU Affero General Public License as published by the Free Software Foundation,
	either version 3 of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
	See the GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License along with this
	program.  If not, see <https://www.gnu.org/licenses/>.
	------------------------------------------------------------------------------------------------
*/

/**
 * @page carp_extension Carp extension
 *
 * @section what What?
 *
 * The %Carp extension enables template call stack backtracing and error reporting for @em parser
 * @em functions.
 * (Error reporting for @em templates is implemented in another extension named TemplateSpecial.)
 *
 * @section why Why?
 *
 * Advanced wiki sites are complex and complicated.
 * A page source is not just wikitext, but rather a @em program —
 * source can invoke dozens of templates, which invoke other templates, and so on.
 * A page source and templates may invoke parser functions, which implements string
 * processing and control structures, such as @c @#if, @c @#while, etc.
 * All this stuff forms ugly, but real @em programming language, doesn't it?
 *
 * As in any programming language, there can be errors.
 * A template expects two arguments, but only one is provided.
 * An argument is expected to be a title of an existing page, but it is an empty string or
 * contains characters not suitable for a page title, or it is a perfect title,
 * but there is no page with such a title. And so on.
 *
 * Well-written parser functions and templates will produce good error messages if something goes
 * wrong. For example, a parser function may return a good error message like "Not enough
 * arguments: 3 arguments expected, 1 provided". The cause of error is clear now, but @em where is
 * the cause? Imagine this function is invoked many times from many locations,
 * and some of calls are buried in deeply nested template calls.
 *
 * If you write a program in a programming language like C or Perl or Java or many other
 * languages, you name it, you can relatively easy locate the error by looking at @em call
 * @em stack @em backtrace:
 *
 * @verbatim
 * Oops! at assa.pl line 9
 * main::bar() called at assa.pl line 13
 * main::foo() called at assa.pl line 16
 * @endverbatim
 *
 * Why don't we have such well-known troubleshooting feature in wikitext? Well, we have now.
 *
 * @section who Who?
 *
 * @em End-users of the %Carp extension are wiki writers, people who edit wiki pages,
 * especially those who develop complex templates.
 * They will get profit in form of error messages with call stack backtrace
 * which allows to locate errors in wikitext more easily.
 * But the %Carp extension is not intended to be used by wiki writers and template developers
 * @em directly.
 * The %Carp is a tool to be used by MediaWiki extension developers,
 * PHP programmers who write @em parser @em functions —
 * they are expected to use Carp class in their PHP code to provide their users,
 * template developers with good error messages.
 *
 * (TemplateSpecial extension provides service for @em template developers.)
 *
 * @section download Download
 *
 * @todo svn or git?
 *
 * @section installation Installation
 *
 * Add to your @c LocalSettings.php:
 *
 * @code
 * require_once( "$IP/extensions/Carp/Carp.php" );
 * @endcode
 *
 * @section configuration Configuration
 *
 * There is no any configurable parameters, at least now.
 *
 * @section usage Usage
 *
 * Let us consider an (incomplete) implementation of @c @#example parser function
 * which does not accept any arguments.
 * If user makes a mistake and specifies any argument(s), we want s/he see an error with call stack
 * backtrace.
 *
 * @code
 * class Example {
 * static function onParserFirstCallInit( &$parser ) {
 * $parser->setFunctionHook( 'example', 'Example::hookExample', Parser::SFH_OBJECT_ARGS );
 * // Note the flag Parser::SFH_OBJECT_ARGS -- it is important. We need a frame to unwind call stack.
 * return true;
 * }
 * static public function hookExample( $parser, $frame, $args ) {
 * try {
 * if ( count( $args ) > 0 ) {
 * // Oops, error: there are argument. Throw an exception.
 * // 'example-no-args' is not a message, but a *key* of message.
 * Carp::throwNew( 'example-no-args' );
 * };
 * return 'Hello from example!';
 * } catch ( Carp $ex ) {
 * // An exception is caught. Return error instead of normal result.
 * // User-visible name of parser function is '#example'.
 * return Carp::confess( '#example', $frame, $ex );
 * };
 * }
 * }
 * @endcode
 *
 * Being called from "Sandbox" page with no arguments:
 *
 * @code{.html}
 * {{ #example }}
 * @endcode
 *
 * the function produces:
 *
 * @code{.html}
 * Hello from example!
 * @endcode
 *
 * However, being called with an argument:
 *
 * @code{.html}
 * {{ #example: arg }}
 * @endcode
 *
 * The function produces:
 *
 * @code{.html}
 * <span class="error">{{ Sandbox }} → {{ #example: Function does not accept any arguments }}</span>
 * @endcode
 *
 * Note the @c {{ @c Sandbox @c }} — this is a call stack backtrace.
 * In the example call stack is very shallow,
 * because @c @#example is called directly from "Sandbox" page.
 * However, this may look like
 *
 * @code{.html}
 * <span class="error">{{ Sandbox }} → {{ Template:Foo }} → {{ Template:Bar }} → {{ #example: Function does not accept any arguments }}</span>
 * @endcode
 *
 * Result is enclosed into @c span element with class @c error, so it is:
 *
 * @li visually highligted (exact result depends on user's skin and site's stylesheets), and
 * @li recognized as error by @c @#iferror parser function defined in ParserFunctions extension.
 *
 * Error message itself ("Function does not accept any arguments"),
 * call stack order and decorators (braces) depend on user's language:
 *
 * @li Localization of error message should be provided by Example extension;
 * @li Decorators are internationalized by the %Carp extension (see files in i18n folder;
 * localization for a particular language may be missed);
 * @li In case of right-to-left language call stack is shown in reverse order,
 * frames will be separated by left arrows.
 *
 * This is straightforward (and recommended) %Carp extension usage,
 * suitable for almost any extension implementing parser functions.
 * Carp class also provides some low-level functionality (e. g. just template call stack
 * backtracing without error formatting). See description of class Carp for details.
 *
 * @section see_also See also
 *
 * @li %Carp, a well-known Perl module. It is a source of idea and some names
 * (%Carp, croak, confess).
 * @li TemplateSpecial, an MediaWiki extension providing similar service for @em template
 * developers (TemplateSpecial uses %Carp).
 *
 * @section license License
 *
 * GNU Affero General Public License, version 3 or any later version.
 * See AGPL-3.0.txt file for the full license text.
 */

/**
 * @file
 * @brief The primary include file of the extension.
 *
 * See @ref carp_extension for general extension description.
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'Carp' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Carp'] = __DIR__ . '/i18n';
	wfWarn(
		'Deprecated PHP entry point used for the Carp extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the Carp extension requires MediaWiki 1.29+' );
}
