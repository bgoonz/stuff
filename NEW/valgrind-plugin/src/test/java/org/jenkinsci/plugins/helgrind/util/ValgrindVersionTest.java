package org.jenkinsci.plugins.helgrind.util;

import static org.junit.Assert.*;

import org.jenkinsci.plugins.helgrind.call.ValgrindVersion;
import org.junit.Test;

public class ValgrindVersionTest
{

    @Test
    public void version_only()
    {
	String s = "1.2.3";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);

	assertNotNull(version);	
	assertEquals( 1, version.major );
	assertEquals( 2, version.minor );
	assertEquals( 3, version.patch );
    }
    
    @Test
    public void name_and_version()
    {
	String s = "valgrind-1.2.3";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);

	assertNotNull(version);	
	assertEquals( 1, version.major );
	assertEquals( 2, version.minor );
	assertEquals( 3, version.patch );
    }
    
    @Test
    public void name_and_version2()
    {
	String s = "456-valgrind-1.2.3";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);

	assertNotNull(version);	
	assertEquals( 1, version.major );
	assertEquals( 2, version.minor );
	assertEquals( 3, version.patch );
    }
    
    @Test
    public void name_and_version3()
    {
	String s = "456-valgrind-1.2.3-postfix-789";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);

	assertNotNull(version);	
	assertEquals( 1, version.major );
	assertEquals( 2, version.minor );
	assertEquals( 3, version.patch );
    }
    
    @Test
    public void name_and_version4()
    {
	String s = "456-valgrind-111.02.345-postfix-789";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);

	assertNotNull(version);	
	assertEquals( 111, version.major );
	assertEquals( 2, version.minor );
	assertEquals( 345, version.patch );
    }
    
    @Test
    public void name_and_incomplete()
    {
	String s = "valgrind-1.2";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);
	assertNull(version);
    }
    
    @Test
    public void incomplete_only()
    {
	String s = "1.2";

	ValgrindVersion version = ValgrindVersion.createInstanceFromString(s);
	assertNull(version);
    }
    
    @Test
    public void empty()
    {
	ValgrindVersion version = ValgrindVersion.createInstanceFromString("");
	assertNull(version);
    }
    
    @Test
    public void nullString()
    {
	ValgrindVersion version = ValgrindVersion.createInstanceFromString(null);
	assertNull(version);
    }
    
    @Test
    public void isGreaterOrEqual()
    {
	ValgrindVersion version = ValgrindVersion.createInstance(1, 2, 3);
	
	assertTrue( version.isGreaterOrEqual(ValgrindVersion.createInstance(1, 2, 3) ) );
	assertTrue( version.isGreaterOrEqual(ValgrindVersion.createInstance(1, 2, 2) ) );
	assertTrue( version.isGreaterOrEqual(ValgrindVersion.createInstance(0, 3, 4) ) );
	
	assertFalse( version.isGreaterOrEqual(ValgrindVersion.createInstance(2, 2, 3) ) );
	assertFalse( version.isGreaterOrEqual(ValgrindVersion.createInstance(1, 3, 2) ) );
	assertFalse( version.isGreaterOrEqual(ValgrindVersion.createInstance(1, 2, 4) ) );

    }
}
