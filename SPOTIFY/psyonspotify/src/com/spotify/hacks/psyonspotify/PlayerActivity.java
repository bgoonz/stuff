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
 * The player view and playlist logic put together.
 * 
 * The logic should be put in the service-layer but currently its here
 */
package com.spotify.hacks.psyonspotify;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Process;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageView;
import android.widget.SeekBar;
import android.widget.SeekBar.OnSeekBarChangeListener;
import android.widget.TextView;

import com.spotify.hacks.psyonspotify.ServiceBinder.ServiceBinderDelegate;
import com.spotify.hacks.psyonspotify.SpotifyService.PlayerUpdateDelegate;

public class PlayerActivity extends Activity {

	private ServiceBinder mBinder;
	private WebService mWebservice;
	private boolean mIsStarred;

	// Disable the ui until a track has been loaded
	private boolean mIsTrackLoaded;
	private ArrayList<Track> mTracks = new ArrayList<Track>();

	private String mAlbumUri;
	private int mIndex = 0;

	private final PlayerUpdateDelegate playerPositionDelegate = new PlayerUpdateDelegate() {

		@Override
		public void onPlayerPositionChanged(float pos) {

			SeekBar seekBar = (SeekBar) findViewById(R.id.seekBar);
			seekBar.setProgress((int) (pos * seekBar.getMax()));

		}

		@Override
		public void onEndOfTrack() {
			playNext();
		}

		@Override
		public void onPlayerPause() {
			ImageView image = (ImageView) findViewById(R.id.player_play_pause_image);
			image.setBackgroundResource(R.drawable.player_play_state);
		}

		@Override
		public void onPlayerPlay() {
			ImageView image = (ImageView) findViewById(R.id.player_play_pause_image);
			image.setBackgroundResource(R.drawable.player_pause_state);
		}

		@Override
		public void onTrackStarred() {
			ImageView view = (ImageView) findViewById(R.id.star_image);
			view.setBackgroundResource(R.drawable.star_state);
			mIsStarred = true;
		}

		@Override
		public void onTrackUnStarred() {
			ImageView view = (ImageView) findViewById(R.id.star_image);
			view.setBackgroundResource(R.drawable.star_disabled_state);
			mIsStarred = false;
		}
	};

	public void star() {
		if (mTracks.size() == 0 || !mIsTrackLoaded)
			return;
		if (mIsStarred) {
			mBinder.getService().unStar();
		} else {
			mBinder.getService().star();
		}
	}

	public void togglePlay() {
		if (mTracks.size() == 0)
			return;

		Track track = mTracks.get(mIndex);

		mBinder.getService().togglePlay(track.getSpotifyUri(), playerPositionDelegate);

	}

	public void playNext() {
		if (mTracks.size() == 0)
			return;

		mIndex++;
		if (mIndex >= mTracks.size())
			mIndex = 0;
		mBinder.getService().playNext(mTracks.get(mIndex).getSpotifyUri(), playerPositionDelegate);
		updateTrackState();
	}

	public void playPrev() {

		if (mTracks.size() == 0)
			return;

		Log.i("", "Play previous song");
		mIndex--;
		if (mIndex < 0)
			mIndex = mTracks.size() - 1;
			mBinder.getService().playNext(mTracks.get(mIndex).getSpotifyUri(), playerPositionDelegate);
		updateTrackState();

	}

	public void updateTrackState() {
		ImageView view = (ImageView) findViewById(R.id.star_image);
		view.setBackgroundResource(R.drawable.star_disabled_state);
		((TextView) findViewById(R.id.track_info)).setText(mTracks.get(mIndex).getTrackInfo());
		((TextView) findViewById(R.id.track_name)).setText(mTracks.get(mIndex).getTrackName());
	}

	protected void onNewIntent(Intent intent) {

		int keycode = intent.getIntExtra("keycode", -1);
		//if (keycode == -1)
		//	throw new RuntimeException("Could not identify the keycode");

		if (keycode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || keycode == KeyEvent.KEYCODE_HEADSETHOOK
				|| keycode == KeyEvent.KEYCODE_MEDIA_PLAY || keycode == KeyEvent.KEYCODE_MEDIA_PAUSE) {
			togglePlay();
		} else if (keycode == KeyEvent.KEYCODE_MEDIA_NEXT) {
			playNext();
		} else if (keycode == KeyEvent.KEYCODE_MEDIA_PREVIOUS) {
			star();
		}
	};

