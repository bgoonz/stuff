// Copyright (c) 2013 Spotify AB
package com.spotify.lkk;

import static junit.framework.Assert.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Type;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.google.gson.reflect.TypeToken;
import com.spotify.lkk.http.HttpDriver;
import com.spotify.lkk.http.HttpDriverException;
import com.spotify.lkk.http.HttpMethod;
import com.spotify.lkk.types.Board;
import com.spotify.lkk.types.BoardIdentifier;
import com.spotify.lkk.types.ReplyData;

public class TestDefaultLeanKitKanbanApi {
    final int boardId = 42;
    HttpDriver driver;
    DefaultLeanKitKanbanApi api;

    @Before
    public void setup() {
        driver = mock(HttpDriver.class);
        api = new DefaultLeanKitKanbanApi(driver);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testGetBoardIdentifiers() throws ApiException, HttpDriverException {
        final Type expected = new TypeToken<ReplyData<BoardIdentifier>>() {}.getType();
        final String expectedUri = String.format(DefaultLeanKitKanbanApi.BOARD_IDENTIFIERS_URI, boardId);

        final List<BoardIdentifier> replyData = mock(List.class);

        final ReplyData<BoardIdentifier> reply = new ReplyData<BoardIdentifier>();
        reply.setReplyCode(200);
        reply.setReplyData(replyData);
        when(driver.execute(HttpMethod.GET, expectedUri, null, expected)).thenReturn(reply);

        assertEquals(replyData, api.getBoardIdentifiers(boardId));

        verify(driver).execute(HttpMethod.GET, expectedUri, null, expected);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testGetBoards() throws ApiException, HttpDriverException {
        final Type expected = new TypeToken<ReplyData<Board>>() {}.getType();
        final String expectedUri = DefaultLeanKitKanbanApi.BOARDS_URI;

        final List<Board> replyData = mock(List.class);

        final ReplyData<Board> reply = new ReplyData<Board>();
        reply.setReplyCode(200);
        reply.setReplyData(replyData);
        when(driver.execute(HttpMethod.GET, expectedUri, null, expected)).thenReturn(reply);

        assertEquals(replyData, api.getBoards());

        verify(driver).execute(HttpMethod.GET, expectedUri, null, expected);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testGetBoard() throws ApiException, HttpDriverException {
        final Type expected = new TypeToken<ReplyData<Board>>() {}.getType();
        final String expectedUri = String.format(DefaultLeanKitKanbanApi.BOARD_URI, boardId);

        final Board board = new Board();

        final List<Board> replyData = mock(List.class);
        when(replyData.isEmpty()).thenReturn(false);
        when(replyData.get(0)).thenReturn(board);

        ReplyData<Board> reply = new ReplyData<Board>();
        reply.setReplyCode(200);
        reply.setReplyData(replyData);
        when(driver.execute(HttpMethod.GET, expectedUri, null, expected)).thenReturn(reply);

        assertEquals(board, api.getBoard(boardId));

        verify(driver).execute(HttpMethod.GET, expectedUri, null, expected);
    }

    @Test(expected=ApiException.class)
    @SuppressWarnings("unchecked")
    public void testEmptyResultSet() throws ApiException, HttpDriverException {
        final Type expected = new TypeToken<ReplyData<Board>>() {}.getType();
        final String expectedUri = String.format(DefaultLeanKitKanbanApi.BOARD_URI, boardId);

        final Board board = new Board();

        final List<Board> replyData = mock(List.class);
        when(replyData.isEmpty()).thenReturn(true);
        when(replyData.get(0)).thenReturn(board);

        ReplyData<Board> reply = new ReplyData<Board>();
        reply.setReplyCode(200);
        reply.setReplyData(replyData);
        when(driver.execute(HttpMethod.GET, expectedUri, null, expected)).thenReturn(reply);

        assertEquals(board, api.getBoard(boardId));

        verify(driver).execute(HttpMethod.GET, expectedUri, null, expected);
    }
}
