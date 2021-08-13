// Copyright (c) 2013 Spotify AB
package com.spotify.jira_lkk_bridge;

import com.atlassian.jira.security.xsrf.RequiresXsrfCheck;
import com.atlassian.jira.web.action.JiraWebActionSupport;
import com.atlassian.sal.api.websudo.WebSudoRequired;

@WebSudoRequired
public class Configuration extends JiraWebActionSupport {

    private static final long serialVersionUID = 1L;

    private final ConfigurationManager configurationManager;

    private String project;
    private String boardId;
    private String server;
    private String port;
    private String username;
    private String password;
    private boolean success;

    public Configuration(ConfigurationManager configurationManager) {
        this.configurationManager = configurationManager;
    }

    private String emptyIfNull(String string) {
        if(null == string) return "";
        return string;
    }
    
    public String getProject() {
        return emptyIfNull(configurationManager.getProject());
    }
    
    public void setProject(String project) {
        this.project = project;
    }

    public String getBoardId() {
        return emptyIfNull(configurationManager.getBoardId());
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    public String getServer() {
        return emptyIfNull(configurationManager.getServer());
    }

    public void setServer(String server) {
        this.server = server;
    }

    public String getPort() {
        return emptyIfNull(configurationManager.getPort());
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getUsername() {
        return emptyIfNull(configurationManager.getUsername());
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return emptyIfNull(configurationManager.getPassword());
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    @RequiresXsrfCheck
    protected String doExecute() throws Exception {
        // only change the token if this is a real update
        configurationManager.updateProject(project);
        configurationManager.updateBoardId(boardId);
        configurationManager.updateServer(server);
        configurationManager.updatePort(port);
        configurationManager.updateUsername(username);
        configurationManager.updatePassword(password);
        success = true;
        return SUCCESS;
    }

    public boolean isSuccess() {
        return success;
    }
}
