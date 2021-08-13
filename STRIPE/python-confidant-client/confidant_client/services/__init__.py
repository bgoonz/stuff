"""Module for accessing services external to Confidant."""

from __future__ import absolute_import
import boto3
import logging

CLIENT_CACHE = {}


def get_boto_client(
        client,
        region=None,
        aws_access_key_id=None,
        aws_secret_access_key=None,
        aws_session_token=None
        ):
    """Get a boto3 client connection."""
    cache_key = '{0}:{1}:{2}'.format(client, region, aws_access_key_id)
    if not aws_session_token:
        if cache_key in CLIENT_CACHE:
            return CLIENT_CACHE[cache_key]
    session = get_boto_session(
        region,
        aws_access_key_id,
        aws_secret_access_key,
        aws_session_token
    )
    if not session:
        logging.error("Failed to get {0} client.".format(client))
        return None

    CLIENT_CACHE[cache_key] = session.client(client)
    return CLIENT_CACHE[cache_key]


def get_boto_session(
        region,
        aws_access_key_id=None,
        aws_secret_access_key=None,
        aws_session_token=None
        ):
    """Get a boto3 session."""
    return boto3.session.Session(
        region_name=region,
        aws_secret_access_key=aws_secret_access_key,
        aws_access_key_id=aws_access_key_id,
        aws_session_token=aws_session_token
    )
