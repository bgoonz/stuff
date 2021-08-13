package org.wikisource;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.apache.cordova.api.LOG;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;

import android.content.pm.PackageManager.NameNotFoundException;

public class ApplicationVersion extends Plugin {
	public JSONObject getVersion() {
		JSONObject info = new JSONObject();
		try {
			info.put("version", ctx.getActivity().getPackageManager().getPackageInfo(ctx.getActivity().getPackageName(), 0).versionName.toString());
		} catch (NameNotFoundException e) {
			LOG.d("error", e.getMessage());
		} catch (JSONException e) {
			LOG.d("error", e.getMessage());
		}

		return info;
	}

	@Override
	public PluginResult execute(String arg0, JSONArray arg1, String arg2) {
		return new PluginResult(Status.OK, getVersion());
	}
}
