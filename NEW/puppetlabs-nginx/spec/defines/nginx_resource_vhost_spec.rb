require 'spec_helper'

describe 'nginx::resource::vhost', :type => :define do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "basic usage" do
    let(:title) { 'test.local' }

    let(:params) {
      {
        'ensure'      => 'present',
        'ipv6_enable' => true,
        'proxy'       => 'http://proxypass',
      }
    }

    it 'should compile' do
      should contain_file('/tmp/nginx.d/test.local-001')
    end
  end

  context "rewrite usage" do
    let(:title) { 'test.local' }

    let(:params) {
      {
        'ensure'   => 'present',
        'www_root' => '/var/www',
        'rewrite'  => {
          'change /user to /users' => {
            'regex'       => '^/user/(.*)$',
            'replacement' => '/users/$ 1?',
          },
          'change /users to /show?user=' => {
            'regex'       => '^/users/(.*)$',
            'replacement' => '/show?user=$ 1?',
            'flag'        => 'last',
          },
        },
      }
    }

    it 'should compile' do
      should contain_file('/tmp/nginx.d/test.local-001')
    end

    it 'should have rewrite rules' do
      should contain_file('/tmp/nginx.d/test.local-010').with_content(
        "  rewrite ^/user/(.*)$ /users/$ 1?; # change /user to /users\n" +
        "  rewrite ^/users/(.*)$ /show?user=$ 1? last; # change /users to /show?user=\n"
      )
    end
  end
end
