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

import java.util.Arrays;
import java.util.List;

/**
 * Definition of one data source for a single metric
 *
 */
public class SingleMetricMuninDataSource extends MuninDataSource {


  private final String label;
  private final String name;
  private final List<MetricName> metricNames;

  public SingleMetricMuninDataSource(final MetricName metricName, final String label,
                                     final Property property) {
    this(metricName, label, property, new MuninDataSourceConfig());
  }

  /**
   * A data source with a configured label and graph configuration
   * @param label The label to use for the data source
   * @param config The graph configuration
   */
  public SingleMetricMuninDataSource(final MetricName metricName, final String label,
                                     final Property property, final MuninDataSourceConfig config) {
    super(property, config);

    Validate.notNull(metricName);
    Validate.notNull(label);

    this.metricNames = Arrays.asList(metricName);
    this.label = label;
    this.name = config.getName();
  }

  /**
   * The label to use for the data source
   * @return The label
   */
  public String getLabel(final MetricName name) {
    return label;
  }

  @Override
  public String getName(final MetricName metricName) {
    if (name != null) {
      return name;
    } else {
      return metricName.getName();
    }
  }

  public List<MetricName> getMetricNames(final MetricsRegistry registry) {
    return metricNames;
  }

  @Override
  public String toString() {
    return "SingleMetricMuninDataSource{"
            + "label='" + label + '\''
            + ", property=" + getPropertyOrNull()
            + ", min=" + getMin()
            + ", metricName=" + metricNames
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

    SingleMetricMuninDataSource that = (SingleMetricMuninDataSource) o;

    if (!super.equals(o)) {
      return false;
    }
    if (!label.equals(that.label)) {
      return false;
    }
    if (!metricNames.equals(that.metricNames)) {
      return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    int result = super.hashCode();
    result = 31 * result + label.hashCode();
    result = 31 * result + metricNames.hashCode();
    return result;
  }
}
