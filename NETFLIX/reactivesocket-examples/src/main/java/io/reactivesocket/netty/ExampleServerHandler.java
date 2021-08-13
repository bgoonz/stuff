package io.reactivesocket.netty;

import io.reactivesocket.Frame;
import io.reactivesocket.Payload;
import io.reactivesocket.RequestHandler;
import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import rx.Observable;
import rx.RxReactiveStreams;
import rx.schedulers.Schedulers;
import uk.co.real_logic.agrona.BitUtil;

import java.nio.ByteBuffer;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.LockSupport;

/**
 * Created by rroeser on 2/3/16.
 */
public class ExampleServerHandler extends RequestHandler {
    @Override
    public Publisher<Payload> handleRequestResponse(Payload payload) {
        int i = payload.getData().getInt(0);
        System.out.println("Got from client " + i);

        ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
        data.putInt(ThreadLocalRandom.current().nextInt());
        Payload p = new Payload() {
            @Override
            public ByteBuffer getData() {
                data.rewind();
                return data;
            }

            @Override
            public ByteBuffer getMetadata() {
                return Frame.NULL_BYTEBUFFER;
            }
        };

        return RxReactiveStreams.toPublisher(Observable.just(p).doOnError(Throwable::printStackTrace));
    }

    @Override
    public Publisher<Payload> handleRequestStream(Payload payload) {
        return RxReactiveStreams.toPublisher(
        Observable.defer(() -> {
            try {

                int numberOfNumber = payload.getData().getInt();

                return Observable
                    .range(0, numberOfNumber)
                    //.onBackpressureDrop(i -> System.out.println("Dropping this number => " + i))
                    .doOnSubscribe(() -> System.out.println("Going to send back " + numberOfNumber + " numbers"))
                    .doOnError(Throwable::printStackTrace)
                    .map(i -> new Payload() {
                        @Override
                        public ByteBuffer getData() {
                            ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                            data.putInt(ThreadLocalRandom.current().nextInt());
                            data.rewind();
                            return data;
                        }

                        @Override
                        public ByteBuffer getMetadata() {
                            return Frame.NULL_BYTEBUFFER;
                        }
                    });
            } catch (Throwable t) {
                t.printStackTrace();
                return Observable.error(new RuntimeException("Error streaming data: " + t.getMessage()));
            }
        }));
    }

    @Override
    public Publisher<Payload> handleSubscription(Payload payload) {
        return RxReactiveStreams.toPublisher(
            Observable.defer(() -> {
                int i = payload.getData().getInt(0);

                if (i % 2 == 0) {
                    System.out.println("Sending evenings...");

                    return Observable
                        .range(0, Integer.MAX_VALUE)
                        .filter(f -> f % 2 == 0)
                        .map(f -> new Payload() {
                            @Override
                            public ByteBuffer getData() {
                                ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                                data.putInt(f);
                                data.rewind();
                                return data;
                            }

                            @Override
                            public ByteBuffer getMetadata() {
                                return Frame.NULL_BYTEBUFFER;
                            }
                        });
                } else {
                    System.out.println("Sending odds...");

                    return Observable
                        .range(0, Integer.MAX_VALUE)
                        .filter(f -> f % 2 != 0)
                        .map(f -> new Payload() {
                            @Override
                            public ByteBuffer getData() {
                                ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                                data.putInt(f);
                                data.rewind();
                                return data;
                            }

                            @Override
                            public ByteBuffer getMetadata() {
                                return Frame.NULL_BYTEBUFFER;
                            }
                        });
                }
            })
            .doOnError(Throwable::printStackTrace)
        );

    }

    @Override
    public Publisher<Void> handleFireAndForget(Payload payload) {
        return (Subscriber<? super Void> s) -> {
            ByteBuffer data = payload.getData();
            System.out.println("got " + data.getInt(0));
            s.onComplete();
        };
    }

    @Override
    public Publisher<Payload> handleChannel(Payload initialPayload, Publisher<Payload> inputs) {
        RxReactiveStreams
            .toObservable(inputs)
            .subscribe(new rx.Subscriber<Payload>() {
                @Override
                public void onStart() {
                    request(2);
                }

                @Override
                public void onCompleted() {
                    System.out.println("I'm done!");
                }

                @Override
                public void onError(Throwable e) {
                    e.printStackTrace();
                }

                @Override
                public void onNext(Payload payload) {
                    try {
                        ByteBuffer data = payload.getData();
                        System.out.println("Got from client " + data.getInt(0));
                        int sleep = ThreadLocalRandom.current().nextInt(1000);
                        LockSupport.parkNanos(TimeUnit.MILLISECONDS.toNanos(sleep));
                        request(1);
                    } catch (Throwable t) {
                        t.printStackTrace();
                        onError(t);
                    }
                }
            });

        return RxReactiveStreams.toPublisher(
            Observable.defer(() -> {
                int i = initialPayload.getData().getInt(0);

                if (i % 2 == 0) {
                    System.out.println("Sending evenings...");

                    return Observable
                        .range(0, Integer.MAX_VALUE, Schedulers.computation())
                        .filter(f -> f % 2 == 0)
                        .map(f -> new Payload() {
                            @Override
                            public ByteBuffer getData() {
                                ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                                data.putInt(f);
                                data.rewind();
                                return data;
                            }

                            @Override
                            public ByteBuffer getMetadata() {
                                return Frame.NULL_BYTEBUFFER;
                            }
                        });
                } else {
                    System.out.println("Sending odds...");

                    return Observable
                        .range(0, Integer.MAX_VALUE, Schedulers.computation())
                        .filter(f -> f % 2 != 0)
                        .map(f -> new Payload() {
                            @Override
                            public ByteBuffer getData() {
                                ByteBuffer data = ByteBuffer.allocate(BitUtil.SIZE_OF_INT);
                                data.putInt(f);
                                data.rewind();
                                return data;
                            }

                            @Override
                            public ByteBuffer getMetadata() {
                                return Frame.NULL_BYTEBUFFER;
                            }
                        });
                }
            })
            .doOnError(Throwable::printStackTrace)
        );

    }

    @Override
    public Publisher<Void> handleMetadataPush(Payload payload) {
        return null;
    }
}
