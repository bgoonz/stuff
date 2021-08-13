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
import uk.co.real_logic.agrona.BitUtil;

import java.nio.ByteBuffer;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.LockSupport;

/**
 * Created by rroeser on 2/3/16.
 */
public class ExampleRequestStreamWithBackPressureClient {
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

        int i = ThreadLocalRandom.current().nextInt(50, 250);
        System.out.println("asking for " + i + " ints");
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

        CountDownLatch latch = new CountDownLatch(1);

        Observable<Payload> payloadObservable = RxReactiveStreams.toObservable(reactiveSocket.requestStream(p));
        payloadObservable
            .map(response -> response.getData().getInt(0))
            .subscribe(new Subscriber<Integer>() {
                private volatile long count = 5;

                @Override
                public void onStart() {
                    request(count);
                }

                @Override
                public void onCompleted() {
                    latch.countDown();
                }

                @Override
                public void onError(Throwable e) {
                    e.printStackTrace();
                }

                @Override
                public void onNext(Integer r) {
                    System.out.println("Got from server => " + r);
                    count--;

                    if (count == 0) {
                        LockSupport.parkNanos(TimeUnit.MILLISECONDS.toNanos(500));
                        System.out.println("Requesting 5 more");
                        count = 5;
                        request(count);
                    }
                }
            });

        latch.await();

    }
}
