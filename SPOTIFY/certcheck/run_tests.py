#!/usr/bin/python -tt

#Make it a bit more like python3:
from __future__ import absolute_import
from __future__ import print_function

import coverage
import os
import shutil
import sys
import unittest


def main():
    major, minor, micro, releaselevel, serial = sys.version_info

    if major == 2 and minor < 7:
        print("In order to run tests you need at least Python 2.7")
        sys.exit(1)

    if major == 3:
        print("Tests were not tested on Python 3.X, use at your own risk")
        sys.exit(1)

    #Cleanup old html report:
    for root, dirs, files in os.walk('test/output_coverage_html/'):
        for f in files:
            if f == '.gitignore' or f == '.empty_dir':
                continue
            os.unlink(os.path.join(root, f))
        for d in dirs:
            shutil.rmtree(os.path.join(root, d))

    #Perform coverage analisys:
    cov = coverage.coverage()

    cov.start()
    #Discover the test and execute them:
    loader = unittest.TestLoader()
    tests = loader.discover('./test/')
    testRunner = unittest.runner.TextTestRunner(descriptions=True, verbosity=1)
    testRunner.run(tests)
    cov.stop()

    cov.html_report()

if __name__ == '__main__':
    main()
