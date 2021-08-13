from setuptools import setup

setup(
    name='eventlogging-devserver',
    license='GPL',
    author='Ori Livneh',
    author_email='ori@wikimedia.org',
    url='https://www.mediawiki.org/wiki/Extension:EventLogging',
    packages=(
        'eventlogging',
    ),
    zip_safe=False,
    install_requires=[
        'jsonschema>=0.7',
        'pygments>=1.5'
    ]
)
