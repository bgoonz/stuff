module Helios
  class DangerEffect < Effect
    def initialize(args)
      @iterations = args.fetch('iterations', 100)
    end

    def change!
      @iterations.times do
        light = rand(24) + 1
        color = [rand(255), rand(255), rand(255)]

        set_light(light, color)
      end
    end
  end
end
