package com.base2services.jenkins;

import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import hudson.util.Secret;
import org.jvnet.hudson.test.HudsonTestCase;
import org.kohsuke.stapler.Stapler;

import java.util.List;

/**
 * Test Class for {@link SqsBuildTrigger}
 *
 * @author aaronwalker
 */
public class SQSBuildTriggerConfigSubmitTest extends HudsonTestCase {

    public void testConfigSubmit_SingleProfile() throws Exception {
        //Given
        WebClient client = configureWebClient();
        HtmlPage p = client.goTo("configure");
        HtmlForm f = p.getFormByName("config");
        f.getInputByName("_.sqsQueue").setValueAttribute("testQueue");
        f.getInputByName("_.awsAccessKeyId").setValueAttribute("myaccesskey");
        f.getInputByName("_.awsSecretAccessKey").setValueAttribute("myverysecretkey");
        f.getInputsByValue("auto").get(0).setChecked(true);
        f.getInputByName("_.username").setValueAttribute("jenkins");
        f.getInputByName("_.password").setValueAttribute("password");

        //When
        submit(f);

        //Then
        SqsBuildTrigger.DescriptorImpl d = getDescriptor();
        List<SqsProfile> profileList = d.getSqsProfiles();
        assertNotNull(profileList);
        assertEquals(profileList.size(),1);
        SqsProfile profile = profileList.get(0);
        assertEquals("testQueue",profile.sqsQueue);
        assertEquals("myaccesskey",profile.awsAccessKeyId);
        assertEquals("myverysecretkey", Secret.toString(profile.awsSecretAccessKey));

        List<Credential> credentials = d.getCredentials();
        assertNotNull(credentials);
        assertEquals(1, credentials.size());
        Credential credential = credentials.get(0);
        assertEquals("jenkins", credential.username);
        assertEquals("password", Secret.toString(credential.password));
    }

    private SqsBuildTrigger.DescriptorImpl getDescriptor() {
        return (SqsBuildTrigger.DescriptorImpl) SqsBuildTrigger.DescriptorImpl.get();
    }

    private WebClient configureWebClient() {
        WebClient client = new WebClient();
        client.setThrowExceptionOnFailingStatusCode(false);
        client.setCssEnabled(false);
        client.setJavaScriptEnabled(true);
        return client;
    }

    // workaround
    static {
        Stapler.CONVERT_UTILS.register(new org.apache.commons.beanutils.Converter() {

            public Secret convert(Class type, Object value) {
                return Secret.fromString(value.toString());
            }
        }, Secret.class);
    }
}
