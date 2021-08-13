# Wikipedia app for Windows 8 / Windows RT

## Getting started

### Windows 8

You'll need a computer or a virtual machine running Windows 8 (x86 or x64).
The current code compiles against the final release of Windows 8, which is
currently available for MSDN and TechNet subscribers or through a preview
download for anyone (90 day activation limit).

Once Windows 8 is set up, you'll need to install Visual Studio Express 2012.

Downloads for all the above are available via:

http://msdn.microsoft.com/en-US/windows/apps/br229516.aspx

Note that Windows 8 runs very nicely under Parallels 8. Under VirtualBox,
avoid installing the 3d guest driver as it seems to have problems.

If you have a MacBook Pro with Retina display, Parallels 8 supports native
"retina" resolution, which will let you test 180% scale mode natively.

### Visual Studio

Once you have Visual Studio installed, launch it. It will prompt you to
register for a Windows developer license, which sounds slightly Orwellian.

But it's much less scary than dealing with Apple's iOS developer certificates,
so don't worry!

You'll need a Windows Live account, which you can register for pretty easily
if you don't already have one. Once registered, you can install and run Metro-
style applications on the computer or VM at will.

### Git

If you're comfortable with traditional msysgit on Windows you can install and
use that. Downloading it is left as an exercise for the reader.

However you may wish to use GitHub For Windows, which provides a nice GUI,
and automatic setup of an ssh key:

http://windows.github.com/

Check out the code either through the command line or GUI interface:

 git@github.com:wikimedia/WikipediaMobile.git
or
 https://github.com/wikimedia/WikipediaMobile.git

### Project file layout

  WikipediaMobile/
    WikipediaMetro/
      WikipediaMetroTest.sln - the solution (über-project)
      WikipediaMetroTest/
        WikipediaMetroTest.jsproj - the actual app project
        default.html - main HTML5 document
        about.html - secondary HTML5 document for about screen
        css/
          default.css
        js/
          default.js <- mishmash that needs some refactoring
          wikiview.js <- helper class for semantic zoom
          jquery-X.X.X.js
        images/
          ...

Additionally, the project includes by reference a number of JavaScript and message
properties files from the parent WikipediaMobile project -- these live under
WikipediaMobile/assets/www/ but can be seen	under js/ and messages/ within the
project in Visual Studio.

### Opening the project

Open an Explorer window to your checkout, and navigate to the 'WikipediaMetro'
subdirectory. Double-click on "WikipediaMetroTest.sln" (if file extensions are
hidden as per default, it's the one that's not a subdirectory).

This should open the "solution" (collection of one or more projects) and the
actual application project in Visual Studio Express 2012.

### Running the app

On Visual Studio's toolbar there'll be a green triangle "Play"-style button, with
"Local Machine" next to it. Click this to build and run the application on your
machine at your regular screen size.

You can alt-tab back to Visual Studio at any time to use the HTML/JavaScript debugger,
which should be fairly familiar, including an HTML inspector, JavaScript breakpoints,
debug console, etc.

To halt execution, press the stop button on the toolbar.

#### Running the app in the simulator

To test the app at particular screen resolutions, or to run the app side-by-side with
Visual Studio to avoid having to tab back and forth during debugging, you can run
the app in a "simulator" mode which runs a secondary desktop session in a window.

To enable this, click the disclosure triangle next to "Local Machine" and select
"Simulator" instead.

When you launch the application again, the simulator will launch, and the app will
open within it. There are buttons along the right side to control various aspects
of the simulator, including setting its screen resolution.

## Application manifest

Like Android applications, Metro-style Windows applications include an XML
manifest file: package.appxmanifest.

This includes the package name and version, settings for the start screen tile
name and icons, splash screen, what permissions the app requires, and what
contracts/capabilities it supports (for instance, can it be searched? can other
applications share data to it?)

You don't have to edit the XML manually as there's a nice GUI form within
Visual Studio. Yay!

When updating the app, be sure to increment the version number.

## Building an installable .appx package

From Visual Studio's "Store" menu, select "Create app packages..."

If building for store release, select "Yes" on the screen asking if you want a
store package -- you will have to sign in with the proper store credentials.

To build for local installation only, select no. You won't need new credentials.

By default, packages will output into the AppPackages subdirectory of the project.

The build will produce an ".appxupload" archive file -- what you will select when
uploading packages to the Windows Store -- and a subdirectory with its contents,
which you can sideload onto any Windows 8 PC with a developer license by running
the included PowerShell script.

The application package itself is the .appx file in the subdirectory.

## Uploading package to the Windows Store

Build as above, selecting "yes" for the store. You will be prompted to authenticate;
get the credentials from Brion or Tomasz.

Select the app "Wikipedia", with package name "WikimediaFoundation.Wikipedia",
and hit "Next".

Ensure that you've upped the version number if necessary and hit "Create".

After the build completes, you'll be prompted to optionally run some automated
acceptance tests on the package -- this will take a few minutes. The same tests
will be run when you upload the package, but failing now will save you time!

Go to https://appdev.microsoft.com/StorePortals in your browser. You'll have to log
in with the appropriate credentials again -- this may involve logging out of your own
Windows Live account first.

Select the "Details" button for the Wikipedia application.

Select the "Create new release" button.

You can change various elements of the package, of which most likely are:
* Packages -- where you'll upload the .appxupload file
* Description -- update at least the "Description of update" section.
* Notes to testers -- point out anything special that should be checked

Once you're done, click on "Submit for certification" and... the waiting game begins.

Some automated tests will run, then there will be manual human review of the app
which may take a couple days.

