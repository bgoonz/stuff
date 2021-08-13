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

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Java has no proper way to get the hostname (e.g. calling hostname(1) or Unix gethostname(2)).
 * This implementation instead gets the hostname by doing a reverse lookup on the local IP.
 * This is not a good idea in general, but works on Spotify hosts as we ensure to write the
 * hostname to /etc/hosts.
 */
public class ReverseLookupHostname implements Hostname {

  @Override
  public String getHostname() {
    try {
      return InetAddress.getLocalHost().getHostName();
    } catch (UnknownHostException e) {
      throw new RuntimeException("Failed to get hostname", e);
    }
  }
}
