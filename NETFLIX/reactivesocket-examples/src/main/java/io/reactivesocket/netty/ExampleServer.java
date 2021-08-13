package io.reactivesocket.netty;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelOption;
import io.reactivesocket.websocket.rxnetty.server.ReactiveSocketWebSocketServer;
import io.reactivex.netty.protocol.http.server.HttpServer;

public class ExampleServer {
    public static void main(String[] args) {
        ReactiveSocketWebSocketServer serverHandler  = ReactiveSocketWebSocketServer.create(setupPayload -> new ExampleServerHandler());

        HttpServer<ByteBuf, ByteBuf> server = HttpServer.newServer(8888)
            .clientChannelOption(ChannelOption.AUTO_READ, true)
           //.enableWireLogging(LogLevel.ERROR)
            .start((req, resp) -> resp.acceptWebSocketUpgrade(serverHandler::acceptWebsocket));

        server.awaitShutdown();
    }
}
