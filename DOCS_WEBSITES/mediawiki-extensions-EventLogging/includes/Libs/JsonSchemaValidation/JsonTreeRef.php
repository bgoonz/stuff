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

/**
 * Structure for representing a data tree, where each node (ref) is aware of its
 * context and associated schema.
 */
class JsonTreeRef {

	/** @var mixed|null */
	public $node;

	/** @var JsonTreeRef|null */
	public $parent;

	/** @var int|null */
	public $nodeindex;

	/** @var string|null */
	public $nodename;

	/** @var TreeRef|null */
	public $schemaref;

	/** @var string */
	public $fullindex;

	/** @var array */
	public $datapath;

	/** @var JsonSchemaIndex */
	public $schemaindex;

	/**
	 * @param mixed|null $node
	 * @param JsonTreeRef|null $parent
	 * @param int|null $nodeindex
	 * @param string|null $nodename
	 * @param TreeRef|null $schemaref
	 */
	public function __construct(
		$node,
		$parent = null,
		$nodeindex = null,
		$nodename = null,
		$schemaref = null
	) {
		$this->node = $node;
		$this->parent = $parent;
		$this->nodeindex = $nodeindex;
		$this->nodename = $nodename;
		$this->schemaref = $schemaref;
		$this->fullindex = $this->getFullIndex();
		$this->datapath = [];
		if ( $schemaref !== null ) {
			$this->attachSchema();
		}
	}

	/**
	 * Associate the relevant node of the JSON schema to this node in the JSON
	 * @param null|array $schema
	 */
	public function attachSchema( $schema = null ) {
		if ( $schema !== null ) {
			$this->schemaindex = new JsonSchemaIndex( $schema );
			$this->nodename = $schema['title'] ?? 'Root node';
			$this->schemaref = $this->schemaindex->newRef( $schema, null, null, $this->nodename );
		} elseif ( $this->parent !== null ) {
			$this->schemaindex = $this->parent->schemaindex;
		}
	}

	/**
	 * Return the title for this ref, typically defined in the schema as the
	 * user-friendly string for this node.
	 * @return string
	 */
	public function getTitle() {
		if ( isset( $this->nodename ) ) {
			return $this->nodename;
		}
		if ( isset( $this->node['title'] ) ) {
			return $this->node['title'];
		}

		return (string)$this->nodeindex;
	}

	/**
	 * Rename a user key.  Useful for interactive editing/modification, but not
	 * so helpful for static interpretation.
	 * @param int $newindex
	 */
	public function renamePropname( $newindex ) {
		$oldindex = $this->nodeindex;
		$this->parent->node[$newindex] = $this->node;
		$this->nodeindex = $newindex;
		$this->nodename = (string)$newindex;
		$this->fullindex = $this->getFullIndex();
		unset( $this->parent->node[$oldindex] );
	}

	/**
	 * Return the type of this node as specified in the schema.  If "any",
	 * infer it from the data.
	 * @return mixed
	 */
	public function getType() {
		if ( array_key_exists( 'type', $this->schemaref->node ) ) {
			$nodetype = $this->schemaref->node['type'];
		} else {
			$nodetype = 'any';
		}

		if ( $nodetype === 'any' ) {
			if ( $this->node === null ) {
				return null;
			}
			return JsonUtil::getType( $this->node );
		}

		return $nodetype;
	}

	/**
	 * Return a unique identifier that may be used to find a node.  This
	 * is only as robust as stringToId is (i.e. not that robust), but is
	 * good enough for many cases.
	 * @return string
	 */
	public function getFullIndex() {
		if ( $this->parent === null ) {
			return 'json_root';
		}

		return $this->parent->getFullIndex() . '.' . JsonUtil::stringToId( $this->nodeindex );
	}

	/**
	 * Get a path to the element in the array.  if $foo['a'][1] would load the
	 * node, then the return value of this would be array('a',1)
	 * @return array
	 */
	public function getDataPath() {
		if ( !is_object( $this->parent ) ) {
			return [];
		}
		$retval = $this->parent->getDataPath();
		$retval[] = $this->nodeindex;
		return $retval;
	}

	/**
	 * Return path in something that looks like an array path.  For example,
	 * for this data: [{'0a':1,'0b':{'0ba':2,'0bb':3}},{'1a':4}]
	 * the leaf node with a value of 4 would have a data path of '[1]["1a"]',
	 * while the leaf node with a value of 2 would have a data path of
	 * '[0]["0b"]["oba"]'
	 * @return string
	 */
	public function getDataPathAsString() {
		$retval = '';
		foreach ( $this->getDataPath() as $item ) {
			$retval .= '[' . json_encode( $item ) . ']';
		}
		return $retval;
	}

	/**
	 * Return data path in user-friendly terms.  This will use the same
	 * terminology as used in the user interface (1-indexed arrays)
	 * @return string
	 */
	public function getDataPathTitles() {
		if ( !is_object( $this->parent ) ) {
			return $this->getTitle();
		}

		return $this->parent->getDataPathTitles() . ' -> '
			. $this->getTitle();
	}

