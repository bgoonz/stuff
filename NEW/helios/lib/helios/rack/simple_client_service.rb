require 'aws-sdk'

module Helios::Rack
  class SimpleClientService
    def self.call(env)
      if authorized?(env) || basic_http_authorized?(env)
        begin
          json = env['rack.input'].read
          post_message_to_sqs(json)
          [200,
           {'Content-Type' => 'text/plain'},
           ["Sent to SQS\n"]]
        rescue Exception => ex
          [500,
           {'Content-Type' => 'text/plain'},
           ["There was an error\n", ex.message, "\n"]]
        end
      else
        return [401, {'Content-Type' => 'text/plain'}, ["Sorry. You must be at New Relic to use this."]] 
      end
    end

    private
    class <<self
      def authorized?(env)
        env['REMOTE_ADDR'] =~ /127\.0\.0\.1/ ||
          (ENV['WHITE_LIST_REGEXP'] &&
           env['HTTP_X_FORWARDED_FOR'] =~ Regexp.new(ENV['WHITE_LIST_REGEXP']))
      end

      def basic_http_authorized?(env)
        auth = Rack::Auth::Basic::Request.new(env)
        auth.provided? && auth.basic? && auth.credentials && auth.credentials &&
          auth.credentials == [ENV['AUTH_USER'], ENV['AUTH_PASSWORD']]
      end

      def post_message_to_sqs(json)
        sqs = AWS::SQS.new(access_key_id: ENV['AWS_ACCESS_KEY'], secret_access_key: ENV['AWS_SECRET_KEY'])
        sqs.queues.create('helios').send_message(json)
      end
    end
  end
end
