require 'spec_helper'

describe 'redis', :type => :class do
  context "osfamily = RedHat" do
    let :facts do
      {
        :osfamily        => 'RedHat',
      }
    end

    context "default usage (osfamily = RedHat)" do
      let(:title) { 'redis-basic' }

      it 'should compile' do
        should contain_package('redis')
        should contain_file('/etc/redis.conf')
        should contain_file('/etc/redis.d')
        should contain_file('/var/log/redis')
        should contain_file('/var/lib/redis')
        should contain_file('/var/run/redis')
        should contain_file('/var/run/redis/sock')
      end
    end
  end
end
