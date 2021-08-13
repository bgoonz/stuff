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

import org.junit.Assert;

import org.junit.Test;

public class MuninDataSourceConfigTest {
  @Test
  public void testBuilder() throws Exception {
    MuninDataSourceConfig config = new MuninDataSourceConfig()
        .withCdef("cdef")
        .withColor("color")
        .withDraw("area")
        .withLine("line")
        .withMin(1)
        .withStack("stack")
        .withName("name");

    Assert.assertEquals(config.getCdef(), "cdef");
    Assert.assertEquals(config.getColor(), "color");
    Assert.assertEquals(config.getDraw(), "area");
    Assert.assertEquals(config.getLine(), "line");
    Assert.assertEquals(config.getMin(), 1);
    Assert.assertEquals(config.getStack(), "stack");
    Assert.assertEquals(config.getName(), "name");
  }

}
