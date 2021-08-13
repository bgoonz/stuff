from __future__ import absolute_import
import base64

import confidant_client.services


def decrypt_datakey(data_key, encryption_context=None, client=None):
    '''
    Decrypt a datakey.
    '''
    if not client:
        client = confidant_client.services.get_boto_client('kms')
    return client.decrypt(
        CiphertextBlob=data_key,
        EncryptionContext=encryption_context
    )['Plaintext']


def create_datakey(encryption_context, keyid, client=None):
    '''
    Create a datakey from KMS.
    '''
    if not client:
        client = confidant_client.services.get_boto_client('kms')
    # Fernet key; from spec and cryptography implementation, but using
    # random from KMS, rather than os.urandom:
    #   https://github.com/fernet/spec/blob/master/Spec.md#key-format
    #   https://cryptography.io/en/latest/_modules/cryptography/fernet/#Fernet.generate_key
    key = base64.urlsafe_b64encode(
        client.generate_random(NumberOfBytes=32)['Plaintext']
    )
    response = client.encrypt(
        KeyId='{0}'.format(keyid),
        Plaintext=key,
        EncryptionContext=encryption_context

    )
    return {'ciphertext': response['CiphertextBlob'],
            'plaintext': key}
