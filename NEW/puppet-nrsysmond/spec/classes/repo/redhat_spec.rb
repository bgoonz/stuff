require 'spec_helper'

describe 'nrsysmond::repo::redhat' do
  context "x86_64 hardwaremodel" do
    let(:facts) { {:osfamily => 'RedHat', :hardwaremodel => 'x86_64'} }
    it { should contain_exec('install repo').with_command('/bin/rpm -Uvh https://yum.newrelic.com/pub/newrelic/el5/x86_64/newrelic-repo-5-3.noarch.rpm')}
  end
end
