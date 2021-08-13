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

import com.yammer.metrics.core.MetricsRegistry;
import com.yammer.metrics.reporting.AbstractReporter;

import java.net.InetAddress;
import java.net.UnknownHostException;

import static java.util.Arrays.asList;

/**
 * Exposes metrics as munin graphs based on graph configurations provided using {@link
 * MuninGraphProvider} and {@link MuninReporterConfig}. Binds to 127.0.0.1:4951 by default.
 */
public class MuninReporter extends AbstractReporter {

  private static final InetAddress DEFAULT_BIND_ADDRESS;

  static {
    try {
      DEFAULT_BIND_ADDRESS = InetAddress.getByAddress(new byte[]{127, 0, 0, 1});
    } catch (UnknownHostException e) {
      throw new RuntimeException(e);
    }
  }

  private static final int DEFAULT_PORT = 4951;

  private final MuninServer server;
  private final MergingMuninGraphProvider mergingGraphProvider;

  /**
   * Create a new reporter with multiple graph providers.
   *
   * @param registry The {@link MetricsRegistry} to get metrics from.
   */
  public MuninReporter(final MetricsRegistry registry, final MuninGraphProvider... providers) {
    this(registry, DEFAULT_PORT, DEFAULT_BIND_ADDRESS, asList(providers));
  }

  /**
   * Create a new reporter with multiple graph providers.
   *
   * @param registry The {@link MetricsRegistry} to get metrics from.
   */
  public MuninReporter(final MetricsRegistry registry,
                       final Iterable<MuninGraphProvider> providers) {
    this(registry, DEFAULT_PORT, DEFAULT_BIND_ADDRESS, providers);
  }

  /**
   * Create a new reporter with a single graph provider.
   *
   * @param registry The {@link MetricsRegistry} to get metrics from.
   * @param provider The {@link MuninGraphProvider} provider to get graph definitions from.
   */
  public MuninReporter(final MetricsRegistry registry, final MuninGraphProvider provider) {
    this(registry, DEFAULT_PORT, DEFAULT_BIND_ADDRESS, provider);
  }

  /**
   * Create a new reporter with a single graph provider.
   *
   * @param registry    The {@link MetricsRegistry} to get metrics from.
   * @param port        The port to bind on.
   * @param bindAddress The address to bind on.
   * @param provider    The {@link MuninGraphProvider} provider to get graph definitions from.
   */
  public MuninReporter(final MetricsRegistry registry, final int port,
                       final InetAddress bindAddress, final MuninGraphProvider provider) {
    this(registry, port, bindAddress, asList(provider));
  }

  /**
   * Create a new reporter with multiple graph providers.
   *
   * @param registry    The {@link MetricsRegistry} to get metrics from.
   * @param port        The port to bind on.
   * @param bindAddress The address to bind on.
   * @param providers   The {@link MuninGraphProvider} providers to get graph definitions from.
   */
  public MuninReporter(final MetricsRegistry registry, final int port,
                       final InetAddress bindAddress,
                       final Iterable<MuninGraphProvider> providers) {
    super(registry);

    this.mergingGraphProvider = new MergingMuninGraphProvider(providers);

    final MetricsCommandProcessor metricsCommandProcessor =
        new MetricsCommandProcessor(registry, mergingGraphProvider, new ReverseLookupHostname());
    this.server = new MuninServer(metricsCommandProcessor,
                                  port, bindAddress);
  }

  /**
   * Create a new reporter with a single graph provider.
   *
   * @param registry The {@link MetricsRegistry} to get metrics from.
   * @param config   The munin reporter configuration to build the graph provider from.
   */
  public MuninReporter(final MetricsRegistry registry, final MuninReporterConfig config) {
    this(registry, config.build());
  }

  /**
   * Start the munin reporter.
   */
  public void start() {
    server.start();
  }

  /**
   * Stop the munin reporter.
   */
  @Override
  public void shutdown() {
    server.shutdown();
  }

  /**
   * Add graphs from a graph provider. Can be called after starting the reporter.
   *
   * @param provider The graph provider to get graphs from.
   */
  public void addGraphs(final MuninGraphProvider provider) {
    mergingGraphProvider.addProvider(provider);
  }

  /**
   * Remove graphs from a graph provider. Can be called after starting the reporter.
   *
   * @param provider The graph provider to remove.
   */
  public void removeGraphs(final MuninGraphProvider provider) {
    mergingGraphProvider.removeProvider(provider);
  }
}
