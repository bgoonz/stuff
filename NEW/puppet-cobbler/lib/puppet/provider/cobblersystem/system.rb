require 'xmlrpc/client'

Puppet::Type.type(:cobblersystem).provide(:system) do
  desc 'Support for managing the Cobbler systems'

  commands :cobbler => '/usr/bin/cobbler'

  mk_resource_methods

  def self.instances
    keys = []
    # connect to cobbler server on localhost
    cobblerserver = XMLRPC::Client.new2('http://127.0.0.1/cobbler_api')
    # make the query (get all systems)
    xmlrpcresult = cobblerserver.call('get_systems')

    # get properties of current system to @property_hash
    xmlrpcresult.each do |member|
      # put only keys with values in interfaces hash
      inet_hash = {}
      member['interfaces'].each do |iface_name,iface_settings|
        inet_hash["#{iface_name}"] = {}
        iface_settings.each do |key,val|
          inet_hash["#{iface_name}"]["#{key}"] = val unless val == '' or val == []
        end
      end

      keys << new(
        :name           => member['name'],
        :ensure         => :present,
        :profile        => member['profile'],
        :interfaces     => inet_hash,
        :kernel_options => member['kernel_options'],
        :hostname       => member['hostname'],
        :gateway        => member['gateway'],
        :netboot        => member['netboot_enabled'].to_s,
        :comment        => member['comment']
      )
    end
    keys
  end

  def self.prefetch(resources)
    instances.each do |prov|
      if resource = resources[prov.name]
        resource.provider = prov
      end
    end
  end

  # sets profile
  def profile=(value)
    cobbler('system', 'edit', '--name=' + @resource[:name], '--profile=' + value)
    @property_hash[:profile]=(value)
  end

  # sets hostname
  def hostname=(value)
    cobbler('system', 'edit', '--name=' + @resource[:name], '--hostname=' + value)
    @property_hash[:hostname]=(value)
  end

  # sets gateway
  def gateway=(value)
    cobbler('system', 'edit', '--name=' + @resource[:name], '--gateway=' + value)
    @property_hash[:gateway]=(value)
  end

  # sets netboot
  def netboot=(value)
    tmparg='--netboot-enabled=0'
    tmparg='--netboot-enabled=1' if value.to_s.grep(/false/i).empty?
    cobbler('system', 'edit', '--name=' + @resource[:name], tmparg)
    @property_hash[:netboot]=(value)
  end

  # sets interfaces
  def interfaces=(value)
    # name argument for cobbler
    namearg='--name=' + @resource[:name]

    # cobbler limitation: cannot delete all interfaces from system :(
    # so we must complicate interface sync by first adding temp
    # interface, then deleting/recreating all other interfaces
    # and finally deleting temp

    # connect to cobbler server on localhost
    cobblerserver = XMLRPC::Client.new2('http://127.0.0.1/cobbler_api')
    # make the query (get all systems)
    xmlrpcresult = cobblerserver.call('get_systems')
    # get properties of current system to variable
    currentsystem = {}
    xmlrpcresult.each do |member|
      currentsystem = member if member['name'] == @resource[:name]
    end
    # generate tmp string for interface name
    o =  [('a'..'z'),('A'..'Z')].map{|i| i.to_a}.flatten
    puppet_iface =  'tmp_' + (0...15).map{ o[rand(o.length)] }.join
    # add temp interface
    cobbler('system', 'edit', namearg, "--interface=#{puppet_iface}", '--static=true')
    # delete all other intefraces
    currentsystem['interfaces'].each do |iface_name,iface_settings|
      cobbler('system', 'edit', namearg, '--interface=' + iface_name, '--delete-interface')
    end

    # recreate interfaces according to resource in puppet
    value.each do |iface, settings|
      ifacearg = '--interface=' + iface

      settings.each do |key,val|
        # substitute _ for -
        setting = key.gsub(/_/,'-')
        # finally construct command and edit system properties
        unless val.nil?
          val = val.join(' ') if val.is_a?(Array)
          valuearg = "--#{setting}=" + val.to_s
          cobbler('system', 'edit', namearg, ifacearg, valuearg)
        else
          cobbler('system', 'edit', namearg, ifacearg, "--#{setting}=''")
        end
      end
    end

    # remove temp interface
    cobbler('system', 'edit', namearg, "--interface=#{puppet_iface}", '--delete-interface')

    @property_hash[:interfaces]=(value)
  end

  # sets kernel_options
  def kernel_options=(value)
    # name argument for cobbler
    namearg='--name=' + @resource[:name]

    # construct commandline from value hash
    cobblerargs='system edit --name=' + @resource[:name]
    cobblerargs=cobblerargs.split(' ')
    # set up kernel options
    kopts_value = []
    # if value is ~, that means key is standalone option
    value.each do |key,val|
      if val=="~"
        kopts_value << "#{key}"
      else
        kopts_value << "#{key}=#{val}" unless val=="~"
      end
    end
    cobblerargs << ('--kopts=' + kopts_value * ' ')
    # finally run command to set value
    cobbler(cobblerargs)
    # update property_hash
    @property_hash[:kernel_options]=(value)
  end

  # sets comment
  def comment=(value)
    cobbler('system', 'edit', '--name=' + @resource[:name], '--comment=' + value)
    @property_hash[:comment]=(value)
  end

  def create
    # add system
    cobbler('system', 'add', '--name=' + @resource[:name], '--profile=' + @resource[:profile])

    # add hostname, gateway, interfaces, netboot
    self.hostname       = @resource.should(:hostname)       unless self.hostname       == @resource.should(:hostname)
    self.gateway        = @resource.should(:gateway)        unless self.gateway        == @resource.should(:gateway)
    self.interfaces     = @resource.should(:interfaces)     unless self.interfaces     == @resource.should(:interfaces)
    self.netboot        = @resource.should(:netboot)        unless self.netboot        == @resource.should(:netboot)
    self.comment        = @resource.should(:comment)        unless self.comment        == @resource.should(:comment)
    self.kernel_options = @resource.should(:kernel_options) unless self.kernel_options == @resource.should(:kernel_options)

    # sync state
    cobbler('sync')

    # update @property_hash
    @property_hash[:ensure] = :absent
  end

  def destroy
    # remove system from cobbler
    cobbler('system', 'remove', '--name=' + @resource[:name])
    cobbler('sync')
    # update @property_hash
    @property_hash[:ensure] = :absent
  end

  def exists?
    @property_hash[:ensure] == :present
  end
end
