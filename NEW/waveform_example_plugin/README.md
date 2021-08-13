[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

New Relic Waveform Plugin
========================================

Prerequisites
-------------

1. A New Relic account. Signup for a free account at http://newrelic.com
2. A configured Java Developer Kit (JDK) - version 1.6 or better
3. The Ant build tool - version 1.8 or better
4. Git
	
Installing the Java Plugin Agent
----------------------------------

1. Download the latest release tag from the https://github.com/newrelic-platform/waveform_example_plugin/tags
2. Extract the archive to the location where you want to develop the plugin.

Assigning a Globally Unique Identifier (GUID)
----------------------------------------------

Your Java plugin will need a Globally Unique Identifier (GUID). Your GUID should be similar to the reverse of a DNS name; for example: **com.some_company.some_plugin_name**. The last part of the GUID (**some_plugin_name**) will be the plugin name that appears in the New Relic menu bar.

**Note:** Keep the same name for your GUID for the life of your plugin, because the user interface and customer data are associated with this GUID.

1. Choose a Globally Unique Identifier (GUID) for your plugin.
2. In a text editor, open **Waveform.java** and go to the following section:
  
		public class Waveform extends Agent {
			super("_TYPE_YOUR_GUID_HERE_", "1.0.0");
			...
		}

3. Replace the text `_TYPE_YOUR_GUID_HERE_` in the file with your chosen GUID.

Building the Agent
----------------------------------

After replacing the generic Waveform.java text with your GUID, build the Java plugin agent.
	
1. From your shell run: `ant` to build the Agent Plugin
2. A tar archive will be placed in the `dist` folder with the pattern `waveform-X.Y.Z.tar.gz`. The tar file will include a waveform jar and several configuration files. This is an example of a distributable file for a plugin.
3. Extract the tar file to a location where you want to run the plugin agent from.

Starting the Java plugin agent
----------------------------------

1. Copy `config/template_newrelic.properties` to `config/newrelic.properties`
2. Edit `config/newrelic.properties` and replace `YOUR_LICENSE_KEY_HERE` with your New Relic license key
3. From your shell run: `java -jar waveform-*.jar`
4. Look for error-free startup messages on stdout, such as "com.newrelic.metrics.publish.Runner setupAndRun" and "INFO: New Relic monitor started."
5. Wait a few minutes for New Relic to start processing the data sent from your agent.
6. Sign in to your New Relic account.
7. From the New Relic menu bar, look for the name of the agent that you just created (the **some_plugin_name** part of your GUID).
8. To view your plugin's summary page, click the plugin's name ("example").

Source Code
-----------

This plugin can be found at https://github.com/newrelic-platform/waveform_example_plugin

Contributing
-----------

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.
