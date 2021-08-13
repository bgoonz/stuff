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

public class ParamMetricName implements MetricFilter {

  private final String group;
  private final String type;
  private final String namePrefix;
  private final String scope;

  private final MetricName total;

  public ParamMetricName(final String group, final String type, final String namePrefix,
                         final String scope) {
    this.group = group;
    this.type = type;
    this.namePrefix = namePrefix;
    this.scope = scope;

    // put "total" in front of the prefix so that this name doesn't match
    this.total = new MetricName(group, type, "total " + namePrefix, scope);
  }

  @Override
  public boolean matches(final MetricName metricName) {
    return metricName.getGroup().equals(group)
      && metricName.getType().equals(type)
      && metricName.getName().startsWith(namePrefix)
      && metricName.hasScope() && metricName.getScope().equals(scope);
  }

  public MetricName name(final Object param) {
    return new MetricName(group, type, namePrefix + " - " + param, scope);
  }

  public MetricName getTotal() {
    return total;
  }
}
