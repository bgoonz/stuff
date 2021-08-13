/*
 * Copyright 2014-2017 Netflix, Inc.
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
package com.netflix.edda;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.core.type.TypeReference;

import com.amazonaws.AmazonClientException;
import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.model.*;

public class EddaCloudWatchClient extends EddaAwsClient {
  public EddaCloudWatchClient(AwsConfiguration config, String vip, String region) {
    super(config, vip, region);
  }

  public AmazonCloudWatch readOnly() {
    return readOnly(AmazonCloudWatch.class);
  }

  public AmazonCloudWatch wrapAwsClient(AmazonCloudWatch delegate) {
    return wrapAwsClient(AmazonCloudWatch.class, delegate);
  }

  public DescribeAlarmsResult describeAlarms() {
    return describeAlarms(new DescribeAlarmsRequest());
  }

  public DescribeAlarmsResult describeAlarms(DescribeAlarmsRequest request) {
    validateEmpty("ActionPrefix", request.getActionPrefix());
    validateEmpty("AlarmNamePrefix", request.getAlarmNamePrefix());

    TypeReference<List<MetricAlarm>> ref = new TypeReference<List<MetricAlarm>>() {};
    String url = config.url() + "/api/v2/aws/alarms;_expand";
    try {
      List<MetricAlarm> metricAlarms = parse(ref, doGet(url));

      List<String> names = request.getAlarmNames();
      String state = request.getStateValue();
      if (shouldFilter(names) || shouldFilter(state)) {
        List<MetricAlarm> mas = new ArrayList<MetricAlarm>();
        for (MetricAlarm ma : metricAlarms) {
          if (matches(names, ma.getAlarmName()) && matches(state, ma.getStateValue()))
            mas.add(ma);
        }
        metricAlarms = mas;
      }

      return new DescribeAlarmsResult()
        .withMetricAlarms(metricAlarms);
    }
    catch (IOException e) {
      throw new AmazonClientException("Faled to parse " + url, e);
    }
  }
}
