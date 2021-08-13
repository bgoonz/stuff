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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;

import io.opencensus.common.Timestamp;
import io.opencensus.metrics.LabelKey;
import io.opencensus.metrics.LabelValue;
import io.opencensus.metrics.export.Metric;
import io.opencensus.metrics.export.MetricDescriptor;
import io.opencensus.metrics.export.Point;
import io.opencensus.metrics.export.TimeSeries;
import io.opencensus.metrics.export.Value;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

public class FfwdMetricsConverterTest {

  @Mock
  private FastForward client;


  @BeforeEach
  void before() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  void counterisSent() throws IOException {
    final FfwdMetricsConverter converter = new FfwdMetricsConverter(client);

    final ArgumentCaptor<com.spotify.ffwd.Metric> metricCaptor =
        ArgumentCaptor.forClass(com.spotify.ffwd.Metric.class);

    Mockito.doNothing().when(client).send(metricCaptor.capture());

    converter.export(
        Collections.singletonList(
            Metric.createWithOneTimeSeries(
                MetricDescriptor.create(
                    "rps-requests",
                    "requests",
                    "requests",
                    MetricDescriptor.Type.CUMULATIVE_DOUBLE,
                    Collections.singletonList(LabelKey.create("status-code", "rpc status code"))),
                TimeSeries.createWithOnePoint(
                    Collections.singletonList(LabelValue.create("200")),
                    Point.create(Value.doubleValue(10.0), Timestamp.create(1575323125, 0)),
                    Timestamp.create(1575323125, 0)))));

    Mockito.verify(client, times(1)).send(Mockito.any(com.spotify.ffwd.Metric.class));

    assertEquals("rps-requests", metricCaptor.getValue().getKey());
    assertEquals("requests", metricCaptor.getValue().getAttributes().get("unit"));
    assertEquals("counter", metricCaptor.getValue().getAttributes().get("metric_type"));
  }

  @Test
  void createTags() {
    final List<LabelKey> keys =
        Collections.singletonList(LabelKey.create("status-code", "rpc status code"));
    final List<LabelValue> values = Collections.singletonList(LabelValue.create("200"));

    final Map<String, String> tags = FfwdMetricsConverter.createTags(keys, values);

    assertEquals(1, tags.size());
  }

  @Test
  void createTagsSkipMissingValue() {
    final List<LabelKey> keys =
        Collections.singletonList(LabelKey.create("status-code", "rpc status code"));
    final List<LabelValue> values = Collections.emptyList();

    final Map<String, String> tags = FfwdMetricsConverter.createTags(keys, values);

    assertEquals(0, tags.size());
  }


}
