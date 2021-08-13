require 'spec_helper'

describe 'nagios' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios default params" do
    let(:title) { 'test_nagios' }

    it 'should compile' do
      should contain_class('nagios::packages')
      should contain_class('nagios::cgi_cfg')
      should contain_class('nagios::nagios_cfg')
      should contain_class('nagios::resource_cfg')
    end
  end

end

