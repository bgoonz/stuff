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

import java.util.concurrent.atomic.AtomicReference;
import com.amazonaws.AmazonWebServiceRequest;
import com.amazonaws.ClientConfiguration;
import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;

import com.amazonaws.regions.Regions;
import com.amazonaws.retry.RetryPolicy;

import com.amazonaws.services.autoscaling.AmazonAutoScaling;
import com.amazonaws.services.autoscaling.AmazonAutoScalingClient;
import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClient;
import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.AmazonEC2Client;
import com.amazonaws.services.elasticloadbalancing.AmazonElasticLoadBalancing;
import com.amazonaws.services.elasticloadbalancing.AmazonElasticLoadBalancingClient;
import com.amazonaws.services.route53.AmazonRoute53;
import com.amazonaws.services.route53.AmazonRoute53Client;

import com.netflix.iep.config.Configuration;
import com.netflix.iep.NetflixEnvironment;

public class AwsClientFactory {
  private AwsClientFactory() {}

  private static AwsConfiguration config() {
    return Configuration.newProxy(AwsConfiguration.class, "netflix.edda.aws");
  }

  private static final AtomicReference<AWSCredentialsProvider> DEFAULT_PROVIDER =
    new AtomicReference<AWSCredentialsProvider>(new DefaultAWSCredentialsProviderChain());

  private static final AtomicReference<String>  DEFAULT_VIP =
    new AtomicReference<String>("edda-main:7001");

  public static void setDefaultCredentialsProvider(AWSCredentialsProvider p) {
    DEFAULT_PROVIDER.set(p);
  }

  public static void setDefaultVip(String vip) {
    DEFAULT_VIP.set(vip);
  }

  private static ClientConfiguration clientConfig(AwsConfiguration config) {
    return new ClientConfiguration()
      .withConnectionTimeout((int) config.connectionTimeout().getMillis())
      .withMaxConnections(config.maxConnections())
      .withMaxErrorRetry(config.maxErrorRetry())
      .withSocketTimeout((int) config.socketTimeout().getMillis())
      .withRetryPolicy(
        new RetryPolicy(
          new RetryPolicy.RetryCondition() {
            private final int maxRetries = config.maxErrorRetry();
            @Override public boolean shouldRetry(
              AmazonWebServiceRequest r, AmazonClientException e, int retriesAttempted
            ) {
              if (e instanceof AmazonServiceException) {
                int code = ((AmazonServiceException) e).getStatusCode();
                if (!(code % 100 == 5 || code == 400 || code == 403 || code == 429)) return false;
              }
              return retriesAttempted < maxRetries;
            }
          },
          new RetryPolicy.BackoffStrategy() {
            @Override public long delayBeforeNextRetry(
              AmazonWebServiceRequest r, AmazonClientException e, int retriesAttempted
            ) { return retriesAttempted * 1000L; }
          },
          config.maxErrorRetry(),
          true
        )
      );
  }

  public static AmazonAutoScaling newAutoScalingClient() {
    return newAutoScalingClient(DEFAULT_PROVIDER.get(), DEFAULT_VIP.get());
  }

