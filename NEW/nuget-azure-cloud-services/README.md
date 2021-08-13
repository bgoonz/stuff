[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

Join the discussion about .NET monitoring in the [New Relic Community Forum](https://discuss.newrelic.com/category/net-agent)! The Community Forum is a public platform to discuss and troubleshoot your New Relic toolset.

If you need additional help, get support at [support.newrelic.com](https://support.newrelic.com).

New Relic Windows Azure Nuget Package
=============

Includes the latest New Relic x64 installer, so that you can easily include New Relic in your Windows Azure deployment.  

Make sure you go to New Relic first to sign up and get your key from [New Relic](http://newrelic.com). Performance monitoring will never be the same after you do!  

The package is available through your NuGet package manager and on the [web](http://nuget.org/packages/NewRelicWindowsAzure)

**Set up:**

1. install-package NewRelicWindowsAzure  
2. The Package installer will prompt you for your NewRelic.AppName and your New Relic license key  

**Note:** If you want to instrument more than one project in your solution, simply change the "Default project" in the package manager console and install the package 

Visit [New Relic](http://rpm.newrelic.com) after your package deploy is complete to see your performance metrics.  

For more information on what this package is doing go to: https://support.newrelic.com/help/kb/dotnet/installing-the-net-agent-on-azure

____________

What this package does
-------

1.  Adds the **newrelic.cmd** and **.msi** to the root of the project for the Service Definition task to pick up and use during the deployment of your application
2. It prompts you for both the New Relic **license key** (for the .cmd file) and for what you would like the value of the **NewRelic.AppName** to be in your .config file
3. It adds a reference to your project to the **NewRelic.Api.Agent.dll** so that you can manually instrument methods in your WebRoles as well as your WorkerRoles
4. It updates your Azure **ServiceDefinition.csdef** file - creating a task for the given role to execute the newrelic.cmd with the appropriate execution context
5. It updates / adds the config key NewRelic.AppName to the **web/app.config** file


Contribute
===========================


Setting up your local environment to contribute
---------------------------------
1. Open visual studio
2. Tools menu >> Library Package Manager >> Package manager settings
3. Under the Package Manager, click on Package sources
4. Create a source named "Local" and set the directory to where you cloned the repository (something like "c:\code\nuget-azure-cloud-services")
5. Click Add then "OK"

Using the package locally
-----------------------------
1.  To use it you can open up your web app and choose >> tools >> Library Package Manager >> Package manager console
2.  In the console make sure that the source drop down is set to local
3.  Then type in "Install-Package NewRelicWindowsAzure"
4.  Hit enter

Pull requests
--------------------
1. [Fork the repository](https://help.github.com/articles/fork-a-repo)
2. Add awesome code or fix an [issue](https://github.com/newrelic/nuget-azure-cloud-services/issues) with awesome code
3. [Submit a pull request](https://github.com/newrelic/nuget-azure-cloud-services/pulls)
