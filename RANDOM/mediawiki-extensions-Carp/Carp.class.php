<?php // Carp.class.php //

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
 * @file
 * @brief The implementation of the extension.
 *
 * See @ref carp_extension for general extension description,
 * and Carp for description of class.
 */

use MediaWiki\MediaWikiServices;

/**
 * @brief Primary and the only class of the %Carp extension
 *
 * See @ref carp_extension for extension description,
 * which includes recommended usage of the %Carp class.
 *
 * Carp class extends PHP's Exception class and provides few static functions for error reporting.
 * In an implementation of a parser function you will likely use just two functions:
 *
 * @li Carp::throwNew — Throw an exception.
 * @li Carp::confess — Format error from caught exception. Error will include
 * template call stack backtrace to let end-user (an article editor or template developer)
 * localize an error more easily.
 *
 * These functions also can be used (but consider Carp::confess first):
 *
 * @li Carp::croak
 * @li Carp::fmess
 *
 * These two functions provide low-level access to template call stack backtracing:
 *
 * @li Carp::getNextFrame
 * @li Carp::getFrameName
 *
 * They are definitely internal implementation details, but they are made public intentionally —
 * backtracing may be useful in some circumstances.
 */
class Carp extends Exception {

	/**
	 * @brief Throws an exception of Carp class.
	 * @param string $key Message @em key (@em not message!).
	 * @param mixed ...$params Parameters of message, if any.
	 *
	 * The funtion constructs new message from the specified message key and parameters, then
	 * creates a new instance of class Carp, then throws an exception.
	 *
	 * Use it when error condition is detected, for example:
	 *
	 * @code
	 * if ( $arg < 0 ) {
	 * // 'negative-arg' is a key of message with one argument.
	 * Carp::throwNew( 'negative-arg', $arg );
	 * }
	 * @endcode
	 */
	public static function throwNew( $key, ...$params ) {
		$msg = wfMessage( $key, $params )->escaped();
		throw new Carp( $msg );
	} // function throwNew

	/**
	 * @brief Create error for a @em parser @em function from given exception.
	 * @param string $name User-visible name of parser function. This cannot be fetched
	 * from frame, so the name should be explicitly specified. Specify name as it visible in
	 * wikitext (including leading hash, if any), not in PHP code.
	 * @param PPFrame $frame Parser frame the parser function is called from.
	 * @param Exception $ex Caught exception — a source of message. It can be either an
	 * instance of class Exception or any of its descendants (including Carp). Message is
	 * fetched by invoking @c getMessage method.
	 * @param bool $stack If @c true, result includes call stack backtrace,
	 * otherwise call stack backtrace is not included.
	 * @return string an error to return from parser function.
	 * It is enclosed into @c span HTML element with class @c error,
	 * so will be visually highlighted and recognized as error by @#iferror parser function
	 * (defined in ParserFunctions extension).
	 * Call stack backtrace will be reversed in case of right-to-left language.
	 * Exact formatting may be localized depending on user's language.
	 *
	 * This function is intended to be called from implementation of a @em parser @em function
	 * to create error to return instead of normal result.
	 *
	 * Carp::croak and Carp::confess are simple wrappers for this function.
	 * The only difference is that Carp::confess @em includes call stack backtrace,
	 * Carp::croak does @em not,
	 * and this one allows to choose it in runtime by specifying the value of parameter $stack.
	 * Consider using Carp::confess first.
	 */
	public static function fmess( $name, $frame, $ex, $stack = true ) {
		global $firephp;
		$firephp->log( get_class( $frame ) );
		$err = [];
		$err[] = wfMessage( 'carp-function-msg', $name, $ex->getMessage() )->escaped();
		$contentLanguage = MediaWikiServices::getInstance()->getContentLanguage();
		if ( $stack ) {
			while ( $frame !== false ) {
				$err[] = wfMessage( 'carp-template', self::getFrameName( $frame ) )->escaped();
				$frame = self::getNextFrame( $frame );
			} // while
			if ( !$contentLanguage->isRTL() ) {
				$err = array_reverse( $err );
			} // if
		}
		return '<span class="error">' .
			implode( ' ' . $contentLanguage->getArrow() . ' ', $err ) .
			'</span>';
	} // function fmess

