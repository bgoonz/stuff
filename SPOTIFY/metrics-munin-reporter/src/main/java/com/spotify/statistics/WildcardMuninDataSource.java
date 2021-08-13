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

import com.yammer.metrics.core.Metric;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;

import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Definition of a data source for dynamic metrics, e.g. metrics matching a type
 *
 */
public class WildcardMuninDataSource extends MuninDataSource {

  private static final String DEFAULT_LABEL_FORMAT = "{}";
  private static final Pattern FORMAT_PLACEHOLDER = Pattern.compile("\\{[^\\{\\}]*\\}");

  private final String labelFormat;
  private final String nameFormat;
  private final MetricFilter filter;

  public WildcardMuninDataSource(final MetricFilter filter,
                                 final String labelFormatOrNull,
                                 final Property propertyOrNull,
                                 final MuninDataSourceConfig config) {
    super(propertyOrNull, config);
    this.filter = checkNotNull(filter);

    if (labelFormatOrNull != null) {
      this.labelFormat = labelFormatOrNull;
    } else {
      this.labelFormat = DEFAULT_LABEL_FORMAT;
    }

    this.nameFormat = config.getName();
  }

  public String getLabel(final MetricName name) {
    return format(labelFormat, name);
  }

  public String getName(final MetricName name) {
    if (nameFormat != null) {
      return format(nameFormat, name);
    } else {
      return name.getName();
    }
  }

  public List<MetricName> getMetricNames(final MetricsRegistry registry) {
    List<MetricName> names = new ArrayList<MetricName>();
    for (final Entry<MetricName, Metric> metric : registry.allMetrics().entrySet()) {
      final MetricName metricName = metric.getKey();
      if (filter.matches(metricName)) {
        names.add(metricName);
      }
    }
    return names;
  }

  public MetricFilter getFilter() {
    return filter;
  }

  static String format(final String format, final MetricName name) {
    final Matcher matcher = FORMAT_PLACEHOLDER.matcher(format);
    final StringBuffer sb = new StringBuffer();

    while (matcher.find()) {
      final String group = matcher.group();

      if (group.equals("{}") || group.equals("{name}")) {
        matcher.appendReplacement(sb, name.getName());
      } else if (group.equals("{scope}")) {
        final String scope = name.getScope();
        if (scope != null) {
          matcher.appendReplacement(sb, name.getScope());
        } else {
          matcher.appendReplacement(sb, "null");
        }
      }
    }

    matcher.appendTail(sb);

    return sb.toString();
  }

  @Override
  public String toString() {
    return "WildcardMuninDataSource{"
      + "labelFormat='" + labelFormat + '\''
      + ", filter=" + filter
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
    if (!super.equals(o)) {
      return false;
    }

    final WildcardMuninDataSource that = (WildcardMuninDataSource) o;

    if (!filter.equals(that.filter)) {
      return false;
    }
    if (!labelFormat.equals(that.labelFormat)) {
      return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    int result = super.hashCode();
    result = 31 * result + labelFormat.hashCode();
    result = 31 * result + filter.hashCode();
    return result;
  }
}
