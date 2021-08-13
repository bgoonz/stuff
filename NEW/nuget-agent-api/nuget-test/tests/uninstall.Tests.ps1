#Set-StrictMode -version latest
<#
uninstall.Test.ps1
Unit / Integration tests used to validate the uninstall script (uninstall.ps1) for the nuget package.

#>
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

$here = "$PackageRoot\tools"
$sut = (Split-Path -Leaf $MyInvocation.MyCommand.Path).Replace(".Tests.", ".")

<#
Describe "uninstall" {
	Context "when uninstall is run" {

	}
	
}
#>