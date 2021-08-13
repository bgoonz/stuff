module Helios
  class Dispatcher
    attr_reader :effect_class, :arguments

    def initialize(message)
      @message = message
      @effect_class = @message['effect'] + 'Effect'
      # { "effect": "StaticColor", "args": {"r": 255, "g": 255, "b": 255} }
      @effect_class = Helios.const_get(@effect_class)
      @arguments = message['args']
    end

    def dispatch!
      self.effect_class.new(self.arguments).change!
    end
  end
end
