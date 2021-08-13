package com.newrelic.util;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.http.ContentTooLongException;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.BasicClientConnectionManager;

/**
 * A PageEvent consumer whose responsibility is to forward events to the
 * KissMetrics service.
 * 
 * See {@link http://support.kissmetrics.com/apis/specifications} for more info.
 * 
 * @author bill
 * 
 */
public final class KissMetricsService {

	private final String HOST = "http://trk.kissmetrics.com:80";
	private final DefaultHttpClient httpClient;

	public KissMetricsService() {
		httpClient = new DefaultHttpClient(new BasicClientConnectionManager());
	}

	/**
	 * Send the event directly to KM via web HEAD request, or log to a file
	 * depending on the operating mode.
	 * 
	 * @param uri
	 * @throws URISyntaxException 
	 * @throws IOException
	 * @throws ClientProtocolException
	 */
	protected void consumeOneEvent(String event) throws URISyntaxException, ClientProtocolException, IOException {
		URI uri = new URI(HOST + event);
		HttpHead headRequest = new HttpHead(uri);
		HttpResponse execute = httpClient.execute(headRequest);
		if (execute.getEntity() != null)
			throw new ContentTooLongException(
					"Expected no entity in response but got one anyway!");
	}

}
