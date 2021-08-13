/*-
 * -\-\-
 * FastForward Java Client
 * --
 * Copyright (C) 2016 - 2020 Spotify AB
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

package com.spotify.ffwd.v1;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import com.spotify.ffwd.protocol1.Protocol1;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import org.junit.jupiter.api.Test;

public class MetricTest {

  private static final String HOST = "host";
  private static final String KEY ="key";
  private static final String TAG1 = "tag1";
  private static final String TAG2 = "tag2";
  private static final String KEYVALUE ="val1";
  private static final String DISTRIBUTION_DATA_POINT ="FAKEDATAFAKEDATAFAKEDATA";


  @Test
  public void testMetricValueNullDefault(){
    Metric metric = new Metric();
    assertNotNull(metric.getValue());
    double actual = extractValue(metric);
    assertEquals(0, actual);
  }

  @Test
  public void testMetricValueNull() {
    final long time = System.currentTimeMillis();
    final Metric metricV1 = createMetric(null, time);
    assertNotNull(metricV1.getValue());
    double actual = extractValue(metricV1);
    assertEquals(0, actual);
  }

  @Test
  public void testMetricDoubleValue(){
    final double expected = 8.908;
    final Metric metricV1 = createMetric(Value.doubleValue(expected), System.currentTimeMillis());
    double actual = extractValue(metricV1);
    assertEquals(expected, actual );
  }

  @Test
  public void testSerializeValueNull() throws InvalidProtocolBufferException {
    final double expectedDataPoint = 0;
    Metric metricV1 = new Metric();
    byte[] bytes =  metricV1.serialize();
    Protocol1.Metric out = Protocol1.Message.newBuilder().mergeFrom(bytes).build().getMetric();
    Protocol1.Value outVal = out.getValue();
    assertEquals(expectedDataPoint, outVal.getDoubleValue());
}

  @Test
  public void testSerializeDoubleValue() throws InvalidProtocolBufferException {
    final double pointVal = 0.9897;
    Metric metricV1 = (new Metric()).value(Value.doubleValue(pointVal));
    byte[] bytes =  metricV1.serialize();
    Protocol1.Metric out = Protocol1.Message.newBuilder().mergeFrom(bytes).build().getMetric();
    Protocol1.Value outVal = out.getValue();
    assertEquals(pointVal,outVal.getDoubleValue());
  }

  @Test
  public void testSerializeDistributionValue() throws InvalidProtocolBufferException {
    final byte [] pointVal =  DISTRIBUTION_DATA_POINT.getBytes(StandardCharsets.UTF_8);
    ByteBuffer byteBuffer = ByteBuffer.allocate(pointVal.length);
    byteBuffer.put(pointVal);
    Metric metricV1 = (new Metric()).value(Value
        .distributionValue(ByteString.copyFrom(byteBuffer.array())));
    byte[] bytes =  metricV1.serialize();
    Protocol1.Metric out = Protocol1.Message.newBuilder().mergeFrom(bytes).build().getMetric();
    Protocol1.Value outVal = out.getValue();
    assertEquals(ByteString.copyFrom(pointVal),outVal.getDistributionValue());
  }


  private Metric createMetric(Value value, long time){
    final long has = 1L;
    final Map<String, String> attributes = Collections.singletonMap(KEY, KEYVALUE);
    return new Metric(has, time,KEY,
        value, HOST, new ArrayList<>(Arrays.asList(TAG1,TAG2)),
        attributes);
  }

  private double extractValue(Metric metric){
    Value value = metric.getValue();
    Double actual = ((Value.DoubleValue) value).getValue();
    return actual;
  }


}
