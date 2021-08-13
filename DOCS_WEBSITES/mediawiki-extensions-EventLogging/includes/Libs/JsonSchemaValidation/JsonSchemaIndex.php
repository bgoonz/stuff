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
 * The JsonSchemaIndex object holds all schema refs with an "id", and is used
 * to resolve an idref to a schema ref.  This also holds the root of the schema
 * tree.  This also serves as sort of a class factory for schema refs.
 */
class JsonSchemaIndex {
	/** @var array|null */
	public $root;
	/** @var array */
	public $idtable;

	/**
	 * The whole tree is indexed on instantiation of this class.
	 * @param array|null $schema
	 */
	public function __construct( $schema ) {
		$this->root = $schema;
		$this->idtable = [];

		if ( $this->root === null ) {
			return;
		}

		$this->indexSubtree( $this->root );
	}

	/**
	 * Recursively find all of the ids in this schema, and store them in the
	 * index.
	 * @param array $schemanode
	 */
	public function indexSubtree( $schemanode ) {
		if ( !array_key_exists( 'type', $schemanode ) ) {
			$schemanode['type'] = 'any';
		}
		$nodetype = $schemanode['type'];
		switch ( $nodetype ) {
			case 'object':
				foreach ( $schemanode['properties'] as $value ) {
					$this->indexSubtree( $value );
				}

				break;
			case 'array':
				$this->indexSubtree( $schemanode['items'] );
				break;
		}
		if ( isset( $schemanode['id'] ) ) {
			$this->idtable[$schemanode['id']] = $schemanode;
		}
	}

	/**
	 * Generate a new schema ref, or return an existing one from the index if
	 * the node is an idref.
	 * @param array $node
	 * @param TreeRef|null $parent
	 * @param int|null $nodeindex
	 * @param string $nodename
	 * @return TreeRef
	 * @throws JsonSchemaException
	 */
	public function newRef( $node, $parent, $nodeindex, $nodename ) {
		if ( array_key_exists( '$ref', $node ) ) {
			if ( strspn( $node['$ref'], '#' ) != 1 ) {
				throw new JsonSchemaException( 'jsonschema-badidref', $node['$ref'] );
			}
			$idref = $node['$ref'];
			try {
				$node = $this->idtable[$idref];
			}
			catch ( Exception $e ) {
				throw new JsonSchemaException( 'jsonschema-badidref', $node['$ref'] );
			}
		}

		return new TreeRef( $node, $parent, $nodeindex, $nodename );
	}
}
