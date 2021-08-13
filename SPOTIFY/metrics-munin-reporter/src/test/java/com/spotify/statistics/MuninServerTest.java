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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

import org.junit.Test;

import com.google.common.collect.Lists;
import com.yammer.metrics.Metrics;

public class MuninServerTest {

  public static int findFreePort() {
    try {
      ServerSocket tmpSocket = null;
      try {
        tmpSocket = new ServerSocket();
        tmpSocket.setReuseAddress(true);
        tmpSocket.bind(new InetSocketAddress(InetAddress.getByName(null), 0));

        return tmpSocket.getLocalPort();
      } finally {
        if (tmpSocket != null) {
          tmpSocket.close();
        }
      }
    } catch (IOException e) {
      throw new RuntimeException("Failed to find a free port", e);
    }
  }

  @Test
  public void testServer() throws Exception {
    final MetricsCommandProcessor commandProcessor = new MetricsCommandProcessor(
            Metrics.defaultRegistry(),
            new StaticMuninGraphProvider(Lists.<MuninGraph>newArrayList()),
            mock(Hostname.class));

    final int port = findFreePort();
    final InetAddress loopback = InetAddress.getByName(null);

    MuninServer sut = new MuninServer(commandProcessor, port, loopback);
    sut.start();

    Socket client = null;

    for (int i = 0; i < 50; i++) {
      try {
        client = new Socket(loopback, port);
      } catch (IOException e) {
        Thread.sleep(10);
      }
    }

    assertNotNull(client);

    BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
    String greeting = in.readLine();
    assertTrue(greeting.startsWith("# Spotify munin node at"));

    sut.shutdown();
    client.close();
  }
}
