/*
 Copyright (c) 2012, Spotify AB
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of Spotify AB nor the names of its contributors may 
 be used to endorse or promote products derived from this software 
 without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL SPOTIFY AB BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Interface to the JNI. All communication goes through this class.
 */

package com.spotify.hacks.psyonspotify;

import android.os.Handler;

import com.spotify.hacks.psyonspotify.SpotifyService.LoginDelegate;
import com.spotify.hacks.psyonspotify.SpotifyService.PlayerUpdateDelegate;

public class LibSpotifyWrapper {

	private static Handler handler = new Handler();
	private static LoginDelegate mLoginDelegate;
	private static PlayerUpdateDelegate mPlayerPositionDelegate;

	native public static void init(ClassLoader loader, String storagePath);

	native public static void destroy();

	native private static void login(String username, String password);

	native private static void toggleplay(String uri);

	native private static void playnext(String uri);

	native public static void seek(float position);

	native public static void star();

	native public static void unstar();

	public static void loginUser(String username, String password, LoginDelegate loginDelegate) {
		mLoginDelegate = loginDelegate;
		login(username, password);
	}

	public static void togglePlay(String uri, PlayerUpdateDelegate playerPositionDelegate) {
		mPlayerPositionDelegate = playerPositionDelegate;
		toggleplay(uri);
	}

	public static void playNext(String uri, PlayerUpdateDelegate playerPositionDelegate) {
		mPlayerPositionDelegate = playerPositionDelegate;
		playnext(uri);
	}

	public static void onLogin(final boolean success, final String message) {
		handler.post(new Runnable() {
			@Override
			public void run() {
				if (success)
					mLoginDelegate.onLogin();
				else
					mLoginDelegate.onLoginFailed(message);
			}
		});

	}

	public static void onPlayerEndOfTrack() {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onEndOfTrack();

			}
		});
	}

	public static void onPlayerPositionChanged(final float position) {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onPlayerPositionChanged(position);

			}
		});
	}

	public static void onPlayerPause() {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onPlayerPause();

			}
		});
	}

	public static void onPlayerPlay() {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onPlayerPlay();

			}
		});
	}

	public static void onTrackStarred() {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onTrackStarred();

			}
		});
	}

	public static void onTrackUnStarred() {
		handler.post(new Runnable() {

			@Override
			public void run() {
				mPlayerPositionDelegate.onTrackUnStarred();

			}
		});
	}

	static private float simTimer;

	static void simulateTimer() {
		handler.postDelayed(new Runnable() {

			@Override
			public void run() {

				mPlayerPositionDelegate.onPlayerPositionChanged(simTimer);
				simTimer += 0.1;
				simulateTimer();

			}
		}, 1000);
	}

}