	/**
	 * @brief Create error for a @em template from given exception.
	 * @param int $skip Number of frames to skip from the top of call stack.
	 * @param PPFrame $frame Parser frame.
	 * @param Exception $ex Caught exception.
	 * @param bool $stack If @c true, result includes call stack backtrace,
	 * otherwise call stack backtrace is not included.
	 * @return string error to return from a @em template.
	 *
	 * It is unlikely you need this function. Look at Carp::confess first.
	 *
	 * This function is similar to Carp::fmess, but this one is intended to report an error
	 * from a @em template, not from a @em parser @em function. Strictly, differences between
	 * these two functions are:
	 *
	 * @li There is no $name parameter because name of template can be fetched from frame.
	 * @li It is possible to skip few items from the top of the call stack. It allows writing
	 * templates which report errors on behalf of other templates.
	 * @li Error is formatted slightly different.
	 *
	 * @note This is not a @em parser @em function, and so, it can not be called from wikitext
	 * directly.
	 * This is a PHP function which provides basic functionality,
	 * but providing parser function is out of scope of %Carp extension.
	 * TemplateSpecial extension defines parser function.
	 */
	public static function tmess( $skip, $frame, $ex, $stack = true ) {
		$err = [];
		while ( $skip > 0 && $frame !== false ) {
			$frame = self::getNextFrame( $frame );
			--$skip;
		} // while
		$err[] = wfMessage( 'carp-template-msg', self::getFrameName( $frame, true ), $ex->getMessage() )->escaped();
		$contentLanguage = MediaWikiServices::getInstance()->getContentLanguage();
		if ( $stack ) {
			$frame = self::getNextFrame( $frame );
			while ( $frame !== false ) {
				$err[] = wfMessage( 'carp-template', self::getFrameName( $frame, true ) )->escaped();
				$frame = self::getNextFrame( $frame );
			} // while
			if ( !$contentLanguage->isRTL() ) {
				$err = array_reverse( $err );
			} // if
		}
		return '<span class="error">' .
			implode( ' ' . $contentLanguage->getArrow() . ' ', $err ) .
			'</span>';
	} // function tmess

	/**
	 * @brief Creates error for a @em parser @em function from given exception
	 * @em without call stack backtrace.
	 * @param string $name User-visible name of parser function.
	 * @param PPFrame $frame Parser frame the parser function is called from.
	 * @param Exception $ex Caught exception.
	 * @return string error to return from a parser function.
	 *
	 * This function is intended to be called from implementation of a parser function to create
	 * error to return from the parser function instead of normal result.
	 *
	 * This function creates error @em without call stack backtrace, while similar
	 * Carp::confess returns an error @em with backtrace. Both are simle wrappers for
	 * Carp::fmess, but this one is @em not recommended to use, use Carp::confess instead.
	 *
	 * @sa
	 * @li Carp::confess — recommended function
	 * @li Carp::fmess — for more detailed description
	 */
	public static function croak( $name, $frame, $ex ) {
		return self::fmess( $name, $frame, $ex, false );
	} // function croak

	/**
	 * @brief Creates error for a @em parser @em function from given exception @em with call stack
	 * backtrace.
	 * @param string $name User-visible mame of parser function.
	 * @param PPFrame $frame Parser frame the parser function is called from.
	 * @param Exception $ex Caught exception.
	 * @return string error to return from a parser function.
	 *
	 * This function is intended to be called from implementation of a @em parser @em function
	 * to create error to return from the parser function instead of normal result.
	 * See an example of usage in @ref carp_extension.
	 *
	 * This function creates an error @em with template call stack backtrace, while similar
	 * Carp::croak creates an error @em without backtrace. Both are simle wrappers for
	 * Carp::fmess, but this one is @em recommended to use.
	 *
	 * @sa
	 * @li Carp::croak
	 * @li Carp::fmess — for more detailed description
	 */
	public static function confess( $name, $frame, $ex ) {
		return self::fmess( $name, $frame, $ex, true );
	} // function confess

	/**
	 * @brief Returns name of specified frame.
	 * @param PPFrame $frame
	 * @param bool $full If @c true, result is a full name of frame (with prefix,i. e.
	 * namespace name), otherwise result is a short name (without prefix).
	 * @param bool $canonical If @c true, result's prefix (if any) is canonical (e. g.
	 * English, not localized), otherwise result's prefix is localized. This parameter
	 * does not matter if $full is @c false.
	 * @return string a frame name. Empty string is returned in case of problems ($frame is not
	 * an instance of PPFrame, there is no frame title, etc).
	 */
	public static function getFrameName( $frame, $full = false, $canonical = false ) {
		if ( method_exists( $frame, 'getTitle' ) ) {
			$title = $frame->getTitle();
		} elseif ( property_exists( $frame, 'title' ) ) {
			$title = $frame->title;
		} else {
			return '';
		} // if
		if ( !$title instanceof Title ) {
			return '';
		} // if

		if ( $full ) {
			if ( $canonical ) {
				$text = $title->getText();
				if ( $text == '' ) {
					return $text;
				} // if
				$ns = $title->getNamespace();
				if ( $ns == NS_MAIN ) {
					return $text;
				} // if
				return MWNamespace::getCanonicalName( $ns ) . ':' . $text;
			} else {
				return $title->getPrefixedText();
			} // if
		} else {
			return $title->getText();
		} // if
	} // function getFrameName

	/**
	 * @brief Returns parent of the specified frame.
	 * @param PPFrame $frame A frame.
	 * @return PPFrame a parent of the specified frame, or @c false, if parent frame does not
	 * exist or $frame is not an instance of Frame (more precisely, if $frame does not have
	 * property @c parent).
	 */
	public static function getNextFrame( $frame ) {
		if ( property_exists( $frame, 'parent' ) ) {
			return $frame->parent;
		} // if
		return false;
	} // function getNextFrame

} // class Carp

// end of file //
