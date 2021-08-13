package com.newrelic.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;

import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.google.common.io.PatternFilenameFilter;

public class Main {

	private File archiveDir;
	private File logDir;
	private KissMetricsService km;

	/**
	 * @param args
	 * @throws IOException
	 */
	public static void main(String[] args) {
		if (args.length == 0) {
			usage();
			System.exit(1);
		}
			
		try {
			new Main(args).run();
			System.exit(0);
		} catch (IOException e) {
			usage();
			System.err.println("Error executing job: "+e);
			e.printStackTrace(System.err);
			System.exit(1);
		}
	}

	Main(String args[]) throws IOException {
		ArrayList<String> argList = Lists.newArrayList(args);
		logDir = new File("./tmp/kissmetrics");
		archiveDir = null;

		while (!argList.isEmpty()) {
			String arg = argList.remove(0);
			if (arg.equals("-i")) {
				logDir = new File(argList.remove(0));
			}
			else if (arg.equals("-o")) {
				archiveDir = new File(argList.remove(0));
			}
			else if (arg.equals("-h")) {
				usage();
				System.exit(0);
			} else {
				System.err.println("Invalid argument: '"+arg+"'");
				usage();
				System.exit(1);
			}
		}
		km = new KissMetricsService();
		if (archiveDir != null) {
			archiveDir.mkdirs();
		}
		if (!logDir.isDirectory()) {
			throw new IOException("Log directory " + logDir + " does not exist");
		}
	}
	public static void usage() {
		System.out.println("This utility was written by Bill Kayser to push data to our kissmetrics account.");
		System.out.println("usage: \n  java -jar app.jar -i km_log_dir [-o archive_dir ] [-h]");
		System.out.println("\nIt will process all *.log files in the km_log_dir and send the events to the server");
		System.out.println("one by one with HTTP HEAD requests on a keep-alive socket.  If specified, it");
		System.out.println("archives each one to a processed.log file in archive_dir.");
	}

	void run() throws IOException {
		File[] logfiles = logDir
				.listFiles(new PatternFilenameFilter(".*\\.log"));
		for (File logFile : logfiles) {
			process(logFile);
		}
	}

	private void process(File logFile) throws IOException {
		Files.move(logFile, new File(archiveDir, logFile.getName()));
		File newFile = new File(archiveDir, logFile.getName());
		File archiveFile = new File(archiveDir, "processed.log");
		FileWriter archiveFileWriter = new FileWriter(archiveFile, true);
		FileReader logFileReader = new FileReader(newFile);
		BufferedReader input = new BufferedReader(logFileReader);
		try {
			for (String line = input.readLine(); line != null; line = input
					.readLine()) {
				if (!line.matches("^/e.*"))
					continue;
				try {
					km.consumeOneEvent(line);
					archiveFileWriter.write(line);
					archiveFileWriter.write(System
							.getProperty("line.separator"));
				} catch (URISyntaxException e) {
					System.err.println("Invalid URI, skipped: " + line);
				}
			}
		} finally {
			archiveFileWriter.close();
			logFileReader.close();
			newFile.delete();
		}

	}
}
