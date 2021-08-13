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

import static io.opencensus.internal.Utils.checkState;

import io.opencensus.common.Duration;
import io.opencensus.exporter.metrics.util.IntervalMetricReader;
import io.opencensus.exporter.metrics.util.MetricReader;
import io.opencensus.metrics.Metrics;
import javax.annotation.Nullable;
import javax.annotation.concurrent.GuardedBy;
import javax.annotation.concurrent.ThreadSafe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Exporter to ffwd protobuf API v0.
 *
 * <p>Example of usage on Google Cloud VMs:
 *
 * <pre><code>
 *   public static void main(String[] args) {
 *     com.spotify.ffwd.FfwdStatsExporter.createAndRegister(
 *         com.spotify.ffwd.FfwdStatsConfiguration
 *             .builder()
 *             .setExporterIntervalSeconds(60)
 *             .build());
 *     ... // Do work.
 *   }
 * </code></pre>
 */
@ThreadSafe
public class FfwdStatsExporter {
  private static final Logger LOG = LoggerFactory.getLogger(FfwdMetricsConverter.class);

  private static final Object monitor = new Object();

  @GuardedBy("monitor")
  @Nullable
  private static FfwdStatsExporter instance = null;

  private static final String EXPORTER_SPAN_NAME = "ExportMetricsToFfwd";

  private final IntervalMetricReader intervalMetricReader;

  private FfwdStatsExporter(
      final String ffwdHost, final int ffwdPort, final long exporterIntervalSeconds) {

    this.intervalMetricReader =
        IntervalMetricReader.create(
            new FfwdMetricsConverter(ffwdHost, ffwdPort),
            MetricReader.create(
                MetricReader.Options.builder()
                    .setMetricProducerManager(
                        Metrics.getExportComponent().getMetricProducerManager())
                    .setSpanName(EXPORTER_SPAN_NAME)
                    .build()),
            IntervalMetricReader.Options.builder()
                .setExportInterval(Duration.create(exporterIntervalSeconds, 0))
                .build());
  }

  /**
   * Creates a ffwd stats exporter with a {@link FfwdStatsConfiguration}.
   *
   * @param configuration the {@code com.spotify.ffwd.FfwdStatsConfiguration}.
   * @throws IllegalStateException if a ffwd exporter is already created.
   */
  public static void createAndRegister(final FfwdStatsConfiguration configuration) {
    createInternal(
        configuration.getFfwdHost(),
        configuration.getFfwdPort(),
        configuration.getExporterIntervalSeconds());
  }

  /**
   * Creates a ffwd ffwd exporter with the default settings.
   *
   * @throws IllegalStateException if a ffwd exporter is already created.
   */
  public static void createAndRegister() {
    createAndRegister(FfwdStatsConfiguration.builder().build());
  }

  // Enforce singleton.
  private static void createInternal(
      final String ffwdHost, final int ffwdPort, final long exporterIntervalSeconds) {

    synchronized (monitor) {
      checkState(instance == null, "Ffwd stats exporter is already created.");

      LOG.info("Registering ffwd opencensus stats exporter");

      instance =
          new FfwdStatsExporter(
              ffwdHost,
              ffwdPort,
              exporterIntervalSeconds);
    }
  }

  /**
   * Unregisters the {@link FfwdStatsExporter} and stops metrics exporting.
   *
   * <p>Unexported data will be flushed before the exporter is stopped.
   *
   */
  public static void unregister() {
    synchronized (monitor) {
      if (instance != null) {
        instance.intervalMetricReader.stop();
      }
      instance = null;
    }
  }
}
