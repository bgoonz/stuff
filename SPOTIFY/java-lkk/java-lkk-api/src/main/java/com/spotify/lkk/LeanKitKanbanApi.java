// Copyright (c) 2013 Spotify AB
package com.spotify.lkk;

import java.util.List;

import com.spotify.lkk.types.AddCardResponse;
import com.spotify.lkk.types.Board;
import com.spotify.lkk.types.BoardIdentifier;
import com.spotify.lkk.types.Card;

public interface LeanKitKanbanApi {
    public AddCardResponse addCard(Card card, int cardTypeId, int boardId, int laneId, int position) throws ApiException;
    public List<BoardIdentifier> getBoardIdentifiers(int boardId) throws ApiException;
    public List<Board> getBoards() throws ApiException;
    public Board getBoard(int boardId) throws ApiException;
}
