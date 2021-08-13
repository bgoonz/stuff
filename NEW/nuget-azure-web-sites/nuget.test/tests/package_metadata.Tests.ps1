#Set-StrictMode -version latest
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

    Describe "package_metadata" {

		It "checks to see if there is a .nuspec file" {
			(Test-Path $PackageRoot\*.nuspec) | Should Be $true
		}
		
    }