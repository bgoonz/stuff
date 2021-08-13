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

import com.spotify.statistics.Property.GaugeProperty;
import com.yammer.metrics.core.Gauge;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;
import com.yammer.metrics.core.VirtualMachineMetrics;
import com.yammer.metrics.core.VirtualMachineMetrics.GarbageCollectorStats;

import java.lang.Thread.State;
import java.util.concurrent.TimeUnit;

import static com.spotify.statistics.MuninUtil.escapeMuninName;


/**
 * A set of basic JVM statistics. Includes:
 * <ul>
 *  <li>Thread/daemon thread counts</li>
 *  <li>Thread state</li>
 *  <li>Memory usage</li>
 *  <li>Garbage collection runs and times</li>
 *  <li>File descriptor usage</li>
 *  <li>Uptime</li>
 * </ul>
 */
public final class JvmMetrics {

  /**
   * Register the JVM metrics
   * @param registry The {@link MetricsRegistry} on which to register
   * @param graphs The {@link MuninReporterConfig} on which to define graphs/sources
   */
  public static void register(final MetricsRegistry registry,
                              final MuninGraphCategoryConfig graphs) {
    register(null, registry, graphs);
  }

  /**
   * Register the JVM metrics
   * @param name A name for the service/component running in the JVM, used as a server global
   *             identifier to keep JVMs unique in Munin
   * @param registry The {@link MetricsRegistry} on which to register
   * @param graphs The {@link MuninReporterConfig} on which to define graphs/sources
   */
  public static void register(final String name,
                              final MetricsRegistry registry,
                              final MuninGraphCategoryConfig graphs) {
    final VirtualMachineMetrics vmMetrics = VirtualMachineMetrics.getInstance();

    // file descriptors
    MetricName fdName = new MetricName(JvmMetrics.class, "filedescriptors");
    registry.newGauge(fdName, new Gauge<Double>() {
      @Override
      public Double value() {
        return vmMetrics.fileDescriptorUsage();
      }
    });
    graphs.graph("File descriptors")
            .vlabel("%")
            .muninName(buildName(name, "_jvm_filedescriptors"))
            .dataSource(fdName, "Used file descriptors");

    // thread counts
    MetricName threadsName = new MetricName(JvmMetrics.class, "threads");
    MetricName daemonThreadsName = new MetricName(JvmMetrics.class, "daemonthreads");
    registry.newGauge(threadsName, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return vmMetrics.threadCount();
      }
    });
    registry.newGauge(daemonThreadsName, new Gauge<Integer>() {
      @Override
      public Integer value() {
        return vmMetrics.daemonThreadCount();
      }
    });
    graphs.graph("Threads")
            .muninName(buildName(name, "_jvm_threads"))
            .dataSource(threadsName, "Number of live threads including daemon threads")
            .dataSource(daemonThreadsName, "Number of live daemon threads");

    // uptime
    MetricName uptimeName = new MetricName(JvmMetrics.class, "uptime");
    registry.newGauge(uptimeName, new Gauge<Long>() {
      @Override
      public Long value() {
        return vmMetrics.uptime();
      }
    });
    graphs.graph("Uptime")
            .muninName(buildName(name, "_jvm_uptime"))
            .vlabel("seconds")
            .dataSource(uptimeName, "Time the JVM process has been running");

    // garbage collection
    MetricName gcRunsName = new MetricName(JvmMetrics.class, "gcruns");
    registry.newGauge(gcRunsName, new Gauge<Long>() {
      @Override
      public Long value() {
        long sum = 0;
        for (GarbageCollectorStats gc : vmMetrics.garbageCollectors().values()) {
          sum += gc.getRuns();
        }
        return sum;
      }
    });
    graphs.graph("Garbage collection runs")
            .muninName(buildName(name, "_jvm_gcruns"))
            .dataSource(gcRunsName, "Number of garbage collection runs",
              GaugeProperty.VALUE_DERIVE);

    MetricName gcTimeName = new MetricName(JvmMetrics.class, "gctime");
    registry.newGauge(gcTimeName, new Gauge<Long>() {
      @Override
      public Long value() {
        long sum = 0;
        for (GarbageCollectorStats gc : vmMetrics.garbageCollectors().values()) {
          sum += gc.getTime(TimeUnit.MILLISECONDS);
        }
        return sum;
      }
    });
    graphs.graph("Garbage collection time")
            .vlabel("ms")
            .muninName(buildName(name, "_jvm_gctime"))
            .dataSource(gcTimeName, "Garbage collection time", GaugeProperty.VALUE_DERIVE);

    // memory usage
    MetricName heapUsedName = new MetricName(JvmMetrics.class, "heap used");
    MetricName heapMaxName = new MetricName(JvmMetrics.class, "heap max");
    registry.newGauge(heapUsedName, new Gauge<Double>() {
      @Override
      public Double value() {
        return vmMetrics.heapUsed();
      }
    });
    registry.newGauge(heapMaxName, new Gauge<Double>() {
      @Override
      public Double value() {
        return vmMetrics.heapMax();
      }
    });
    graphs.graph("Heap memory usage")
            .vlabel("bytes")
            .muninName(buildName(name, "_jvm_heap"))
            .dataSource(heapUsedName, "Heap memory currently used by the JVM")
            .dataSource(heapMaxName, "Max memory that can be used by the JVM");

    // Thread state
    MuninGraph.Builder graph = graphs.graph("Thread states")
            .vlabel("%")
            .muninName(buildName(name, "_jvm_threadstate"));
    for (final State state : State.values()) {
      MetricName stateName = new MetricName(JvmMetrics.class, "threadstate " + state.name());
      registry.newGauge(stateName, new Gauge<Double>() {
        @Override
        public Double value() {
          Double percentage = vmMetrics.threadStatePercentages().get(state);
          if (percentage != null) {
            return percentage * 100;
          } else {
            // no thread is in this state, thus the percentage is 0
            return 0.0;
          }
        }
      });
      graph.dataSource(stateName, state.toString());
    }
  }

  private static String buildName(final String prefix, final String suffix) {
    if (prefix != null) {
      return escapeMuninName(prefix + "_" + JvmMetrics.class.getName() + suffix);
    } else {
      return escapeMuninName(JvmMetrics.class.getName() + suffix);
    }
  }

  private JvmMetrics() {
    // don't allow construction
  }
}
