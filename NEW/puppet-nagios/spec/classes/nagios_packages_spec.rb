require 'spec_helper'

describe 'nagios::packages' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios::packages no params" do
    let(:title) { 'test_nagios_packages' }

    it 'should compile' do
      should contain_package('nagios')
      should contain_package('nagios-common')
      should contain_package('nagios-plugins-all')
      should contain_package('perl-Net-SNMP')

      should contain_file('/etc/nagios/objects/').with({
        'ensure' => 'absent',
        'force'  => 'true',
      })

      should contain_file('/usr/lib/nagios/').with({
        'ensure' => 'link',
        'target' => '/usr/lib64/nagios/',
      })
    end
  end

end

