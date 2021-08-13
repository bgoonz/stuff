// Copyright (c) 2013 Spotify AB
package com.spotify.lkk;

import java.lang.reflect.Type;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.reflect.TypeToken;
import com.spotify.lkk.http.HttpDriver;
import com.spotify.lkk.http.HttpDriverException;
import com.spotify.lkk.http.HttpMethod;
import com.spotify.lkk.types.AddCardRequest;
import com.spotify.lkk.types.AddCardResponse;
import com.spotify.lkk.types.Board;
import com.spotify.lkk.types.BoardIdentifier;
import com.spotify.lkk.types.Card;
import com.spotify.lkk.types.ReplyData;

public class DefaultLeanKitKanbanApi implements LeanKitKanbanApi {
    final HttpDriver driver;

    final public static String ADD_CARD_URI = "/Kanban/Api/Board/%d/AddCard/Lane/%d/Position/%d";
    final public static String BOARD_IDENTIFIERS_URI = "/Kanban/Api/Board/%d/GetBoardIdentifiers";
    final public static String BOARDS_URI = "/Kanban/Api/Boards";
    final public static String BOARD_URI = "/Kanban/Api/Boards/%d";

    public DefaultLeanKitKanbanApi(HttpDriver driver) {
        this.driver = driver;
    }

    @SuppressWarnings("unchecked")
    private <T,R> List<T> execute(HttpMethod method, String uri, R entity, Type expected) throws ApiException {
        final ReplyData<T> reply;

        try {
            reply = (ReplyData<T>)this.driver.execute(method, uri, entity, expected);
        } catch (HttpDriverException e) {
            throw new ApiException(e);
        }

        if (reply.getReplyCode() / 100 != 2) {
            throw new ApiRemoteException(reply.getReplyCode(), reply.getReplyText());
        }

        return reply.getReplyData();
    }

    private <T> List<T> get(String uri, Type expected) throws ApiException {
        return execute(HttpMethod.GET, uri, null, expected);
    }

    private <T, R> List<T> post(String uri, R entity, Type expected) throws ApiException {
        return execute(HttpMethod.POST, uri, entity, expected);
    }

    @Override
    public AddCardResponse addCard(Card card, int cardTypeId, int boardId, int laneId, int position) throws ApiException {
        final String uri = String.format(ADD_CARD_URI, boardId, laneId, position);

        final AddCardRequest addCard = new AddCardRequest();

        addCard.setTitle(card.getTitle());
        addCard.setDescription(card.getDescription());
        addCard.setTypeId(cardTypeId);
        addCard.setPriority(card.getPriority());
        addCard.setSize(card.getSize());
        addCard.setIsBlocked(false);
        addCard.setBlockReason(null);
        addCard.setDueDate(null);
        addCard.setExternalSystemName(card.getExternalSystemName());
        addCard.setExternalSystemUrl(card.getExternalSystemUrl());
        addCard.setExternalCardID(card.getExternalCardId());
        addCard.setTags(StringUtils.join(card.getTags(), ","));
        addCard.setClassOfServiceId(0);
        addCard.setAssignedUserIds(null);

        final Type expected = new TypeToken<ReplyData<AddCardResponse>>(){}.getType();
        final List<AddCardResponse> response = post(uri, addCard, expected);

        return response.get(0);
    }

    @Override
    public List<BoardIdentifier> getBoardIdentifiers(int boardId) throws ApiException {
        final String uri = String.format(BOARD_IDENTIFIERS_URI, boardId);
        final Type expected = new TypeToken<ReplyData<BoardIdentifier>>() {}.getType();
        return get(uri, expected);
    }

    @Override
    public List<Board> getBoards() throws ApiException {
        final String uri = BOARDS_URI;
        final Type expected = new TypeToken<ReplyData<Board>>() {}.getType();
        return get(uri, expected);
    }

    @Override
    public Board getBoard(int boardId) throws ApiException {
        final String uri = String.format(BOARD_URI, boardId);
        final Type expected = new TypeToken<ReplyData<Board>>() {}.getType();
        List<Board> boards = get(uri, expected);

        if (boards.isEmpty()) {
            throw new ApiException("Could not find a board with id: " + boardId);
        }

        return boards.get(0);
    }
}
