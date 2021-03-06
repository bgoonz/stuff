package com.netflix.imflibrary.st2067_201;

import com.netflix.imflibrary.utils.ErrorLogger;
import org.testng.Assert;
import org.testng.annotations.Test;
import testUtils.TestHelper;

import java.io.File;
import java.io.IOException;
import java.util.List;

import com.netflix.imflibrary.app.IMPAnalyzer;

public class IABMXFValidationTest {

    @Test
    public void testValid() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 6);
    }

    @Test
    public void testValidNonZeroChannelCount() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_non_zero_channelcount.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 6);
    }

    @Test
    public void testInvalidEditRateMismatch() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_editrate_mismatch.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 8);
    }

    @Test
    public void testInvalidNoConformsToSpecifications() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_no_conformstospecifications.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }

    @Test
    public void testInvalidNoSubDescriptor() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_no_subdesc.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 3);
    }

    @Test
    public void testInvalidWrongCoding() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_coding.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }

    @Test
    public void testInvalidWrongConformsToSpecifications() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_conformstospecifications_value.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }

    @Test
    public void testInvalidWrongEssence() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_essence_ul.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }

    @Test
    public void testInvalidWrongMCAValues() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_mca_values.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 9);
    }

    @Test
    public void testInvalidWrongQuantizationBits() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_qb.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }

    @Test
    public void testInvalidWrongSubDescriptorAudioChannel() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_subdesc_ac.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 4);
    }

    @Test
    public void testInvalidWrongSubDescriptorSoundFieldGroup() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_subdesc_sg.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 4);
    }

    @Test
    public void testInvalidWrongSubDescriptorGroupOfSoundfieldGroup() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_subdesc_gosg.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 4);
    }

    @Test
    public void testInvalidWrongIndexEditRate() throws IOException
    {
        File inputFile = TestHelper.findResourceByPath("TestIMP/IAB/MXF/meridian_2398_IAB_5f_wrong_index_edit_rate.mxf");
        List<ErrorLogger.ErrorObject> errors = IMPAnalyzer.analyzeFile(inputFile);
        Assert.assertEquals(errors.size(), 7);
    }
}
