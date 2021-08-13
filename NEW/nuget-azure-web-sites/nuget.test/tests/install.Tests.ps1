#Set-StrictMode -version latest
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

$here = "$PackageRoot\tools"
$sut = (Split-Path -Leaf $MyInvocation.MyCommand.Path).Replace(".Tests.", ".")

#TODO: Need to come up with a way to load a project (from the fixtures)
# PackageManagement.Cmdlets.dll looks really promising, however I have been unable to get 
# Set-Project to work - it is simply not found in the module but is referenced by:
# http://community.sharpdevelop.net/blogs/mattward/archive/2011/06/12/InstallingNuGetPackagesOutsideVisualStudio.aspx

# StudioShell looks equally as promising but there are a couple of questions still outstanding:
# 1. Do you need visual studio installed?
# 2. Can the StudioShell cmdlet be loaded without installing StudioShell?
# 3. Can you set projects to a local ver to be used?

#if(Test-Path "$here\$sut"){
#. "$here\$sut"
#}



#Describe "install" {
#	Context "when install is run on a web project" {
#		#NuGet Pack C:\code\nuget\nuget-azure-web-sites\NewRelicAzureWebSites.nuspec
#		
#		#Move the web project to temp
#		$tempDir = "$PackageRoot\nuget.test\fixtures\temp\MVCWebApplication.Fixture"
#		Copy-Item "$PackageRoot\nuget.test\fixtures\MVCWebApplication.Fixture\*" $tempDir -recurse
#		
#		$solution = "$tempDir\MVCWebApplication.Fixture.sln"
#		set-project -name MVCWebApplication.Fixture $solution
#		install-package NewRelicAzureWebSites -Source C:\code\nuget\nuget-azure-web-sites
#		
#		$project = Get-Project -name MVCWebApplication.Fixture
#
#		It "verifies install adds newrelic.config" {
#			(Test-Path "$tempDir\newrelic\newrelic.config") | Should Be $true
#		}
#		
#	}
#	
#}