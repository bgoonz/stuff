require 'spec_helper'

describe 'redis::server', :type => :define do
  context "osfamily = RedHat" do
    let :facts do
      {
        :osfamily        => 'RedHat',
      }
    end

    context "default usage (osfamily = RedHat)" do
      let(:title) { 'myserver' }

      it 'should compile' do
        should contain_file('/etc/redis.d/myserver.conf')
        should contain_file('/etc/init.d/redis-myserver')
        should contain_service('redis-myserver')
        should contain_file('/var/lib/redis/myserver')
      end
    end
  end
end
