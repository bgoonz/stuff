require 'spec_helper'

describe 'nginx::resource::location', :type => :define do
  let :facts do
    {
      :osfamily        => 'RedHat',
      :kernel          => 'Linux',
      :operatingsystem => 'CentOS',
    }
  end

  context "basic usage" do
    let(:title) { 'test.local-user' }

    let(:params) {
      {
        'vhost'    => 'test.local',
        'location' => '/',
        'www_root' => '/var/www/html',
      }
    }

    it 'should compile' do
      should contain_file('/tmp/nginx.d/test.local-500-test.local-user')
    end
  end

  context "ssl usage" do
    let(:title) { 'test.local-secure' }

    let(:params) {
      {
        'vhost'    => 'test.local',
        'location' => '/secure',
        'www_root' => '/var/www/html',
        'ssl'      => 'true',
      }
    }

    it 'should compile' do
      should contain_file('/tmp/nginx.d/test.local-800-test.local-secure-ssl')
    end
  end

  context "return usage" do
    let(:title) { 'test.local-ret' }

    let(:params) {
      {
        'vhost'      => 'test.local',
        'location'   => '/status',
        'return_str' => '204',
      }
    }

    it 'should compile' do
      should contain_file('/tmp/nginx.d/test.local-500-test.local-ret').with_content(
        "  location /status {\n" +
        "    return 204;\n" +
        "  }\n"
      )
    end
  end

  context "rewrite usage" do
    let(:title) { 'test.local-user' }

    let(:params) {
      {
        'ensure'   => 'present',
        'vhost'    => 'test.local',
        'www_root' => '/var/www',
        'location' => '~ /user',
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
      should contain_file('/tmp/nginx.d/test.local-600-test.local-user')
    end

    it 'should have rewrite rules' do
      should contain_file('/tmp/nginx.d/test.local-600-test.local-user').with_content(
        "    rewrite ^/user/(.*)$ /users/$ 1?; # change /user to /users\n" +
        "    rewrite ^/users/(.*)$ /show?user=$ 1? last; # change /users to /show?user=\n"
      )
    end
  end
end
