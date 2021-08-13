# xmlsec-ruby

Currently working on getting a basic signature verification 
(for SAML purposes) working, in the least hacky way possible.


## Testing

Tests are dependent on `rspec` and `rake-compiler`. Run them with:

	rake spec

The tests build the C extension, to clean the output from the build process:

	rake clean

Test certificates and signed documents are taken from the
[xmlseclibs](http://code.google.com/p/xmlseclibs/source/browse/trunk/tests/)
test suite.


## Version History

Version 0.0.6
Less hacky way of grabbing ID attributes.

Version 0.0.5
Took out init/deinit of crypto libraries - this should already done
when we require openssl, and we don't want to wantonly destroy 
all that state.
