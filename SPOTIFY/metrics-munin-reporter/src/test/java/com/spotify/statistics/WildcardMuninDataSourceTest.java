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

import com.yammer.metrics.core.Metric;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;

import org.junit.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class WildcardMuninDataSourceTest {

  @Test
  public void testFormat() {
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("foo");
    when(name.getScope()).thenReturn("bar");

    assertEquals("baz", WildcardMuninDataSource.format("baz", name));
    assertEquals("foo", WildcardMuninDataSource.format("{}", name));
    assertEquals("foo", WildcardMuninDataSource.format("{name}", name));
    assertEquals("bar", WildcardMuninDataSource.format("{scope}", name));
    assertEquals("<foo-bar>", WildcardMuninDataSource.format("<{}-{scope}>", name));

    when(name.getScope()).thenReturn(null);
    assertEquals("null", WildcardMuninDataSource.format("{scope}", name));
  }

  @Test
  public void testGetLabel() throws Exception {
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("bar");
    final MetricFilter filter = mock(MetricFilter.class);

    final WildcardMuninDataSource dataSource = new WildcardMuninDataSource(
        filter, "foo {} baz", null, mock(MuninDataSourceConfig.class));

    assertEquals("foo bar baz", dataSource.getLabel(name));
  }

  @Test
  public void testGetName() throws Exception {
    final MetricName name = new MetricName("group", "type", "name");
    final MetricFilter filter = mock(MetricFilter.class);

    final WildcardMuninDataSource dataSource = new WildcardMuninDataSource(
        filter, "foobar", null, new MuninDataSourceConfig().withName("foo {} baz"));

    assertEquals("foo name baz", dataSource.getName(name));
  }

  @Test
  public void testGetMetricNames() throws Exception {
    final MetricName name1 = mock(MetricName.class);
    final MetricName name2 = mock(MetricName.class);
    final MetricName name3 = mock(MetricName.class);

    final MetricFilter filter = mock(MetricFilter.class);
    when(filter.matches(name1)).thenReturn(true);
    when(filter.matches(name2)).thenReturn(true);
    when(filter.matches(name3)).thenReturn(false);

    final MetricsRegistry registry = mock(MetricsRegistry.class);
    final Map<MetricName, Metric> metrics = new HashMap<MetricName, Metric>();
    metrics.put(name1, mock(Metric.class));
    metrics.put(name2, mock(Metric.class));
    metrics.put(name3, mock(Metric.class));
    when(registry.allMetrics()).thenReturn(metrics);

    final WildcardMuninDataSource dataSource = new WildcardMuninDataSource(
        filter, null, null, mock(MuninDataSourceConfig.class));

    assertListEqualsUnordered(Arrays.asList(name1, name2), dataSource.getMetricNames(registry));
  }

  private void assertListEqualsUnordered(List<MetricName> expected, List<MetricName> actual) {
    assertEquals(expected.size(), actual.size());
    assertEquals(new HashSet<MetricName>(expected), new HashSet<MetricName>(actual));
  }
}
