module Helios
  class FlickerEffect < Effect
    def initialize(args)
      @oldred = args['r'].to_i
      @oldgreen = args['g'].to_i
      @oldblue = args['b'].to_i
      @red = args['r1'].to_i
      @green = args['g1'].to_i
      @blue = args['b1'].to_i
      @iterations = args['iterations']
      @interval = args.fetch('interval', 0.05)
      lights = args.fetch('lights', [1, '..', 25])
      @lights = get_lights(lights)
    end

    def change!
      old_color = [@oldred, @oldgreen, @oldblue]

      @iterations.times do
        set_lights([@red, @green, @blue])
        set_lights(old_color)
      end
    end

    def set_lights(color)
      @lights.each do |light|
        set_light(light, color)
        sleep @interval
      end
    end
  end
end
