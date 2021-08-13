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

import org.junit.Test;

public class NumberUtilTest {

  @Test
  public void testDoubleToString() {
    assertEquals("0.0000001", NumberUtil.toString(1E-7));
    assertEquals("-0.0000001", NumberUtil.toString(-1E-7));
    assertEquals("1.23", NumberUtil.toString(1.23));
    assertEquals("-1.23", NumberUtil.toString(-1.23));
    assertEquals("0", NumberUtil.toString(0.0));
    assertEquals("0", NumberUtil.toString(1E-10));
    assertEquals("-0", NumberUtil.toString(-1E-10));
    assertEquals("1000000000000", NumberUtil.toString(1E12));
    assertEquals("-1000000000000", NumberUtil.toString(-1E12));

    assertEquals("U", NumberUtil.toString(Double.POSITIVE_INFINITY));
    assertEquals("U", NumberUtil.toString(Double.NEGATIVE_INFINITY));
    assertEquals("U", NumberUtil.toString(Double.NaN));
  }

  /*
   * This test is somewhat academic as metric mostly returns doubles, but it's here for
   * completeness and if someone were to use floats in gauges.
   */
  @Test
  public void testFloatToString() {
    assertEquals("0.0000001", NumberUtil.toString(1E-7f));
    assertEquals("-0.0000001", NumberUtil.toString(-1E-7f));
    assertEquals("0", NumberUtil.toString(0.0f));
    assertEquals("0", NumberUtil.toString(1E-10f));
    assertEquals("-0", NumberUtil.toString(-1E-10f));
    assertEquals("123", NumberUtil.toString(123));
    assertEquals("-123", NumberUtil.toString(-123));

    assertEquals("U", NumberUtil.toString(Float.POSITIVE_INFINITY));
    assertEquals("U", NumberUtil.toString(Float.NEGATIVE_INFINITY));
    assertEquals("U", NumberUtil.toString(Float.NaN));
  }

  @Test
  public void testLongToString() {
    assertEquals("1000000000000", NumberUtil.toString(1000000000000l));
    assertEquals("-1000000000000", NumberUtil.toString(-1000000000000l));
    assertEquals("123", NumberUtil.toString(123));
    assertEquals("-123", NumberUtil.toString(-123));
    assertEquals("0", NumberUtil.toString(0));
    assertEquals("0", NumberUtil.toString(-0));
  }

  @Test
  public void testLongObjectToString() {
    assertEquals("1000000000000", NumberUtil.toString((Object) 1000000000000l));
    assertEquals("-1000000000000", NumberUtil.toString((Object) (-1000000000000l)));
    assertEquals("123", NumberUtil.toString((Object) 123));
    assertEquals("-123", NumberUtil.toString((Object) (-123)));
    assertEquals("0", NumberUtil.toString((Object) 0));
    assertEquals("0", NumberUtil.toString((Object) (-0)));
  }

  @Test
  public void testStringObjectToString() {
    assertEquals("foo", NumberUtil.toString("foo"));
  }

  @Test
  public void testNullObjectToString() {
    assertEquals(null, NumberUtil.toString(null));
  }
}
