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

public class LeanKitKanbanSimpleClient {
    private final LeanKitKanbanApi api;

    private boolean updated = false;

    private Map<String, Board> boards = new HashMap<String, Board>();
    private Map<Integer, Board> boardsById = new HashMap<Integer, Board>();

    public LeanKitKanbanSimpleClient(LeanKitKanbanApi api) throws ApiException {
        this.api = api;
    }

    /**
     * Update all board identifiers.
     *
     * @throws ApiException
     */
    public void update() throws ApiException {
        for (Board board : api.getBoards()) {
            this.boards.put(board.getTitle(), board);
            this.boardsById.put(board.getId(), board);
        }

        this.updated = true;
    }

    public LeanKitKanbanBoard getBoard(String boardName) throws ApiException {
        if (!updated) {
            throw new ApiException("Not updated, run update() at least once");
        }

        final Board board = boards.get(boardName);

        if (board == null) {
            throw new IllegalArgumentException("no board named: " + board
                    + " from " + boards);
        }

        return new LeanKitKanbanBoard(api, board);
    }

    public LeanKitKanbanBoard getBoard(int boardId) throws ApiException {
        final Board board = api.getBoard(boardId);
        return new LeanKitKanbanBoard(api, board);
    }
}
