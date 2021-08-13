<?php
/**
 * Blackout class
 * This file is part of Extension:Blackout
 *
 * Copyright (C) 2012, Gregory Varnum & John Du Hart
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class Blackout {

	/**
	 * Override action hook. This is the show-stopper
	 *
	 * @param OutputPage $output
	 * @param Article $article
	 * @param Title $title
	 * @param User $user
	 * @param WebRequest $request
	 * @param MediaWiki $wiki
	 * @return bool
	 */
	public static function overrideAction( $output, $article, $title, $user, $request, $wiki ) {
		global $wgBlackout;

		// You know what this does
		if ( !$wgBlackout['Enable'] ) {
			return true;
		}

		// Check the article whitelist
		if ( in_array( $title->getPrefixedDBkey(), $wgBlackout['Whitelist'] ) ) {
			return true;
		}

		$skinClass = "Skin{$wgBlackout['Skin']}";
		$skin = new $skinClass();
		$output->getContext()->setSkin( $skin );

		return false;
	}
}
