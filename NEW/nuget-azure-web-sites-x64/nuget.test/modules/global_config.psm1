$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path.Replace("\modules\", "")

Export-ModuleMember -Variable PackageRoot
