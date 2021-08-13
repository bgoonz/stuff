require 'spec_helper'

describe 'nagios::resource_cfg' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios::resource_cfg no params" do
    let(:title) { 'test_resource_cfg' }

    it 'should compile' do
      should contain_file('/etc/nagios/private/resource.cfg').with({
        'ensure'  => 'file',
        'mode'    => '0660',
        'owner'   => 'root',
        'group'   => 'wheel',
      })
    end
  end

  context "nagios::resource_cfg user1 set" do
    let(:title) { 'test_resource_cfg' }

    let(:params) {
      {
        'resource_user' => { 'user1' => 'blah1' },
      }
    }

    it 'should compile' do
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER1\$=blah1$/)
    end
  end

  context "nagios::resource_cfg user5 set" do
    let(:title) { 'test_resource_cfg' }

    let(:params) {
      {
        'resource_user' => { 'user5' => 'blah5' },
      }
    }

    it 'should compile' do
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER5\$=blah5$/)
    end
  end

  context "nagios::resource_cfg user1-5 set" do
    let(:title) { 'test_resource_cfg' }

    let(:params) {
      {
        'resource_user' => {
          'user1' => 'blah1',
          'user2' => 'blah2',
          'user3' => 'blah3',
          'user4' => 'blah4',
          'user5' => 'blah5',
        },
      }
    }

    it 'should compile' do
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER1\$=blah1$/)
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER2\$=blah2$/)
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER3\$=blah3$/)
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER4\$=blah4$/)
      should contain_file('/etc/nagios/private/resource.cfg').with_content(/^\$USER5\$=blah5$/)
    end
  end
end

