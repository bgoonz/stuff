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

import java.util.ArrayList;
import java.util.List;

import static com.spotify.statistics.MuninUtil.escapeMuninName;

class MuninGraphCategoryConfigImpl implements MuninGraphCategoryConfig {

  private final List<MuninGraph.Builder> graphBuilders = new ArrayList<MuninGraph.Builder>();

  private final String category;

  public MuninGraphCategoryConfigImpl(final String category) {
    this.category = category;
  }

  public MuninGraph.Builder graph(final String title) {
    MuninGraph.Builder graphConfigurator =
        new MuninGraph.Builder(escapeMuninName(category + "_" + title), category, title);
    graphBuilders.add(graphConfigurator);
    return graphConfigurator;
  }

  public List<MuninGraph> build() {
    List<MuninGraph> graphs = new ArrayList<MuninGraph>();
    for (MuninGraph.Builder builder : this.graphBuilders) {
      graphs.add(builder.build());
    }
    return graphs;
  }
}
