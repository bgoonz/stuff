<?php
/**
 * JSON Schema Validation Library
 *
 * Copyright (c) 2005-2012, Rob Lanphier
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 	* Redistributions of source code must retain the above copyright
 * 	  notice, this list of conditions and the following disclaimer.
 *
 * 	* Redistributions in binary form must reproduce the above
 * 	  copyright notice, this list of conditions and the following
 * 	  disclaimer in the documentation and/or other materials provided
 * 	  with the distribution.
 *
 * 	* Neither my name nor the names of my contributors may be used to
 * 	  endorse or promote products derived from this software without
 * 	  specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author Rob Lanphier <robla@wikimedia.org>
 * @copyright © 2011-2012 Rob Lanphier
 * @license http://jsonwidget.org/LICENSE BSD-3-Clause
 */

class JsonUtil {
	/**
	 * Converts the string into something safe for an HTML id.
	 * performs the easiest transformation to safe id, but is lossy
	 * @param int|string $var
	 * @return string
	 * @throws JsonSchemaException
	 */
	public static function stringToId( $var ) {
		if ( is_int( $var ) ) {
			return (string)$var;
		}
		if ( is_string( $var ) ) {
			return preg_replace( '/[^a-z0-9\-_:\.]/i', '', $var );
		}

		throw new JsonSchemaException( 'jsonschema-idconvert', self::encodeForMsg( $var ) );
	}

	/**
	 * Converts data to JSON format with pretty-formatting, but limited to a single line and escaped
	 * to be suitable for wikitext message parameters.
	 * @param array $data
	 * @return string
	 */
	public static function encodeForMsg( $data ) {
		if ( class_exists( FormatJson::class ) && function_exists( 'wfEscapeWikiText' ) ) {
			$json = FormatJson::encode( $data, "\t", FormatJson::ALL_OK );
			// Literal newlines can't appear in JSON string values, so this neatly folds the formatting
			$json = preg_replace( "/\n\t+/", ' ', $json );
			return wfEscapeWikiText( $json );
		}

		return json_encode( $data );
	}

	/**
	 * Given a type (e.g. 'object', 'integer', 'string'), return the default/empty
	 * value for that type.
	 * @param string $thistype
	 * @return mixed
	 */
	public static function getNewValueForType( $thistype ) {
		switch ( $thistype ) {
			case 'object':
				$newvalue = [];
				break;
			case 'array':
				$newvalue = [];
				break;
			case 'number':
			case 'integer':
				$newvalue = 0;
				break;
			case 'string':
				$newvalue = '';
				break;
			case 'boolean':
				$newvalue = false;
				break;
			default:
				$newvalue = null;
				break;
		}

		return $newvalue;
	}

	/**
	 * Return a JSON-schema type for arbitrary data $foo
	 * @param mixed $foo
	 * @return mixed
	 */
	public static function getType( $foo ) {
		if ( $foo === null ) {
			return null;
		}

		switch ( gettype( $foo ) ) {
			case 'array':
				$retval = 'array';
				foreach ( array_keys( $foo ) as $key ) {
					if ( !is_int( $key ) ) {
						$retval = 'object';
					}
				}
				return $retval;
			case 'integer':
			case 'double':
				return 'number';
			case 'boolean':
				return 'boolean';
			case 'string':
				return 'string';
			default:
				return null;
		}
	}

	/**
	 * Generate a schema from a data example ($parent)
	 * @param mixed $parent
	 * @return array
	 */
	public static function getSchemaArray( $parent ) {
		$schema = [];
		$schema['type'] = self::getType( $parent );
		switch ( $schema['type'] ) {
			case 'object':
				$schema['properties'] = [];
				foreach ( $parent as $name ) {
					$schema['properties'][$name] = self::getSchemaArray( $parent[$name] );
				}

				break;
			case 'array':
				$schema['items'] = [];
				$schema['items'][0] = self::getSchemaArray( $parent[0] );
				break;
		}

		return $schema;
	}
}
