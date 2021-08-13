HPI=/Users/rrh/git-work-jenkins/valgrind-plugin/target/helgrind.hpi
ls -l $HPI
java -jar ~/Downloads/jenkins-cli.jar -s http://localhost:8080/ install-plugin ${HPI}
java -jar ~/Downloads/jenkins-cli.jar -s http://localhost:8080/ restart
