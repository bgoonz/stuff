package com.newrelic.examples.waveform;

import java.util.Map;

import com.newrelic.metrics.publish.Agent;
import com.newrelic.metrics.publish.AgentFactory;

public class WaveformFactory extends AgentFactory {

	public WaveformFactory() {
		super("com.newrelic.examples.waveform.json");
	}
	
	@Override
	public Agent createConfiguredAgent(Map<String, Object> properties) {
		String name = (String) properties.get("name");
		int sawtoothMax = ((Long) properties.get("sawtoothMax")).intValue();
		int squarewaveMax = ((Long) properties.get("squarewaveMax")).intValue();
		
		return new Waveform(name, sawtoothMax, squarewaveMax);
	}
}
