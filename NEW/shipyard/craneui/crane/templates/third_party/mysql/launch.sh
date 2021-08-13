#!/bin/bash

# Launch sshd
/usr/sbin/sshd;

/usr/bin/mysql_install_db --datadir=$DATA_DIRECTORY;
/usr/sbin/mysqld --bind-address='0.0.0.0' --datadir=$DATA_DIRECTORY &

sleep 10;

mysql --user=root --execute=\
" UPDATE mysql.user SET Password = PASSWORD('{{root_password}}')
     WHERE User = 'root';
 FLUSH PRIVILEGES;
";

mysql --user=root --password="{{root_password}}" --execute="DROP USER ''@'localhost';";
mysql --user=root --password="{{root_password}}" --execute="DROP DATABASE test";
mysql --user=root --password="{{root_password}}" --execute="CREATE USER 'qa'@'%' IDENTIFIED BY '{{user_password}}';"
mysql --user=root --password="{{root_password}}" --execute="GRANT ALL PRIVILEGES ON *.* TO 'qa'@'%' IDENTIFIED BY '{{user_password}}';"

echo "Mysqld configured, qa user password is : {{user_password}}";

# FIXME : createdb

while true; do
    sleep 60;
done
