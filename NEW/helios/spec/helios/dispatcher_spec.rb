require 'spec_helper'

describe Helios::Dispatcher do
  it 'creates the correct class' do
    dis = Helios::Dispatcher.new({'effect' => 'Dummy'})

    dis.effect_class.must_equal DummyEffect
  end

  it 'call the class with arguments' do
    args = {
      'foo' => 'bar',
      'adams' => 42
    }

    dis = Helios::Dispatcher.new({
      'effect' => 'Dummy',
      'args'   => args
    })

    DummyEffect.expects(:new).with(args).returns(mock(:change! => nil))

    dis.dispatch!
  end
end

class DummyEffect
  def initialize(args)
  end
end
