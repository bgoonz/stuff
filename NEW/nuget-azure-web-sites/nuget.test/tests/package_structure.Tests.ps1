##Set-StrictMode -version latest
#$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
#Import-Module (Join-Path $modulesPath global_config.psm1) -Force
#
#    Describe "package_structure" {
#		
#		It "checks to see if tools\install.ps1 exists" {
#			#Write-Host $packageDir\tools\install.ps1
#			(Test-Path $PackageRoot\tools\install.ps1) | Should Be $true
#		}
#		
#		It "checks to see if tools\uninstall.ps1 exists" {
#			(Test-Path $PackageRoot\tools\install.ps1) | Should Be $true
#		}
#		
#		
#		It "checks to see if lib\NewRelic.Api.Agent.dll exists" {
#			(Test-Path $PackageRoot\lib\NewRelic.Api.Agent.dll) | Should Be $true
#		}
#		
#		It "checks to see if content\newrelic.config exists" {
#			(Test-Path $PackageRoot\content\newrelic.config) | Should Be $true
#		}
#		
#		It "checks to see if content\newrelic\SampleClassLibrary.dll exists" {
#			(Test-Path $PackageRoot\content\newrelic\SampleClassLibrary.dll) | Should Be $true
#		}
#		
#		It "checks to see if content\newrelic\TestProfiler.dll exists" {
#			(Test-Path $PackageRoot\content\newrelic\TestProfiler.dll) | Should Be $true
#		}
#		
#		It "checks to see if content\newrelic\extensions\extension.xml exists" {
#			(Test-Path $PackageRoot\content\newrelic\extensions\extension.xsd) | Should Be $true
#		}
#		
#		It "checks to see if there is a .nuspec file" {
#			(Test-Path $PackageRoot\*.nuspec) | Should Be $true
#		}
#		
#    }