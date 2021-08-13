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

import com.google.common.collect.ImmutableMap;

import com.yammer.metrics.core.MetricName;

import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class MergingMuninGraphProviderTest {

  final MergingMuninGraphProvider sut = new MergingMuninGraphProvider();

  final MetricName metricName1 = new MetricName("g1", "t1", "n1", "s1");
  final MuninGraphProviderBuilder builder1 = new MuninGraphProviderBuilder();
  final MuninGraph expectedGraph1 = builder1.category("foo1")
      .graph("bar1")
      .dataSource(metricName1)
      .build();
  final MuninGraphProvider provider1 = builder1.build();

  final MetricName metricName2 = new MetricName("g2", "t2", "n2", "s2");
  final MuninGraphProviderBuilder builder2 = new MuninGraphProviderBuilder();
  final MuninGraph expectedGraph2 = builder2.category("foo2")
      .graph("bar2")
      .dataSource(metricName2)
      .build();
  final MuninGraphProvider provider2 = builder2.build();

  final Map<String, MuninGraph> expectedGraphs1 = ImmutableMap.of(expectedGraph1.getName(),
                                                                  expectedGraph1);

  final Map<String, MuninGraph> expectedGraphs1and2 = ImmutableMap.of(expectedGraph1.getName(),
                                                                      expectedGraph1,
                                                                      expectedGraph2.getName(),
                                                                      expectedGraph2);

  final Map<String, MuninGraph> expectedGraphs2 = ImmutableMap.of(expectedGraph2.getName(),
                                                                  expectedGraph2);

  @Test
  public void testEmpty() {
    assertTrue(sut.getGraphs().isEmpty());
  }

  @Test
  public void testAddRemoveSingle() {
    sut.addProvider(provider1);
    assertEquals(expectedGraphs1, sut.getGraphs());

    sut.removeProvider(provider1);
    assertTrue(sut.getGraphs().isEmpty());
  }

  @Test
  public void testAddRemoveMultiple() {
    sut.addProvider(provider1);
    sut.addProvider(provider2);
    assertEquals(expectedGraphs1and2, sut.getGraphs());
    sut.removeProvider(provider1);
    assertEquals(expectedGraphs2, sut.getGraphs());
  }
}
