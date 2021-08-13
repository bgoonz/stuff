# CocoaLibSpotify FAQ #

## Logging in and Storing Credentials ##

### How do I store credentials? ###

If you want to save a user's login details for next time, do not store their password directly. Instead, implement the `SPSessionDelegate` method: 

For example:

```

-(void)session:(SPSession *)aSession didGenerateLoginCredentials:(NSString *)credential forUserName:(NSString *)userName {
	
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
	NSMutableDictionary *storedCredentials = [[defaults valueForKey:@"SpotifyUsers"] mutableCopy];

	if (storedCredentials == nil)
		storedCredentials = [NSMutableDictionary dictionary];

	[storedCredentials setValue:credential forKey:userName];
	[defaults setValue:storedCredentials forKey:@"SpotifyUsers"];
}

```

### session:didGenerateLoginCredentials:forUserName: is being called multiple times. Is this normal? ###

Yes, the credentials token can and will be refreshed multiple times during your application's lifespan. Simply replace your last token with the newest one as the code snippet above does and you'll be fine.

### Should I encrypt login tokens given to me by session:didGenerateLoginCredentials:forUserName:? ###

The token is given to you is fine to be stored without encryption, so there's no need to go to special length to encrypt anything. It's important that you never directly save the user's password, though.

### How long does the login token for a user last? What happens if I try to login with an invalid token that was previously valid? ###

Login tokens last a very long time (measured in months/years), but they can be invalidated by a number of events, including the user changing their password. There's no way to tell before attempting login if the token is invalid.

If you try to login with an invalid token, you'll get a login failure as normal. If the failure isn't due to some other problem (internet connection is offline, etc), simply discard your stored token and ask the user for their password again.

