require 'spec_helper'

describe Helios::Listener do
  it 'listens to SQS' do
      aws = mock()
      queues = mock()
      queue = mock()
      queue.expects(:poll)
      queues.expects(:named).with('helios').returns(queue)
      aws.expects(:queues).returns(queues)
      listener = Helios::Listener.new(aws)
      listener.listen!
  end
end
