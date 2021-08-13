
# Hack: A psytrance discovery Android app using libspotify #

The app will fetch the latest psytrance album-release that you haven't already listened to. The player will just loop this album and you can star the tracks you like. If you are tired of the album or don't like it at all you can just press a button to fetch another album.

## Background ##

This project is the outcome of one of the regular hackweeks at Spotify (29 oct 2012). It is just a quick hack and not nearly finished. It is not at all trying to show you how to produce a music player and its not claiming to optimally solve the bridge between Java and native. It could be useful as an example of how to integrate libspotify in your project.

The aim is to produce a very minimalistic music player that is choosing the music for you. You just need to start it and press play. It is meant to to be a discovery service for new psytrance album releases and it should be easy to save favorite tracks for later listening.

Looking at the code gives you some insight in:

* Integration with libspotify
* Communication through JNI
* Bridging raw PCM data to OpenSL

## Known issues ##

* Star/unstar sometimes crashes the application.
* Problems fetching the starred state of a track (only works if starred in the current application instance).
* The login does not remember username/password if the app is being closed. There is support for this in libspotify.
* If the app crashes you need to start it from your home-screen/app list. Otherwise it will just open the player but there is no way to login and you won't be able to play music.
* If you need to logout you need to press settings -> Kill me and then restart the app from the launcher.
* The Android service is always in foreground mode as long as the application is active.
* A wakelock is always active
* Not requesting or handling audio focus
* Facebook login does not work

## Setup ##

* Install the Eclipse CDT
* Download the latest version of the Android SDK and NDK.
* Install the eclipse-plugin for Android Tools and the NDK Plugins (You might need to use the preview versions of the plugins to make sure the CDT/NDK integration works properly.)
* Open Eclipse and click File -> Existing Android Code Into Workspace
* Set "Root Directory" to the PsyOnSpotify-folder and click finish.
* You will need to fix a few errors about missing files:
* Download libspotify for android from the website and put the api.h and libspotify.so in the jni folder
* Put your Application key in a file called jni/key.h file. If you don't have one you can login to the Spotify webpage to find out how to request one.
* Download the Android Asynchronous Http Client library and put it in the libs folder.
* When building the project it should automatically build the native code first.
* You can also build the native library by opening the terminal and going to the root of the PsyOnSpotify folder. Then run the command ndk-build.

## Flow ##

This app is communicating with libspotify and webservices in the following order:

1. User is logged in to Spotify through JNI/libspotify.
2. The latest album is fetched through a JSON-service hosted in psytrance.se. The JSON service will use the unique Spotify-username to be able to remember which albums have been listened to.
3. Metadata about that album and all tracks is fetched through the Spotify Web API (should be done in libspotify in the future).
4. The list of tracks will be saved in the Java-layer and the PlayerActivity takes care of keeping all the state about the list.
5. The user can play the current track, pause it, star it and seek in it. These operations are bridged to libspotify through the JNI. This is basically all operations that libspotify is used for.
6. The user may reject the current album and start listening to a new one. The java layer tells a service in psytrance.se to mark the current album as listened to. Then it again fetches the latest album that hasn't been listened to yet (repeats from 2).

## Remarks ##

* You need to be a Spotify premium user.
* Android version 2.3 is required because of openSL.
* It will not work on x86 Android since there is no libspotify released for that platform.

## Known code issues ##

* Cleanup of libspotify, openSL and other objects when exiting the app is needed.
* Player state should be moved to the android service instead of the PlayerActivity. In the end it would be nice to keep it in native code.
* The sound driver might need to be able to support different audio formats.
* Wakelock and service foreground mode is not handled correctly (holds forever until released)

## Threading ##

Please read the FAQ section about threads in https://developer.spotify.com/technologies/libspotify/faq/ before continue reading. Libspotify is running in its own thread. This is due to the fact that libspotify needs to be awakened now and then and some kind of loop is required. You could plugin to the main loop of the activity/service but it requires a lot of JNI callbacks and makes it hard to follow the flow. Putting libspotify in its own thread also makes the gui more responsive when libspotify is doing a lot of work. There is a main loop for libspotify called libspotify_loop() in run_loop.cpp. Since libspotify is not threadsafe all the api-calls needs to be done on this thread. I'm using a list of function pointers to be processed in this loop for making sure it runs on the correct thread. The loop starts by waiting for a wakening signal. When someone from any thread wants to do a libspotify API-call he/she just adds a function pointer to the list, containing the suitable code. Then he/she signals the loop that something is available. Reading/writing to the list needs to be synchronized with a mutex. The loop then loops the list and executes each one of them. The loop may also be awakened by a timeout, supplied by the sp_session_process_events call. It's important to unlock the mutex before executing sp_session_process_events because it could be dependent on a another thread that is trying to lock the mutex.

## Sound and openSL ##

Raw PCM data is delivered by libspotify in the music_delivery callback. The code is using two buffers to be able to fill one while playing the other. Each buffer holds a fraction of a second with unformatted PCM-data. All of the operations to the buffers needs to be synchronized since openSL is using internal threads. When the music_delivery callback has filled one buffer of data it hands it over to openSL for sound output. Then music_delivery starts to fill the next buffer. OpenSL on the other hand uses a callback (bqPlayerCallback in the code) to alert that it has finished outputting one buffer. This callback comes from an internal openSL thread. Then it frees this buffer for music_delivery to fill. If the other buffer has already been filled by music_delivery it start consuming it immediately. This is the normal case when you have no hiccups in the music.

## External libs/code ##

The libs used are not part of this repository and you need to manually download them.

* Libspotify https://developer.spotify.com/technologies/libspotify/
* Android Asynchronous Http Client http://loopj.com/android-async-http/
* Hacked in parts of the answer by Kevin in http://stackoverflow.com/questions/3115918/android-unique-id
* Login activity is using code from the Google Android LoginActivity Template (when creating new projects).
