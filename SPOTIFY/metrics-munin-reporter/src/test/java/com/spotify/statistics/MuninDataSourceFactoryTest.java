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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import org.junit.Test;

import com.yammer.metrics.core.MetricName;

public class MuninDataSourceFactoryTest {

  /**
   * Test {@link MuninDataSourceFactory#forMetric(com.yammer.metrics.core.MetricName, String,
   * Property, MuninDataSourceConfig)}
   */
  @Test
  public void testForMetric() {
    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("name");

    final Property property = mock(Property.class);

    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);
    when(dataSourceConfig.getCdef()).thenReturn("cdef");
    when(dataSourceConfig.getColor()).thenReturn("color");
    when(dataSourceConfig.getDraw()).thenReturn("draw");
    when(dataSourceConfig.getLine()).thenReturn("line");
    when(dataSourceConfig.getMin()).thenReturn(42);
    when(dataSourceConfig.getStack()).thenReturn("stack");

    final MuninDataSource dataSource = dataSourceFactory.forMetric(name, "label", property,
                                                                   dataSourceConfig);

    assertTrue(dataSource instanceof SingleMetricMuninDataSource);
    assertEquals(property, dataSource.getPropertyOrNull());
    assertEquals(Arrays.asList(name), dataSource.getMetricNames(null));
    assertEquals("label", dataSource.getLabel(name));

    verify(dataSourceConfig).getCdef();
    assertEquals("cdef", dataSource.getCdef());
    verify(dataSourceConfig).getColor();
    assertEquals("color", dataSource.getColor());
    verify(dataSourceConfig).getDraw();
    assertEquals("draw", dataSource.getDraw());
    verify(dataSourceConfig).getLine();
    assertEquals("line", dataSource.getLine());
    verify(dataSourceConfig).getMin();
    assertEquals(42, dataSource.getMin());
    verify(dataSourceConfig).getStack();
    assertEquals("stack", dataSource.getStack());
  }

  @Test
  public void testForMetricNullLabel() {
    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("name");

    final Property property = mock(Property.class);

    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);
    when(dataSourceConfig.getCdef()).thenReturn("cdef");
    when(dataSourceConfig.getColor()).thenReturn("color");
    when(dataSourceConfig.getDraw()).thenReturn("draw");
    when(dataSourceConfig.getLine()).thenReturn("line");
    when(dataSourceConfig.getMin()).thenReturn(42);
    when(dataSourceConfig.getStack()).thenReturn("stack");

    final MuninDataSource dataSource = dataSourceFactory.forMetric(name, null, property,
                                                                   dataSourceConfig);

    assertEquals("name", dataSource.getLabel(name));
  }

  /**
   * Test {@link MuninDataSourceFactory#forWildcard(String, String, String, Property,
   * MuninDataSourceConfig)}.
   */
  @Test
  public void testForWildcardGroupAndType() {
    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("name");

    final Property property = mock(Property.class);

    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);
    when(dataSourceConfig.getCdef()).thenReturn("cdef");
    when(dataSourceConfig.getColor()).thenReturn("color");
    when(dataSourceConfig.getDraw()).thenReturn("draw");
    when(dataSourceConfig.getLine()).thenReturn("line");
    when(dataSourceConfig.getMin()).thenReturn(42);
    when(dataSourceConfig.getStack()).thenReturn("stack");

    final MuninDataSource dataSource = dataSourceFactory.forWildcard("group", "type", "labelfmt",
                                                                     property, dataSourceConfig);

    assertTrue(dataSource instanceof WildcardMuninDataSource);
    final WildcardMuninDataSource wildcardDataSource = (WildcardMuninDataSource)dataSource;
    assertEquals(new MuninDataSourceFactory.GroupAndTypeFilter("group", "type"),
                 wildcardDataSource.getFilter());

    assertEquals(property, dataSource.getPropertyOrNull());
    assertEquals("labelfmt", dataSource.getLabel(name));

    verify(dataSourceConfig).getCdef();
    assertEquals("cdef", dataSource.getCdef());
    verify(dataSourceConfig).getColor();
    assertEquals("color", dataSource.getColor());
    verify(dataSourceConfig).getDraw();
    assertEquals("draw", dataSource.getDraw());
    verify(dataSourceConfig).getLine();
    assertEquals("line", dataSource.getLine());
    verify(dataSourceConfig).getMin();
    assertEquals(42, dataSource.getMin());
    verify(dataSourceConfig).getStack();
    assertEquals("stack", dataSource.getStack());
  }

  /**
   * Test {@link MuninDataSourceFactory#forWildcard(MetricFilter, String, Property,
   * MuninDataSourceConfig)}.
   */
  @Test
  public void testForWildcardFilter() {
    final MuninDataSourceFactory dataSourceFactory = new MuninDataSourceFactory();
    final MetricName name = mock(MetricName.class);
    when(name.getName()).thenReturn("name");

    final MetricFilter filter = mock(MetricFilter.class);
    final Property property = mock(Property.class);

    final MuninDataSourceConfig dataSourceConfig = mock(MuninDataSourceConfig.class);
    when(dataSourceConfig.getCdef()).thenReturn("cdef");
    when(dataSourceConfig.getColor()).thenReturn("color");
    when(dataSourceConfig.getDraw()).thenReturn("draw");
    when(dataSourceConfig.getLine()).thenReturn("line");
    when(dataSourceConfig.getMin()).thenReturn(42);
    when(dataSourceConfig.getStack()).thenReturn("stack");

    final MuninDataSource dataSource = dataSourceFactory.forWildcard(filter, "labelfmt", property,
                                                                     dataSourceConfig);

    assertTrue(dataSource instanceof WildcardMuninDataSource);
    final WildcardMuninDataSource wildcardDataSource = (WildcardMuninDataSource)dataSource;
    assertEquals(filter, wildcardDataSource.getFilter());

    assertEquals(property, dataSource.getPropertyOrNull());
    assertEquals("labelfmt", dataSource.getLabel(name));

    verify(dataSourceConfig).getCdef();
    assertEquals("cdef", dataSource.getCdef());
    verify(dataSourceConfig).getColor();
    assertEquals("color", dataSource.getColor());
    verify(dataSourceConfig).getDraw();
    assertEquals("draw", dataSource.getDraw());
    verify(dataSourceConfig).getLine();
    assertEquals("line", dataSource.getLine());
    verify(dataSourceConfig).getMin();
    assertEquals(42, dataSource.getMin());
    verify(dataSourceConfig).getStack();
    assertEquals("stack", dataSource.getStack());
  }

  @Test
  public void testGroupAndTypeFilter() {
    final MuninDataSourceFactory.GroupAndTypeFilter filter =
        new MuninDataSourceFactory.GroupAndTypeFilter("g", "t");

    final MetricName name1 = mock(MetricName.class);
    when(name1.getGroup()).thenReturn("g");
    when(name1.getType()).thenReturn("t");
    final MetricName name2 = mock(MetricName.class);
    when(name2.getGroup()).thenReturn("g");
    when(name2.getType()).thenReturn("x");
    final MetricName name3 = mock(MetricName.class);
    when(name3.getGroup()).thenReturn("x");
    when(name3.getType()).thenReturn("t");

    assertTrue(filter.matches(name1));
    assertFalse(filter.matches(name2));
    assertFalse(filter.matches(name3));
  }

}
