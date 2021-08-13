module Helios
  class TimedStaticColorEffect < Effect
    def initialize(args)
      @red = args['r'].to_i
      @green = args['g'].to_i
      @blue = args['b'].to_i
      @interval = args['interval']
      lights = args.fetch('lights', [1, '..', 25])
      @lights = get_lights(lights)
    end

    def change!
      @lights.each do |light|
        Lights[light] = [@red, @green, @blue]
        sleep @interval
      end
    end
  end
end
