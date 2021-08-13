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

public class MuninDataSourceFactory {

  static class GroupAndTypeFilter implements MetricFilter {

    private final String metricGroup;
    private final String metricType;

    @Override
    public boolean equals(final Object o) {
      if (this == o) {
        return true;
      }
      if (o == null || getClass() != o.getClass()) {
        return false;
      }

      final GroupAndTypeFilter that = (GroupAndTypeFilter) o;

      if (!metricGroup.equals(that.metricGroup)) {
        return false;
      }
      if (!metricType.equals(that.metricType)) {
        return false;
      }

      return true;
    }

    @Override
    public int hashCode() {
      int result = metricGroup.hashCode();
      result = 31 * result + metricType.hashCode();
      return result;
    }

    @Override
    public String toString() {
      return "GroupAndTypeFilter{"
        + "metricGroup='" + metricGroup + '\''
        + ", metricType='" + metricType + '\''
        + '}';
    }

    GroupAndTypeFilter(final String metricGroup, final String metricType) {
      this.metricGroup = metricGroup;
      this.metricType = metricType;
    }

    public boolean matches(final MetricName metricName) {
      return metricName.getGroup().equals(metricGroup)
        && metricName.getType().equals(metricType);
    }
  }

  /**
   * @param metricName The metric name.
   * @param labelOrNull Label to use for the metric. <code>metricName.getName()</code> will be used
   *                    if <code>null</code> is supplied.
   * @param propertyOrNull The property of the metric to use for graphing
   * @param config Configuration for the data source, will be applied for all matching
   *               metrics
   * @return The munin data source.
   */
  public MuninDataSource forMetric(final MetricName metricName, final String labelOrNull,
                                   final Property propertyOrNull,
                                   final MuninDataSourceConfig config) {
    final String label = labelOrNull == null ? metricName.getName() : labelOrNull;
    return new SingleMetricMuninDataSource(metricName, label, propertyOrNull, config);
  }

  public MuninDataSource forWildcard(final String metricGroup, final String metricType,
                                     final String labelFormatOrNull,
                                     final Property propertyOrNull, final MuninDataSourceConfig config) {
    return forWildcard(new GroupAndTypeFilter(metricGroup, metricType),
                       labelFormatOrNull, propertyOrNull, config);
  }

  public MuninDataSource forWildcard(final MetricFilter filter, final String labelFormatOrNull,
                                     final Property propertyOrNull, final MuninDataSourceConfig config) {
    return new WildcardMuninDataSource(filter, labelFormatOrNull, propertyOrNull, config);
  }

}
