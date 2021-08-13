# CocoaLibSpotify 2.4.5 for libspotify 12, release August 12th, 2013

- libspotify cache and offline sync directories are no longer backed up to iCloud.

# CocoaLibSpotify 2.4.4 for libspotify 12, released June 27th 2013

- Uses libspotify 12.1.64 for iOS, which provides:

  - Fixes an issue that would cause a crash on login in certain circumstances.

- `-[SPSession attemptLoginWithUserName:existingCredential:]` should no longer hang for five minutes on iOS hardware.

# CocoaLibSpotify 2.4.3 for libspotify 12, released May 20th 2013

- Uses libspotify 12.1.62 for iOS, which provides:

  - Fixes an issue that would cause applications using libspotify to be rejected from the iOS App Store.
  - Adds armv7s build.
  - Fixes a potential crashing problem.

- `SPDispatchSyncIfNeeded` and `SPDispatchAsync` are now declared as inline functions rather than macros to aid debugging.

- Unit tests output the version of libspotify being used at runtime.

# CocoaLibSpotify 2.4.2 for libspotify 12, released January 29th 2013

- Fixes build on Xcode 4.6.

# CocoaLibSpotify 2.4.1 for libspotify 12, released January 28th 2013

- Adds a build script that corrects a problem in libspotify 12 preventing submission of CocoaLibSpotify applications to the Mac App Store (GitHub issue #136).

# CocoaLibSpotify 2.4.0 for libspotify 12, released November 14th 2012

- Improvements to packaging of sample projects, including an updated `USER_HEADER_SEARCH_PATHS` setting that allows archiving of iOS projects.

- Large rewrite of the library's internal threading. This shouldn't affect your project, but please test your application thoroughly before releasing with this version.

- Add to and document threading helper macros.

- Improve `SPCoreAudioController` and `SPCircularBuffer`, fixing a bug that could result in corrupted audio playback.

- `-[SPSession -trackForTrackStruct:]` no longer crashes on a `NULL` struct.

- Improved unit tests to never hang during run, and to accept an appkey at the command line.

- Other minor improvements and fixes.

# CocoaLibSpotify 2.3.0 for libspotify 12, released October 11th 2012

- Fix potential crash in `[SPSession -logout:]`.

- Set `[SPPlaylistItem -unread]` correctly (GitHub issue #98).

- Fix potential race in `[SPImage -startLoading]` that could allow the image to be loaded multiple times.

- Add property to control dismissal of `SPLoginViewController`.

- Fix login breakage when merging accounts on iOS.

- Increase robustness of `[SPTrack -dealloc]`.

- Greatly improve iOS unit tests, including a UI to see test progress.

- Fix KVO chaining in `SPToplist` that would cause `SPAsyncLoading` to time out even though the top list had loaded.

- The `subscribers` property of `SPPlaylist` is now set correctly.

# CocoaLibSpotify 2.2.0 for libspotify 12, released August 27th 2012

- Fix problem in playlist callbacks that could cause a crash (GitHub issue #88).

- `availability` property on `SPTrack` is now updated correctly (GitHub issue #83).

- SPToplist now correctly behaves when being used with `SPAsyncLoading`.

- Add `[SPSession -subscribeToPlaylist:callback:]` (GitHub issue #67).

- Add `[SPSession -objectRepresentationForSpotifyURL:linkType:]`.

- Fix race condition that could cause incorrect state for a short period of time after login (GitHub issue #62, perhaps others).

# CocoaLibSpotify 2.1.0 for libspotify 12, released August 20th 2012

- First release under semantic versioning. Contains a few buxfixes and changes since 2.0.

# CocoaLibSpotify 2.0 for libspotify 12, released May 23rd 2012

- Huge re-engineering of CocoaLibSpotify to run libspotify in its own background thread. This has brought on a large set of API changes, and you must now be aware of potential threading issues. See the project's README file for more information.

- Added small and large cover images to `SPAlbum`, as well as `smallestAvailableCover` and `largestAvailableCover` convenience methods.

- Added `fetchLoginUserName:` method to `SPSession` to get the username used to log into the current session. This also fixes `[SPSessionDelegate -session:didGenerateLoginCredentials:forUserName]` giving an incorrect username for users logging in with Facebook details.

- Added the ability to control scrobbling to various social services, including Last.fm and the user's connected Facebook account.

- Added `SPAsyncLoading` and `SPDelayableAsyncLoading`, a new way of working with objects that load asynchonously. If you pass `SPAsyncLoadingManual` to `[SPSession -initWithApplicationKey:userAgent:loadingPolicy:error:]`, anything conforming to `SPDelayableAsyncLoading` (such as user playlists, etc) won't be loaded until you want them to load. See the README file and sample projects for examples.

- Added a number of unit tests.

# CocoaLibSpotify for libspotify 11, released March 27th 2012

- SPSearch can now search for playlists.

- SPSearch can now do a "live search", appropriate for showing a "live search" menu when the user is typing. See `[SPSearch +liveSearchWithSearchQuery:inSession:]` for details.

- Added `[SPTrack -playableTrack]`. Use this to get the actual track that will be played instead of the receiver if the receiver is unplayable in the user's locale. Normally, your application does not need to worry about this but the method is here for completeness.

- Added the `topTracks` property to `SPArtistBrowse`. All browse modes fill in this property, and the `tracks` property has been deprecated and will be removed in a future release.

- Added `[SPSession -attemptLoginWithUserName:existingCredential:rememberCredentials:]` and `[<SPSessionDelegate> -session:didGenerateLoginCredentials:forUserName:]`. Every time a user logs in you'll be given a safe credential "blob" to store as you wish (no encryption is required). This blob can be used to log the user in again. Use this if you want to save login details for multiple users.

- Added `[SPSession -flushCaches]`, appropriate for use when iOS applications go into the background. This will ensure libspotify's caches are flushed to disk so saved logins and so on will be saved.

- Added the `audioDeliveryDelegate` property to `SPSession`, which conforms to the `<SPSessionAudioDeliveryDelegate>` protocol, which allows you more freedom in your audio pipeline. The new protocol also uses standard Core Audio types to ease integration.

- Added SPLoginViewController to the iOS library. This view controller provides a Spotify-designed login and signup flow.
