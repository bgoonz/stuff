require 'newrelic_plugin'
require 'logger'
require 'fileutils'

module NewRelicRackspacePlugin
  class PluginAgent < NewRelic::Plugin::Agent::Base

    attr_reader :connection, :options, :log
    
    def initialize(*args)
      @log = Logger.new(log_destination)
      @log.level = log_level
      super
    end

    # Returns destination for logging. Configurable in configuration
    # file via `'logger' => {'log_file' => '/some/path'}`
    # default: STDOUT
    def log_destination
      if(agent_options['logger'] && agent_options['logger']['log_file'])
        FileUtils.mkdir_p(File.dirname(path = agent_options['logger']['log_file']))
        path
      else
        STDOUT
      end
    end

    # Returns log severity level. Configurable in configuration file
    # via `'logger' => {'severity' => 'debug'}`
    # default: STDOUT
    def log_level
      if(agent_options['logger'] && agent_options['logger']['severity'])
        begin
          Logger.const_get(agent_options['logger']['severity'].upcase)
        rescue NameError
          raise NewRelic::Plugin::BadConfig.new('Invalid severity provided for logger. Allowed: debug, info, warn, fatal')
        end
      else
        Logger::WARN
      end
    end

    # Executes block provided and suppresses any StandardError type
    # exceptions and logs them
    def log_errors
      begin
        yield if block_given?
      rescue => e
        log.error "Unexpected error encounted: #{e}"
        log.info "#{e.class.name}: #{e}"
        log.debug e.backtrace.join("\n")
      end
    end

    # Returns name of this agent
    def agent_name(*args)
      name_parts = self.class.name.split('::')[-2,2]
      if(args.include?(:camel))
        name_parts.join('')
      else
        name_parts.join('_').downcase
      end
    end

    # Returns options for this agent
    def agent_options
      unless(@agent_options)
        @agent_options = NewRelic::Plugin::Config.config.options
        unless((rs = @agent_options['rackspace']).is_a?(Hash) && rs['username'] && rs['api_key'])
          raise NewRelic::Plugin::BadConfig.new('Missing Rackspace credentials')
        end
      end
      @agent_options
    end

    # Loads required dependency library
    def setup_metrics
      require 'fog'
      @options = NewRelic::Plugin::Config.config.newrelic
      log.debug 'Establishing connection to New Relic'
    end

    # Returns the poll interval (defaults to 10 seconds)
    def poll
      options['poll'] || 10
    end

    # component:: name of component
    # args:: arguments for metric report
    # Optional - Hash with :name key to namespace metric
    # Override to allow custom behavior for #report_metric
    def report_metric(component, *args)
      opts = args.detect{|a| a.is_a?(Hash)}
      args.delete(opts) if opts
      log.debug "OPTIONAL Hash arguments for #report_metric: #{opts.inspect}" if opts
      comps = []
      comps.push("Overview/#{component}") unless opts[:disable_overview]
      comps.push("#{agent_name(:camel)}/#{opts[:name]}/#{component}") if opts[:name]
      comps.each do |component_name|
        log.debug "Reporting metric: #{component_name} - #{args.inspect}"
        super(component_name, *args)
      end
    end

    # type:: Type of rackspace fog connection
    # Returns the requested type of fog connection to the rackspace
    # API. Currently supported types:
    #   :compute, :blockstorage, :storage, :loadbalancers, :databases
    #   :cloud_monitoring, :dns, :cdn
    def fog(type)
      stype = type.to_sym
      require 'fog' unless @fog
      @fog ||= {}
      unless(@fog[stype])
        require 'fog'
        args = {
          :rackspace_username => agent_options['rackspace']['username'],
          :rackspace_api_key => agent_options['rackspace']['api_key']
        }
        if(agent_options['rackspace']['region'])
          args[:rackspace_region] = agent_options['rackspace']['region']
        end
        case stype
        when :compute
          klass = Fog::Compute::RackspaceV2
        when :blockstorage
          klass = Fog::Rackspace::BlockStorage
        when :storage
          klass = Fog::Storage::Rackspace
        when :loadbalancers
          klass = Fog::Rackspace::LoadBalancers
        when :databases
          klass = Fog::Rackspace::Databases
        when :cloud_monitoring
          klass = Fog::Monitoring::Rackspace
        when :cdn
          klass = Fog::CDN::Rackspace
        when :dns
          klass = Fog::DNS::Rackspace
        else
          raise ArgumentError.new "Invalid fog connection type received: #{type}"
        end
        log.debug("Establishing connection to Rackspace for: #{klass} service")
        @fog[stype] = klass.new(args)
      end
      @fog[stype]
    end
  end
end
