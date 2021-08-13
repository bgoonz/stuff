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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

import java.util.List;
import java.util.Map;

/**
 * Merges graph definitions from multiple graph providers.
 */
class MergingMuninGraphProvider implements MuninGraphProvider {

  private final List<MuninGraphProvider> providers;

  /**
   * Create a new empty provider.
   */
  MergingMuninGraphProvider() {
    this(Lists.<MuninGraphProvider>newArrayList());
  }

  /**
   * Create a new provider using a list of providers.
   *
   * @param providers The providers to merge.
   */
  public MergingMuninGraphProvider(final Iterable<MuninGraphProvider> providers) {
    this.providers = Lists.newCopyOnWriteArrayList(providers);
  }

  @Override
  public Map<String, MuninGraph> getGraphs() {
    final ImmutableMap.Builder<String, MuninGraph> builder = ImmutableMap.builder();
    for (final MuninGraphProvider provider : providers) {
      builder.putAll(provider.getGraphs());
    }
    return builder.build();
  }

  /**
   * Add a graph provider, merging its set of graphs with the graphs of all other added providers.
   *
   * @param provider The provider to add.
   */
  public void addProvider(final MuninGraphProvider provider) {
    providers.add(provider);
  }

  /**
   * Remove a graph provider, removing its set of graphs.
   *
   * @param provider The provider to remove.
   */
  public void removeProvider(final MuninGraphProvider provider) {
    providers.remove(provider);
  }
}
