#!/usr/bin/python

from setuptools import setup

setup(
    name='limnpy',
    version='0.1.0',
    description='Tool for writing Limn (https://github.com/wikimedia/limn) compatible files from python',
    url='http://www.github.com/embr/limnpy',
    author='Evan Rosen',
    author_email='erosen@wikimedia.org',
    install_requires=[
        "pandas >= 0.9.0",
        "pyyaml >= 3.10"
        ],
    entry_points={
        'console_scripts': ['limnify = limnpy.limnify:main']
        }
    )

