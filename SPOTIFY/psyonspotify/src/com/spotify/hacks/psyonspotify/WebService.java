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
 * Get information about albums from webservices from psytrance.se and spotify.com
 */
package com.spotify.hacks.psyonspotify;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.JsonHttpResponseHandler;


public class WebService {

	private AsyncHttpClient mPsytranceClient = new AsyncHttpClient();
	private AsyncHttpClient mRemoveAlbumClient = new AsyncHttpClient();
	
	private AsyncHttpClient mSpotifyWebClient = new AsyncHttpClient();
	private TracksLoadedDelegate mTracksLoadedDelegate;
	private String mLoginId;
	
	private String mAlbumUri;
	private String mImageUri;
	
	public static interface TracksLoadedDelegate {
		void onTracksLoaded(ArrayList<Track> tracks, String albumUri, String imageUri);
	}
	
	public WebService(String loginId) {
		mLoginId = loginId;
	}
	
	private JsonHttpResponseHandler SpotifyWebResponseHandler = new JsonHttpResponseHandler() {
		public void onSuccess(JSONObject response) {
			try {
				JSONArray tracks = response.getJSONObject("album").getJSONArray("tracks");
				ArrayList<Track> result = new ArrayList<Track>();
				String album = response.getJSONObject("album").getString("name");
				String artist = response.getJSONObject("album").getString("artist");
				
				for (int i = 0; i < tracks.length(); i++) {
					String track = tracks.getJSONObject(i).getString("name");
					String uri = tracks.getJSONObject(i).getString("href");
					result.add(new Track(track, album, artist, uri));
				}
				
				mTracksLoadedDelegate.onTracksLoaded(result, mAlbumUri, mImageUri);
				
			} catch (JSONException e) {
				throw new RuntimeException("Could not parse the result from spotify webapi");
			}
		}
	};
	
	public void loadAlbum(TracksLoadedDelegate tracksLoadedDelegate) {
		
		mTracksLoadedDelegate = tracksLoadedDelegate;
		// Fetch the first album
		
		mPsytranceClient.get("http://psytrance.se/rest.php?style=psytrance&page=0&pageSize=1&filter=hide&uid=" + mLoginId, new JsonHttpResponseHandler() {
			
			public void onSuccess(JSONObject response) {
				try {
					JSONArray albums = response.getJSONArray("albums");
					JSONObject album = albums.getJSONObject(0);
					
					mAlbumUri = album.getString("spotify");
					mImageUri = album.getString("image");
					// Now get track details from the webapi
					
					mSpotifyWebClient.get("http://ws.spotify.com/lookup/1/.json?uri=" + album.getString("spotify") + "&extras=track", SpotifyWebResponseHandler);
					
				} catch (JSONException e) {
					throw new RuntimeException("Could not parse the result from psytrance.se");
				}
			}
		});
		
	}

	public void loadNextAlbum(String username, String currentAlbum) {
		mRemoveAlbumClient.get("http://psytrance.se/albumClicked.php?uid=" + username + "&url=" + currentAlbum,
				new AsyncHttpResponseHandler() {
					@Override
					public void onSuccess(String value) {
						Log.e("", "Success to remove this album.. get next one");
						loadAlbum(mTracksLoadedDelegate);
					}
				});

	}
	

}
