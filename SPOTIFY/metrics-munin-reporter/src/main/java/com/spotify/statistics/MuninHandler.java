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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.InetAddress;
import java.net.Socket;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;

public class MuninHandler extends Thread {

  private static final Logger LOG = LoggerFactory.getLogger(MuninHandler.class);

  private static final String LINE_END = "\n";

  private final Socket socket;
  private final MetricsCommandProcessor commandProcessor;

  public MuninHandler(final Socket socket, final MetricsCommandProcessor commandProcessor) {
    this.socket = socket;
    this.commandProcessor = commandProcessor;

    setDaemon(true);
  }

  @Override
  public void run() {
    try {
      final BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      final Writer out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

      InetAddress addr = InetAddress.getLocalHost();
      String hostname = addr.getHostName();

      write(out, "# Spotify munin node at " + hostname);
      out.flush();

      processInput(in, out);
    } catch (QuitException ignore) {
    } catch (SocketException e) {
      LOG.debug("Connection error, closing.", e);
    } catch (Exception e) {
      LOG.error("MuninHandler failed", e);
      throw new RuntimeException(e);
    } finally {
      try {
        socket.close();
      } catch (IOException ignored) {
      }
    }
  }

  private void processInput(final BufferedReader in, final Writer out)
    throws IOException, QuitException {
    String line = in.readLine();
    while (line != null) {
      line = line.trim();
      LOG.debug("> " + line);
      if (line.length() > 0) {
        processLine(out, line);
      }
      line = in.readLine();
    }
  }

  private void processLine(final Writer out, final String line)
    throws IOException, QuitException {
    String[] lineTokens = line.split(" ");
    String command = lineTokens[0];
    List<String> args = new ArrayList<String>();
    if (lineTokens.length > 1) {
      args = asList(lineTokens).subList(1, lineTokens.length);
    }

    try {
      List<String> output = commandProcessor.processCommand(command, args);
      for (String outline : output) {
        write(out, outline);
      }
    } catch (UnknownCommandException e) {
      write(out, "# Unknown command. Try list, config, fetch or quit");
    }
    out.flush();
  }

  private void write(final Writer out, final String str) throws IOException {
    out.write(str + LINE_END);
    LOG.debug("< " + str);
  }
}
