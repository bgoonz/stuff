require 'xmlsec'

describe Xmlsec do

  before(:all) do
    @cert = File.read(File.join(File.dirname(__FILE__), 'fixtures', 'mycert.pem'))
    @signed_xml = File.read(File.join(File.dirname(__FILE__), 'fixtures', 'sign-sha256-rsa-sha256-test.res'))
  end

  describe "#verify_file" do
    it "should verify the signature of a document signed with rsa-sha256" do
      Xmlsec::verify_file(@signed_xml, @cert).should eql 1
    end
  end

end
