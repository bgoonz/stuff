require 'spec_helper'

class Helios::TestSetIndividualLightsEffect < Helios::Effect
  def change!
    set_light(0, [255, 255, 255])
    set_light(1, [255, 255, 255])
  end
end

describe Helios::TestSetIndividualLightsEffect do
  WHITE = [255, 255, 255]
  GREY = [128, 128, 128]
  BLACK = [0, 0, 0]

  it "sets the lights to all white" do
    fx = Helios::TestSetIndividualLightsEffect.new({})
    lights = [BLACK, BLACK]
    fx.stubs(:lights_class).returns(lights) do
      fx.change!
      assert_equal [WHITE, WHITE], lights
    end
  end
end

class Helios::TestSetMultipleLightsEffect < Helios::Effect
  def change!
    set_lights([[255, 255, 255], [128, 128, 128]])
  end
end

describe Helios::TestSetMultipleLightsEffect do
  WHITE = [255, 255, 255]
  GREY = [128, 128, 128]
  BLACK = [0, 0, 0]

  it "sets the lights to all white" do
    fx = Helios::TestSetMultipleLightsEffect.new({})
    lights = [BLACK, BLACK]
    fx.stubs(:lights_class).returns(lights) do
      fx.change!
      assert_equal [WHITE, GREY], lights
    end
  end
end
