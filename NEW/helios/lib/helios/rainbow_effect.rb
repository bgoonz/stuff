module Helios
  class RainbowEffect < Effect
    RED = [255,0,0]
    ORANGE = [255,127,0]
    YELLOW = [255,255,0]
    GREEN = [0,255,0]
    BLUE = [0,0,255]
    INDIGO = [75,0,130]
    VIOLET = [198,0,235]

    def initialize(args = {})
      lights = args.fetch('lights', [1, '..', 25])
      @lights = get_lights(lights)
      @iterations = args.fetch('iterations', 5)
    end

    def change!
      starting = [RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET]
      @iterations.times do
        colors = starting.dup

        @lights.to_a.reverse.each do |light|
          Lights[light] = colors.last
          colors.rotate!
        end

        starting.rotate!
        sleep 1
      end
    end
  end
end
