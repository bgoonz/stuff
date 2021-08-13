package com.base2services.jenkins;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.base2services.jenkins.trigger.TriggerProcessor;
import hudson.Extension;
import hudson.model.PeriodicWork;
import hudson.util.SequentialExecutionQueue;
import hudson.util.TimeUnit2;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Receives a message from SQS and triggers any builds
 *
 * @author aaronwalker
 */
@Extension
public class SqsQueueHandler extends PeriodicWork {

    private static final Logger LOGGER = Logger.getLogger(SqsQueueHandler.class.getName());

    private transient final SequentialExecutionQueue queue = new SequentialExecutionQueue(Executors.newFixedThreadPool(2));

    @Override
    public long getRecurrencePeriod() {
        return TimeUnit2.SECONDS.toMillis(2);
    }

    @Override
    protected void doRun() throws Exception {
        if(queue.getInProgress().size() == 0) {
            List<SqsProfile> profiles = SqsBuildTrigger.DescriptorImpl.get().getSqsProfiles();
            if (profiles.size() != 0) {
                queue.setExecutors(Executors.newFixedThreadPool(profiles.size()));
                for (final SqsProfile profile : profiles) {
                    queue.execute(new SQSQueueReceiver(profile));
                }
            }
        } else {
            logger.fine("Currently Waiting for Messages from Queues");
        }
    }

    public static SqsQueueHandler get() {
        return PeriodicWork.all().get(SqsQueueHandler.class);
    }

    private class SQSQueueReceiver implements Runnable {

        private SqsProfile profile;

        private SQSQueueReceiver(SqsProfile profile) {
            this.profile = profile;
        }

        public void run() {
            LOGGER.fine("looking for build triggers on queue:" + profile.sqsQueue);
            AmazonSQS sqs = profile.getSQSClient();
            String queueUrl = profile.getQueueUrl();
            TriggerProcessor processor = profile.getTriggerProcessor();
            ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(queueUrl);
            receiveMessageRequest.setWaitTimeSeconds(20);
            List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
            for(Message message : messages) {
                //Process the message payload, it needs to conform to the GitHub Web-Hook JSON format
                try {
                    logger.fine("got payload\n" + message.getBody());
                    processor.trigger(message.getBody());

                } catch (Exception ex) {
                    logger.log(Level.SEVERE,"unable to trigger builds " + ex.getMessage(),ex);
                } finally {
                    //delete the message even if it failed
                    sqs.deleteMessage(new DeleteMessageRequest()
                            .withQueueUrl(queueUrl)
                            .withReceiptHandle(message.getReceiptHandle()));
                }
            }
        }
    }
}
