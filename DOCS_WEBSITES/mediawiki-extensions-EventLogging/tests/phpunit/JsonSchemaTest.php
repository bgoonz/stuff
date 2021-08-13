<?php
/**
 * PHP Unit tests for JsonSchemaContent.
 *
 * @file
 * @ingroup Extensions
 *
 * @author Ori Livneh <ori@wikimedia.org>
 */

/**
 * @group EventLogging
 * @covers JsonSchemaContent
 */
class JsonSchemaTest extends MediaWikiTestCase {

	private const INVALID_JSON = '"Malformed, JSON }';
	private const INVALID_JSON_SCHEMA = '{"malformed":true}';  // Valid JSON, invalid JSON Schema.
	private const VALID_JSON_SCHEMA = '{"properties":{"valid":{"type":"boolean","required":true}}}';
	private const EVIL_JSON = '{"title":"<script>alert(document.cookie);</script>"}';

	/**
	 * Tests handling of invalid JSON.
	 * @covers JsonSchemaContent::isValid
	 */
	public function testInvalidJson() {
		$content = new JsonSchemaContent( self::INVALID_JSON );
		$this->assertFalse( $content->isValid(), 'Malformed JSON should be detected.' );
	}

	/**
	 * Tests handling of valid JSON that is not valid JSON Schema.
	 * @covers JsonSchemaContent::isValid
	 */
	public function testInvalidJsonSchema() {
		$content = new JsonSchemaContent( self::INVALID_JSON_SCHEMA );
		$this->assertFalse( $content->isValid(), 'Malformed JSON Schema should be detected.' );
	}

	/**
	 * Tests successful validation of well-formed JSON Schema.
	 * @covers JsonSchemaContent::isValid
	 */
	public function testValidJsonSchema() {
		$content = new JsonSchemaContent( self::VALID_JSON_SCHEMA );
		$this->assertTrue( $content->isValid(), 'Valid JSON Schema should be recognized as valid.' );
	}

	/**
	 * Tests JSON pretty-printing.
	 * @covers JsonSchemaContent::preSaveTransform
	 */
	public function testPreSaveTransform() {
		$user = new User();
		$transformed = new JsonSchemaContent( self::VALID_JSON_SCHEMA );
		$prettyJson = $transformed->preSaveTransform(
			$this->createMock( Title::class ),
			$user,
			new ParserOptions( $user )
		)->getText();

		$this->assertStringContainsString( "\n", $prettyJson, 'Transformed JSON is beautified.' );
		$this->assertEquals(
			FormatJson::decode( $prettyJson ),
			FormatJson::decode( self::VALID_JSON_SCHEMA ),
			'Beautification does not alter JSON value.'
		);
	}

	/**
	 * Tests JSON->HTML representation.
	 * @covers JsonSchemaContent::getText
	 */
	public function testGetText() {
		$content = new JsonSchemaContent( self::EVIL_JSON );
		$out = $content->getParserOutput(
			Title::newFromText( 'Test' ),
			null,
			null,
			/* html */ true
		);
		$this->assertStringContainsString(
			'&lt;script>',
			$out->getText(),
			'HTML output should be escaped'
		);
	}
}
