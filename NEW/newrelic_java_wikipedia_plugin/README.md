[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

# New Relic Platform Wikipedia Plugin - Java

Find the New Relic Wikipedia Example plugin in the [New Relic storefront](http://newrelic.com/plugins/new-relic-inc/8)

Find the New Relic Wikipedia plugin in [Plugin Central](https://rpm.newrelic.com/extensions/com.newrelic.examples.wikipedia)

----

## What's new in V2?

This plugin has been upgraded to V2 of the New Relic Platform Java SDK.  For version 2 of the Java SDK, we have made several changes to help make the installation experience more uniform for plugins.  The changes include:

* 'newrelic.properties' file is now 'newrelic.json'
* Plugin configuration is now done through the 'plugin.json' file
* Logging has been made more robust and easier to use.
* Jar distributables now have a well-defined name (i.e. plugin.jar)
* Configuration files are now located in a well-defined location (i.e. './config' off the root)

More information on these changes (including how to configure logging, license keys, and the plugin itself) can be found [here](https://github.com/newrelic-platform/metrics_publish_java).  If you have any feedback, please don't hesitate to reach out to us through our forums [here](https://discuss.newrelic.com/category/platform-plugins/platform-sdk).

----

## Requirements

- A New Relic account. Sign up for a free account [here](http://newrelic.com)
- Java Runtime (JRE) environment Version 1.6 or later
- Network access to New Relic (authenticated proxies are not currently supported, see details below)

----

## Installation

This plugin can be installed one of the following ways:

* [Option 1 - New Relic Platform Installer](#option-1--install-with-the-new-relic-platform-installer)
* [Option 2 - Chef and Puppet Install Scripts](#option-2--install-via-chef-or-puppet)
* [Option 3 - Manual Install](#option-3--install-manually)

### Option 1 - Install with the New Relic Platform Installer

The New Relic Platform Installer (NPI) is a simple, lightweight command line tool that helps you easily download, configure and manage New Relic Platform Plugins.  If you're interested in learning more simply go to [our forum category](https://discuss.newrelic.com/category/platform-plugins/platform-installer) and checkout the ['Getting Started' section](https://discuss.newrelic.com/t/getting-started-for-the-platform-installer/842).  If you have any questions, concerns or feedback, please do not hesitate to reach out through the forums as we greatly appreciate your feedback!

Once you've installed the NPI tool, run the following command:

```
	./npi install com.newrelic.examples.wikipedia
```	

This command will take care of the creation of `newrelic.json` and `plugin.json` configuration files.  See the [configuration information](#configuration-information) section for more information.

### Option 2 - Install via Chef or Puppet

For [Chef](http://www.getchef.com) and [Puppet](http://puppetlabs.com) support see the New Relic plugin's [Chef Cookbook](http://community.opscode.com/cookbooks/newrelic_plugins) and [Puppet Module](https://forge.puppetlabs.com/newrelic/newrelic_plugins).

Additional information on using Chef and Puppet with New Relic is available in New Relic's [documentation](https://docs.newrelic.com/docs/plugins/plugin-installation-with-chef-and-puppet).

### Option 3 - Install Manually (Non-standard)

#### Step 1 - Downloading and Extracting the Plugin

The latest version of the plugin can be downloaded [here](https://rpm.newrelic.com/extensions/com.newrelic.examples.wikipedia).  Once the plugin is on your box, extract it to a location of your choosing.

**note** - This plugin is distributed in tar.gz format and can be extracted with the following command on Unix-based systems (Windows users will need to download a third-party extraction tool or use the [New Relic Platform Installer](https://discuss.newrelic.com/t/getting-started-with-the-platform-installer/842)):

```
	tar -xvzf newrelic_wikipedia_plugin-X.Y.Z.tar.gz
```

#### Step 2 - Configuring the Plugin

Check out the [configuration information](#configuration-information) section for details on configuring your plugin. 

#### Step 3 - Running the Plugin

To run the plugin, execute the following command from a terminal or command window (assuming Java is installed and on your path):

```
	java -Xmx128m -jar plugin.jar
```

**Note:** Though it is not necessary, the '-Xmx128m' flag is highly recommended due to the fact that when running the plugin on a server class machine, the `java` command will start a JVM that may reserve up to one quarter (25%) of available memory, but the '-Xmx128m' flag will limit heap allocation to a more reasonable 128MBs.  

For more information on JVM server class machines and the `-Xmx` JVM argument, see: 

 - [http://docs.oracle.com/javase/6/docs/technotes/guides/vm/server-class.html](http://docs.oracle.com/javase/6/docs/technotes/guides/vm/server-class.html)
 - [http://docs.oracle.com/cd/E22289_01/html/821-1274/configuring-the-default-jvm-and-java-arguments.html](http://docs.oracle.com/cd/E22289_01/html/821-1274/configuring-the-default-jvm-and-java-arguments.html)
 
#### Step 4 - Keeping the Plugin Running

Step 3 showed you how to run the plugin; however, there are several problems with running the process directly in the foreground (For example, when the machine reboots the process will not be started again).  That said, there are several common ways to keep a plugin running, but they do require more advanced knowledge or additional tooling.  We highly recommend considering using the [New Relic Platform Installer](https://discuss.newrelic.com/t/getting-started-with-the-platform-installer/842) or Chef/Puppet scripts for installing plugins as they will take care of most of the heavy lifting for you.  

If you prefer to be more involved in the maintaince of the process, consider one of these tools for managing your plugin process (bear in mind that some of these are OS-specific):

- [Upstart](http://upstart.ubuntu.com/)
- [Systemd](http://www.freedesktop.org/wiki/Software/systemd/)
- [Runit](http://smarden.org/runit/)
- [Monit](http://mmonit.com/monit/)

----

## Configuration Information

### Configuration Files

You will need to modify two configuration files in order to set this plugin up to run.  The first (`newrelic.json`) contains configurations used by all Platform plugins (e.g. license key, logging information, proxy settings) and can be shared across your plugins.  The second (`plugin.json`) contains data specific to each plugin such as a list of hosts and port combination for what you are monitoring.  Templates for both of these files should be located in the '`config`' directory in your extracted plugin folder. 

#### Configuring the `plugin.json` file: 

The `plugin.json` file has a provided template in the `config` directory named `plugin.template.json`.  If you are installing manually, make a copy of this template file and rename it to `plugin.json` (the New Relic Platform Installer will automatically handle creation of configuration files for you).  

Below is an example of the `plugin.json` file's contents, you can add multiple objects to the "agents" array to monitor different instances:

```
{
  "agents": [
    {
      "name" : "Wikipedia - English",
      "host" : "en.wikipedia.org"
    },
    {
      "name" : "Wikipedia - French",
      "host" : "fr.wikipedia.org"
    },
    {
      "name" : "Wikipedia - German",
      "host" : "de.wikipedia.org"
    }
  ]
}
```

**note** - The "name" attribute is used to identify specific instances in the New Relic UI. 

#### Configuring the `newrelic.json` file: 

The `newrelic.json` file also has a provided template in the `config` directory named `newrelic.template.json`.  If you are installing manually, make a copy of this template file and rename it to `newrelic.json` (again, the New Relic Platform Installer will automatically handle this for you).  

The `newrelic.json` is a standardized file containing configuration information that applies to any plugin (e.g. license key, logging, proxy settings), so going forward you will be able to copy a single `newrelic.json` file from one plugin to another.  Below is a list of the configuration fields that can be managed through this file:

##### Configuring your New Relic License Key

Your New Relic license key is the only required field in the `newrelic.json` file as it is used to determine what account you are reporting to.  If you do not know what your license key is, you can learn about it [here](https://newrelic.com/docs/subscriptions/license-key).

Example: 

```
{
  "license_key": "YOUR_LICENSE_KEY_HERE"
}
```

##### Logging configuration

By default Platform plugins will have their logging turned on; however, you can manage these settings with the following configurations:

`log_level` - The log level. Valid values: [`debug`, `info`, `warn`, `error`, `fatal`]. Defaults to `info`.

`log_file_name` - The log file name. Defaults to `newrelic_plugin.log`.

`log_file_path` - The log file path. Defaults to `logs`.

`log_limit_in_kbytes` - The log file limit in kilobytes. Defaults to `25600` (25 MB). If limit is set to `0`, the log file size would not be limited.

Example:

```
{
  "license_key": "YOUR_LICENSE_KEY_HERE"
  "log_level": "debug",
  "log_file_path": "/var/logs/newrelic"
}
```

##### Proxy configuration

If you are running your plugin from a machine that runs outbound traffic through a proxy, you can use the following optional configurations in your `newrelic.json` file:

`proxy_host` - The proxy host (e.g. `webcache.example.com`)

`proxy_port` - The proxy port (e.g. `8080`).  Defaults to `80` if a `proxy_host` is set

`proxy_username` - The proxy username

`proxy_password` - The proxy password

Example:

```
{
  "license_key": "YOUR_LICENSE_KEY_HERE",
  "proxy_host": "proxy.mycompany.com",
  "proxy_port": 9000
}
```

----

## Support

Plugin support and troubleshooting assistance can be obtained by visiting [support.newrelic.com](https://support.newrelic.com)

### Frequently Asked Questions

**Q: I've started this plugin, now what?**

**A:** Once you have a plugin reporting with the proper license key, log into New Relic [here](http://rpm.newrelic.com).  If everything was successful, you should see a new navigation item appear on the left navigation bar identifying your new plugin (This may take a few minutes).  Click on this item to see the metrics for what you were monitoring (bear in mind, some details -- such as summary metrics -- may take several minutes to show values).

----

## Fork me!

The New Relic Platform uses an extensible architecture that allows you to define new metrics beyond the provided defaults. To expose more data, fork this repository, create a new GUID, add the metrics you would like to collect to the code and then build summary metrics and dashboards to expose your newly collected metrics.

## Contributing

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.
