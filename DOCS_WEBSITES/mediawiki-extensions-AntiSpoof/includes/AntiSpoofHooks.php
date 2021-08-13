<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */

class AntiSpoofHooks {
	/**
	 * @param DatabaseUpdater $updater
	 * @return bool
	 */
	public static function asUpdateSchema( DatabaseUpdater $updater ) {
		$updater->addExtensionTable( 'spoofuser',
			__DIR__ . '/../sql/patch-antispoof.' . $updater->getDB()->getType() . '.sql' );
		return true;
	}

	/**
	 * On new account creation, record the username's thing-bob.
	 * Replaces AddNewAccountHook for more modern MediaWiki versions-
	 *
	 * @param User $user
	 * @return bool
	 */
	public static function asLocalUserCreated( $user ) {
		$spoof = new SpoofUser( $user->getName() );
		$spoof->record();
		return true;
	}

	/**
	 * On rename, remove the old entry and add the new
	 * (After a successful user rename)
	 *
	 * @param string $uid
	 * @param string $oldName
	 * @param string $newName
	 * @return bool
	 */
	public static function asAddRenameUserHook( $uid, $oldName, $newName ) {
		$spoof = new SpoofUser( $newName );
		$spoof->update( $oldName );
		return true;
	}

	/**
	 * @param User &$oldUser
	 * @return bool
	 */
	public static function asDeleteAccount( User &$oldUser ) {
		$spoof = new SpoofUser( $oldUser->getName() );
		$spoof->remove();
		return true;
	}
}