You'll have to check back to see the status; if the release is rejected you may
or may not get as many details as you like...

With initial prerelease versions in summer 2012 we had a lot of problems with
"section 4.1" (privacy policy), which hopefully are all resolved at this point.

### Common technical problems

The store automatic verification wants JavaScript files to start with a UTF-8 BOM
character. We're not in the habit of using these because the PHP interpreter outputs
them into HTML output, but on JavaScript and raw HTML files it causes no harm and
makes Microsoft happy.

### Escalating issues with Windows Store

If you get a rejection that you don't understand, look up more info or escalate
at http://msdn.microsoft.com/en-us/windows/apps/hh690938

## Windows 8 Metro UI information

The Windows Metro or "Modern UI" as it is now being called is a sort of hybrid UI
designed for touch tablets, but also to work reasonably well with keyboard and mouse
/touchpad devices.

### Charms bar

To access search, share, or settings features, open the system's "charms bar" and
select the appropriate icon.
* On touch devices, swipe in from the right side of the screen
* With a mouse, hit hotcorners in the upper-right or lower-right
* With keyboard, hit Win+C

Note that the "Devices" charm is currently not used by the Wikipedia app, but will be
what you hit when printing support is added.

### Hub view

The application is oriented around a "hub screen", on which we show information
from the "Featured Feeds" in a WinJS grid control to give a native Metro feel to
the site home page.

Note that Metro prefers horizontal layouts and scrolling over vertical scrolling,
and we do our best to fit with that in the app.

Tapping or clicking on one of the various featured items will open an article.
You can also perform an article search through the search charm; typeahead search
for titles is provided, and if there's no exact match you'll see a grid of search
results when hitting enter / selecting the search term.

Additionally, typing will open up the search charm just like on the Windows 8
Start Screen for searching applications.

### Detail views

Article and search result views show a back button; this uses a stock icon.
Clicking it will go back one step; right-clicking or tap-and-hold will open
a context menu with the entire history stack back to the hub page.

Article views appear in columns with horizontal scrolling, which is Metro's
preferred style. Each column is of similar width to a mobile phone screen.

### App bar

Additional features are available on the "app bar".
* On touch devices, swipe in from the top or bottom of the screen
* With a mouse, right-click in any convenient spot on the window
* With keyboard, hit Win+Z

Features available here are:
* "Read in..." -> change language
* "Pin to start" -> bookmark the article as a secondary tile on the Start Screen
* "Open in browser"
* "Find in page"

### Semantic Zoom

Article view is currently continuous and horizontal, with each section starting on
a column boundary.

To see a list of sections, you can use the "semantic zoom" pattern to zoom out from
the detail view to a grid list of sections and subsections.

* On touch devices, pinch and spread fingers out (zoom out)
* With a mouse, click the "-" box near the scroll bar. There may be another shortcut.
* With keyboard... not sure.

I'm a bit unsatisfied with this layout and may replace it in the future with a section
sidebar that's more easily discoverable and avoids having to load all sections at once.

## Technical information

You'll find lots of documentation on MSDN, though it can be hard to sort through.

Start at http://msdn.microsoft.com/en-us/library/windows/apps/hh465037.aspx

### Frameworks

The app makes use of two main JavaScript frameworks: jQuery, and WinJS.
jQuery is of course... jQuery. Y'all know that!

WinJS is a JavaScript widget and utility library that ships with Windows and
provides various common Metro-style controls and access patterns.

Documentation for WinJS and the common WinRT APIs exposed to JavaScript apps
is available at http://msdn.microsoft.com/en-us/library/windows/apps/br211377.aspx

### Screen resolutions and density scale

See: http://msdn.microsoft.com/en-us/library/windows/apps/hh465362.aspx

Windows 8/Windows RT Metro apps support three display scales:
* 100% - tablet at 1366x768, traditional displays
* 140% - tablet at 1920x1080
* 180% - tablet at 2560x1440, MacBook Pro Retina display

Note that the different tablet resolutions are _slightly different_ numbers of
CSS pixels wide and tall, so layout is not guaranteed to be exactly the same
the way it is on the Retina and non-Retina iPad.

The scaling factors may seem odd, but are chosen to let layouts in multiples of
5 pixels scale up evenly. Metro loves 5 and 20-pixel units!

Key resolutions to test include the above tablet resolutions as well as 1024x768,
which is the minimum screen size for Metro-style apps.

Larger screens at 100% scaling are also supported, and should be tested although
the app is primarily targeted at tablets.

#### Assets for multiple screen densities

For images displayed within the application you can use SVG files, which scale
naturally.

The application tile icons and splash screen, however, must be provided as
JPEG or PNG files, which can only hold one scale per file.

Asset files for multiple scales can be provided by appending ".scale-XXX" to
the base of the filename, before the extension. For instance:

  splashscreen.scale-100.png
  splashscreen.scale-140.png
  splashscreen.scale-180.png

Referring to just "splashscreen.png" from the application manifest or within
an img tag or CSS background will automatically load the appropriate version
for the display scale being used.

### Contracts

See: http://msdn.microsoft.com/en-us/library/windows/apps/hh465037.aspx#implement_contracts

Metro "contracts" are similar to Android's "intents" system, in that applications
can register to accept various sorts of activation methods for search, data sharing,
printing, providing places to open or save files, etc.

These are mostly activated through the "charms" that appear when swiping from the right
side of the screen (or hitting upper-left or lower-left hotcorners with the mouse).

The Wikipedia app currently supports the search and settings contracts, and can send
article URLs to other applications supporting the sharing contract.
