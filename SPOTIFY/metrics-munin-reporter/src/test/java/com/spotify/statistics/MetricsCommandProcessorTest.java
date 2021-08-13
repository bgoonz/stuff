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
package com.spotify.statistics;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.spotify.statistics.Property.GaugeProperty;
import com.yammer.metrics.core.Counter;
import com.yammer.metrics.core.Gauge;
import com.yammer.metrics.core.Histogram;
import com.yammer.metrics.core.Meter;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;
import com.yammer.metrics.core.Timer;

public class MetricsCommandProcessorTest {

  private static final List<String> NO_ARGS = new ArrayList<String>();

  private MetricsRegistry metricsRegistry = new MetricsRegistry();

  @Mock private Hostname hostname;

  @Before
  public void setUp() throws Exception {
    MockitoAnnotations.initMocks(this);

    when(hostname.getHostname()).thenReturn("somehost");

    metricsRegistry = new MetricsRegistry();
  }

  @Test
  public void testListNoMetrics() throws Exception {
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>();
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    assertEquals(asList(""), sut.processCommand("list", NO_ARGS));
  }

  @Test
  public void testList() throws Exception {
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("graph1", new MuninGraph("graph1", "c", "t"));
      put("graph2", new MuninGraph("graph2", "c", "t"));
    }};
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    assertEquals(asList("graph1 graph2"), sut.processCommand("list", NO_ARGS));
  }

  @Test
  public void testConfigWithNoArgs() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
            "# unknown service",
            "."
    )
            , sut.processCommand("config", NO_ARGS));
  }

  @Test
  public void testConfigWithDefaults() throws Exception {
    final MetricName name1 = new MetricName("gr", "t1", "c1");
    final MetricName name2 = new MetricName("gr", "t1", "m1");
    final MetricName name3 = new MetricName("gr", "t1", "g1");
    final MetricName name4 = new MetricName("gr", "t1", "h1");
    final MetricName name5 = new MetricName("gr", "t1", "t1");
    metricsRegistry.newCounter(name1);
    metricsRegistry.newMeter(name2, "trolls", TimeUnit.SECONDS);
    metricsRegistry.newGauge(name3, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return 123;
      }});
    metricsRegistry.newHistogram(name4, false);
    metricsRegistry.newTimer(name5, TimeUnit.SECONDS, TimeUnit.MILLISECONDS);

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();

    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("gr_t1_c1", new MuninGraph("gr_t1_c1", "gr", "t1 - c1", asList(
          dataSourceFactory.forMetric(name1, null, null, new MuninDataSourceConfig()))));
      put("gr_t1_m1", new MuninGraph("gr_t1_m1", "gr", "t1 - m1", asList(
          dataSourceFactory.forMetric(name2, null, null, new MuninDataSourceConfig()))));
      put("gr_t1_g1", new MuninGraph("gr_t1_g1", "gr", "t1 - g1", asList(
          dataSourceFactory.forMetric(name3, null, null, new MuninDataSourceConfig()))));
      put("gr_t1_h1", new MuninGraph("gr_t1_h1", "gr", "t1 - h1", asList(
          dataSourceFactory.forMetric(name4, null, null, new MuninDataSourceConfig()))));
      put("gr_t1_t1", new MuninGraph("gr_t1_t1", "gr", "t1 - t1", asList(
          dataSourceFactory.forMetric(name5, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    {
      List<String> output = sut.processCommand("config", asList("gr_t1_c1"));
      List<String> expectedOutput = asList(
              "graph_title t1 - c1",
              "graph_category gr",
              "graph_vlabel ",
              "c1__count.label c1",
              "c1__count.type DERIVE",
              "c1__count.min 0",
              "."
      );
      assertEquals(expectedOutput, output);
    }

    {
      List<String> output = sut.processCommand("config", asList("gr_t1_m1"));
      List<String> expectedOutput = asList(
              "graph_title t1 - m1",
              "graph_category gr",
              "graph_vlabel ",
              "m1__five_minute_rate.label m1",
              "m1__five_minute_rate.type GAUGE",
              "m1__five_minute_rate.min 0",
              "."
      );
      assertEquals(expectedOutput, output);
    }

    {
      List<String> output = sut.processCommand("config", asList("gr_t1_h1"));
      List<String> expectedOutput = asList(
              "graph_title t1 - h1",
              "graph_category gr",
              "graph_vlabel ",
              "h1__median.label h1",
              "h1__median.type GAUGE",
              "h1__median.min 0",
              "."
      );
      assertEquals(expectedOutput, output);
    }

    {
      List<String> output = sut.processCommand("config", asList("gr_t1_t1"));
      List<String> expectedOutput = asList(
              "graph_title t1 - t1",
              "graph_category gr",
              "graph_vlabel ",
              "t1__median.label t1",
              "t1__median.type GAUGE",
              "t1__median.min 0",
              "."
      );
      assertEquals(expectedOutput, output);
    }

    {
      List<String> output = sut.processCommand("config", asList("gr_t1_g1"));
      List<String> expectedOutput = asList(
              "graph_title t1 - g1",
              "graph_category gr",
              "graph_vlabel ",
              "g1__value_gauge.label g1",
              "g1__value_gauge.type GAUGE",
              "g1__value_gauge.min 0",
              "."
      );
      assertEquals(expectedOutput, output);
    }
  }

  @Test
  public void testConfig() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "g1");
    metricsRegistry.newGauge(name, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return 123;
      }});

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MuninDataSource muninDataSource = dataSourceFactory.forMetric(name, "label", null, new MuninDataSourceConfig()
            .withMin(123));

    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("gr_t1_g1", new MuninGraph("gr_t1_g1", "gr", "t1 - g1", asList(muninDataSource), "vlabel", "args"));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);
    List<String> expectedOutput = asList(
      "graph_title t1 - g1",
      "graph_category gr",
      "graph_args args",
      "graph_vlabel vlabel",
      "g1__value_gauge.label label",
      "g1__value_gauge.type GAUGE",
      "g1__value_gauge.min 123",
      "."
    );
    List<String> output = sut.processCommand("config", asList("gr_t1_g1"));
    assertEquals(expectedOutput, output);
  }

  @Test
  public void testConfigWithProperty() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "g1");
    metricsRegistry.newGauge(name, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return 123;
      }});

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MuninDataSource muninDataSource = dataSourceFactory.forMetric(
        name, "label", GaugeProperty.VALUE_DERIVE, new MuninDataSourceConfig());

    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("gr_t1_g1", new MuninGraph("gr_t1_g1", "gr", "t1 - g1", asList(muninDataSource), "vlabel", "args"));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);
    List<String> expectedOutput = asList(
      "graph_title t1 - g1",
      "graph_category gr",
      "graph_args args",
      "graph_vlabel vlabel",
      "g1__value_derive.label label",
      "g1__value_derive.type DERIVE",
      "g1__value_derive.min 0",
      "."
    );
    List<String> output = sut.processCommand("config", asList("gr_t1_g1"));
    assertEquals(expectedOutput, output);
  }

  @Test
  public void testUnknownService() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
            "# unknown service",
            "."
    )
    , sut.processCommand("config", asList("dummy")));
  }

  @Test
  public void testFetchCounter() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "n1");
    Counter counter = metricsRegistry.newCounter(name);

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(
          dataSourceFactory.forMetric(name, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    counter.inc();
    counter.inc();

    assertEquals(asList(
      "n1__count.value 2",
      "."
      )
      , sut.processCommand("fetch", asList("foo")));
  }

  @Test
  public void testFetchMeter() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "n1");
    Meter meter = metricsRegistry.newMeter(name, "trolls", TimeUnit.SECONDS);
    meter.mark();
    meter.mark();

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(dataSourceFactory.forMetric(
          name, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    // rate will be 0.0 in this test
    assertEquals(asList(
      "n1__five_minute_rate.value 0",
      "."
    )
    , sut.processCommand("fetch", asList("foo")));
  }


  @Test
  public void testFetchGauge() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "n1");
    metricsRegistry.newGauge(name, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return 123;
      }});

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(
          dataSourceFactory.forMetric(name, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    assertEquals(asList(
      "n1__value_gauge.value 123",
      "."
      )
      , sut.processCommand("fetch", asList("foo")));
  }

  @Test
  public void testFetchHistogram() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "h1");
    Histogram histogram = metricsRegistry.newHistogram(name, false);
    histogram.update(1);
    histogram.update(1);
    histogram.update(3);

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(
          dataSourceFactory.forMetric(name, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    assertEquals(asList(
      "h1__median.value 1",
      "."
    )
    , sut.processCommand("fetch", asList("foo")));
  }


  @Test
  public void testFetchTimer() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "h1");
    Timer timer = metricsRegistry.newTimer(name, TimeUnit.SECONDS, TimeUnit.SECONDS);
    timer.update(1, TimeUnit.SECONDS);
    timer.update(1, TimeUnit.SECONDS);
    timer.update(1, TimeUnit.SECONDS);

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(
          dataSourceFactory.forMetric(name, null, null, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    assertEquals(asList(
            "h1__median.value 1",
            "."
    )
    , sut.processCommand("fetch", asList("foo")));
  }

  @Test(expected=IllegalArgumentException.class)
  public void testFetchInvalidProperty() throws Exception {
    final MetricName name = new MetricName("gr", "t1", "h1");
    metricsRegistry.newTimer(name, TimeUnit.SECONDS, TimeUnit.SECONDS);

    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    Map<String, MuninGraph> graphs = new HashMap<String, MuninGraph>() {{
      put("foo", new MuninGraph("foo", "gr", "t", asList(dataSourceFactory.forMetric(
          name, null, GaugeProperty.VALUE_DERIVE, new MuninDataSourceConfig()))));
    }};

    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(graphs), hostname);

    sut.processCommand("fetch", asList("foo"));
  }

  @Test
  public void testFetchWithNoArgs() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
            "# unknown service",
            "."
    )
            , sut.processCommand("fetch", NO_ARGS));
  }

  @Test
  public void testNodes() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
            "somehost",
            "."
    )
    , sut.processCommand("nodes", NO_ARGS));
  }

  @Test
  public void testVersion() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
      "metrics-munin-reporter munin node on somehost"
    )
    , sut.processCommand("version", NO_ARGS));
  }

  @Test
  public void testFetchWithUnknownService() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    assertEquals(asList(
      "# unknown service",
      "."
    )
    , sut.processCommand("fetch", asList("dummy")));
  }

  @Test(expected=QuitException.class)
  public void testQuit() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    sut.processCommand("quit", NO_ARGS);
  }

  @Test(expected=UnknownCommandException.class)
  public void testUnknownCommand() throws Exception {
    MetricsCommandProcessor sut = new MetricsCommandProcessor(metricsRegistry, new StaticMuninGraphProvider(new ArrayList<MuninGraph>()), hostname);
    sut.processCommand("dummy", NO_ARGS);
  }
}
