#!/bin/sh
echo "Version : $1";
filename="http://www.python.org/ftp/python/$1/Python-$1.tar.bz2";

echo "Downloading : $filename"
wget $filename;

file=`echo $filename | cut -d"/" -f7`;
echo "Uncompressing : $file"
tar -xjvf $file;

folder=`echo $file | cut -c -12`;
echo "Moving and making to : $folder"
cd $folder;

./configure;
make;
make install;
