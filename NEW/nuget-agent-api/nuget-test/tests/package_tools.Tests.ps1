#Set-StrictMode -version latest
<#
package_tools.Tests.ps1
Unit / Integration tests used to validate the tools of the nuget package.

Ex.
Checking to see if a tool file exists
Checking to see if a tool script runs as expected
Unit testing individual functions of scripts

#>
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

    Describe "package_tools" {
		
		It "checks to see if tools\install.ps1 exists" {
			(Test-Path $PackageRoot\tools\install.ps1) | Should Be $true
		}
		It "checks to see if tools\uninstall.ps1 exists" {
			(Test-Path $PackageRoot\tools\uninstall.ps1) | Should Be $true
		}
		It "checks to see if tools\NewRelicHelper.psm1 exists" {
			(Test-Path $PackageRoot\tools\NewRelicHelper.psm1) | Should Be $true
		}
		
    }