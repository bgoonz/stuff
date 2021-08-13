require 'spec_helper'

describe 'nagios::nagios_cfg' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios::nagios_cfg default params" do
    let(:title) { 'test_nagios' }

    it 'should compile' do
      should contain_file('/etc/nagios/nagios.cfg').with({
        'ensure' => 'present',
        'owner'  => 'root',
        'group'  => 'root',
        'mode'   => '0664',
      })

      should contain_file('/etc/nagios/nagios.cfg').with_content(/^command_check_interval=-1$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^use_retained_scheduling_info=1$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^enable_flap_detection=0$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^enable_notifications=1$/)
    end
  end

  context "nagios::nagios_cfg params set" do
    let(:title) { 'test_nagios' }

    let(:params) {
      {
        'cfg_files'                    => ['/etc/nagios/test.cfg'],
        'cfg_dirs'                     => ['/etc/nagios/testdir'],
        'command_check_interval'       => '300',
        'use_retained_scheduling_info' => '0',
        'enable_flap_detection'        => '1',
        'enable_notifications'         => '0',
      }
    }

    it 'should compile' do
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^cfg_file=\/etc\/nagios\/test.cfg$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^cfg_dir=\/etc\/nagios\/testdir$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^command_check_interval=300$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^use_retained_scheduling_info=0$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^enable_flap_detection=1$/)
      should contain_file('/etc/nagios/nagios.cfg').with_content(/^enable_notifications=0$/)
    end
  end
end

