require 'spec_helper'
# require 'helios/effect'
require 'helios/cylon_effect'

describe Helios::CylonEffect do
  RED = [255,0,0]
  BLACK = [0,0,0]

  it "moves the lights left to right and back again" do
    fx = Helios::CylonEffect.new('lights' => [1, 2, 3])
    fx.stubs(:lights_class).returns([]) do
      fx.stubs(:pause).returns(nil) do
      lights = sequence('lights')

      expected = [
        [RED, BLACK, BLACK],
        [BLACK, RED, BLACK],
        [BLACK, BLACK, RED],
        [BLACK, BLACK, RED],
        [BLACK, RED, BLACK],
        [RED, BLACK, BLACK]
      ]

      expected.each do |light_settings|
        fx.expects(:set_lights).with(light_settings).in_sequence(lights)
      end

        fx.change!
      end
    end
  end
end
