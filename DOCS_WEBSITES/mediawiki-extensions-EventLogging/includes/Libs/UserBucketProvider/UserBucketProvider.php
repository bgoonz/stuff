<?php

/**
 * Utilities for getting low-granularity segmentation of users.
 */
class UserBucketProvider {

	/**
	 * Find the coarse bucket corresponding to a user's edit count.
	 *
	 * Usually safe to keep in sanitized streams.
	 *
	 * These bucket labels are the current standard, but are subject to change in the future.
	 * Sites may override this service and define their own metrics buckets.  If we rely on coarse bucketing to
	 * protect user identity, it's important to not mix different bucketing thresholds, since the intersections
	 * can reveal more detail than intended.
	 *
	 * @param User $user provides raw edit count
	 * @return string|null Bucket identifier, or null for anonymous users.
	 */
	public static function getUserEditCountBucket( User $user ): ?string {
		$editCount = $user->getEditCount();
		if ( $editCount === null ) {
			return null;
		}
		if ( $editCount >= 1000 ) {
			return '1000+ edits';
		}
		if ( $editCount >= 100 ) {
			return '100-999 edits';
		}
		if ( $editCount >= 5 ) {
			return '5-99 edits';
		}
		if ( $editCount >= 1 ) {
			return '1-4 edits';
		}
		return '0 edits';
	}

}
