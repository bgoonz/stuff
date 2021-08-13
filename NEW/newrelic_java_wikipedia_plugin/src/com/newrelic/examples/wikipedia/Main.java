package com.newrelic.examples.wikipedia;

import com.newrelic.metrics.publish.Runner;
import com.newrelic.metrics.publish.configuration.ConfigurationException;

/**
 * Main class for Wikipedia Agent Example
 * @author jstenhouse
 */
public class Main {

    public static void main(String[] args) {
        try {
            Runner runner = new Runner();
            runner.add(new WikipediaAgentFactory());
            runner.setupAndRun(); // Never returns
        } catch (ConfigurationException e) {
            System.err.println("ERROR: " + e.getMessage());
            System.exit(-1);
        }
    }
}
