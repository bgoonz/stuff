require 'mkmf'

# Hack to get this to work on OSX
$CFLAGS = '-I/usr/local/Cellar/libxmlsec1/1.2.18/include/xmlsec1 -I/usr/local/Cellar/libxml2/2.8.0/include/libxml2 -DXMLSEC_CRYPTO_OPENSSL'

create_makefile('xmlsec')
