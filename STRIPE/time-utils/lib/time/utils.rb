require 'time'
require 'time/utils/version'
require 'date/utils'

class Time
  module Utils extend self
    COMMON_YEAR_DAYS_IN_MONTH = [nil, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    def days_in_month(month, year = now.year)
      return 29 if month == 2 && ::Date.gregorian_leap?(year)
      COMMON_YEAR_DAYS_IN_MONTH[month]
    end

    def time_with_datetime_fallback(utc_or_local, year, month=1, day=1, hour=0, min=0, sec=0, usec=0)
      time = ::Time.send(utc_or_local, year, month, day, hour, min, sec, usec)
      # This check is needed because Time.utc(y) returns a time object in the 2000s for 0 <= y <= 138.
      time.year == year ? time : ::DateTime.civil_from_format(utc_or_local, year, month, day, hour, min, sec)
      time
    end

    # Wraps class method +time_with_datetime_fallback+ with +utc_or_local+ set to <tt>:utc</tt>.
    def utc_time(*args)
      time_with_datetime_fallback(:utc, *args)
    end

    # Wraps class method +time_with_datetime_fallback+ with +utc_or_local+ set to <tt>:local</tt>.
    def local_time(*args)
      time_with_datetime_fallback(:local, *args)
    end

    def change(time, options)
      send(
        time.utc? ? :utc_time : :local_time,
        options[:year]  || time.year,
        options[:month] || time.month,
        options[:day]   || time.day,
        options[:hour]  || time.hour,
        options[:min]   || (options[:hour] ? 0 : time.min),
        options[:sec]   || ((options[:hour] || options[:min]) ? 0 : time.sec),
        options[:usec]  || ((options[:hour] || options[:min] || options[:sec]) ? 0 : time.usec)
      )
    end

    def advance(time, options)
      unless options[:weeks].nil?
        options[:weeks], partial_weeks = options[:weeks].divmod(1)
        options[:days] = (options[:days] || 0) + 7 * partial_weeks
      end

      unless options[:days].nil?
        options[:days], partial_days = options[:days].divmod(1)
        options[:hours] = (options[:hours] || 0) + 24 * partial_days
      end

      d = Date::Utils.advance(to_date(time), options)
      time_advanced_by_date = change(time, :year => d.year, :month => d.month, :day => d.day)
      seconds_to_advance = (options[:seconds] || 0) + (options[:minutes] || 0) * 60 + (options[:hours] || 0) * 3600
      seconds_to_advance == 0 ? time_advanced_by_date : since(time_advanced_by_date, seconds_to_advance)
    end

    # Returns a new Time representing the time a number of seconds ago, this is basically a wrapper around the Numeric extension
    def ago(time, seconds)
      since(time, -seconds)
    end

    # Returns a new Time representing the time a number of seconds since the instance time
    def since(time, seconds)
      time + seconds
    end
    alias :in :since

    # Returns a new Time representing the time a number of specified weeks ago.
    def weeks_ago(time, weeks)
      advance(time, :weeks => -weeks)
    end

    # Returns a new Time representing the time a number of specified months ago
    def months_ago(time, months)
      advance(time, :months => -months)
    end

    # Returns a new Time representing the time a number of specified months in the future
    def months_since(time, months)
      advance(time, :months => months)
    end

    # Returns a new Time representing the time a number of specified years ago
    def years_ago(time, years)
      advance(time, :years => -years)
    end

    # Returns a new Time representing the time a number of specified years in the future
    def years_since(time, years)
      advance(time, :years => years)
    end

    # Short-hand for years_ago(1)
    def prev_year(time)
      years_ago(time, 1)
    end

    # Short-hand for years_since(1)
    def next_year(time)
      years_since(time, 1)
    end

    # Short-hand for months_ago(1)
    def prev_month(time)
      months_ago(time, 1)
    end

    # Short-hand for months_since(1)
    def next_month(time)
      months_since(time, 1)
    end

    # Returns a new Time representing the start of the day (0:00)
    def beginning_of_day(time)
      #(self - seconds_since_midnight).change(:usec => 0)
      change(time, :hour => 0)
    end
    alias :midnight :beginning_of_day
    alias :at_midnight :beginning_of_day
    alias :at_beginning_of_day :beginning_of_day

    # Returns a new Time representing the end of the day, 23:59:59.999999 (.999999999 in ruby1.9)
    def end_of_day(time)
      change(time, :hour => 23, :min => 59, :sec => 59, :usec => 999999.999)
    end

    # Returns a new Time representing the start of the hour (x:00)
    def beginning_of_hour(time)
      change(time, :min => 0)
    end
    alias :at_beginning_of_hour :beginning_of_hour

    # Returns a new Time representing the end of the hour, x:59:59.999999 (.999999999 in ruby1.9)
    def end_of_hour(time)
      change(
        time,
        :min => 59,
        :sec => 59,
        :usec => 999999.999
      )
    end

    # Returns a new Time representing the start of the month (1st of the month, 0:00)
    def beginning_of_month(time)
      #self - ((self.mday-1).days + self.seconds_since_midnight)
      change(time, :day => 1, :hour => 0)
    end
    alias :at_beginning_of_month :beginning_of_month

    # Returns a new Time representing the end of the month (end of the last day of the month)
    def end_of_month(time)
      #self - ((self.mday-1).days + self.seconds_since_midnight)
      last_day = days_in_month(time.month, time.year)
      change(time, :day => last_day, :hour => 23, :min => 59, :sec => 59, :usec => 999999.999)
    end
    alias :at_end_of_month :end_of_month

    # Returns a new Time representing the start of the year (1st of january, 0:00)
    def beginning_of_year(time)
      change(time, :month => 1, :day => 1, :hour => 0)
    end
    alias :at_beginning_of_year :beginning_of_year

    # Returns a new Time representing the end of the year (end of the 31st of december)
    def end_of_year(time)
      change(time, :month => 12, :day => 31, :hour => 23, :min => 59, :sec => 59, :usec => 999999.999)
    end
    alias :at_end_of_year :end_of_year

    # Convenience method which returns a new Time representing the time 1 day ago
    def yesterday(time)
      advance(time, :days => -1)
    end

    # Convenience method which returns a new Time representing the time 1 day since the instance time
    def tomorrow(time)
      advance(time, :days => 1)
    end

    # Conversions

    def to_date(time)
      Date.new(time.year, time.month, time.day)
    end
  end
end