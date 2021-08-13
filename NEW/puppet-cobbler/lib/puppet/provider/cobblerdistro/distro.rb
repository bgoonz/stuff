require 'xmlrpc/client'
require 'fileutils'

Puppet::Type.type(:cobblerdistro).provide(:distro) do
  desc 'Support for managing the Cobbler distros'

  commands :wget    => '/usr/bin/wget',
           :mount   => '/bin/mount',
           :umount  => '/bin/umount',
           :cp      => '/bin/cp',
           :cobbler => '/usr/bin/cobbler'

  mk_resource_methods

  def self.instances
    keys = []
    # connect to cobbler server on localhost
    cobblerserver = XMLRPC::Client.new2('http://127.0.0.1/cobbler_api')
    # make the query (get all systems)
    xmlrpcresult = cobblerserver.call('get_distros')

    # get properties of current system to @property_hash
    xmlrpcresult.each do |member|
      keys << new(
        :name           => member['name'],
        :ensure         => :present,
        :arch           => member['arch'],
        :kernel         => member['kernel'],
        :initrd         => member['initrd'],
        :ks_meta        => member['ks_meta'],
        :comment        => member['comment'],
        :breed          => member['breed'],
        :os_version     => member['os_version']
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
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--arch=' + value.to_s)
    @property_hash[:arch]=(value.to_s)
  end

  # sets the path to kernel
  def kernel=(value)
    raise ArgumentError, 'correct kernel path must be specified!' unless File.exists?(value) 
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--kernel=' + value)
    @property_hash[:kernel]=(value)
  end

  # sets the path to initrd
  def initrd=(value)
    raise ArgumentError, 'correct initrd path must be specified!' unless File.exists?(value) 
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--initrd=' + value)
    @property_hash[:initrd]=(value)
  end

  # sets the kickstart metadata
  def ks_meta=(value)
    # name argument for cobbler
    namearg='--name=' + @resource[:name]

    # construct commandline from value hash
    cobblerargs='distro edit --name=' + @resource[:name]
    cobblerargs=cobblerargs.split(' ')
    # set up kernel options
    ksmeta_value = []
    # if value is ~, that means key is standalone option
    value.each do |key,val|
      if val=="~"
        ksmeta_value << "#{key}"
      else
        ksmeta_value << "#{key}=#{val}" unless val=="~"
      end
    end
    cobblerargs << ('--ksmeta=' + ksmeta_value * ' ')
    # finally run command to set value
    cobbler(cobblerargs)
    # update property_hash
    @property_hash[:ks_meta]=(value)
  end

  # Support cobbler's --breed
  def breed=(value)
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--breed=' + value)
    @property_hash[:breed]=(value)
  end
 
  # Support cobbler's --os-version
  def os_version=(value)
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--os-version=' + value)
    @property_hash[:os_version]=(value)
  end

  # comment
  def comment=(value)
    cobbler('distro', 'edit', '--name=' + @resource[:name], '--comment=' + value)
    @property_hash[:comment]=(value)
  end

  def create
    # check wether we are importing path via 'cobbler import'
    if @resource[:path] != ''
      # This is block that does:
      #  'cobbler import'

      # if ks_meta tree is defined, get the value
      # and use it for '--available-as' option
      ks_meta = if @resource[:ks_meta].has_key?('tree') then ' --available-as=' + @resource[:ks_meta]['tree'] else '' end

      cobblerargs = 'import --name=' + @resource[:name] + ' --path=' + @resource[:path] + ks_meta
    else
      # This is block that does:
      #  'cobbler distro add'

      # create destination directory for distro
      distrodestdir = @resource[:destdir] + '/' + @resource[:name]
      Dir.mkdir(distrodestdir) unless File.directory? distrodestdir

      # get ISO image
      wget(@resource[:isolink],'--continue','--directory-prefix=/tmp').strip

      # get ISO path
      isopath = '/tmp/' + @resource[:isolink].sub(/^.*\/(.*).iso/, '\1')

      # create mount destination
      if ! File.directory? isopath
        Dir.mkdir(isopath, 755)
      end
      mount( '-o', 'loop', isopath + '.iso', isopath) unless mount( '-l', '-t', 'iso9660') =~ /#{isopath}/

      # real work to be done here
      currentdir = Dir.pwd
      Dir.chdir(isopath)
      cp('-R', '.', distrodestdir)
      Dir.chdir(currentdir)

      # clean garbage
      umount( '-f', isopath)
      Dir.delete(isopath)

      # after copying check for kernel and initrd
      raise ArgumentError, 'correct kernel path must be specified!' unless File.exists?(@resource[:kernel]) 
      raise ArgumentError, 'correct initrd path must be specified!' unless File.exists?(@resource[:initrd]) 

      # create profileargs variable
      cobblerargs = 'distro add --name=' + @resource[:name] + ' --kernel=' + @resource[:kernel] + ' --initrd=' + @resource[:initrd]
    end

    # finaly run the cobbler command
    cobbler(cobblerargs.split(' '))

    # remove the profile generated by 'cobbler import'
    cobbler('profile', 'remove', '--name=' + @resource[:name]) if @resource[:path] != ''

    # add properties
    self.arch       = @resource.should(:arch)       unless self.arch       == @resource.should(:arch)
    self.comment    = @resource.should(:comment)    unless self.comment    == @resource.should(:comment)
    self.breed      = @resource.should(:breed)      unless self.breed      == @resource.should(:breed)
    self.os_version = @resource.should(:os_version) unless self.os_version == @resource.should(:os_version)

    # final sync
    cobbler('sync')
    @property_hash[:ensure] = :present
  end

  def destroy
    # strap out distribution directory from kernel path
    distrodir = self.kernel.sub(/^(.*#{self.name}).*/, '\1')
    # if destdir is defined, override calculated value
    distrodir = @resource[:destdir] unless @resource[:destdir].nil?
    # remove distro with sanity checks
    FileUtils.rm_rf distrodir unless distrodir =~ /^\/(bin|boot|dev|etc|lib|lib64|opt|sbin|sys|tmp|usr|var)?$/
    cobbler('distro','remove','--name=' + @resource[:name])
    cobbler('sync')
    @property_hash[:ensure] = :absent
  end

  def exists?
    @property_hash[:ensure] == :present
  end
end
