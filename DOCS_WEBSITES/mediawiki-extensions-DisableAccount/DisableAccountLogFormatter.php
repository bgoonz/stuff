<?php

class DisableAccountLogFormatter extends LogFormatter {
	protected function getMessageParameters() {
		$params = parent::getMessageParameters();
		if ( count( $params ) == 3 ) {
			// Deal with old log entries which don't have this set (needed for GENDER support)
			$params[3] = $this->entry->getTarget()->getRootText();
		}
		return $params;
	}
}
