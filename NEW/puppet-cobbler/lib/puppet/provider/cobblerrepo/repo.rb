require 'xmlrpc/client'

Puppet::Type.type(:cobblerrepo).provide(:repo) do
  desc 'Support for managing the Cobbler repos'

  commands :cobbler => '/usr/bin/cobbler'

  mk_resource_methods

  def self.instances
    keys = []
    # connect to cobbler server on localhost
    cobblerserver = XMLRPC::Client.new2('http://127.0.0.1/cobbler_api')
    # make the query (get all systems)
    xmlrpcresult = cobblerserver.call('get_repos')

    # get properties of current system to @property_hash
    xmlrpcresult.each do |member|
      keys << new(
        :name           => member['name'],
        :ensure         => :present,
        :arch           => member['arch'],
        :priority       => member['priority'].to_s,
        :mirror         => member['mirror'],
        :mirror_locally => member['mirror_locally'].to_s,
        :keep_updated   => member['keep_updated'].to_s,
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

  # sets architecture
  def arch=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--arch=' + value.to_s)
    @property_hash[:arch]=(value.to_s)
    cobbler('reposync')
  end

  # sets mirror
  def mirror=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--mirror=' + value)
    @property_hash[:mirror]=(value)
    cobbler('reposync')
  end

  # set priority
  def priority=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--priority=' + value)
    @property_hash[:priority]=(value)
    cobbler('reposync')
  end

  # mirror locally repository or not
  def mirror_locally=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--mirror-locally=' + value.to_s)
    @property_hash[:mirror_locally]=(value.to_s)
    cobbler('reposync')
  end

  # keep mirror updated?
  def keep_updated=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--keep-updated=' + value.to_s)
    @property_hash[:keep_updated]=(value.to_s)
  end

  # comment
  def comment=(value)
    cobbler('repo', 'edit', '--name=' + @resource[:name], '--comment=' + value)
    @property_hash[:comment]=(value)
  end

  def create
    # sanity check
    raise ArgumentError, 'mirror of the repository must be specified!' if @resource[:mirror].nil? 
    
    # create cobblerargs variable
    cobblerargs = 'repo add --name=' + @resource[:name] + ' --mirror=' + @resource[:mirror] + ' --mirror-locally=' + @resource[:mirror_locally].to_s
    
    # turn string into array
    cobblerargs = cobblerargs.split(' ')

    # run cobbler commands
    cobbler(cobblerargs)
    
    # add properties
    self.arch           = @resource.should(:arch)          unless self.arch           == @resource.should(:arch)
    self.mirror_locally = @resource.should(:mirror_localy) unless self.mirror_locally == @resource.should(:mirror_locally)
    self.keep_updated   = @resource.should(:keep_updated)  unless self.keep_updated   == @resource.should(:keep_updated)
    self.comment        = @resource.should(:comment)       unless self.comment        == @resource.should(:comment)
    
    # final sync
    cobbler('reposync')
    @property_hash[:ensure] = :present
  end

  def destroy
    cobbler('repo','remove','--name=' + @resource[:name])
    cobbler('reposync')
    @property_hash[:ensure] = :absent
  end
  
  def exists?
    @property_hash[:ensure] == :present
  end
end
