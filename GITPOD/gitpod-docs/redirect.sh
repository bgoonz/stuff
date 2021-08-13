#!/bin/bash

cd site/doc

find * -iname "*.html" -exec sh -c '
cat > {} <<- EOM
<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0; url=https://www.gitpod.io/docs/{}">
        <script type="text/javascript">
            window.location.href = "https://www.gitpod.io/docs/{}"
        </script>
        <title>Page Redirection</title>
    </head>
    <body>
        If you are not redirected automatically, follow this <a href="https://www.gitpod.io/docs/{}">link</a>.
    </body>
</html>
EOM
' \;

