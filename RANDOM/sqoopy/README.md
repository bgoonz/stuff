sqoopy
======

Python CLI to generate custom sqoop import statements

The Mediawiki database contains many tables and many of tables make use of (var)binary and blob column types.
By default, Sqoop does not know how to handle binary fields so you have to write a custom SELECT SQL query
to cast these fields to CHAR. These tool automates that for you. It will generate the entire sqoop import command
and store it in sqoopy.sh. 
