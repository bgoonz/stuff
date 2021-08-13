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
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.isNull;
import static org.mockito.Matchers.notNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import org.junit.Test;

import com.yammer.metrics.core.MetricName;

public class MuninGraphTest {

  @Test
  public void testEmptyGraph() throws Exception {
    MuninGraph graph = new MuninGraph.Builder("n", "c", "t")
            .build();
    MuninGraph expectedGraph = new MuninGraph("n", "c", "t");
    assertEquals(expectedGraph, graph);
  }

  /**
   * Test {@link MuninGraph.Builder#dataSource(com.yammer.metrics.core.MetricName)}.
   */
  @Test
  public void testDataSource1() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forMetric(any(MetricName.class), anyString(), any(Property.class),
                                     any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("foo");

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .dataSource(name)
        .build();

    verify(dataSourceFactory).forMetric(eq(name), isNull(String.class), isNull(Property.class),
                                        notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#dataSource(com.yammer.metrics.core.MetricName, String)}.
   */
  @Test
  public void testDataSource2() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forMetric(any(MetricName.class), anyString(), any(Property.class),
                                     any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricName name = mock(MetricName.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .dataSource(name, "label")
        .build();

    verify(dataSourceFactory).forMetric(eq(name), eq("label"), isNull(Property.class),
                                        notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#dataSource(com.yammer.metrics.core.MetricName, String,
   * MuninDataSourceConfig)}.
   */
  @Test
  public void testDataSource3() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forMetric(any(MetricName.class), anyString(), any(Property.class),
                                     any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricName name = mock(MetricName.class);
    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .dataSource(name, "label", dataSourceConfig)
        .build();

    verify(dataSourceFactory).forMetric(eq(name), eq("label"), isNull(Property.class),
                                        eq(dataSourceConfig));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#dataSource(com.yammer.metrics.core.MetricName, String,
   * Property)}.
   */
  @Test
  public void testDataSource4() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forMetric(any(MetricName.class), anyString(), any(Property.class),
                                     any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricName name = mock(MetricName.class);
    final Property property = mock(Property.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .dataSource(name, "label", property)
        .build();

    verify(dataSourceFactory).forMetric(eq(name), eq("label"), eq(property),
                                        notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#dataSource(com.yammer.metrics.core.MetricName, String, Property,
   * MuninDataSourceConfig)}
   */
  @Test
  public void testDataSource5() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forMetric(any(MetricName.class), anyString(), any(Property.class),
                                     any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricName name = mock(MetricName.class);
    final Property property = mock(Property.class);
    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .dataSource(name, "label", property, dataSourceConfig)
        .build();

    verify(dataSourceFactory).forMetric(eq(name), eq("label"), eq(property), eq(dataSourceConfig));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(String, String)}.
   */
  @Test
  public void testWildcardDataSource1() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(anyString(), anyString(), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource("group", "type")
        .build();

    verify(dataSourceFactory).forWildcard(eq("group"), eq("type"), isNull(String.class),
                                          isNull(Property.class),
                                          notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(String, String, Property)}.
   */
  @Test
  public void testWildcardDataSource2() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(anyString(), anyString(), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final Property property = mock(Property.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource("group", "type", property)
        .build();

    verify(dataSourceFactory).forWildcard(eq("group"), eq("type"), isNull(String.class),
                                          eq(property), notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(String, String, String)}.
   */
  @Test
  public void testWildcardDataSource3() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(anyString(), anyString(), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource("group", "type", "labelfmt")
        .build();

    verify(dataSourceFactory).forWildcard(eq("group"), eq("type"), eq("labelfmt"),
                                          isNull(Property.class),
                                          notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(String, String, String, Property,
   * MuninDataSourceConfig)}.
   */
  @Test
  public void testWildcardDataSource4() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(anyString(), anyString(), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final Property property = mock(Property.class);
    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource("group", "type", "labelfmt", property, dataSourceConfig)
        .build();

    verify(dataSourceFactory).forWildcard(eq("group"), eq("type"), eq("labelfmt"),
                                          eq(property), eq(dataSourceConfig));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(MetricFilter)}.
   */
  @Test
  public void testWildcardDataSource5() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(any(MetricFilter.class), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricFilter filter = mock(MetricFilter.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource(filter)
        .build();

    verify(dataSourceFactory).forWildcard(eq(filter), isNull(String.class), isNull(Property.class),
                                          notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(MetricFilter, String)}.
   */
  @Test
  public void testWildcardDataSource6() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(any(MetricFilter.class), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricFilter filter = mock(MetricFilter.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource(filter, "labelfmt")
        .build();

    verify(dataSourceFactory).forWildcard(eq(filter), eq("labelfmt"), isNull(Property.class),
                                          notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(MetricFilter, Property)}.
   */
  @Test
  public void testWildcardDataSource7() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(any(MetricFilter.class), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricFilter filter = mock(MetricFilter.class);
    final Property property = mock(Property.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource(filter, property)
        .build();

    verify(dataSourceFactory).forWildcard(eq(filter), isNull(String.class), eq(property),
                                          notNull(MuninDataSourceConfig.class));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

  /**
   * Test {@link MuninGraph.Builder#wildcardDataSource(MetricFilter, String, Property,
   * MuninDataSourceConfig)}.
   */
  @Test
  public void testWildcardDataSource8() {
    final MuninDataSourceFactory dataSourceFactory = mock(MuninDataSourceFactory.class);
    final MuninDataSource dataSource = mock(MuninDataSource.class);
    when(dataSourceFactory.forWildcard(any(MetricFilter.class), anyString(), any(Property.class),
                                       any(MuninDataSourceConfig.class)))
        .thenReturn(dataSource);

    final MetricFilter filter = mock(MetricFilter.class);
    final Property property = mock(Property.class);
    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);

    final MuninGraph graph = new MuninGraph.Builder(dataSourceFactory, "n", "c", "t")
        .wildcardDataSource(filter, "labelfmt", property, dataSourceConfig)
        .build();

    verify(dataSourceFactory).forWildcard(eq(filter), eq("labelfmt"), eq(property),
                                          eq(dataSourceConfig));

    assertEquals(Arrays.asList(dataSource), graph.getDataSources());
  }

}
