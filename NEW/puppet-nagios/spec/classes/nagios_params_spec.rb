require 'spec_helper'

describe 'nagios::params' do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "nagios::params default" do
    let(:title) { 'test_nagios_params' }

    it 'should compile' do
    end
  end

end

