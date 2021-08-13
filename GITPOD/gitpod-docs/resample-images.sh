#!/bin/bash
files="`find doc/images -name \*.jpg` `find doc/images -name \*.png`"
for file in $files
do
    dpi=`identify -format %x $file`
    if [ $dpi = '144' ] 
    then
        echo Downsampling $file
        convert $file -resample 72 $file
    fi
done 