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

import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;

import org.apache.commons.lang.Validate;

import java.util.List;

/**
 * Definition of one data source
 *
 */
public abstract class MuninDataSource {

  private final Property propertyOrNull;
  private final int min;
  private final String color;
  private final String cdef;
  private final String line;
  private final String stack;
  private final String draw;

  /**
   * A data source with a configured label and graph configuration
   * @param propertyOrNull Property for the data source, may be null
   * @param config The graph configuration
   */
  public MuninDataSource(final Property propertyOrNull, final MuninDataSourceConfig config) {
    Validate.notNull(config);

    this.propertyOrNull = propertyOrNull;
    this.min = config.getMin();
    this.color = config.getColor();
    this.cdef = config.getCdef();
    this.line = config.getLine();
    this.stack = config.getStack();
    this.draw = config.getDraw();
  }

  /**
   * The label to use for the data source
   * @param name {@link MetricName} that might be used for defaulting
   * @return The label
   */
  public abstract String getLabel(final MetricName name);

  /**
   * The munin name to use for the data source
   * @param name {@link MetricName} that might be used for defaulting
   * @return The name
   */
  public abstract String getName(final MetricName name);

  /**
   * Minimum value. If the fetched value is below "min", it will be discarded
   * @return The minimum value
   */
  public int getMin() {
    return min;
  }

  /**
   * Property for the data source
   * @return The property, or null
   */
  public Property getPropertyOrNull() {
    return propertyOrNull;
  }

  /**
   * Get the color of the data-source (in "rrggbb" = ffffff aka HTML color)
   * @return HTML encoded color string, can be null
   */
  public String getColor() {
    return color;
  }

  /**
   * Munin cdef for a value - can be used for recalculating values (see munin for more info)
   *
   * @return cdef, can be null
   */
  public String getCdef() {
    return cdef;
  }

  /**
   * Get the line configurion that is responsible for a line in the graph
   * (syntax is Value [:color [:label]]) whereof color is hex withou #
   *
   * @return line configuration, can be null
   */
  public String getLine() {
    return line;
  }

  /**
   * Return the current stack descriptor
   *
   * @return stack configuration, can be null
   */
  public String getStack() {
    return stack;
  }

  /**
   * Return how to draw the data
   *
   * @link http://munin-monitoring.org/wiki/fieldname.draw
   *
   * @return draw configuration
   */
  public String getDraw() {
    return draw;
  }

  public abstract List<MetricName> getMetricNames(MetricsRegistry registry);

  @Override
  public String toString() {
    return "MuninDataSource{"
          + ", min=" + min
          + ", property=" + propertyOrNull
          + ", color=" + color
          + ", cdef=" + cdef
          + ", line=" + line
          + ", stack=" + stack
          + ", draw=" + draw
          + '}';
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    MuninDataSource that = (MuninDataSource) o;

    if (min != that.min) {
      return false;
    }
    if (cdef != null ? !cdef.equals(that.cdef) : that.cdef != null) {
      return false;
    }
    if (color != null ? !color.equals(that.color) : that.color != null) {
      return false;
    }
    if (draw != null ? !draw.equals(that.draw) : that.draw != null) {
      return false;
    }
    if (line != null ? !line.equals(that.line) : that.line != null) {
      return false;
    }
    if (propertyOrNull != null ? !propertyOrNull.equals(that.propertyOrNull)
                               : that.propertyOrNull != null) {
      return false;
    }
    if (stack != null ? !stack.equals(that.stack) : that.stack != null) {
      return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    int result = propertyOrNull != null ? propertyOrNull.hashCode() : 0;
    result = 31 * result + min;
    result = 31 * result + (color != null ? color.hashCode() : 0);
    result = 31 * result + (cdef != null ? cdef.hashCode() : 0);
    result = 31 * result + (line != null ? line.hashCode() : 0);
    result = 31 * result + (stack != null ? stack.hashCode() : 0);
    result = 31 * result + (draw != null ? draw.hashCode() : 0);
    return result;
  }
}
