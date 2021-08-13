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
 * Bind activities to services
 */
package com.spotify.hacks.psyonspotify;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.widget.Toast;

public class ServiceBinder {

	private Context mContext;
	private SpotifyService mBoundService;
	private boolean mIsBound;
	private ServiceBinderDelegate mDelegate;

	static interface ServiceBinderDelegate {
		public void onIsBound();
	}

	public ServiceBinder(Context context) {
		mContext = context;
	}

	public SpotifyService getService() {
		if (mBoundService == null)
			throw new RuntimeException("The service is not bound yet");
		return mBoundService;
	}

	public void bindService(ServiceBinderDelegate delegate) {
		mDelegate = delegate;
		if (!mContext.bindService(new Intent(mContext, SpotifyService.class), mConnection, Context.BIND_AUTO_CREATE))
			throw new RuntimeException("Could not connect to service");
		mIsBound = true;

	}

	void doUnbindService() {
		if (mIsBound) {
			// Detach our existing connection.
			mContext.unbindService(mConnection);
			mIsBound = false;
		}
	}

	private ServiceConnection mConnection = new ServiceConnection() {
		public void onServiceConnected(ComponentName className, IBinder service) {
			mBoundService = ((SpotifyService.LocalBinder) service).getService();

			mDelegate.onIsBound();
		}

		public void onServiceDisconnected(ComponentName className) {
			mBoundService = null;
			Toast.makeText(mContext, "Disconnected from the service... crash??", Toast.LENGTH_SHORT).show();
			throw new RuntimeException("Got disconnected from the service.. crash???");
		}
	};

}
