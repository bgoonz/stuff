module Helios
  class AltEffect < Effect
    def initialize(args)
      @odd_red = args['r'].to_i
      @odd_green = args['g'].to_i
      @odd_blue = args['b'].to_i
      @even_red = args['r1'].to_i
      @even_green = args['g1'].to_i
      @even_blue = args['b1'].to_i
      @iterations = args['iterations']
      @interval = args.fetch('interval', 0.05)
      lights = args.fetch('lights', [1, '..', 25])
      @lights = get_lights(lights)
    end

    def change!
      odd_color = [@odd_red, @odd_green, @odd_blue]
      even_color = [@even_red, @even_green, @even_blue]

      @iterations.times do |i|
        if i.even?
          alt_colors(odd_color, even_color)
        else
          alt_colors(even_color, odd_color)
        end
        sleep @interval
      end
    end

    def alt_colors(odd_color, even_color)
      @lights.each_with_index do |light, i|
          color = i.even? ? even_color : odd_color
          set_light(light, color)
      end
    end
  end
end
