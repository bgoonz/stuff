require 'date'

class Date
  module Utils extend self
    def advance(date, options)
      options = options.dup
      date = date >> options.delete(:years) * 12 if options[:years]
      date = date >> options.delete(:months)     if options[:months]
      date = date +  options.delete(:weeks) * 7  if options[:weeks]
      date = date +  options.delete(:days)       if options[:days]
      date
    end
  end
end