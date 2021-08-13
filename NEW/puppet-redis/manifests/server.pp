# == Defined Type: redis::server
#
# Full description of class redis here.
#
# === Parameters
#
# [*ensure*]                      - What state to ensure the service is in. Default running.
# [*enable*]                      - Whether to start the service on boot. Default true.
# [*bind*]                        - IP Address to bind the service
# [*port*]                        - Port to bind the service
# [*package_version*]             - Package version or puppet string (ie present/latest)
# [*daemonize*]                   - Tell redis to run in the background
# [*loglevel*]                    - How verbose you want the logs
# [*timeout*]                     - Disconnect inactive clients after this amount of time (seconds)
# [*save*]                        - Persistent data policies (Array of strings)
# [*stop_writes_on_bgsave_error*] - 
# [*rdbcompression*]              - 
# [*rdbchecksum*]                 - 
# [*dbfilename*]                  - 
# [*slaveof*]                     - 
# [*masterauth*]                  - 
# [*slave_serve_stale_data*]      - 
# [*slave_read_only*]             - 
# [*repl_ping_slave_period*]      - 
# [*repl_timeout*]                - 
# [*slave_priority*]              - 
# [*requirepass*]                 - Set a password that clients must use when connecting
# [*rename_command*]              - Array of redis rename-command directive (ie ['CONFIG ""', 'INFO "mycustominfocommandname"']) Use <cmdname> "" to disable a command.
# [*maxclients*]                  - 
# [*maxmemory*]                   - Set maximum memory for redis to use.
# [*maxmemory_policy*]            - Define what redis does when out of memory and you insert a key.
# [*maxmemory_samples*]           - 
# [*appendonly*]                  - 
# [*appendfsync*]                 - 
# [*no_appendfsync_on_rewrite*]   - 
# [*auto_aof_rewrite_percentage*] - 
# [*auto_aof_rewrite_min_size*]   - 
# [*lua_time_limit*]              - 
# [*slowlog_log_slower_than*]     - 
# [*slowlog_max_len*]             - 
# [*hash_max_ziplist_entries*]    - 
# [*hash_max_ziplist_value*]      - 
# [*list_max_ziplist_entries*]    - 
# [*list_max_ziplist_value*]      - 
# [*set_max_intset_entries*]      - 
# [*zset_max_ziplist_entries*]    - 
# [*zset_max_ziplist_value*]      - 
# [*activerehashing*]             - 
# [*nagios_check*]                - Enable nagios health checks (Requires nagios check_redis plugin found here: git@github.com:shift/nagios-check-redis.git )
# [*client_output_buffer_limit*]  - 
#
# === Examples
#
#  class { redis:
#    package_version => '2.6.4'
#  }
#
# === Authors
#
# Jonathan Thurman <jthurman@newrelic.com>
#
define redis::server (
  $ensure                      = 'running',
  $enable                      = 'true',
  $daemonize                   = 'yes',
  $bind                        = '127.0.0.1',
  $port                        = '6379',
  $data_dir                    = undef,
  $dbfilename                  = 'dump.rdb',
  $timeout                     = 0,
  $databases                   = 16,
  $log_level                   = 'notice',
  $syslog_enabled              = false,
  $syslog_ident                = 'redis',
  $syslog_facility             = 'local0',
  $save                        = ['900 1', '300 10', '60 10000'],
  $stop_writes_on_bgsave_error = 'yes',
  $rdbcompression              = 'yes',
  $rdbchecksum                 = 'yes',
  $slaveof                     = undef,
  $masterauth                  = undef,
  $slave_serve_stale_data      = 'yes',
  $slave_read_only             = 'yes',
  $repl_ping_slave_period      = 10,
  $repl_timeout                = 60,
  $slave_priority              = 100,
  $requirepass                 = undef,
  $rename_command              = [ ],
  $maxclients                  = undef,
  $maxmemory                   = undef,
  $maxmemory_policy            = undef,
  $maxmemory_samples           = undef,
  $appendonly                  = 'no',
  $appendfsync                 = 'everysec',
  $no_appendfsync_on_rewrite   = 'no',
  $auto_aof_rewrite_percentage = 100,
  $auto_aof_rewrite_min_size   = '64mb',
  $lua_time_limit              = 5000,
  $slowlog_log_slower_than     = 10000,
  $slowlog_max_len             = 128,
  $hash_max_ziplist_entries    = 512,
  $hash_max_ziplist_value      = 64,
  $list_max_ziplist_entries    = 512,
  $list_max_ziplist_value      = 64,
  $set_max_intset_entries      = 512,
  $zset_max_ziplist_entries    = 128,
  $zset_max_ziplist_value      = 64,
  $activerehashing             = 'yes',
  $nagios_check                = false,
  $client_output_buffer_limit  = ['normal 0 0 0', 'slave 256mb 64mb 60', 'pubsub 32mb 8mb 60']
) {
  include redis::params

  # Calculated parameters:
  if $data_dir == undef {
    $dir = "${redis::params::data_dir}/${name}"
  } else {
    $dir = $data_dir
  }

  $logfile     = "${redis::params::log_dir}/${name}.log"
  $pidfile     = "${redis::params::pid_dir}/redis-${name}.pid"
  $config_file = "${redis::params::conf_dir}/${name}.conf"

  # Template uses all of the parameters for this class...
  file { $config_file:
    ensure  => 'present',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0640',
    content => template('redis/server.conf.erb'),
    require => Class['redis'],
    notify  => Service["${redis::params::service}-${name}"],
  }

  file { "${redis::params::init_dir}/redis-${name}":
    ensure  => 'present',
    owner   => 'root',
    group   => 'root',
    mode    => '0755',
    content => template("redis/init-${::osfamily}.erb"),
    require => Class['redis'],
  }

  file { $dir:
    ensure  => 'directory',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0755',
    require => Class['redis'],
  }

  service { "${redis::params::service}-${name}":
    ensure     => $ensure,
    enable     => $enable,
    hasrestart => true,
    hasstatus  => true,
    require    => [
      Class['redis'],
      File["${redis::params::conf_dir}/${name}.conf"],
      File["${redis::params::init_dir}/redis-${name}"],
      File[$dir],
    ],
  }

  if $nagios_check {
    # Calculate percentages based on either the maxmemory setting or total system memory
    if $maxmemory {
      $nagios_maxmem = to_bytes(upcase($maxmemory))
    } else {
      $nagios_maxmem = to_bytes($::memorysize)
    }
    $mem_warn = ($nagios_maxmem * $redis::params::nagios_mem_warn_percent) / 100
    $mem_crit = ($nagios_maxmem * $redis::params::nagios_mem_crit_percent) / 100

    @@nagios_service { "check_redis_memory_${::hostname}_${name}":
      check_command       => "check_redis!used_memory!${port}!${requirepass}!${redis::params::nagios_check_timeout}!${mem_warn}!${mem_crit}",
      host_name           => $::hostname,
      service_description => "${redis::params::nagios_service_description}_memory_${name}",
      servicegroups       => $redis::params::nagios_servicegroups,
      use                 => $redis::params::nagios_use,
    }
  }
}
