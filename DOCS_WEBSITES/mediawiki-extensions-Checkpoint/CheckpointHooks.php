<?php

class CheckpointHooks {

	static function efCheckpointButton( $editpage, &$buttons ) {
		$attr = [
			'id'    => 'wpCheckpoint',
			'name'  => 'wpCheckpoint',
			'type'  => 'submit',
			'value' => wfMessage( 'checkpoint' )->text(),
			'title' => wfMessage( 'checkpoint-tooltip' )->text(),
		];
		$buttons['checkpoint'] = Xml::element( 'input', $attr, '' );
		return true;
	}

	static function efCheckpointSave( WikiPage &$wikiPage, &$user, &$content, &$summary,
		$isMinor, $isWatch, $section, &$flags, &$status ) {
		global $wgRequest;

		if ( $wgRequest->getCheck( 'wpCheckpoint' ) ) {
			if ( $summary == '' ) {
				// blank summary, so let's get an automatic one if
				// applicable (the appending bit prevents autosummaries
				// from appearing otherwise).
				$old_content = $wikiPage->getContent( Revision::RAW ); // current revision
				$summary = $wikiPage->getContentHandler()->getAutosummary( $old_content, $content, $flags );
			}
			$summary .= wfMessage( 'word-separator' )->text() . wfMessage( 'checkpoint-notice' )->text();
		}
		return true;
	}

	static function efCheckpointReturn( $title, &$url, $query ) {
		global $wgRequest;

		if ( $wgRequest->wasPosted() && $wgRequest->getCheck( 'wpCheckpoint' ) ) {
			$frag = $title->getFragmentForURL();
			$querystr = strpos( $url, '?' ) ? '&' : '?'; // see if we need to append a ? or a &
			if ( $frag == '' ) {
				// just append our query to the end
				$url .= $querystr . 'action=edit&preview=yes';
			} else {
				// do a string replace
				$url = str_replace( $frag, $querystr . 'action=edit&preview=yes' . $frag, $url );
			}
		}
		return true;
	}

}
