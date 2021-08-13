#Set-StrictMode -version latest
<#
package_content.Tests.ps1
Unit / Integration tests used to validate the items in the content folder of your app for the nuget package.

Ex.
Checking to see if a content file exists
Checking to see if a content file contains specific information
Checking to see if a content file is a specific version
Validating the data in the .nuspec file

#>

$modulesPath = (Split-Path -parent $MyInvocation.MyCommand.Path).Replace("\tests", "\modules\")
Import-Module (Join-Path $modulesPath global_config.psm1) -Force

    Describe "package_content" {
		$agentVersion = "6.22.0.0"
		$serverMonitorVersion = "3.3.6.0"
		
		Context "When package exists" {
			It "checks to see if content\newrelic.cmd exists" {
				(Test-Path $PackageRoot\content\newrelic.cmd) | Should Be $true
			}
			
			It "checks to see if content\NewRelicAgent_x64_$agentVersion.msi exists" {
				(Test-Path $PackageRoot\content\NewRelicAgent_x64_$agentVersion.msi) | Should Be $true
			}

			It "checks to see if content\NewRelicServerMonitor_x64_$serverMonitorVersion.msi exists" {
				(Test-Path $PackageRoot\content\NewRelicServerMonitor_x64_$serverMonitorVersion.msi) | Should Be $true
			}

		}

		Context "When newrelic.cmd has not been applied to the application" {
			$cmdfile = "$PackageRoot\content\newrelic.cmd"

			It "Should have the static value NewRelicAgent_x64_$agentVersion.msi" {
				$result = Get-Content $cmdfile | Select-String "NewRelicAgent_x64_$agentVersion.msi" -CaseSensitive -Quiet
				($result -ne $null) | Should be $true
			}
			It "Should have the static value NewRelicServerMonitor_x64_$agentVersion.msi" {
				$result = Get-Content $cmdfile | Select-String "NewRelicServerMonitor_x64_$serverMonitorVersion.msi" -CaseSensitive -Quiet
				($result -ne $null) | Should be $true
			}
		}
		
		Context "When .nuspec file exists and has a metadata element" {
			[xml] $nuspecXml = Get-Content $PackageRoot\*.nuspec
			$node = $nuspecXml.package.metadata
		
			It "Should have id element with value NewRelicWindowsAzure" {
				$node.id | Should be "NewRelicWindowsAzure"
			}
			
			It "Should have version element with value $agentVersion" {
				$node.version | Should be $agentVersion
			}
			
			It "Should have title element with value New Relic x64 for Windows Azure" {
				$node.title | Should be "New Relic x64 for Windows Azure"
			}
			
			It "Should have projectUrl element with value https://github.com/newrelic/nuget-azure-cloud-services" {
				$node.projectUrl | Should be "https://github.com/newrelic/nuget-azure-cloud-services"
			}
			
			It "Should have iconUrl element with value http://newrelic.com/images/avatar-newrelic.png" {
				$node.iconUrl | Should be "http://newrelic.com/images/avatar-newrelic.png"
			}
			
			It "Should have requireLicenseAcceptance element that is false" {
				$node.requireLicenseAcceptance | Should be "false"
			}
		}
		
		Context "When .nuspec file exists and has a file element" {
			[xml] $nuspecXml = Get-Content $PackageRoot\*.nuspec
			$ns = @{ e = "urn:newrelic-config" }
			$ns = New-Object Xml.XmlNamespaceManager $nuspecXml.NameTable
			$ns.AddNamespace( "e", "http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd" )
		
			It "Should have file element for newrelic.cmd" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'content\newrelic.cmd']", $ns)
				$result.src | Should be $result.target
			}
			
			It "Should have file element for NewRelicAgent_x64_$agentVersion.msi" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'content\NewRelicAgent_x64_$agentVersion.msi']", $ns)
				$result.src | Should be $result.target
			}	

			It "Should have file element for NewRelicServerMonitor_x64_$serverMonitorVersion.msi'" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'content\NewRelicServerMonitor_x64_$serverMonitorVersion.msi']", $ns)
				$result.src | Should be $result.target
			}	
		
			It "Should have file element for NewRelic.Api.Agent.dll" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'lib\NewRelic.Api.Agent.dll']", $ns)
				$result.src | Should be $result.target
			}
			
			It "Should have file element for install.ps1" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'tools\install.ps1']", $ns)
				$result.src | Should be $result.target
			}
			
			It "Should have file element for NewRelicHelper.psm1" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'tools\NewRelicHelper.psm1']", $ns)
				$result.src | Should be $result.target
			}
			
			It "Should have file element for tools\uninstall.ps1" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'tools\uninstall.ps1']", $ns)
				$result.src | Should be $result.target
			}
		
		}

    }
