require 'xmlrpc/client'

Puppet::Type.type(:cobblerprofile).provide(:profile) do
  desc 'Support for managing the Cobbler profiles'

  commands :cobbler => '/usr/bin/cobbler'

  mk_resource_methods

  def self.instances
    keys = []
    # connect to cobbler server on localhost
    cobblerserver = XMLRPC::Client.new2('http://127.0.0.1/cobbler_api')
    # make the query (get all systems)
    xmlrpcresult = cobblerserver.call('get_profiles')

    # get properties of current system to @property_hash
    xmlrpcresult.each do |member|
      keys << new(
        :name        => member['name'],
        :ensure      => :present,
        :distro      => member['distro'],
        :parent      => member['parent'],
        :nameservers => member['name_servers'],
        :repos       => member['repos'],
        :kickstart   => member['kickstart']
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

    # sets distribution (distro)
    def distro=(value)
      cobbler('profile', 'edit', '--name=' + @resource[:name], '--distro=' + value)
      @property_hash[:distro]=(value)
    end

    # sets parent profile
    def parent=(value)
      cobbler('profile', 'edit', '--name=' + @resource[:name], '--parent=' + value)
      @property_hash[:parent]=(value)
    end

    # sets kickstart
    def kickstart=(value)
      cobbler('profile', 'edit', '--name=' + @resource[:name], '--kickstart=' + value)
      @property_hash[:kickstart]=(value)
    end

    # sets nameservers
    def nameservers=(value)
      # create cobblerargs variable
      cobblerargs='profile edit --name=' + @resource[:name]
      # turn string into array
      cobblerargs = cobblerargs.split(' ')
      # set up nameserver argument 
      cobblerargs << ('--name-servers=' + value * ' ')
      # finally set value
      cobbler(cobblerargs)
      @property_hash[:nameservers]=(value)
    end

    # sets repos
    def repos=(value)
      # create cobblerargs variable
      cobblerargs='profile edit --name=' + @resource[:name]
      # turn string into array
      cobblerargs = cobblerargs.split(' ')
      # set up nameserver argument 
      cobblerargs << ('--repos=' + value * ' ')
      # finally set value
      cobbler(cobblerargs)
      @property_hash[:repos]=(value)
    end

    def create
      # check profile name
      raise ArgumentError, 'you must specify "distro" or "parent" for profile' if @resource[:distro].nil? and @resource[:parent].nil? 

      # create cobblerargs variable
      cobblerargs  = 'profile add --name=' + @resource[:name] 
      cobblerargs += ' --distro=' + @resource[:distro] unless @resource[:distro].nil?
      cobblerargs += ' --parent=' + @resource[:parent] unless @resource[:parent] != ''
      
      # turn string into array
      cobblerargs = cobblerargs.split(' ')

      # run cobbler commands
      cobbler(cobblerargs)

      # add kickstart, nameservers & repos (distro and/or parent are needed at creation time)
      # - check if property is defined, if not inheritance is probability (from parent)
      self.kickstart   = @resource.should(:kickstart)   unless @resource[:kickstart].nil?   or self.kickstart   == @resource.should(:kickstart)
      self.nameservers = @resource.should(:nameservers) unless @resource[:nameservers].nil? or self.nameservers == @resource.should(:nameservers)
      self.repos       = @resource.should(:repos)       unless @resource[:repos].nil?       or self.repos       == @resource.should(:repos)

      # final sync
      cobbler('sync')
      @property_hash[:ensure] = :present
    end

    def destroy
      # remove repository from cobbler
      cobbler('profile','remove','--name=' + @resource[:name])
      cobbler('sync')
      @property_hash[:ensure] = :absent
    end

    def exists?
      @property_hash[:ensure] == :present
    end
end
