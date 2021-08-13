#Set-StrictMode -version latest
<#
package_structure.Tests.ps1
Unit / Integration tests used to validate the structure of the nuget package.

Ex.
Checking to see if a custom file exists
Checking custom scripts or files for contents / expected behaviors
Checking to see if directory structures are present and have the appropriate files in them

#>
$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

    Describe "package_structure" {`

    }