#Set-StrictMode -version latest
<#
package_metadata.Tests.ps1
Unit / Integration tests used to validate the .nuspec file of the nuget package.

Ex.
Checking to see if a lib file exists

#>
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

    Describe "package_metadata" {

		It "checks to see if there is a .nuspec file" {
			(Test-Path $PackageRoot\*.nuspec) | Should Be $true
		}
		
    }