package com.stripe.android.networking

import com.stripe.android.model.StripeJsonUtils

/**
 * A class representing a [FraudDetectionData] request.
 */
internal class FraudDetectionDataRequest(
    override val params: Map<String, Any>,
    guid: String
) : StripeRequest() {
    override val method = Method.POST
    override val baseUrl = URL
    override val mimeType = MimeType.Json
    override val headersFactory = RequestHeadersFactory.FraudDetection(
        guid = guid
    )

    override val body: String
        get() {
            return StripeJsonUtils.mapToJsonObject(params).toString()
        }

    private companion object {
        private const val URL = "https://m.stripe.com/6"
    }
}
