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
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class MuninReporterConfigTest {

  MuninReporterConfig sut = new MuninReporterConfig();

  @Test
  public void testCategory() {
    MuninGraphCategoryConfig category = sut.category("c");
    assertNotNull(category);
  }

  @Test
  public void testGraph() throws Exception {
    MuninGraphCategoryConfig category = sut.category("c");
    category.graph("t");
    MuninGraph graph = sut.build().getGraphs().get("c_t");
    assertNotNull(graph);
    assertEquals("c_t", graph.getName());
    assertEquals("c", graph.getCategory());
    assertEquals("t", graph.getTitle());
  }

}