	/**
	 * Return the child ref for $this ref associated with a given $key
	 * @param int|string $key
	 * @return JsonTreeRef
	 * @throws JsonSchemaException
	 */
	public function getMappingChildRef( $key ) {
		$snode = $this->schemaref->node;
		$schemadata = [];
		$nodename = $key;
		if ( array_key_exists( 'properties', $snode ) &&
			array_key_exists( $key, $snode['properties'] ) ) {
			$schemadata = $snode['properties'][$key];
			$nodename = $schemadata['title'] ?? $key;
		} elseif ( array_key_exists( 'additionalProperties', $snode ) ) {
			// additionalProperties can *either* be a boolean or can be
			// defined as a schema (an object)
			if ( gettype( $snode['additionalProperties'] ) === 'boolean' ) {
				if ( !$snode['additionalProperties'] ) {
					throw new JsonSchemaException( 'jsonschema-invalidkey',
						(string)$key, $this->getDataPathTitles() );
				}
			} else {
				$schemadata = $snode['additionalProperties'];
				$nodename = $key;
			}
		}
		// @phan-suppress-next-line PhanTypeArraySuspiciousNullable
		$value = $this->node[$key];
		$schemai = $this->schemaindex->newRef( $schemadata, $this->schemaref, $key, (string)$key );

		return new JsonTreeRef( $value, $this, $key, $nodename, $schemai );
	}

	/**
	 * Return the child ref for $this ref associated with a given index $i
	 * @param int $i
	 * @return JsonTreeRef
	 */
	public function getSequenceChildRef( $i ) {
		// TODO: make this conform to draft-03 by also allowing single object
		if ( array_key_exists( 'items', $this->schemaref->node ) ) {
			$schemanode = $this->schemaref->node['items'];
		} else {
			$schemanode = [];
		}
		$itemname = $schemanode['title'] ?? "Item";
		$nodename = $itemname . " #" . ( (string)( $i + 1 ) );
		$schemai = $this->schemaindex->newRef( $schemanode, $this->schemaref, 0, (string)$i );

		// @phan-suppress-next-line PhanTypeArraySuspiciousNullable
		return new JsonTreeRef( $this->node[$i], $this, $i, $nodename, $schemai );
	}

	/**
	 * Validate the JSON node in this ref against the attached schema ref.
	 * Return true on success, and throw a JsonSchemaException on failure.
	 * @return bool
	 */
	public function validate() {
		if ( array_key_exists( 'enum', $this->schemaref->node ) &&
			!in_array( $this->node, $this->schemaref->node['enum'] ) ) {
			$e = new JsonSchemaException( 'jsonschema-invalid-notinenum',
				JsonUtil::encodeForMsg( $this->node ), $this->getDataPathTitles() );
			$e->subtype = 'validate-fail';
			throw $e;
		}
		$datatype = JsonUtil::getType( $this->node );
		$schematype = $this->getType();
		if ( $datatype === 'array' && $schematype === 'object' ) {
			// PHP datatypes are kinda loose, so we'll fudge
			$datatype = 'object';
		}
		if ( $datatype === 'number' && $schematype === 'integer' &&
			$this->node == (int)$this->node ) {
			// Alright, it'll work as an int
			$datatype = 'integer';
		}
		if ( $datatype != $schematype ) {
			if ( $datatype === null && !is_object( $this->parent ) ) {
				$e = new JsonSchemaException( 'jsonschema-invalidempty' );
				$e->subtype = 'validate-fail-null';
				throw $e;
			}
			$datatype = $datatype ?: 'null';
			$e = new JsonSchemaException( 'jsonschema-invalidnode',
				$schematype, $datatype, $this->getDataPathTitles() );
			$e->subtype = 'validate-fail';
			throw $e;
		}
		switch ( $schematype ) {
			case 'object':
				$this->validateObjectChildren();
				break;
			case 'array':
				$this->validateArrayChildren();
				break;
		}
		return true;
	}

	private function validateObjectChildren() {
		if ( array_key_exists( 'properties', $this->schemaref->node ) ) {
			foreach ( $this->schemaref->node['properties'] as $skey => $svalue ) {
				$keyRequired = array_key_exists( 'required', $svalue ) ? $svalue['required'] : false;
				if ( $keyRequired && !array_key_exists( $skey, $this->node ) ) {
					$e = new JsonSchemaException( 'jsonschema-invalid-missingfield', $skey );
					$e->subtype = 'validate-fail-missingfield';
					throw $e;
				}
			}
		}

		foreach ( $this->node as $key => $value ) {
			$jsoni = $this->getMappingChildRef( $key );
			$jsoni->validate();
		}
		return true;
	}

	private function validateArrayChildren() {
		$length = count( $this->node );
		for ( $i = 0; $i < $length; $i++ ) {
			$jsoni = $this->getSequenceChildRef( $i );
			$jsoni->validate();
		}
	}
}
