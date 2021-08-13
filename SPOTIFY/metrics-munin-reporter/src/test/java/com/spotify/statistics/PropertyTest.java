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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;

import java.util.concurrent.TimeUnit;

import org.junit.Test;

import com.spotify.statistics.Property.CounterProperty;
import com.spotify.statistics.Property.GaugeProperty;
import com.spotify.statistics.Property.HistogramProperty;
import com.spotify.statistics.Property.MeterProperty;
import com.spotify.statistics.Property.PropertyFactory;
import com.spotify.statistics.Property.TimerProperty;
import com.yammer.metrics.Metrics;
import com.yammer.metrics.core.Counter;
import com.yammer.metrics.core.Gauge;
import com.yammer.metrics.core.Histogram;
import com.yammer.metrics.core.Meter;
import com.yammer.metrics.core.Metric;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.Timer;

public class PropertyTest {

  private final Gauge<Integer> gauge = Metrics.newGauge(new MetricName("g", "t", "g"), new Gauge<Integer>() {
    @Override
    public Integer value() {
      return 17;
    }});

  private final Counter counter = Metrics.newCounter(new MetricName("g", "t", "c"));
  private final Meter meter = Metrics.newMeter(new MetricName("g", "t", "m"), "events", TimeUnit.SECONDS);
  private final Histogram histogram = Metrics.newHistogram(new MetricName("g", "t", "h"));
  private final Timer timer = Metrics.newTimer(new MetricName("g", "t", "t"), TimeUnit.SECONDS, TimeUnit.SECONDS);

  @Test
  public void testPropertyFactory() {
    Property prop = PropertyFactory.getProperty(GaugeProperty.VALUE_DERIVE, gauge);

    assertEquals(Type.DERIVE, prop.getType());
    assertEquals(17, prop.getNumber(gauge, null));
  }

  @Test
  public void testPropertyFactoryDefault() {
    Property prop = PropertyFactory.getProperty(null, gauge);

    assertEquals(Type.GAUGE, prop.getType());
    assertEquals(17, prop.getNumber(gauge, null));

    assertSame(GaugeProperty.VALUE_GAUGE, PropertyFactory.getProperty(null, gauge));
    assertSame(CounterProperty.COUNT, PropertyFactory.getProperty(null, counter));
    assertSame(MeterProperty.FIVE_MINUTE_RATE, PropertyFactory.getProperty(null, meter));
    assertSame(HistogramProperty.MEDIAN, PropertyFactory.getProperty(null, histogram));
    assertSame(TimerProperty.MEDIAN, PropertyFactory.getProperty(null, timer));
  }

  @Test
  public void testGauge() {
    assertProperty(GaugeProperty.VALUE_DERIVE, Type.DERIVE, 17, gauge, counter);
  }

  @Test
  public void testCounter() {
    assertProperty(CounterProperty.COUNT, Type.DERIVE, 0L, counter, gauge);
    assertProperty(CounterProperty.GAUGE, Type.GAUGE, 0L, counter, gauge);
  }


  @Test
  public void testMeter() {
    assertProperty(MeterProperty.ONE_MINUTE_RATE, Type.GAUGE, 0.0, meter, gauge);
  }

  @Test
  public void testHistogram() {
    assertProperty(HistogramProperty.MEAN, Type.GAUGE, 0.0, histogram, gauge);
  }

  @Test
  public void testTimer() {
    assertProperty(TimerProperty.MEAN, Type.GAUGE, 0.0, timer, gauge);
  }

  private void assertProperty(Property actual, Type expectedType, Number expectedValue, Metric metric, Metric otherMetric) {
    assertEquals(expectedType, actual.getType());
    assertEquals(expectedValue, actual.getNumber(metric, null));

    try {
      actual.getNumber(otherMetric, null);
      fail("Must throw IllegalArgumentException");
    } catch(IllegalArgumentException expected) {}
  }


}
