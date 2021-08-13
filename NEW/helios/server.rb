require './init'

listener = Helios::Listener.new(AWS::SQS.new(access_key_id: ENV['AWS_ACCESS_KEY'], secret_access_key: ENV['AWS_SECRET_KEY']))

File.open('./helios.pid', 'w') { |f| f.write $$ }

begin
  Helios::Lights.load_saved_light_state
rescue Exception => ex
    Helios::Logger.instance.error("Error loading light state")
    Helios::Logger.instance.error("ERROR: #{ex.message}")
    Helios::Logger.instance.error ex.backtrace.join("\n")
end

loop do
  listener.listen!
end
