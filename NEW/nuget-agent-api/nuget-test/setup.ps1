#This MUST be run from an x86 powershell console or x86 gui - the module that it is attempting to load requires it

Write-Host "***Validating execution policy for test run***"

#Conditional probably not neccessary 
$policy = Get-ExecutionPolicy
if ([string]$policy -ine 'Unrestricted'){
	Write-Host "***Execution policy must be set to at least RemoteSigned for this process - setting the Execution Policy to 'RemoteSigned' ***"
	Set-ExecutionPolicy RemoteSigned -Scope Process
}

# Write-Host $path"\modules\PackageManagement.Cmdlets.dll"

$invocation = (Get-Variable MyInvocation).Value
$directorypath = Split-Path $invocation.MyCommand.Path
# $modulespath = $directorypath + '\modules\PackageManagement\bin\PackageManagement.Cmdlets.dll'

# Write-Host 'Installing module to help with nuget commands from Powershell located at' + $modulespath
# if(Test-Path $modulespath){
# 	Write-Host "***Registering the PackageManagement.Cmdlets.dll module***"
# 	Import-Module $modulespath
# }

$modulespath = $directorypath + '\modules\PETools'
Write-Host 'Installing module PETools to help with nuget commands from Powershell located at' + $modulespath
if(Test-Path $modulespath){
	Write-Host "***Registering the PETools module***"
	Import-Module $modulespath
}

Write-Host "***Installing PsGet a dependency for Pester ***"
(new-object Net.WebClient).DownloadString("http://bit.ly/GetPsGet") | iex
import-module PsGet

Write-Host "***Installing BDD framework Pester ***"
install-module Pester
import-module Pester

Write-Host "***Listing modules for validation***"
Get-Module
