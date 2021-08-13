module Helios
  class Effect
    def initialize(args)
      lights = args.fetch('lights', [1, '..', 25])
      @lights = get_lights(lights)
      stop_pulsing(@lights) if args['stop_pulsing']
    end

    def change!
      raise NotImplementedError("Effects must implement #change! method")
    end

    protected
    def get_lights(value)
      if value.is_a?(Array)
        # [0, '..', 512]
        if value[1] == '..'
          return (value[0].to_i..value[2].to_i)
        end
        return value.map(&:to_i)
      end
      return value
    end

    def lights_class
      Lights
    end

    private
    def stop_pulsing(lights)
      if PulsingEffect.running_effect && PulsingEffect.running_effect[@lights]
        PulsingEffect.running_effect[@lights].kill
        PulsingEffect.running_effect[@lights] = nil
      end
    end
  end
end
