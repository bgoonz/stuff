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

import com.spotify.statistics.Property.PropertyFactory;
import com.yammer.metrics.core.Metric;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;
import com.yammer.metrics.core.Sampling;
import com.yammer.metrics.stats.Snapshot;

import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.String.format;
import static java.util.Arrays.asList;

public class MetricsCommandProcessor {

  private final MetricsRegistry registry;
  private final MuninGraphProvider muninGraphProvider;
  private final Hostname hostname;

  public MetricsCommandProcessor(final MetricsRegistry registry,
                                 final MuninGraphProvider muninGraphProvider,
                                 final Hostname hostname) {
    this.registry = registry;
    this.muninGraphProvider = muninGraphProvider;
    this.hostname = hostname;
  }

  public List<String> processCommand(final String command, final List<String> args)
    throws QuitException, UnknownCommandException {

    if (command.equals("list")) {
      return processListCommand();
    } else if (command.equals("fetch")) {
      return processFetchCommand(args);
    } else if (command.equals("config")) {
      return processConfigCommand(args);
    } else if (command.equals("nodes")) {
      return processNodesCommand();
    } else if (command.equals("version")) {
      return processVersionCommand();
    } else if (command.equals("quit")) {
      throw new QuitException();
    } else {
      throw new UnknownCommandException();
    }
  }

  private List<String> processConfigCommand(final List<String> args) {
    if (args.size() < 1) {
      return unknownService();
    }

    String service = args.get(0);
    MuninGraph graph = muninGraphProvider.getGraphs().get(service);
    if (graph == null) {
      return unknownService();
    }

    List<String> output = new ArrayList<String>();

    output.add(format("graph_title %s", graph.getTitle()));
    output.add(format("graph_category %s", graph.getCategory()));

    if (graph.getArgs() != null && graph.getArgs().length() > 0) {
      output.add(format("graph_args %s", graph.getArgs()));
    }
    output.add(format("graph_vlabel %s", graph.getVlabel()));

    for (MuninDataSource dataSource : graph.getDataSources()) {
      List<MetricName> names = dataSource.getMetricNames(registry);

      for (MetricName name : names) {
        Metric metric = registry.allMetrics().get(name);
        if (metric != null) {
          Property property = PropertyFactory.getProperty(dataSource.getPropertyOrNull(), metric);

          String muninName = dataSource.getName(name);

          output.add(format("%s.label %s", escapeName(muninName, property), dataSource.getLabel(name)));
          output.add(format("%s.type %s", escapeName(muninName, property), property.getType()));
          output.add(format("%s.min %d", escapeName(muninName, property), dataSource.getMin()));

          if (dataSource.getCdef() != null) {
            output.add(format("%s.cdef %s", escapeName(muninName, property), dataSource.getCdef()));
          }

          if (dataSource.getColor() != null) {
            output.add(format("%s.color %s", escapeName(muninName, property), dataSource.getCdef()));
          }

          if (dataSource.getDraw() != null) {
            output.add(format("%s.draw %s", escapeName(muninName, property), dataSource.getDraw()));
          }

          if (dataSource.getLine() != null) {
            output.add(format("%s.line %s", escapeName(muninName, property), dataSource.getLine()));
          }

          if (dataSource.getStack() != null) {
            output.add(format("%s.stack %s", escapeName(muninName, property), dataSource.getStack()));
          }
        }
      }
    }

    output.add(".");
    return output;
  }

  private List<String> processFetchCommand(final List<String> args) {
    if (args.size() < 1) {
      return unknownService();
    }

    String service = args.get(0);
    MuninGraph graph = muninGraphProvider.getGraphs().get(service);
    if (graph == null) {
      return unknownService();
    }

    // collect all snapshots so that data sources that work against the same snapshot,
    // will sample from the exact same snapshot.
    Map<MetricName, Snapshot> snapshots = new HashMap<MetricName, Snapshot>();
    for (MuninDataSource dataSource : graph.getDataSources()) {
      List<MetricName> names = dataSource.getMetricNames(registry);

      for (MetricName name : names) {
        Metric metric = registry.allMetrics().get(name);

        if (metric instanceof Sampling) {
          snapshots.put(name, ((Sampling) metric).getSnapshot());
        }
      }
    }

    List<String> output = new ArrayList<String>();
    for (MuninDataSource dataSource : graph.getDataSources()) {
      List<MetricName> names = dataSource.getMetricNames(registry);

      for (MetricName name : names) {
        Metric metric = registry.allMetrics().get(name);

        if (metric != null) {
          Property property = PropertyFactory.getProperty(dataSource.getPropertyOrNull(), metric);

          String muninName = dataSource.getName(name);

          output.add(format("%s.value %s", escapeName(muninName, property),
            NumberUtil.toString(property.getNumber(metric, snapshots.get(name)))));
        }
      }
    }

    // mark end of output
    output.add(".");

    return output;
  }

  private List<String> processListCommand() {
    List<String> sortedMuninNames = new ArrayList<String>(muninGraphProvider.getGraphs().keySet());
    Collections.sort(sortedMuninNames);

    return Collections.singletonList(StringUtils.join(sortedMuninNames, ' '));
  }

  private List<String> processNodesCommand() {
    return asList(hostname.getHostname(), ".");
  }

  private List<String> processVersionCommand() {
    return asList("metrics-munin-reporter munin node on " + hostname.getHostname());
  }

  private List<String> unknownService() {
    return Arrays.asList("# unknown service", ".");
  }

  private String escapeName(final String name, final Property property) {
    return MuninUtil.escapeMuninName(name + "__" + property.name());
  }
}
