require 'spec_helper'

describe 'nagios::cgi_cfg' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios::cgi_cfg default params" do
    let(:title) { 'test_cgi_cfg' }

    it 'should compile' do
      should contain_file('/etc/nagios/cgi.cfg').with({
        'ensure'  => 'present',
        'mode'    => '0664',
        'owner'   => 'root',
        'group'   => 'root',
      })
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_system_information=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_configuration_information=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_system_commands=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_services=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_hosts=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_service_commands=nagiosadmin$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_host_commands=nagiosadmin$/)
    end
  end

  context "nagios::cgi_cfg with params set" do
    let(:title) { 'test_cgi_cfg' }

    let(:params) {
      {
        'authorized_for_system_information'        => 'test_system_info',
        'authorized_for_configuration_information' => 'test_config_info',
        'authorized_for_system_commands'           => 'test_system_cmds',
        'authorized_for_all_services'              => 'test_all_services',
        'authorized_for_all_hosts'                 => 'test_all_hosts',
        'authorized_for_all_service_commands'      => 'test_all_service_cmds',
        'authorized_for_all_host_commands'         => 'test_all_host_cmds',
      }
    }

    it 'should compile' do
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_system_information=test_system_info$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_configuration_information=test_config_info$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_system_commands=test_system_cmds$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_services=test_all_services$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_hosts=test_all_hosts$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_service_commands=test_all_service_cmds$/)
      should contain_file('/etc/nagios/cgi.cfg').with_content(/^authorized_for_all_host_commands=test_all_host_cmds$/)
    end
  end

end

