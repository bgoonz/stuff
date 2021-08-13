// Copyright (c) 2013 Spotify AB
package com.spotify.lkk.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.spotify.lkk.ApiException;
import com.spotify.lkk.LeanKitKanbanApi;
import com.spotify.lkk.types.Board;
import com.spotify.lkk.types.BoardIdentifier;
import com.spotify.lkk.types.Card;
import com.spotify.lkk.types.IdName;

public class LeanKitKanbanBoard {
    private final Board board;
    private final LeanKitKanbanApi api;

    private boolean updated = false;

    private Map<String, Integer> cardTypes = new HashMap<String, Integer>();
    private Map<String, Integer> lanes = new HashMap<String, Integer>();

    public LeanKitKanbanBoard(LeanKitKanbanApi api, Board board) throws ApiException {
        this.api = api;
        this.board = board;
        update();
    }

    /**
     * Update all board identifiers.
     *
     * @throws ApiException
     */
    public void update() throws ApiException {
        List<BoardIdentifier> identifiers = this.api.getBoardIdentifiers(board.getId());

        for (BoardIdentifier identifier : identifiers) {
            for (IdName value : identifier.getCardTypes()) {
                cardTypes.put(value.getName(), value.getId());
            }

            for (IdName value : identifier.getLanes()) {
                lanes.put(value.getName(), value.getId());
            }
        }

        this.updated = true;
    }

    public void addCard(Card card, String lane, int position) throws ApiException {
        if (!updated) {
            throw new ApiException("Not updated, run update() at least once");
        }

        final Integer cardTypeId = cardTypes.get(card.getType());
        final Integer laneId = lanes.get(lane);

        if (cardTypeId == null) {
            throw new IllegalArgumentException("no such card type: " + card.getType()
                    + " from " + cardTypes);
        }

        if (laneId == null) {
            throw new IllegalArgumentException("no such lane: " + lane
                    + " from " + lanes);
        }

        this.api.addCard(card, cardTypeId, board.getId(), laneId, position);
    }
}
