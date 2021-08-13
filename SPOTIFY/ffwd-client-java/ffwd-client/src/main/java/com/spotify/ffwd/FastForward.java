/*-
 * -\-\-
 * FastForward Java Client
 * --
 * Copyright (C) 2016 - 2020 Spotify AB
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

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class FastForward {

  /**
   * If you are using an older version, please use Version.V0.
   * This variable will eventually be removed.
   */
  @Deprecated()
  public static final int LATEST_VERSION = 0;

  public static final String DEFAULT_HOST = "localhost";
  public static final int DEFAULT_PORT = 19091;

  public enum Version {
    V0(0),
    V1(1);
    private final int version;

    Version(final int version) {
      this.version = version;
    }

    public int getVersion() {
      return version;
    }

  }


  public static FastForward setup() throws UnknownHostException, SocketException {
    return setup(InetAddress.getByName(DEFAULT_HOST), DEFAULT_PORT);
  }

  public static FastForward setup(String host) throws UnknownHostException, SocketException {
    return setup(InetAddress.getByName(host));
  }

  public static FastForward setup(String host, int port)
      throws UnknownHostException, SocketException {
    return setup(InetAddress.getByName(host), port);
  }

  public static FastForward setup(InetAddress addr) throws SocketException {
    return setup(addr, DEFAULT_PORT);
  }

  /**
   * Initialization method for a FastForward client.
   *
   * @return A new instance of a FastForward client.
   *
   * @throws SocketException If a datagram socket cannot be created.
   */
  public static FastForward setup(InetAddress addr, int port) throws SocketException {
    final DatagramSocket socket = new DatagramSocket();
    return new FastForward(addr, port, socket);
  }

  private final InetAddress addr;
  private final int port;
  private final DatagramSocket socket;

  private FastForward(InetAddress addr, int port, DatagramSocket socket) {
    this.addr = addr;
    this.port = port;
    this.socket = socket;
  }

  protected FastForward() throws UnknownHostException, SocketException {
    this.addr = InetAddress.getByName(DEFAULT_HOST);
    this.port = DEFAULT_PORT;
    this.socket = new DatagramSocket();
  }


  public void send(Metric metric) throws IOException {
    sendFrame(metric.serialize(), Version.V0);
  }

  public void send(com.spotify.ffwd.v1.Metric metric) throws IOException {
    sendFrame(metric.serialize(), Version.V1);
  }

  void sendFrame(byte[] bytes, Version v) throws IOException {
    final ByteBuffer buffer = ByteBuffer.allocate(bytes.length + 8);
    buffer.order(ByteOrder.BIG_ENDIAN);

    buffer.putInt(v.getVersion());
    buffer.putInt(buffer.capacity());
    buffer.put(bytes);
    buffer.rewind();

    final byte[] send = new byte[buffer.capacity()];
    buffer.get(send);

    final DatagramPacket packet = new DatagramPacket(send, send.length,
        addr, port);

    socket.send(packet);
  }

  public static Metric metric(String key) {
    return new Metric().key(key);
  }

  public static com.spotify.ffwd.v1.Metric metricV1(String key) {
    return new com.spotify.ffwd.v1.Metric().key(key);
  }

}
