module Helios
  class CylonEffect < Effect
    RED = [255,0,0]
    BLACK = [0,0,0]

    def initialize(args = {})
      lights = args.fetch('lights', [1, '..', 25])
      @iterations = args.fetch('iterations', 5)
      @lights = get_lights(lights)
      @color = args.values_at('r', 'g', 'b')
      @color = RED if @color.none?
    end

    def change!
      size = @lights.last - @lights.first + 1

      @iterations.times do
        cylon_lights = Array.new(size, BLACK)
        cylon_lights[0] = @color

        size.times do
          set_lights(cylon_lights, @lights)
          cylon_lights.rotate!(-1)
          pause
        end

        size.times do
          cylon_lights.rotate!
          set_lights(cylon_lights, @lights)
          pause
        end

      end

    end

    def pause
    end

    def set_lights(values, range)
      _lights = Array(range)
      values.each_with_index do |color, index|
        Lights[_lights[index]] = color
      end
      nil
    end
  end
end

