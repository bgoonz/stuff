#!/bin/bash
/usr/bin/mysql_install_db ; # --datadir='/home/qa/databases';
/usr/sbin/mysqld & # --datadir='/home/qa/databases' &

echo '------------------------------ MYSQLD LAUNCHED'
sleep 5;

mysql --user=root --execute=\
" UPDATE mysql.user SET Password = PASSWORD('')
     WHERE User = 'root';
 FLUSH PRIVILEGES;
";

mysql --user=root --password="" --execute="DROP USER ''@'localhost';";
mysql --user=root --password="" --execute="CREATE USER 'qa'@'%' IDENTIFIED BY '';"
mysql --user=root --password="" --execute="GRANT ALL PRIVILEGES ON *.* TO 'qa'@'%' IDENTIFIED BY '';"
{% if database_name %}
echo 'CREATE DATABASE {{database_name}}'
mysql --user=root --password="" --execute="CREATE DATABASE {{database_name}};";
{% endif %}
echo '------------------------------ MYSQLD CONFIGURED'
