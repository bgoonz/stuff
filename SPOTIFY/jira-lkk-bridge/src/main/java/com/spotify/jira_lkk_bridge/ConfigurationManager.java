// Copyright (c) 2013 Spotify AB
package com.spotify.jira_lkk_bridge;

import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;

public class ConfigurationManager {
    private static final String PLUGIN_STORAGE_KEY = "com.spotify.jira-lkk-bridge";
    private static final String PROJECT = "project";
    private static final String BOARD_ID = "board-id";
    private static final String SERVER = "server";
    private static final String PORT = "port";
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";

    private final PluginSettings pluginSettings;

    public ConfigurationManager(PluginSettingsFactory pluginSettingsFactory) {
        pluginSettings = pluginSettingsFactory.createSettingsForKey(PLUGIN_STORAGE_KEY);
    }

    /**
     * Check if all required fields are set.
     * @return true if all fields are set.
     */
    public boolean isConfigured() {
      return getProject() != null &&
          getBoardId() != null &&
          getServer() != null &&
          getPort() != null &&
          getUsername() != null &&
          getPassword() != null;
    }

    public String getProject() {
        return (String)pluginSettings.get(PROJECT);
    }

    public void updateProject(String project) {
        this.pluginSettings.put(PROJECT, project);
    }

    public String getBoardId() {
        return (String) this.pluginSettings.get(BOARD_ID);
    }

    public void updateBoardId(String boardId) {
        this.pluginSettings.put(BOARD_ID, boardId);
    }

    public String getServer() {
        return (String) this.pluginSettings.get(SERVER);
    }

    public void updateServer(String server) {
        this.pluginSettings.put(SERVER, server);
    }

    public String getPort() {
        return (String) this.pluginSettings.get(PORT);
    }

    public void updatePort(String port) {
        this.pluginSettings.put(PORT, port);
    }

    public String getUsername() {
        return (String) this.pluginSettings.get(USERNAME);
    }

    public void updateUsername(String username) {
        this.pluginSettings.put(USERNAME, username);
    }

    public String getPassword() {
        return (String) this.pluginSettings.get(PASSWORD);
    }

    public void updatePassword(String password) {
        this.pluginSettings.put(PASSWORD, password);
    }
}
