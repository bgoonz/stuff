/*-
 * -\-\-
 * FastForward Perf
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

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.Data;
import org.kohsuke.args4j.CmdLineParser;
import org.kohsuke.args4j.Option;

public class FastForwardPerf {

  @Option(name = "-h", aliases = {"--help"}, help = true, usage = "Display help")
  private boolean help;

  @Option(
      name = "--attribute-count", usage = "Control the number of attributes to use (default: 8)")
  private int attributeCount = 8;

  @Option(name = "--threads", usage = "Control number of threads to use (default: 2)")
  private int threads = 2;

  @Option(name = "--count", usage = "Control number of metrics to send per patch (default: 100000)")
  private int count = 10000;

  @Option(name = "--batches", usage = "Control how many batches of metrics to send (default: 1000)")
  private int batches = 1000;

  @Option(
      name = "--even",
      usage = "Attempt to send metrics evenly over the given time period in ms (default: disabled)")
  private long even = 200;

  public static void main(String... argv) throws Exception {
    new FastForwardPerf().run(argv);
  }

  public void run(String... argv) throws Exception {
    final CmdLineParser parser = new CmdLineParser(this);

    parser.parseArgument(argv);

    if (help) {
      parser.printUsage(System.out);
      return;
    }

    final Map<String, String> attributes = buildBaseAttributes();

    final ExecutorService executor = Executors.newFixedThreadPool(threads);

    final Metric m = FastForward.metric("test").attributes(attributes);

    System.out.println("Sending:");

    for (int id = 0; id < batches; id++) {
      System.out.print(".");
      System.out.flush();

      if ((id + 1) % 100 == 0) {
        System.out.println();
      }

      final CountDownLatch latch = new CountDownLatch(threads);
      final Batch batch = new Batch(m, latch, System.nanoTime());

      for (int i = 0; i < threads; i++) {
        executor.submit(new BatchRunnable(batch));
      }

      latch.await();

      for (final Throwable error : batch.errors) {
        System.out.println("Error in batch #" + id);
        error.printStackTrace(System.out);
      }
    }

    System.out.println();
    System.out.println("Shutting down threads");

    executor.shutdown();
    System.exit(0);
  }

  private Map<String, String> buildBaseAttributes() {
    final Map<String, String> attributes = new HashMap<>();

    for (int i = 0; i < attributeCount; i++) {
      attributes.put("attribute" + i, "attribute-value-" + i);
    }

    return attributes;
  }

  private final class BatchRunnable implements Runnable {

    private final Batch batch;

    public BatchRunnable(Batch batch) {
      this.batch = batch;
    }

    @Override
    public void run() {
      try {
        once();
      } catch (Exception e) {
        batch.errors.add(e);
      }

      batch.latch.countDown();
    }

    private void once() throws Exception {
      final FastForward client = FastForward.setup();

      final long period = (even * 1000000) / count;

      while (true) {
        int i = batch.position.getAndIncrement();

        if (i >= count) {
          break;
        }

        final Metric m = batch.metric.value(i * 1.0);

        if (even == 0) {
          client.send(m);
          continue;
        }

        final long now = System.nanoTime();

        // what is the expected time that we should run?
        final long expected = batch.started + (i * period) / threads;

        final long diff = (expected - now) / 1000000;

        if (diff > 0) {
          Thread.sleep(diff);
        }

        client.send(m);
      }
    }
  }

  ;

  @Data
  private static class Batch {

    final AtomicInteger position = new AtomicInteger();
    final ConcurrentLinkedQueue<Throwable> errors = new ConcurrentLinkedQueue<>();

    final Metric metric;
    final CountDownLatch latch;
    final long started;
  }
}
