<?php

/**
 * Variation of CodeRevisionCommiter for use in the API. Removes the post and token checking from
 * validPost API can/will do both the POST and token
 */
class CodeRevisionCommitterApi extends CodeRevisionCommitter {
	/**
	 * Check whether the user has the correct permissions for the action
	 *
	 * @param string $permission
	 * @param User $user
	 * @return bool
	 */
	public function validPost( $permission, User $user ) {
		return $user->isAllowed( $permission );
	}
}