	@Override
	protected void onResume() {
		// Register media buttons
		AudioManager am = (AudioManager) this.getSystemService(Context.AUDIO_SERVICE);

		// Start listening for button presses
		am.registerMediaButtonEventReceiver(new ComponentName(getPackageName(), RemoteControlReceiver.class.getName()));

		super.onResume();
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_player);

		SeekBar seekBar = (SeekBar) findViewById(R.id.seekBar);
		seekBar.setMax(300);

		Log.e("", "Your login id is " + Installation.id(this));
		mWebservice = new WebService(Installation.id(this));

		mWebservice.loadAlbum(new WebService.TracksLoadedDelegate() {
			public void onTracksLoaded(ArrayList<Track> tracks, String albumUri, String imageUri) {
				mTracks = tracks;
				mAlbumUri = albumUri;
				// Set the data of the first track
				mIndex = 0;
				updateTrackState();

				AsyncTask<String, Integer, Bitmap> coverLoader = new AsyncTask<String, Integer, Bitmap>() {

					@Override
					protected Bitmap doInBackground(String... uris) {
						try {
							URL url = new URL(uris[0]);
							Bitmap bmp = BitmapFactory.decodeStream(url.openConnection().getInputStream());
							return bmp;
						} catch (MalformedURLException e) {
							throw new RuntimeException("Cannot load cover image", e);
						} catch (IOException e) {
							throw new RuntimeException("Cannot load cover image", e);
						}
					}

					protected void onPostExecute(Bitmap bmp) {
						((ImageView) findViewById(R.id.cover_image)).setImageBitmap(bmp);
					}
				};
				coverLoader.execute(new String[] { imageUri });
				// load the track
				mBinder.getService().playNext(mTracks.get(mIndex).getSpotifyUri(), playerPositionDelegate);
				// track might not be loaded yet but assume it is
				mIsTrackLoaded = true;
			}
		});

		seekBar.setOnSeekBarChangeListener(new OnSeekBarChangeListener() {

			@Override
			public void onStopTrackingTouch(SeekBar seekBar) {
				if (mIsTrackLoaded)
					mBinder.getService().seek((float) seekBar.getProgress() / seekBar.getMax());
			}

			@Override
			public void onStartTrackingTouch(SeekBar seekBar) {
			}

			@Override
			public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {

			}
		});

		mBinder = new ServiceBinder(this);
		mBinder.bindService(new ServiceBinderDelegate() {

			@Override
			public void onIsBound() {

			}
		});

		findViewById(R.id.player_prev).setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				playPrev();
			}
		});

		findViewById(R.id.player_next).setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				playNext();
			}
		});

		findViewById(R.id.player_play_pause).setOnClickListener(

		new OnClickListener() {

			@Override
			public void onClick(View v) {
				togglePlay();
			}
		});

		findViewById(R.id.player_star).setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				star();

			}
		});

		findViewById(R.id.player_next_album).setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				if (mTracks.size() == 0 || mAlbumUri == null)
					return;

				AlertDialog.Builder builder = new AlertDialog.Builder(PlayerActivity.this);

				builder.setMessage("Are you sure you want to skip to the next Album?").setTitle("Alert");
				builder.setPositiveButton("ok", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
						mWebservice.loadNextAlbum(Installation.id(PlayerActivity.this), mAlbumUri);
					}
				});
				builder.setNegativeButton("cancel", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
					}
				});

				AlertDialog dialog = builder.create();
				dialog.show();
			}
		});
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_player, menu);
		return true;
	}
	
	@Override
	public void finish() {
		mBinder.getService().destroy();
		super.finish();
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle item selection
		switch (item.getItemId()) {
		case R.id.menu_settings:
			Process.killProcess(Process.myPid());
			mBinder.getService().destroy();
		}
		return true;
	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			moveTaskToBack(true);
			return true;
		}
		return super.onKeyDown(keyCode, event);
	}

}
