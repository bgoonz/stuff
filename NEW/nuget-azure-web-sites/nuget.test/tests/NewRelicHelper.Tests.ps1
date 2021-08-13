Set-StrictMode -version latest
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

$here = "$PackageRoot\tools"
$sut = (Split-Path -Leaf $MyInvocation.MyCommand.Path).Replace(".Tests.", ".")

#if(Test-Path "$here\$sut"){
#. "$here\$sut"
#}

#
#
#Describe "install" {
#	Context "when install is run on an empty web project" {
#		#Move the web project to temp
#		#Copy-Item "$PackageRoot\nuget.test\mocks\WebApplication.Mock\*" "TestDrive:\"
#	
#		#$installPath, $toolsPath, $package, $project
#		$toolsPath=$here
#		$installPath= "$here\$sut"
#		#Set-Project -name WebApplication.Mock C:\code\nuget\nuget-azure-web-sites\nuget.test\mocks\WebApplication.Mock\WebApplication.Mock.sln
#		#$project = Get-Project -name WebApplication.Mock -solution 
#		
#		import-module C:\code\nuget\nuget-azure-web-sites\nuget.test\modules\PackageManagement\PackageManagement.Cmdlets.dll 
# 
#		$solution = "C:\code\nuget\nuget-azure-web-sites\nuget.test\mocks\WebApplication.Mock\WebApplication.Mock.sln" 
#		set-project WebApplication.Mock $solution
#		
##	    Mock $installPath {$null}
##		Mock $toolsPath {$null}
##		Mock $package {$null}
##		Mock $project {$null}
##		
##	    $result = . "$here\$sut" $installPath $toolsPath $package $project
##
##		It "verifies the mocks" {
##		  Assert-VerifiableMocks
##		}
##		It "returns the next version number" {
##		  $result.Should.Be(1.2)
##		}
#	}
#	
#}