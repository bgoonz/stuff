/*
 * Copyright (c) 2012-2014 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.spotify.statistics.example;

import com.spotify.statistics.JvmMetrics;
import com.spotify.statistics.MuninGraphCategoryConfig;
import com.spotify.statistics.MuninGraphProviderBuilder;
import com.spotify.statistics.MuninReporter;
import com.spotify.statistics.MuninReporterConfig;
import com.spotify.statistics.Property.MeterProperty;
import com.spotify.statistics.Property.TimerProperty;
import com.yammer.metrics.Metrics;
import com.yammer.metrics.core.Counter;
import com.yammer.metrics.core.Gauge;
import com.yammer.metrics.core.Meter;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.Timer;
import com.yammer.metrics.core.TimerContext;

import java.io.IOException;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import static com.spotify.statistics.MuninGraph.muninName;

public class Example {

  public static void main(final String[] args) throws InterruptedException, IOException {

    // Define the metrics
    MetricName totalName = new MetricName("Spotify", "hits", "total");
    Counter counter = Metrics.newCounter(totalName);

    MetricName cdnName = new MetricName("Spotify", "hits", "cdn");
    Counter cdnCounter = Metrics.newCounter(cdnName);

    MetricName meteredName = new MetricName(Example.class, "requests");
    Meter metered = Metrics.newMeter(meteredName, "requests", TimeUnit.SECONDS);

    MetricName timerName = new MetricName(Example.class, "duration");
    Timer timer = Metrics.newTimer(timerName, TimeUnit.SECONDS, TimeUnit.SECONDS);

    MetricName gaugeName = new MetricName("Spotify", "worker", "queue size");
    Metrics.newGauge(gaugeName, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return 17;
      }
    });

    // let's generate some data
    counter.inc();
    counter.inc();
    cdnCounter.inc();

    metered.mark();
    metered.mark();

    String inputGroup = "Spotify";
    String inputType = "input types";

    // this is a poor way to fake some input not known before-hand
    String someInput = Integer.toString(new Random().nextInt());
    Metrics.newCounter(new MetricName(inputGroup, inputType, someInput)).inc();

    final TimerContext context = timer.time();
    try {
      Thread.sleep(500); // Work...
    } finally {
      context.stop();
    }

    // Define the munin graphs

    MuninReporterConfig config = new MuninReporterConfig();

    MuninGraphCategoryConfig category = config.category("Spotify");

    category.graph("Number of responses")
            .muninName("spotify_num_responses")
            .dataSource(totalName, "Total number of responses")
            .dataSource(cdnName, "CDN responses");

    category.graph("Number of requests")
            .dataSource(meteredName, "Requests", MeterProperty.ONE_MINUTE_RATE);

    category.graph("Request duration")
            .dataSource(timerName, "Median", TimerProperty.MEDIAN)
            .dataSource(timerName, "95%", TimerProperty.PERCENTILE95);

    category.graph("In vs Out")
            .vlabel("messages")
            .muninName("custom_munin_name")
            .dataSource(totalName, "Requests", muninName("requests"))
            .dataSource(meteredName, "Responses", muninName("responses"));

    category.graph("Input types")
      .muninName("input_types")
      // the {} placeholder will be replaced by the dynamic metric name
      .wildcardDataSource(inputGroup, inputType, "Type {}", muninName("foobar_{}"));

    JvmMetrics.register(Metrics.defaultRegistry(), config.category("JVM"));

    MuninReporter munin = new MuninReporter(Metrics.defaultRegistry(), config);
    munin.start();


    // Add metrics for a runtime component, e.g. a plugin
    MetricName pluginRequestsName = new MetricName("Plugin", "requests", "requests");
    Meter pluginRequests = Metrics.newMeter(pluginRequestsName, "requests", TimeUnit.SECONDS);
    pluginRequests.mark(4711);

    // Set up graphs for the plugin, i.e. add graphs after the reporter was started
    MuninGraphProviderBuilder pluginGraphs = new MuninGraphProviderBuilder();
    MuninGraphCategoryConfig pluginCategory = pluginGraphs.category("Plugin");
    pluginCategory.graph("Requests")
                  .dataSource(pluginRequestsName, "Requests", muninName("requests"));

    // Add the graphs
    munin.addGraphs(pluginGraphs.build());

    // wait, try to play around using telnet localhost 4951
    Object mutex = new Object();
    synchronized (mutex) {
      mutex.wait();
    }
  }

}
