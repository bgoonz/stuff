require 'iconv'

class Gem::Specification
  alias_method :__licenses, :licenses

  def debugging
    false
  end

  def licenses
    cleaned_up_licenses
  end

  private

  def cleaned_up_licenses
    before = gem_or_file_license

    puts "License #{before.inspect}" if debugging

    # manually clean up some cruft
    after = before.collect do |license|
      stringified = license.to_s
      if stringified == 'mit'
        'MIT'
      elsif stringified == 'lgpl'
        'LGPL'
      elsif stringified == 'gpl'
        'GPL'
      else
        stringified
      end
    end

    puts "  Cleaned #{after.inspect}" if debugging && before != after

    after
  end

  def gem_or_file_license
    from_gem || guess_licenses
  end

  def from_gem
    result = (__licenses || []).select { |l| l.length > 0 }
    if result.length > 0
      puts "Retrieved from Gem license" if debugging
      result
    else
      puts "Guessing from file" if debugging
      nil
    end
  end

  # Strip non UTF-8 characters from the string
  def utf8_safe(string)
    return string if string.nil?
    ic = Iconv.new('UTF-8//IGNORE', 'UTF-8')

    # If the invalid character is the last (or in some cases, the second to last),
    # Iconv raises an InvalidCharacter exception instead of stripping the character out
    ic.iconv(string + '  ')[0..-3]
  end
  
  def guess_licenses
    licenses = []
    if File.exists?(full_gem_path)  # Sometimes it doesn't. Like with bundler.
      Dir.foreach(full_gem_path) do |filename|
        filename_without_extension = File.basename(filename, File.extname(filename)).downcase
        if filename_without_extension.include?("license")
          parts = filename.split('-')
          if (parts.length >= 2)
            licenses << parts[0].upcase
          else
            licenses = guess_licenses_from_file_contents File.join(full_gem_path, filename)
          end
        elsif filename_without_extension.include?("readme")
          licenses = guess_licenses_from_file_contents File.join(full_gem_path, filename)
        end
        break if licenses.length > 0
      end
    end

    licenses << 'Unknown' if licenses.length == 0
    licenses = ['Unknown'] if licenses == [nil]

    licenses
  end

  def guess_licenses_from_file_contents(path)
    licenses = []
    file_handle = File.new(path, "r")

    contents = ''
    while (line = utf8_safe(file_handle.gets)) && (licenses.size == 0)
      line = line.strip
      contents << line+' '
      # positive matches

      [ /released under the (.+) license/i,
        /same license as (.+)/i,
        /same terms of (.+)/i,
        /(.+) License, see/i,
        /(\w+) license$/i,
        /\(the (.+) license\)/i,
        /license: (.+)/i,
        /released under the (.+) license/i ].each do |r|
        res = Regexp.new(r).match(line)
        match = $1

        next unless res

        licenses << match
        break
      end
    end
    file_handle.close

    # multi-line matches
    mit = 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files \(the ["\']Software["\']\), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:'
    if contents =~ /#{mit}/mi
      licenses << "MIT"
    end
    licenses
  end
  
end

