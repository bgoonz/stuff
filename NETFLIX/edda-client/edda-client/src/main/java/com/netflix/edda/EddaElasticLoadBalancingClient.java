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
import com.amazonaws.services.elasticloadbalancing.AmazonElasticLoadBalancing;
import com.amazonaws.services.elasticloadbalancing.model.*;

import com.netflix.edda.mapper.InstanceStateView;
import com.netflix.edda.mapper.LoadBalancerAttributesView;

public class EddaElasticLoadBalancingClient extends EddaAwsClient {
  public EddaElasticLoadBalancingClient(AwsConfiguration config, String vip, String region) {
    super(config, vip, region);
  }

  public AmazonElasticLoadBalancing readOnly() {
    return readOnly(AmazonElasticLoadBalancing.class);
  }

  public AmazonElasticLoadBalancing wrapAwsClient(AmazonElasticLoadBalancing delegate) {
    return wrapAwsClient(AmazonElasticLoadBalancing.class, delegate);
  }

  public DescribeInstanceHealthResult describeInstanceHealth(DescribeInstanceHealthRequest request) {
    validateNotEmpty("LoadBalancerName", request.getLoadBalancerName());

    TypeReference<InstanceStateView> ref = new TypeReference<InstanceStateView>() {};
    String loadBalancerName = request.getLoadBalancerName();
    
    String url = config.url() + "/api/v2/view/loadBalancerInstances/"+loadBalancerName+";_expand";
    try {
      InstanceStateView instanceStateView = parse(ref, doGet(url));
      List<InstanceState> instanceStates = instanceStateView.getInstances();

      List<Instance> instances = request.getInstances();
      List<String> ids = new ArrayList<String>();
      if (instances != null) {
        for (Instance i : instances)
          ids.add(i.getInstanceId());
      }
      if (shouldFilter(ids)) {
        List<InstanceState> iss = new ArrayList<InstanceState>();
        for (InstanceState is : instanceStates) {
          if (matches(ids, is.getInstanceId()))
            iss.add(is);
        }
        instanceStates = iss;
      }

      return new DescribeInstanceHealthResult()
        .withInstanceStates(instanceStateView.getInstances());
    }
    catch (IOException e) {
      throw new AmazonClientException("Faled to parse " + url, e);
    }
  }

  public DescribeLoadBalancersResult describeLoadBalancers() {
    return describeLoadBalancers(new DescribeLoadBalancersRequest());
  }

  public DescribeLoadBalancersResult describeLoadBalancers(DescribeLoadBalancersRequest request) {
    TypeReference<List<LoadBalancerDescription>> ref = new TypeReference<List<LoadBalancerDescription>>() {};
    String url = config.url() + "/api/v2/aws/loadBalancers;_expand";
    try {
      List<LoadBalancerDescription> loadBalancerDescriptions = parse(ref, doGet(url));

      List<String> names = request.getLoadBalancerNames();
      if (shouldFilter(names)) {
        List<LoadBalancerDescription> lbs = new ArrayList<LoadBalancerDescription>();
        for (LoadBalancerDescription lb : loadBalancerDescriptions) {
          if (matches(names, lb.getLoadBalancerName()))
            lbs.add(lb);
        }
        loadBalancerDescriptions = lbs;
      }

      return new DescribeLoadBalancersResult()
        .withLoadBalancerDescriptions(loadBalancerDescriptions);
    }
    catch (IOException e) {
      throw new AmazonClientException("Faled to parse " + url, e);
    }
  }

  public DescribeLoadBalancerAttributesResult describeLoadBalancerAttributes(DescribeLoadBalancerAttributesRequest request) {
    validateNotEmpty("LoadBalancerName", request.getLoadBalancerName());

    TypeReference<LoadBalancerAttributesView> ref = new TypeReference<LoadBalancerAttributesView>() {};
    String loadBalancerName = request.getLoadBalancerName();

    String url = config.url() + "/api/v2/view/loadBalancerAttributes/"+loadBalancerName+";_expand";
    try {
      LoadBalancerAttributesView loadBalancerAttributesView = parse(ref, doGet(url));
      return new DescribeLoadBalancerAttributesResult()
        .withLoadBalancerAttributes(loadBalancerAttributesView.getAttributes());
    }
    catch (IOException e) {
      throw new AmazonClientException("Faled to parse " + url, e);
    }
  }
}
