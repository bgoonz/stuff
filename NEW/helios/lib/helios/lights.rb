require 'rdmx'

module Helios
  class Lights
    TOTAL_LIGHTS = 50
    SOUTH_SIDE_MAX = 25

    class <<self
      def [](idx)
        if (1..SOUTH_SIDE_MAX).include?(idx)
          idx -= 1
          south_dmx[idx..idx+2]
        else
          idx -= ( SOUTH_SIDE_MAX + 1)
          idx *= 3
          north_dmx[idx..idx+2]
        end
      end

      # Lights[3] = [255, 0, 0] =>
      #      south_dmx[6, 7, 8] = [255, 0, 0]
      def []=(idx, color_array)
        if idx.is_a? Range
          idx.to_a.each do |i|
            self[i] = color_array
          end
          return
        end

        unless color_array.find {|color| color < 0}
          Helios::DB.instance.set("helios::light::#{idx}", color_array)
        end

        if (1..SOUTH_SIDE_MAX).include?(idx)
          dmx = south_dmx
        else
          idx = idx - SOUTH_SIDE_MAX
          dmx = north_dmx
        end
        min_range = ((idx-1) * 3)
        range = min_range..(min_range+2)

        dmx[range] = color_array
      end

      def load_saved_light_state
        (1..TOTAL_LIGHTS).each do |light_no|
          light_color =
            Helios::DB.instance.get("helios::light::#{light_no}")
          next if light_color.nil?
          Lights[light_no] = JSON.parse(light_color)
        end
      end

      def south_dmx
        # Reference to south DMX
        @south_dmx ||= Rdmx::Universe.new(ENV['SOUTH_DMX_USB'])
      end

      def north_dmx
        # Reference to north DMX
        @north_dmx ||= Rdmx::Universe.new(ENV['NORTH_DMX_USB'])
      end
    end
  end
end
