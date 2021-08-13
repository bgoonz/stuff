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

import java.text.NumberFormat;
import java.util.Locale;

public final class NumberUtil {

  // NumberFormat is not thread-safe, yes, it's awesome
  private static ThreadLocal<NumberFormat> formatters = new ThreadLocal<NumberFormat>() {

    @Override
    protected NumberFormat initialValue() {
      NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
      nf.setMaximumFractionDigits(9); // 9 is randomly picked
      nf.setGroupingUsed(false);
      return nf;
    }
  };

  private static String toString(final Double value) {
    if (Double.isNaN(value) || Double.isInfinite(value)) {
      // http://munin-monitoring.org/wiki/network-protocol
      // "Numeric value, or 'U'"
      return "U";
    } else {
      return formatters.get().format(value);
    }
  }

  private static String toString(final Float value) {
    if (Float.isNaN(value) || Float.isInfinite(value)) {
      // http://munin-monitoring.org/wiki/network-protocol
      // "Numeric value, or 'U'"
      return "U";
    } else {
      return formatters.get().format(value);
    }
  }

  /**
   * Used for gauges where the type of the value is not known
   * @param value The value, can be of any type or null, but {@link Number} will be properly
   *              formatted
   * @return The formatted value, toString() used for non-Number values, null for null input
   *         values
   */
  public static String toString(final Object value) {
    if (value instanceof Double) {
      return toString((Double) value);
    } else if (value instanceof Float) {
        return toString((Float) value);
    } else if (value instanceof Number) {
      return formatters.get().format(value);
    } else if (value != null) {
      // fallback if something not a number is used
      return value.toString();
    } else {
      return null;
    }
  }

  private NumberUtil() {
    // don't allow initialization
  }
}
