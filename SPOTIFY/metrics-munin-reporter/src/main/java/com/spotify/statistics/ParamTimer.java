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

import com.google.common.collect.Maps;

import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;
import com.yammer.metrics.core.Timer;
import com.yammer.metrics.core.TimerContext;

import java.util.List;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.collect.ImmutableList.of;

public class ParamTimer {

  private final MetricsRegistry registry;
  private final ParamMetricName paramMetricName;
  private final TimeUnit durationUnit;
  private final TimeUnit timeUnit;
  private final Timer allTimer;
  private final ConcurrentMap<Object, Timer> timers = Maps.newConcurrentMap();

  public ParamTimer(final MetricsRegistry registry, final ParamMetricName paramMetricName,
                    final TimeUnit durationUnit, final TimeUnit timeUnit) {
    this.registry = checkNotNull(registry);
    this.paramMetricName = checkNotNull(paramMetricName);
    this.durationUnit = checkNotNull(durationUnit);
    this.timeUnit = checkNotNull(timeUnit);

    this.allTimer = registry.newTimer(paramMetricName.getTotal(), durationUnit, timeUnit);
  }

  public List<TimerContext> time(final Object param) {
    Timer timer = timers.get(param);
    if (timer == null) {
      final MetricName name = paramMetricName.name(param);
      timer = registry.newTimer(name, durationUnit, timeUnit);
      final Timer existingTimer = timers.putIfAbsent(param, timer);
      if (existingTimer != null) {
        timer = existingTimer;
      }
    }
    return of(timer.time(), allTimer.time());
  }
}
