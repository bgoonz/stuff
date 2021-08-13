package com.newrelic.util;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.google.common.io.Files;

public class MainTest {

	@Before
	public void setUp() throws Exception {
	}
	
	@After
	public void tearDown() throws IOException {
		File logfile = new File("testdata/output/processed.log");
		Files.copy(logfile, new File("testdata/fixtures/km.log"));
		logfile.getParentFile().delete();
	}

	@Test
	public void test() throws IOException {
		String args[] = new String[] {
				"-i",
				"./testdata/fixtures",
				"-o",
				"./testdata/output"
		};
		Main m = new Main(args);
		m.run();
		
	}

}
