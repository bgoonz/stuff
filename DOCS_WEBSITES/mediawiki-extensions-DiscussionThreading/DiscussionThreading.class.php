<?php

class DiscussionThreading {
	/**
	 * @param $callobj
	 * @param $nt Title
	 * @param $section
	 * @param string $hint
	 * @param $result
	 * @return bool
	 */
	public static function onDoEditSectionLink ( $callobj , $nt , $section , $hint = '' , &$result ) {
		global $wgSectionThreadingOn;
		if( $wgSectionThreadingOn && $nt->isTalkPage() ) {
			$spanOpen="<span class=\"mw-editsection\">";
			$spanClose="</span>";
			$strippedResults = substr( substr( $result, strlen( $spanOpen ) ) , 0 , -strlen( $spanClose ) );

			$commenturl = array( 'action' => 'edit', 'section' => $section, 'replyto' => 'yes' );
			$hint = ( $hint == '' )
				? ''
				: array( 'title' => wfMessage( 'discussionthreading-replysectionhint', $hint )->escaped() );
			$curl = Linker::link(
				$nt,
				wfMessage( 'discussionthreading-replysection' )->escaped(),
				$hint,
				$commenturl,
				array( 'known' )
			);

			$newthreadurl = array( 'action' => 'edit', 'section' => 'new' );
			$hint = ( $hint == '' )
				? ''
				: array('title' => wfMessage( 'discussionthreading-threadnewsectionhint', $hint )->escaped() );
			$nurl = Linker::link(
				$nt,
				wfMessage( 'discussionthreading-threadnewsection' )->escaped(),
				$hint,
				$newthreadurl,
				array( 'known' )
			);

			$nurl = '<span class="mw-editsection-bracket">[</span>' . $nurl . '<span class="mw-editsection-bracket">]</span>';
			$curl = '<span class="mw-editsection-bracket">[</span>' . $curl . '<span class="mw-editsection-bracket">]</span>';
			$result = $spanOpen . $nurl . $strippedResults . $curl . $spanClose;
		}
		return true;
	}

	/**
	 * This function is a hook used to test to see if empty, if so, start a comment
	 *
	 * @param $efform EditPage object.
	 * @return  true
	 */
	public static function efDiscussionThreadEdit( $efform ) {
		global $wgRequest,$wgSectionThreadingOn;
		$efform->replytosection = '';
		$efform->replyadded = false;
		$efform->replytosection = $wgRequest->getVal( 'replyto' );
		if( !$efform->mTitle->exists() ) {
			if( $wgSectionThreadingOn && $efform->mTitle->isTalkPage() ) {
				$efform->section = 'new';
			}
		}
		return true;
	}

	/**
	 * Create a new header, one level below the 'replyto' header, add re: to front and tag it with user information
	 *
	 * @param $efform EditPage Object before display
	 * @return  true
	 */
	public static function efDiscussionThread($efform){
		global $wgSectionThreadingOn;
		$wgSectionThreadingOn = isset( $wgSectionThreadingOn ) ? $wgSectionThreadingOn : false;
		if ( $efform->replytosection != '' && $wgSectionThreadingOn  && isset( $efform->replyadded ) && !$efform->replyadded ) {
			if ($efform->replytosection != '' ) {
				$text = $efform->textbox1;
				$matches = array();
				preg_match( "/^(=+)(.+)\\1/mi" ,
					$efform->textbox1 ,
					$matches );
				if( !empty( $matches[2] ) ) {
					preg_match( "/.*(-+)\\1/mi" , $matches[2] , $matchsign );
					if (!empty($matchsign[0]) ){
						$text = $text."\n\n".$matches[1]."=Re: ".trim( $matchsign[0] )." ~~~~".$matches[1]."=";
					} else {
						$text = $text."\n\n".$matches[1]."=Re: ".trim( $matches[2] )." -- ~~~~".$matches[1]."=";
					}
				} else {
					$text = $text." -- ~~~~<br />\n\n";
				}
				// Add an appropriate number of colons (:) to indent the body.
				// Include replace me text, so the user knows where to reply
				$replaceMeText = " Replace this text with your reply";
				$text .= "\n\n".str_repeat( ":" , strlen( $matches[1] )-1 ).$replaceMeText;
				// Insert javascript hook that will select the replace me text
				global $wgOut;
				$wgOut->addScript("<script type=\"text/javascript\">
function efDiscussionThread(){
	var ctrl = document.editform.wpTextbox1;
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		var end = ctrl.value.length;
		ctrl.setSelectionRange(end-".strlen($replaceMeText).",end-1);
		ctrl.scrollTop = ctrl.scrollHeight;
	} else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(false);
		range.moveStart('character', -".strlen($replaceMeText).");
		range.select();
	}
}
addOnloadHook(efDiscussionThread);
			</script>"
				);
				$efform->replyadded = true;
				$efform->textbox1 = $text;
			}
		}
		return true;
	}

	/**
	 * When the new header is created from summary in new (+) add comment, just stamp the header as created
	 *
	 * @param $efform EditPage Object before display
	 * @return  true
	 */
	public static function onAttemptSave( $efform ){
		global $wgSectionThreadingOn;
		$wgSectionThreadingOn = isset($wgSectionThreadingOn) ? $wgSectionThreadingOn : false;
		if ( $efform->section == "new" && $wgSectionThreadingOn && isset( $efform->replyadded ) && !$efform->replyadded ) {
			$efform->summary = $efform->summary." -- ~~~~";
		}
		return true;
	}
}
