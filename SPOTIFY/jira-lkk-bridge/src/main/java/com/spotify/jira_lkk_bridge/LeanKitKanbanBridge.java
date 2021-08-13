// Copyright (c) 2013 Spotify AB
package com.spotify.jira_lkk_bridge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

import com.atlassian.event.api.EventListener;
import com.atlassian.event.api.EventPublisher;
import com.atlassian.jira.event.issue.IssueEvent;
import com.atlassian.jira.event.type.EventType;
import com.atlassian.jira.issue.Issue;
import com.spotify.lkk.ApiException;
import com.spotify.lkk.DefaultLeanKitKanbanApi;
import com.spotify.lkk.client.LeanKitKanbanSimpleClient;
import com.spotify.lkk.client.LeanKitKanbanBoard;
import com.spotify.lkk.http.DefaultHttpDriver;
import com.spotify.lkk.http.HttpDriver;
import com.spotify.lkk.types.Card;

/**
 * A JIRA listener using the atlassian-event library.
 * Used for getting events about issues.
 */
public class LeanKitKanbanBridge implements InitializingBean, DisposableBean {
  private static final Logger log =
      LoggerFactory.getLogger(LeanKitKanbanBridge.class);

  private final EventPublisher eventPublisher;
  private ConfigurationManager configurationManager;

  /**
   * Constructor.
   * @param eventPublisher injected {@code EventPublisher} implementation.
   */
  public LeanKitKanbanBridge(EventPublisher eventPublisher, ConfigurationManager configurationManager) {
    this.eventPublisher = eventPublisher;
    this.configurationManager = configurationManager;
  }

  /**
   * Called when the plugin has been enabled.
   * @throws Exception
   */
  @Override
  public void afterPropertiesSet() throws Exception {
    eventPublisher.register(this);
    log.info("LKK Listener registered");
  }

  /**
   * Called when the plugin is being disabled or removed.
   * @throws Exception
   */
  @Override
  public void destroy() throws Exception {
    eventPublisher.unregister(this);
  }

  /**
   * Receives any {@code IssueEvent}s sent by JIRA.
   * @param issueEvent the IssueEvent passed to us
   */
  @EventListener
  public void onIssueEvent(IssueEvent issueEvent) {
    Long eventTypeId = issueEvent.getEventTypeId();
    Issue issue = issueEvent.getIssue();

    if(issue.getProjectObject().getKey().equals(configurationManager.getProject())) {

      if (eventTypeId.equals(EventType.ISSUE_CREATED_ID)) {
        log.info("Issue {} has been created at {}.", issue.getKey(), issue.getCreated());
        log.info("  Type: {}", issue.getIssueTypeObject().getName());
        log.info("  Summary: {}", issue.getSummary());
        log.info("  Description: {}", issue.getDescription());

        LeanKitKanbanBoard board;
        try {
          board = getBoard();
          if(board != null) {
            Card card = new Card();
            card.setExternalCardId(issue.getKey());
            //card.setExternalSystemName("JIRA");
            //card.setExternalSystemUrl(issue.);
            card.setType(issue.getIssueTypeObject().getName());
            card.setTitle(issue.getSummary());
            card.setDescription(issue.getDescription());

            // Lane should be inferred from issue.getStatus()
            String lane = "ToDo";

            // TODO(max): is onIssueEvent running in a worker thread in jira, or should I thread this call?
            try {
              board.addCard(card, lane, 0);
            } catch(ApiException e) {
              // TODO(max): Retry?
              log.error("lkkClient return exception: {}", e);
            }
          } else {
            log.warn("The LeanKit Kanban Bridge has not been configured yet.");
          }
        } catch (ApiException e) {
          // TODO(max): Report error to user
          log.error("lkkClient couldn't get board: {}", e);
        }
      } else if (eventTypeId.equals(EventType.ISSUE_RESOLVED_ID)) {
        log.info("Issue {} has been resolved at {}.", issue.getKey(), issue.getResolutionDate());
      }
    }
  }

  private LeanKitKanbanBoard getBoard() throws ApiException {
    if(configurationManager.isConfigured()) {
      String server = configurationManager.getServer();
      int port = Integer.parseInt(configurationManager.getPort());
      String username = configurationManager.getUsername();
      String password = configurationManager.getPassword();
      HttpDriver driver = new DefaultHttpDriver(server, port, username, password);
      DefaultLeanKitKanbanApi api = new DefaultLeanKitKanbanApi(driver);
      int boardId = Integer.parseInt(configurationManager.getBoardId());
      LeanKitKanbanSimpleClient client = new LeanKitKanbanSimpleClient(api);
      return client.getBoard(boardId);
    } else {
      return null;
    }
  }
}
