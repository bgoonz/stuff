import { __assign } from "tslib";
import { SENSITIVE_STRING } from "@aws-sdk/smithy-client";
export var ReplicaRegionType;
(function (ReplicaRegionType) {
    /**
     * @internal
     */
    ReplicaRegionType.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ReplicaRegionType || (ReplicaRegionType = {}));
export var CancelRotateSecretRequest;
(function (CancelRotateSecretRequest) {
    /**
     * @internal
     */
    CancelRotateSecretRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(CancelRotateSecretRequest || (CancelRotateSecretRequest = {}));
export var CancelRotateSecretResponse;
(function (CancelRotateSecretResponse) {
    /**
     * @internal
     */
    CancelRotateSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(CancelRotateSecretResponse || (CancelRotateSecretResponse = {}));
export var InternalServiceError;
(function (InternalServiceError) {
    /**
     * @internal
     */
    InternalServiceError.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(InternalServiceError || (InternalServiceError = {}));
export var InvalidParameterException;
(function (InvalidParameterException) {
    /**
     * @internal
     */
    InvalidParameterException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(InvalidParameterException || (InvalidParameterException = {}));
export var InvalidRequestException;
(function (InvalidRequestException) {
    /**
     * @internal
     */
    InvalidRequestException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(InvalidRequestException || (InvalidRequestException = {}));
export var ResourceNotFoundException;
(function (ResourceNotFoundException) {
    /**
     * @internal
     */
    ResourceNotFoundException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ResourceNotFoundException || (ResourceNotFoundException = {}));
export var Tag;
(function (Tag) {
    /**
     * @internal
     */
    Tag.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(Tag || (Tag = {}));
export var CreateSecretRequest;
(function (CreateSecretRequest) {
    /**
     * @internal
     */
    CreateSecretRequest.filterSensitiveLog = function (obj) { return (__assign(__assign(__assign({}, obj), (obj.SecretBinary && { SecretBinary: SENSITIVE_STRING })), (obj.SecretString && { SecretString: SENSITIVE_STRING }))); };
})(CreateSecretRequest || (CreateSecretRequest = {}));
export var StatusType;
(function (StatusType) {
    StatusType["Failed"] = "Failed";
    StatusType["InProgress"] = "InProgress";
    StatusType["InSync"] = "InSync";
})(StatusType || (StatusType = {}));
export var ReplicationStatusType;
(function (ReplicationStatusType) {
    /**
     * @internal
     */
    ReplicationStatusType.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ReplicationStatusType || (ReplicationStatusType = {}));
export var CreateSecretResponse;
(function (CreateSecretResponse) {
    /**
     * @internal
     */
    CreateSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(CreateSecretResponse || (CreateSecretResponse = {}));
export var EncryptionFailure;
(function (EncryptionFailure) {
    /**
     * @internal
     */
    EncryptionFailure.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(EncryptionFailure || (EncryptionFailure = {}));
export var LimitExceededException;
(function (LimitExceededException) {
    /**
     * @internal
     */
    LimitExceededException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(LimitExceededException || (LimitExceededException = {}));
export var MalformedPolicyDocumentException;
(function (MalformedPolicyDocumentException) {
    /**
     * @internal
     */
    MalformedPolicyDocumentException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(MalformedPolicyDocumentException || (MalformedPolicyDocumentException = {}));
export var PreconditionNotMetException;
(function (PreconditionNotMetException) {
    /**
     * @internal
     */
    PreconditionNotMetException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(PreconditionNotMetException || (PreconditionNotMetException = {}));
export var ResourceExistsException;
(function (ResourceExistsException) {
    /**
     * @internal
     */
    ResourceExistsException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ResourceExistsException || (ResourceExistsException = {}));
export var DecryptionFailure;
(function (DecryptionFailure) {
    /**
     * @internal
     */
    DecryptionFailure.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DecryptionFailure || (DecryptionFailure = {}));
export var DeleteResourcePolicyRequest;
(function (DeleteResourcePolicyRequest) {
    /**
     * @internal
     */
    DeleteResourcePolicyRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DeleteResourcePolicyRequest || (DeleteResourcePolicyRequest = {}));
export var DeleteResourcePolicyResponse;
(function (DeleteResourcePolicyResponse) {
    /**
     * @internal
     */
    DeleteResourcePolicyResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DeleteResourcePolicyResponse || (DeleteResourcePolicyResponse = {}));
export var DeleteSecretRequest;
(function (DeleteSecretRequest) {
    /**
     * @internal
     */
    DeleteSecretRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DeleteSecretRequest || (DeleteSecretRequest = {}));
export var DeleteSecretResponse;
(function (DeleteSecretResponse) {
    /**
     * @internal
     */
    DeleteSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DeleteSecretResponse || (DeleteSecretResponse = {}));
export var DescribeSecretRequest;
(function (DescribeSecretRequest) {
    /**
     * @internal
     */
    DescribeSecretRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DescribeSecretRequest || (DescribeSecretRequest = {}));
export var RotationRulesType;
(function (RotationRulesType) {
    /**
     * @internal
     */
    RotationRulesType.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RotationRulesType || (RotationRulesType = {}));
export var DescribeSecretResponse;
(function (DescribeSecretResponse) {
    /**
     * @internal
     */
    DescribeSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(DescribeSecretResponse || (DescribeSecretResponse = {}));
export var Filter;
(function (Filter) {
    /**
     * @internal
     */
    Filter.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(Filter || (Filter = {}));
export var GetRandomPasswordRequest;
(function (GetRandomPasswordRequest) {
    /**
     * @internal
     */
    GetRandomPasswordRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(GetRandomPasswordRequest || (GetRandomPasswordRequest = {}));
export var GetRandomPasswordResponse;
(function (GetRandomPasswordResponse) {
    /**
     * @internal
     */
    GetRandomPasswordResponse.filterSensitiveLog = function (obj) { return (__assign(__assign({}, obj), (obj.RandomPassword && { RandomPassword: SENSITIVE_STRING }))); };
})(GetRandomPasswordResponse || (GetRandomPasswordResponse = {}));
export var GetResourcePolicyRequest;
(function (GetResourcePolicyRequest) {
    /**
     * @internal
     */
    GetResourcePolicyRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(GetResourcePolicyRequest || (GetResourcePolicyRequest = {}));
export var GetResourcePolicyResponse;
(function (GetResourcePolicyResponse) {
    /**
     * @internal
     */
    GetResourcePolicyResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(GetResourcePolicyResponse || (GetResourcePolicyResponse = {}));
export var GetSecretValueRequest;
(function (GetSecretValueRequest) {
    /**
     * @internal
     */
    GetSecretValueRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(GetSecretValueRequest || (GetSecretValueRequest = {}));
export var GetSecretValueResponse;
(function (GetSecretValueResponse) {
    /**
     * @internal
     */
    GetSecretValueResponse.filterSensitiveLog = function (obj) { return (__assign(__assign(__assign({}, obj), (obj.SecretBinary && { SecretBinary: SENSITIVE_STRING })), (obj.SecretString && { SecretString: SENSITIVE_STRING }))); };
})(GetSecretValueResponse || (GetSecretValueResponse = {}));
export var InvalidNextTokenException;
(function (InvalidNextTokenException) {
    /**
     * @internal
     */
    InvalidNextTokenException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(InvalidNextTokenException || (InvalidNextTokenException = {}));
export var SortOrderType;
(function (SortOrderType) {
    SortOrderType["asc"] = "asc";
    SortOrderType["desc"] = "desc";
})(SortOrderType || (SortOrderType = {}));
export var ListSecretsRequest;
(function (ListSecretsRequest) {
    /**
     * @internal
     */
    ListSecretsRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ListSecretsRequest || (ListSecretsRequest = {}));
export var SecretListEntry;
(function (SecretListEntry) {
    /**
     * @internal
     */
    SecretListEntry.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(SecretListEntry || (SecretListEntry = {}));
export var ListSecretsResponse;
(function (ListSecretsResponse) {
    /**
     * @internal
     */
    ListSecretsResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ListSecretsResponse || (ListSecretsResponse = {}));
export var ListSecretVersionIdsRequest;
(function (ListSecretVersionIdsRequest) {
    /**
     * @internal
     */
    ListSecretVersionIdsRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ListSecretVersionIdsRequest || (ListSecretVersionIdsRequest = {}));
export var SecretVersionsListEntry;
(function (SecretVersionsListEntry) {
    /**
     * @internal
     */
    SecretVersionsListEntry.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(SecretVersionsListEntry || (SecretVersionsListEntry = {}));
export var ListSecretVersionIdsResponse;
(function (ListSecretVersionIdsResponse) {
    /**
     * @internal
     */
    ListSecretVersionIdsResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ListSecretVersionIdsResponse || (ListSecretVersionIdsResponse = {}));
export var PublicPolicyException;
(function (PublicPolicyException) {
    /**
     * @internal
     */
    PublicPolicyException.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(PublicPolicyException || (PublicPolicyException = {}));
export var PutResourcePolicyRequest;
(function (PutResourcePolicyRequest) {
    /**
     * @internal
     */
    PutResourcePolicyRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(PutResourcePolicyRequest || (PutResourcePolicyRequest = {}));
export var PutResourcePolicyResponse;
(function (PutResourcePolicyResponse) {
    /**
     * @internal
     */
    PutResourcePolicyResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(PutResourcePolicyResponse || (PutResourcePolicyResponse = {}));
export var PutSecretValueRequest;
(function (PutSecretValueRequest) {
    /**
     * @internal
     */
    PutSecretValueRequest.filterSensitiveLog = function (obj) { return (__assign(__assign(__assign({}, obj), (obj.SecretBinary && { SecretBinary: SENSITIVE_STRING })), (obj.SecretString && { SecretString: SENSITIVE_STRING }))); };
})(PutSecretValueRequest || (PutSecretValueRequest = {}));
export var PutSecretValueResponse;
(function (PutSecretValueResponse) {
    /**
     * @internal
     */
    PutSecretValueResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(PutSecretValueResponse || (PutSecretValueResponse = {}));
export var RemoveRegionsFromReplicationRequest;
(function (RemoveRegionsFromReplicationRequest) {
    /**
     * @internal
     */
    RemoveRegionsFromReplicationRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RemoveRegionsFromReplicationRequest || (RemoveRegionsFromReplicationRequest = {}));
export var RemoveRegionsFromReplicationResponse;
(function (RemoveRegionsFromReplicationResponse) {
    /**
     * @internal
     */
    RemoveRegionsFromReplicationResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RemoveRegionsFromReplicationResponse || (RemoveRegionsFromReplicationResponse = {}));
export var ReplicateSecretToRegionsRequest;
(function (ReplicateSecretToRegionsRequest) {
    /**
     * @internal
     */
    ReplicateSecretToRegionsRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ReplicateSecretToRegionsRequest || (ReplicateSecretToRegionsRequest = {}));
export var ReplicateSecretToRegionsResponse;
(function (ReplicateSecretToRegionsResponse) {
    /**
     * @internal
     */
    ReplicateSecretToRegionsResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ReplicateSecretToRegionsResponse || (ReplicateSecretToRegionsResponse = {}));
export var RestoreSecretRequest;
(function (RestoreSecretRequest) {
    /**
     * @internal
     */
    RestoreSecretRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RestoreSecretRequest || (RestoreSecretRequest = {}));
export var RestoreSecretResponse;
(function (RestoreSecretResponse) {
    /**
     * @internal
     */
    RestoreSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RestoreSecretResponse || (RestoreSecretResponse = {}));
export var RotateSecretRequest;
(function (RotateSecretRequest) {
    /**
     * @internal
     */
    RotateSecretRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RotateSecretRequest || (RotateSecretRequest = {}));
export var RotateSecretResponse;
(function (RotateSecretResponse) {
    /**
     * @internal
     */
    RotateSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(RotateSecretResponse || (RotateSecretResponse = {}));
export var StopReplicationToReplicaRequest;
(function (StopReplicationToReplicaRequest) {
    /**
     * @internal
     */
    StopReplicationToReplicaRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(StopReplicationToReplicaRequest || (StopReplicationToReplicaRequest = {}));
export var StopReplicationToReplicaResponse;
(function (StopReplicationToReplicaResponse) {
    /**
     * @internal
     */
    StopReplicationToReplicaResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(StopReplicationToReplicaResponse || (StopReplicationToReplicaResponse = {}));
export var TagResourceRequest;
(function (TagResourceRequest) {
    /**
     * @internal
     */
    TagResourceRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(TagResourceRequest || (TagResourceRequest = {}));
export var UntagResourceRequest;
(function (UntagResourceRequest) {
    /**
     * @internal
     */
    UntagResourceRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(UntagResourceRequest || (UntagResourceRequest = {}));
export var UpdateSecretRequest;
(function (UpdateSecretRequest) {
    /**
     * @internal
     */
    UpdateSecretRequest.filterSensitiveLog = function (obj) { return (__assign(__assign(__assign({}, obj), (obj.SecretBinary && { SecretBinary: SENSITIVE_STRING })), (obj.SecretString && { SecretString: SENSITIVE_STRING }))); };
})(UpdateSecretRequest || (UpdateSecretRequest = {}));
export var UpdateSecretResponse;
(function (UpdateSecretResponse) {
    /**
     * @internal
     */
    UpdateSecretResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(UpdateSecretResponse || (UpdateSecretResponse = {}));
export var UpdateSecretVersionStageRequest;
(function (UpdateSecretVersionStageRequest) {
    /**
     * @internal
     */
    UpdateSecretVersionStageRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(UpdateSecretVersionStageRequest || (UpdateSecretVersionStageRequest = {}));
export var UpdateSecretVersionStageResponse;
(function (UpdateSecretVersionStageResponse) {
    /**
     * @internal
     */
    UpdateSecretVersionStageResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(UpdateSecretVersionStageResponse || (UpdateSecretVersionStageResponse = {}));
export var ValidateResourcePolicyRequest;
(function (ValidateResourcePolicyRequest) {
    /**
     * @internal
     */
    ValidateResourcePolicyRequest.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ValidateResourcePolicyRequest || (ValidateResourcePolicyRequest = {}));
export var ValidationErrorsEntry;
(function (ValidationErrorsEntry) {
    /**
     * @internal
     */
    ValidationErrorsEntry.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ValidationErrorsEntry || (ValidationErrorsEntry = {}));
export var ValidateResourcePolicyResponse;
(function (ValidateResourcePolicyResponse) {
    /**
     * @internal
     */
    ValidateResourcePolicyResponse.filterSensitiveLog = function (obj) { return (__assign({}, obj)); };
})(ValidateResourcePolicyResponse || (ValidateResourcePolicyResponse = {}));
//# sourceMappingURL=models_0.js.map