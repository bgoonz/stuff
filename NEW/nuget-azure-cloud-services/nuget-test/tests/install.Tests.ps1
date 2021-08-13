#Set-StrictMode -version latest
<#
install.Test.ps1
Unit / Integration tests used to validate the install script (install.ps1) for the nuget package.

#>

$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

$here = "$PackageRoot\tools"
$sut = (Split-Path -Leaf $MyInvocation.MyCommand.Path).Replace(".Tests.", ".")


Describe "install" {
#	Context "when install is run on a mvc web project" {
#
#		$packageName = "MyPackageName"
#
#		#Move the web project to temp
#		$tempDir = "$PackageRoot\nuget.test\fixtures\temp\MVCWebApplication.Fixture"
#		Copy-Item "$PackageRoot\nuget.test\fixtures\MVCWebApplication.Fixture\*" $tempDir -recurse
#		
#		$solution = "$tempDir\MVCWebApplication.Fixture.sln"
#		set-project -name MVCWebApplication.Fixture $solution
#		install-package $packageName -Source $PackageRoot
#		
#		$project = Get-Project -name MVCWebApplication.Fixture
#
#		It "verifies install adds some file" {
#			(Test-Path "$tempDir\myfile.config") | Should Be $true
#		}
#		
#	}
#	
}