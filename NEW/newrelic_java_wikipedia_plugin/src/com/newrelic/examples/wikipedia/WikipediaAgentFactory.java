package com.newrelic.examples.wikipedia;

import java.util.Map;

import com.newrelic.metrics.publish.Agent;
import com.newrelic.metrics.publish.AgentFactory;
import com.newrelic.metrics.publish.configuration.ConfigurationException;

/**
 * AgentFactory for Wikipedia Example. 
 * The name of the Agent and host for Wikipedia. E.g., 'en.wikipedia.org'.
 * @author jstenhouse
 */
public class WikipediaAgentFactory extends AgentFactory {

    @Override
    public Agent createConfiguredAgent(Map<String, Object> properties) throws ConfigurationException {
        String name = (String) properties.get("name");
        String host = (String) properties.get("host");
        
        if (name == null || host == null) {
            throw new ConfigurationException("'name' and 'host' cannot be null. Do you have a 'config/plugin.json' file?");
        }
        
        return new WikipediaAgent(name, host);
    }
}
