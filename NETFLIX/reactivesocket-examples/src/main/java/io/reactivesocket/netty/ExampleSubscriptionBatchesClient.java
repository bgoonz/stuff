package io.reactivesocket.netty;

import io.reactivesocket.ConnectionSetupPayload;
import io.reactivesocket.Frame;
import io.reactivesocket.Payload;
import io.reactivesocket.ReactiveSocket;
import io.reactivesocket.websocket.rxnetty.WebSocketDuplexConnection;
import io.reactivex.netty.protocol.http.client.HttpClient;
import io.reactivex.netty.protocol.http.ws.WebSocketConnection;
import io.reactivex.netty.protocol.http.ws.client.WebSocketResponse;
import org.reactivestreams.Publisher;
import rx.Observable;
import rx.RxReactiveStreams;
import rx.Subscriber;
import rx.subjects.PublishSubject;
import uk.co.real_logic.agrona.BitUtil;

import java.nio.ByteBuffer;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.LockSupport;

/**
 * Created by rroeser on 2/3/16.
 */
public class ExampleSubscriptionBatchesClient {
    public static void main(String... args) throws Exception {

        Observable<WebSocketConnection> wsConnection = HttpClient.newClient("localhost", 8888)
           // .enableWireLogging(LogLevel.ERROR)
            .createGet("/rs")
            .requestWebSocketUpgrade()
            .flatMap(WebSocketResponse::getWebSocketConnection);

        Publisher<WebSocketDuplexConnection> connectionPublisher =
            WebSocketDuplexConnection.create(RxReactiveStreams.toPublisher(wsConnection));

        ReactiveSocket reactiveSocket = RxReactiveStreams
            .toObservable(connectionPublisher)
            .map(w -> ReactiveSocket.fromClientConnection(w, ConnectionSetupPayload.create("UTF-8", "UTF-8")))
            .toBlocking()
            .single();

        reactiveSocket.startAndWait();

        int i = ThreadLocalRandom.current().nextInt(1, 100);
        ByteBuffer b = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
        b.putInt(i);

        Payload p = new Payload() {
            @Override
            public ByteBuffer getData() {
                b.rewind();
                return b;
            }

            @Override
            public ByteBuffer getMetadata() {
                return Frame.NULL_BYTEBUFFER;
            }
        };

        CountDownLatch latch = new CountDownLatch(200);

        PublishSubject<Integer> subject = PublishSubject.create();
        subject.doOnNext(f -> System.out.println("Got => " + f));

        Observable<Payload> payloadObservable = RxReactiveStreams.toObservable(reactiveSocket.requestSubscription(p));
        payloadObservable
            .map(response -> response.getData().getInt(0))
            .doOnError(Throwable::printStackTrace)
           .subscribe(new Subscriber<Integer>() {
               private volatile long count;

               private void requestMore() {
                   count = ThreadLocalRandom.current().nextInt(5, 20);
                   System.out.println("request => " + count);
                   request(count);
               }

               @Override
               public void onStart() {
                   requestMore();
               }

               @Override
               public void onCompleted() {

               }

               @Override
               public void onError(Throwable e) {

               }

               @Override
               public void onNext(Integer integer) {
                   count--;
                   latch.countDown();
                   System.out.println("Got => " + integer);

                   if (count == 0) {
                       int s = ThreadLocalRandom.current().nextInt(1,5);
                       System.out.println("Sleeping for " + s + " seconds");
                       LockSupport.parkNanos(TimeUnit.SECONDS.toNanos(s));
                       requestMore();

                   }
               }
           });

        latch.await();
    }
}
