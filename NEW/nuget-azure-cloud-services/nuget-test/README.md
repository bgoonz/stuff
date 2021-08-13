nuget-test
=================================================================

A PowerShell based testing framework that helps you test your [nuget](http://nuget.org) packages.

Testing your nuget packages can be difficult especially if you're trying to write tests to be run on build server where Visual Studio might not be installed and if
you have my custom things built into your packages you'll need those things to be tested with iron-clad rules in a repeatable way. Running and verifying your nuget package in Visual Studio is not practical for you as a developer nor is it practical if you are trying to get to a *hands-free* deployment.

The goal of this framework is to make testing your nuget packages easy by giving you the strengths of PowerShell and the elegance of *convention* and *testing semantics* provided by Pester.

This project also aims to provide the developer with a way to run the tests as part of [CI / CD gates](http://en.wikipedia.org/wiki/Continuous_delivery) on servers where Visual Studio is not installed.  This helps with assuring that what your Continuous Delivery server is pushing out the door is what you expect it to be pushing out the door.

Basic usage
-----------

**NOTE**: The PackageManagement.Cmdlets.dll that is used to execute your nuget package against the [fixture apps](https://github.com/nickfloyd/nuget-test/tree/master/fixtures) requires that you run a **x86** PowerShell console in order for you to be able to load the module. The module is loaded via [Setup.ps1](https://github.com/nickfloyd/nuget-test/blob/master/setup.ps1) and can be commented out if you do not intend on executing your nuget package against a temp fixture application as a test.

1 Clone the project into your package directory (where your .nuspec file and package files are). If for whatever reason you want to keep the nuget-test project as a "git" repo  then simple remove "remove-item nuget-test/.git -Recurse -Force" from the command below.

    git clone https://github.com/nickfloyd/nuget-test.git; remove-item nuget-test/.git -Recurse -Force

2 Run [Setup.ps1](https://github.com/nickfloyd/nuget-test/blob/master/setup.ps1) in the root of the nuget-test directory in an **x86** instance of PowerShell.
	
	PS> .\setup.ps1

3 Write tests and place them in the nuget-test/test directory using the [Pester](https://github.com/pester/Pester) syntax. ex.
		
	Context "When package exists" {
		It "checks to see if content\my.config exists" {
			(Test-Path $PackageRoot\content\my.config) | Should Be $true
		}
		
		It "checks to see if content\my.dll exists" {
			(Test-Path $PackageRoot\content\my.dll) | Should Be $true
		}
		
		It "checks to see if content\my.dll is set to version 1.0.0" {
			[System.Diagnostics.FileVersionInfo]::GetVersionInfo("$PackageRoot\content\my.dll").FileVersion | Should be "1.0.0"
		}
	}


4 Run the tests.

	PS> Invoke-Pester

Real-world examples
------------
[Nuget package for New Relic Azure Web Sites](https://github.com/newrelic/nuget-azure-web-sites/tree/master/nuget.test)

[Nuget package for New Relic x86 API](https://github.com/newrelic/nuget-agent-api-x86)

[Nuget package for New Relic x64 API](https://github.com/newrelic/nuget-agent-api-x86)

Support Libraries
------------
These libraries are instrumental in getting this "framework" to actually work. Special thanks to:

 * [Pester](https://github.com/pester/Pester) - a powerful testing framework for PowerShell
 * [SharpDevelop's package management module](https://github.com/icsharpcode/SharpDevelop/tree/master/src/AddIns/Misc/PackageManagement) - an amazing module that allows the developer to perform nuget commands outside of a Visual Studio instance
 * [PowerSploit PETools](https://github.com/mattifestation/PowerSploit) - modules that help developers verify and peer into managed and unmanaged code. 
 * [Nuget](http://nuget.org) - Package management for for Visual Studio


Requirements
------------
- [PowerShell 2.0](http://msdn.microsoft.com/en-us/library/ff637750(v=azure.10).aspx) or greater (running x86 if you need to use the PackageManagement Cmdlets)
- [Pester](https://github.com/pester/Pester) (added via [Setup.ps1](https://github.com/nickfloyd/nuget-test/blob/master/setup.ps1))
- [PsGet](http://psget.net/) (dependency for Pester, added via [Setup.ps1](https://github.com/nickfloyd/nuget-test/blob/master/setup.ps1))
- [PETools](https://github.com/mattifestation/PowerSploit) (if you need to dig into your compiled libraries, so on, added via [Setup.ps1](https://github.com/nickfloyd/nuget-test/blob/master/setup.ps1))
- A nuget package to test

Known Limitations
------------

- Currently if you want to run a package simulation using the PackageManagement Cmdlets you must be running in an x86 PowerShell console.
- It seems that the PackageManagement Cmdlets will only load Visual Studio projects / solutions version 2010 or lower, though there might be a new build that should be used that might allow 2012 projects / solutions to be used.
- Some $DTE functions do not always run as expected or will break when executed through the tests - more work needs to be done with this framework and $DTE to get better compatibility.

Contribute
------------
1. [Fork the repository](https://help.github.com/articles/fork-a-repo)
2. Add awesome code or fix an [issue](https://github.com/nickfloyd/nuget-test/issues) with awesome code
3. Submit a [pull request](https://github.com/nickfloyd/nuget-test/pulls)