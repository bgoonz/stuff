require 'spec_helper'

describe 'rbenv::gem', :type => :define do
  let(:title) { 'rbenv::gem::bundler' }
  let(:params) { { :gemname => 'bundler', :foruser => 'tester', :gemversion => '~>1.1', :rubyversion => '1.9.3-p125'} }

  it "installs gem of the chosen version" do
    should contain_exec(
      "install rbenv gem #{params[:gemname]} #{params[:gemversion]} in ruby #{params[:rubyversion]} for #{params[:foruser]}"
      ).with(
        'command' => "/home/#{params[:foruser]}/.rbenv/versions/#{params[:rubyversion]}/bin/gem install #{params[:gemname]} --quiet --no-ri --no-rdoc --version='#{params[:gemversion]}'",
        'path'    => [ "/home/#{params[:foruser]}/.rbenv/shims", "/home/#{params[:foruser]}/.rbenv/bin", '/usr/bin', '/bin'],
        'user'    => params[:foruser],
        'onlyif'  => "[ -f /home/#{params[:foruser]}/.rbenv/versions/#{params[:rubyversion]}/bin/gem ]",
        'unless'  => ["/home/#{params[:foruser]}/.rbenv/versions/#{params[:rubyversion]}/bin/gem list -i -v'#{params[:gemversion]}' #{params[:gemname]}"]
      )
  end

end
