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
import uk.co.real_logic.agrona.BitUtil;

import java.nio.ByteBuffer;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Created by rroeser on 2/3/16.
 */
public class ExampleChannelClient {
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

        int i = ThreadLocalRandom.current().nextInt(5, 25);
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

        Publisher<Payload> payloadPublisher = reactiveSocket.requestChannel(
            RxReactiveStreams.toPublisher(
                Observable
                    .range(0, 1000)
                    .map(r -> {
                        ByteBuffer byteBuffer = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                        byteBuffer.putInt(i);

                        Payload payload = new Payload() {
                            @Override
                            public ByteBuffer getData() {
                                byteBuffer.rewind();
                                return byteBuffer;
                            }

                            @Override
                            public ByteBuffer getMetadata() {
                                return Frame.NULL_BYTEBUFFER;
                            }
                        };

                        return payload;
                    })
            )
        );

        Observable<Payload> payloadObservable = RxReactiveStreams.toObservable(payloadPublisher);
        payloadObservable
            .map(response -> response.getData().getInt(0))
            .doOnNext(r -> System.out.println("Got from server => " + r))
            .doOnError(Throwable::printStackTrace)
            .toBlocking()
            .last();

    }
}
