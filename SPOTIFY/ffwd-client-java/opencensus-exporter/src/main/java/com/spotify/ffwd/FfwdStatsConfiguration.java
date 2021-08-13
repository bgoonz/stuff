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

public class FfwdStatsConfiguration {
  private String ffwdHost;
  private int ffwdPort;
  private long exporterIntervalSeconds;

  public String getFfwdHost() {
    return ffwdHost;
  }

  public int getFfwdPort() {
    return ffwdPort;
  }

  public long getExporterIntervalSeconds() {
    return exporterIntervalSeconds;
  }

  public static FfwdStatsConfigurationBuilder builder() {
    return new FfwdStatsConfigurationBuilder();
  }

  private FfwdStatsConfiguration(FfwdStatsConfigurationBuilder builder) {
    this.ffwdHost = builder.ffwdHost;
    this.ffwdPort = builder.ffwdPort;
    this.exporterIntervalSeconds = builder.exporterIntervalSeconds;
  }

  // Builder Class
  public static class FfwdStatsConfigurationBuilder {
    private String ffwdHost = "localhost";
    private int ffwdPort = 19091;
    private long exporterIntervalSeconds = 60;

    public FfwdStatsConfigurationBuilder() {}

    public FfwdStatsConfigurationBuilder setHost(final String ffwdHost) {
      this.ffwdHost = ffwdHost;
      return this;
    }

    public FfwdStatsConfigurationBuilder setPort(final int ffwdPort) {
      this.ffwdPort = ffwdPort;
      return this;
    }

    public FfwdStatsConfigurationBuilder setExporterIntervalSeconds(
        final long exporterIntervalSeconds) {
      this.exporterIntervalSeconds = exporterIntervalSeconds;
      return this;
    }

    public FfwdStatsConfiguration build() {
      return new FfwdStatsConfiguration(this);
    }
  }
}
