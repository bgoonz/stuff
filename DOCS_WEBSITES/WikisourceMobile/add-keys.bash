#!/bin/bash

# FBAPI Key
echo -n "Enter FB API Key: "
read FBKEY

sed -i.bak "s/\[FB-APP-ID\]/$FBKEY/" Wikipedia-iOS/Wikipedia-iOS-Info.plist
sed -i.bak "s/\[FB-APP-ID\]/$FBKEY/" assets/www/ios/platform.js
