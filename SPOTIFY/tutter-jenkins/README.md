# tutter-jenkins

This action let non collaborators review
and merge code without having more then read access to the project.

1. A pull request get submitted
2. Jenkins runs the tests, comments "Test PASSed."
3. The pull request can be merged by commenting "merge, my change is covered by tests"

## Installation

    gem install tutter-jenkins

jenkins specific settings (goes into tutter.yaml)

    action: 'jenkins'
