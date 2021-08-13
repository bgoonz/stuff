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

public class MuninGraphProviderBuilder {

  private final List<MuninGraphCategoryConfigImpl> categoryConfigs = new ArrayList<MuninGraphCategoryConfigImpl>();

  public MuninGraphProvider build() {
    List<MuninGraph> graphs = new ArrayList<MuninGraph>();
    for (MuninGraphCategoryConfigImpl categoryConfig : this.categoryConfigs) {
      graphs.addAll(categoryConfig.build());
    }
    return new StaticMuninGraphProvider(graphs);
  }

  public MuninGraphCategoryConfig category(final String category) {
    MuninGraphCategoryConfigImpl config = new MuninGraphCategoryConfigImpl(category);
    categoryConfigs.add(config);
    return config;
  }
}
