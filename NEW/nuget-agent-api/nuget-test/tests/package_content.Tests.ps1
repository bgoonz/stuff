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

	$version = "6.22.0.0"
    Describe "package_content" {
		
		Context "When .nuspec file exists and has a metadata element" {
			[xml] $nuspecXml = Get-Content $PackageRoot\*.nuspec
			$node = $nuspecXml.package.metadata
		
			It "Should have id element with value NewRelic.Agent.Api" {
				$node.id | Should be "NewRelic.Agent.Api"
			}
			
			It "Should have version element with value $version" {
				$node.version | Should be $version
			}
			
			It "Should have title element with value NewRelic.Agent.Api" {
				$node.title | Should be "NewRelic.Agent.Api"
			}
			
			It "Should have owners element with value New Relic" {
				$node.owners | Should be "New Relic"
			}
			
			It "Should have projectUrl element with value https://docs.newrelic.com/docs/agents/net-agent/features/net-agent-api" {
				$node.projectUrl | Should be "https://docs.newrelic.com/docs/agents/net-agent/features/net-agent-api"
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
			$ns = @{ e = "urn:config" }
			$ns = New-Object Xml.XmlNamespaceManager $nuspecXml.NameTable
			$ns.AddNamespace( "e", "http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd" )
		
			It "Should have file element for lib\net45\NewRelic.Api.Agent.dll" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'lib\net45\NewRelic.Api.Agent.dll']", $ns)
				$result.src | Should be $result.target
			}

			It "Should have file element for lib\netstandard2.0\NewRelic.Api.Agent.dll" {
				$result = $nuspecXml.SelectSingleNode("//e:file[@src = 'lib\netstandard2.0\NewRelic.Api.Agent.dll']", $ns)
				$result.src | Should be $result.target
			}
		}
    }
