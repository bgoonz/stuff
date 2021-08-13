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

import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MuninServer extends Thread {
  private static final Logger LOG = LoggerFactory.getLogger(MuninServer.class);
  private static final int DEFAULT_BACKLOG = 0;

  private final MetricsCommandProcessor commandProcessor;
  private final InetAddress bindAddress;
  private final int port;

  private boolean stopped = false;

  public MuninServer(final MetricsCommandProcessor commandProcessor, final int port,
                     final InetAddress bindAddress) {
    super("munin-node");

    this.commandProcessor = commandProcessor;
    this.bindAddress = bindAddress;
    this.port = port;

    this.setDaemon(true);
  }


  @Override
  public void run() {
      try {
        ServerSocket ss = new ServerSocket(port, DEFAULT_BACKLOG, bindAddress);

        try {
          while (!stopped) {
            new MuninHandler(ss.accept(), commandProcessor).start();
          }

          ss.close();
        } catch (IOException e) {
          LOG.error("Failed to accept on munin socket", e);
          throw new RuntimeException(e);
        }
      } catch (IOException e1) {
        throw new RuntimeException("Failed to bind Munin server socket on address " + bindAddress + ":" + port, e1);
      }
  }

  public void shutdown() {
    this.stopped = true;
  }
}
