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

import com.google.common.base.Joiner;
import com.google.common.collect.Maps;

import com.yammer.metrics.core.Meter;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;

import java.util.AbstractList;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import static com.google.common.base.Preconditions.checkNotNull;

public class ParamMeter {

  private final MetricsRegistry registry;
  private final ParamMetricName paramMetricName;
  private final String eventType;
  private final TimeUnit timeUnit;
  private final Meter total;
  private final ConcurrentMap<Object, Meter> meters = Maps.newConcurrentMap();

  public ParamMeter(final MetricsRegistry registry, final ParamMetricName paramMetricName,
                    final String eventType, final TimeUnit timeUnit) {
    this.registry = checkNotNull(registry);
    this.paramMetricName = checkNotNull(paramMetricName);
    this.eventType = checkNotNull(eventType);
    this.timeUnit = checkNotNull(timeUnit);

    this.total = registry.newMeter(paramMetricName.getTotal(), eventType, timeUnit);
  }

  public void mark(final Object param) {
    Meter meter = meters.get(param);
    if (meter == null) {
      final MetricName name = paramMetricName.name(param);
      meter = registry.newMeter(name, eventType, timeUnit);
      final Meter existingMeter = meters.putIfAbsent(param, meter);
      if (existingMeter != null) {
        meter = existingMeter;
      }
    }
    meter.mark();
    total.mark();
  }

  public void mark(final Object param1, final Object param2) {
    mark(paramList(param1, param2));
  }

  private static Object paramList(final Object param1, final Object param2) {
    return new ParamList2(param1, param2);
  }

  public Meter getTotal() {
    return total;
  }

  private abstract static class ParamList extends AbstractList<Object> {

    public String toString() {
      return Joiner.on(" - ").join(this);
    }
  }

  private static class ParamList2 extends ParamList {

    private final Object param1;
    private final Object param2;

    public ParamList2(final Object param1, final Object param2) {
      this.param1 = param1;
      this.param2 = param2;
    }

    @Override
    public Object get(final int index) {
      switch (index) {
        case 0:
          return param1;
        case 1:
          return param2;
        default:
          throw new IndexOutOfBoundsException(index + " not in [0, 1]");
      }
    }

    @Override
    public int size() {
      return 2;
    }
  }
}
