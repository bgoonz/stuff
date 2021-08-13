module Helios
  class StaticColorEffect < Effect
    def initialize(args)
      @red = args['r'].to_i
      @green = args['g'].to_i
      @blue = args['b'].to_i
      super
    end

    def change!
      @lights = Array(@lights)
      @lights.each do |light|
        Lights[light] = [@red, @green, @blue]
      end
    end
  end
end
