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


import org.apache.commons.lang.Validate;

/**
 * Configuration for a data source
 *
 */
public class MuninDataSourceConfig {

  private static final int DEFAULT_MIN = 0;

  private int min;
  private String color;
  private String cdef;
  private String line;
  private String stack;
  private String draw;
  private String name;

  public MuninDataSourceConfig() {
    this.color = null;
    this.cdef = null;
    this.line = null;
    this.stack = null;
    this.draw = null;
    this.min = DEFAULT_MIN;
    this.name = null;
  }

  /**
   * Get the minimum value. If the fetched value is below "min", it will be discarded. Defaults to 0
   * @return The minimum value
   */
  public int getMin() {
    return min;
  }

  /**
   * Set the minimum value. If the fetched value is below "min", it will be discarded. Defaults to 0
   * @param min The minimum value
   * @return The config
   */
  public MuninDataSourceConfig withMin(final int min) {
    this.min = min;
    return this;
  }

  /**
   * Get the color of the data-source (in "rrggbb" = ffffff aka HTML color)
   * @return HTML encoded color string
   */
  public String getColor() {
    return color;
  }

  /**
   * Set the color of the data source
   * @param color In HTML color code (without #)
   */
  public MuninDataSourceConfig withColor(final String color) {
    Validate.notNull(color);
    this.color = color;
    return this;
  }

  /**
   * Munin cdef for a value
   *
   * @see #withCdef(String)
   *
   * @return cdef
   */
  public String getCdef() {
    return cdef;
  }

  /**
   * Munin cdef for a value - can be used for recalculating values (see munin for more info)
   * @param cdef cdef for value
   */
  public MuninDataSourceConfig withCdef(final String cdef) {
    Validate.notNull(cdef);
    this.cdef = cdef;
    return this;
  }


  /**
   * Return the line descriptor
   *
   * @see #withLine(String)
   */
  public String getLine() {
    return line;
  }

  /**
   * Draws a line in the graph (syntax is Value [:color [:label]]) whereof color is hex withou #
   * @param line Value [:color [:label]] (example 5:00ff00:Limit to draw a line at 5 in green)
   */
  public MuninDataSourceConfig withLine(final String line) {
    Validate.notNull(line);
    this.line = line;
    return this;
  }

  /**
   * Return the current stack descriptor
   *
   * @see #withStack(String)
   */
  public String getStack() {
    return stack;
  }

  /**
   * Used to create stacked graphs
   *
   * @link http://munin-monitoring.org/wiki/stack_examples
   *
   * @param stack Stacking descriptor
   */
  public MuninDataSourceConfig withStack(final String stack) {
    Validate.notNull(stack);
    this.stack = stack;
    return this;
  }

  /**
   * Return how to draw the data
   *
   * @see #withDraw(String)
   */
  public String getDraw() {
    return draw;
  }

  /**
   * How to draw the data.
   *
   * @link http://munin-monitoring.org/wiki/fieldname.draw
   *
   * @param draw Draw description strings
   */
  public MuninDataSourceConfig withDraw(final String draw) {
    this.draw = draw;
    return this;
  }

  /**
   * The munin name of this data source.
   * @return The name.
   */
  public String getName() {
    return name;
  }

  /**
   * Set the munin name of this data source.
   * @param name The name to use.
   */
  public MuninDataSourceConfig withName(final String name) {
    this.name = name;
    return this;
  }
}