  public static AmazonAutoScaling newAutoScalingClient(AWSCredentialsProvider provider, String vip) {
    AwsConfiguration config = config();
    return newAutoScalingClient(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonAutoScaling newAutoScalingClient(
    AwsConfiguration config,
    AWSCredentialsProvider provider,
    String vip,
    String region
  ) {
    if (config.useMock())
      throw new UnsupportedOperationException("AutoScaling mock not yet supported");

    EddaAutoScalingClient edda = new EddaAutoScalingClient(config, vip, region);

    if (config.useEdda() && !config.wrapAwsClient()) return edda.readOnly();

    AmazonAutoScaling client = AmazonAutoScalingClient.builder()
        .withCredentials(provider)
        .withClientConfiguration(clientConfig(config))
        .withRegion(region)
        .build();
    if (config.useEdda())
      client = edda.wrapAwsClient(client);
    return client;
  }

  public static AmazonCloudWatch newCloudWatchClient() {
    return newCloudWatchClient(DEFAULT_PROVIDER.get(), DEFAULT_VIP.get());
  }

  public static AmazonCloudWatch newCloudWatchClient(AWSCredentialsProvider provider, String vip) {
    AwsConfiguration config = config();
    return newCloudWatchClient(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonCloudWatch newCloudWatchClient(
    AwsConfiguration config,
    AWSCredentialsProvider provider,
    String vip,
    String region
  ) {
    if (config.useMock())
      throw new UnsupportedOperationException("CloudWatch mock not yet supported");

    EddaCloudWatchClient edda = new EddaCloudWatchClient(config, vip, region);

    if (config.useEdda() && !config.wrapAwsClient()) return edda.readOnly();

    AmazonCloudWatch client = AmazonCloudWatchClient.builder()
        .withCredentials(provider)
        .withClientConfiguration(clientConfig(config))
        .withRegion(region)
        .build();
    if (config.useEdda())
      client = edda.wrapAwsClient(client);
    return client;
  }

  public static AmazonEC2 newEc2Client() {
    return newEc2Client(DEFAULT_PROVIDER.get(), DEFAULT_VIP.get());
  }

  public static AmazonEC2 newEc2Client(AWSCredentialsProvider provider, String vip) {
    AwsConfiguration config = config();
    return newEc2Client(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonEC2 newEc2Client(
    AwsConfiguration config,
    AWSCredentialsProvider provider,
    String vip,
    String region
  ) {
    if (config.useMock())
      throw new UnsupportedOperationException("EC2 mock not yet supported");

    EddaEc2Client edda = new EddaEc2Client(config, vip, region);
    if (config.useEdda() && !config.wrapAwsClient()) return edda.readOnly();

    AmazonEC2 client = AmazonEC2Client.builder()
        .withCredentials(provider)
        .withClientConfiguration(clientConfig(config))
        .withRegion(region)
        .build();
    if (config.useEdda())
      client = edda.wrapAwsClient(client);
    return client;
  }

  public static AmazonElasticLoadBalancing newElasticLoadBalancingClient() {
    return newElasticLoadBalancingClient(DEFAULT_PROVIDER.get(), DEFAULT_VIP.get());
  }

  public static AmazonElasticLoadBalancing newElasticLoadBalancingClient(
    AWSCredentialsProvider provider,
    String vip
  ) {
    AwsConfiguration config = config();
    return newElasticLoadBalancingClient(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonElasticLoadBalancing newElasticLoadBalancingClient(
    AwsConfiguration config
  ) {
    AWSCredentialsProvider provider = DEFAULT_PROVIDER.get();
    String vip = DEFAULT_VIP.get();
    return newElasticLoadBalancingClient(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonElasticLoadBalancing newElasticLoadBalancingClient(
    AwsConfiguration config,
    AWSCredentialsProvider provider,
    String vip,
    String region
  ) {
    if (config.useMock())
      throw new UnsupportedOperationException("ElasticLoadBalancing mock not yet supported");

    EddaElasticLoadBalancingClient edda = new EddaElasticLoadBalancingClient(config, vip, region);

    if (config.useEdda() && !config.wrapAwsClient()) return edda.readOnly();

    AmazonElasticLoadBalancing client = AmazonElasticLoadBalancingClient.builder()
        .withCredentials(provider)
        .withClientConfiguration(clientConfig(config))
        .withRegion(region)
        .build();
    if (config.useEdda())
      client = edda.wrapAwsClient(client);
    return client;
  }

  public static AmazonRoute53 newRoute53Client() {
    return newRoute53Client(DEFAULT_PROVIDER.get(), DEFAULT_VIP.get());
  }

  public static AmazonRoute53 newRoute53Client(AWSCredentialsProvider provider, String vip) {
    AwsConfiguration config = config();
    return newRoute53Client(config, provider, vip, NetflixEnvironment.region());
  }

  public static AmazonRoute53 newRoute53Client(
    AwsConfiguration config,
    AWSCredentialsProvider provider,
    String vip,
    String region
  ) {
    if (config.useMock())
      throw new UnsupportedOperationException("Route53 mock not yet supported");

    EddaRoute53Client edda = new EddaRoute53Client(config, vip, region);

    if (config.useEdda() && !config.wrapAwsClient()) return edda.readOnly();

    AmazonRoute53 client = AmazonRoute53Client.builder()
        .withCredentials(provider)
        .withClientConfiguration(clientConfig(config))
        .withRegion(Regions.US_EAST_1) // us-east-1 only and needs to be explicit
        .build();
    if (config.useEdda())
      client = edda.wrapAwsClient(client);
    return client;
  }
}
