/*-
 * -\-\-
 * opencensus-exporter
 * --
 * Copyright (C) 2016 - 2019 Spotify AB
 * --
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -/-/-
 */

package com.spotify.ffwd;

import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import io.opencensus.common.Function;
import io.opencensus.common.Functions;
import io.opencensus.exporter.metrics.util.MetricExporter;
import io.opencensus.metrics.LabelKey;
import io.opencensus.metrics.LabelValue;
import io.opencensus.metrics.export.Distribution;
import io.opencensus.metrics.export.Metric;
import io.opencensus.metrics.export.MetricDescriptor.Type;
import io.opencensus.metrics.export.Point;
import io.opencensus.metrics.export.Summary;
import io.opencensus.metrics.export.TimeSeries;
import java.io.IOException;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FfwdMetricsConverter extends MetricExporter {

  private static final Logger LOG = LoggerFactory.getLogger(FfwdMetricsConverter.class);

  private FastForward client;

  FfwdMetricsConverter(final String ffwdHost, final int ffwdPort) {
    try {
      client = FastForward.setup(ffwdHost, ffwdPort);
    } catch (UnknownHostException | SocketException e) {
      throw new IllegalStateException("Failed to start ffwd opencensus client", e);
    }
  }

  protected FfwdMetricsConverter(final FastForward client) {
    this.client = client;
  }


  // Constant functions for TypedValue.
  private static final Function<Double, List<com.spotify.ffwd.Metric>> typedValueDoubleFunction =
      new Function<Double, List<com.spotify.ffwd.Metric>>() {
        @Override
        public List<com.spotify.ffwd.Metric> apply(Double value) {
          return
              Collections.singletonList(new com.spotify.ffwd.Metric().value(value));
        }
      };

  private static final Function<Long, List<com.spotify.ffwd.Metric>> typedValueLongFunction =
      new Function<Long, List<com.spotify.ffwd.Metric>>() {
        @Override
        public List<com.spotify.ffwd.Metric> apply(Long value) {
          return
              Collections.singletonList(new com.spotify.ffwd.Metric().value(value));
        }
      };

  private static final Function<Distribution, List<com.spotify.ffwd.Metric>>
      typedValueDistributionFunction =
      new Function<Distribution, List<com.spotify.ffwd.Metric>>() {
        @Override
        public List<com.spotify.ffwd.Metric> apply(Distribution distribution) {
          //TODO: Big task of support distributions in Heroic.
          return new ArrayList<>(ImmutableList.of());
        }
      };
  private static final Function<Summary, List<com.spotify.ffwd.Metric>> typedValueSummaryFunction =
      new Function<Summary, List<com.spotify.ffwd.Metric>>() {
        @Override
        public List<com.spotify.ffwd.Metric> apply(Summary summary) {
          // TODO: Make the percentiles configurable.
          final List<Summary.Snapshot.ValueAtPercentile> snapshot =
              summary.getSnapshot().getValueAtPercentiles();

          // TODO: Add stat: min/max/average/p75/p99
          return Collections.singletonList(
              new com.spotify.ffwd.Metric().value(snapshot.get(50).getValue())
          );
        }
      };

  public void export(Collection<Metric> collection) {
    final ArrayList<com.spotify.ffwd.Metric> metrics = new ArrayList<>();

    for (Metric metric : collection) {
      for (TimeSeries timeSeries : metric.getTimeSeriesList()) {
        for (final Point point : timeSeries.getPoints()) {
          final List<com.spotify.ffwd.Metric> values = point.getValue().match(
              typedValueDoubleFunction,
              typedValueLongFunction,
              typedValueDistributionFunction,
              typedValueSummaryFunction,
              Functions.throwIllegalArgumentException()
          );

          final Map<String, String> tags = createTags(
              metric.getMetricDescriptor().getLabelKeys(), timeSeries.getLabelValues());

          for (final com.spotify.ffwd.Metric value : values) {
            metrics.add(
                FastForward
                    .metric(metric.getMetricDescriptor().getName())
                    .attributes(tags)
                    .attribute("unit", metric.getMetricDescriptor().getUnit())
                    .attribute("metric_type", getMetricType(metric.getMetricDescriptor().getType()))
                    .time(point.getTimestamp().getSeconds() * 1000) // convert to milliseconds
                    .value(value.getValue())
            );
          }
        }
      }
    }

    sendMetrics(metrics);
  }

  private static String getMetricType(Type type) {
    switch (type) {
      case CUMULATIVE_INT64:
      case CUMULATIVE_DOUBLE:
        return "counter";
      case GAUGE_INT64:
      case GAUGE_DOUBLE:
        return "gauge";
      case GAUGE_DISTRIBUTION:
      case CUMULATIVE_DISTRIBUTION:
        return "distribution";
      case SUMMARY:
        return "histogram";
      default:
        return null;
    }
  }

  private void sendMetrics(List<com.spotify.ffwd.Metric> metrics) {
    for (com.spotify.ffwd.Metric m : metrics) {
      try {
        client.send(m);
      } catch (IOException e) {
        LOG.error("Failed to send metric", e);
      }
    }
  }

  static Map<String, String> createTags(List<LabelKey> keys, List<LabelValue> values) {
    final HashMap<String, String> tags = new HashMap<>(keys.size());
    for (int i = 0; i < values.size(); i++) {
      LabelValue value = values.get(i);
      if (Strings.isNullOrEmpty(value.getValue())) {
        continue;
      }
      tags.put(keys.get(i).getKey(), value.getValue());
    }
    return tags;
  }
}
