"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreSecretRequest = exports.ReplicateSecretToRegionsResponse = exports.ReplicateSecretToRegionsRequest = exports.RemoveRegionsFromReplicationResponse = exports.RemoveRegionsFromReplicationRequest = exports.PutSecretValueResponse = exports.PutSecretValueRequest = exports.PutResourcePolicyResponse = exports.PutResourcePolicyRequest = exports.PublicPolicyException = exports.ListSecretVersionIdsResponse = exports.SecretVersionsListEntry = exports.ListSecretVersionIdsRequest = exports.ListSecretsResponse = exports.SecretListEntry = exports.ListSecretsRequest = exports.SortOrderType = exports.InvalidNextTokenException = exports.GetSecretValueResponse = exports.GetSecretValueRequest = exports.GetResourcePolicyResponse = exports.GetResourcePolicyRequest = exports.GetRandomPasswordResponse = exports.GetRandomPasswordRequest = exports.Filter = exports.DescribeSecretResponse = exports.RotationRulesType = exports.DescribeSecretRequest = exports.DeleteSecretResponse = exports.DeleteSecretRequest = exports.DeleteResourcePolicyResponse = exports.DeleteResourcePolicyRequest = exports.DecryptionFailure = exports.ResourceExistsException = exports.PreconditionNotMetException = exports.MalformedPolicyDocumentException = exports.LimitExceededException = exports.EncryptionFailure = exports.CreateSecretResponse = exports.ReplicationStatusType = exports.StatusType = exports.CreateSecretRequest = exports.Tag = exports.ResourceNotFoundException = exports.InvalidRequestException = exports.InvalidParameterException = exports.InternalServiceError = exports.CancelRotateSecretResponse = exports.CancelRotateSecretRequest = exports.ReplicaRegionType = void 0;
exports.ValidateResourcePolicyResponse = exports.ValidationErrorsEntry = exports.ValidateResourcePolicyRequest = exports.UpdateSecretVersionStageResponse = exports.UpdateSecretVersionStageRequest = exports.UpdateSecretResponse = exports.UpdateSecretRequest = exports.UntagResourceRequest = exports.TagResourceRequest = exports.StopReplicationToReplicaResponse = exports.StopReplicationToReplicaRequest = exports.RotateSecretResponse = exports.RotateSecretRequest = exports.RestoreSecretResponse = void 0;
const smithy_client_1 = require("@aws-sdk/smithy-client");
var ReplicaRegionType;
(function (ReplicaRegionType) {
    /**
     * @internal
     */
    ReplicaRegionType.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ReplicaRegionType = exports.ReplicaRegionType || (exports.ReplicaRegionType = {}));
var CancelRotateSecretRequest;
(function (CancelRotateSecretRequest) {
    /**
     * @internal
     */
    CancelRotateSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(CancelRotateSecretRequest = exports.CancelRotateSecretRequest || (exports.CancelRotateSecretRequest = {}));
var CancelRotateSecretResponse;
(function (CancelRotateSecretResponse) {
    /**
     * @internal
     */
    CancelRotateSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(CancelRotateSecretResponse = exports.CancelRotateSecretResponse || (exports.CancelRotateSecretResponse = {}));
var InternalServiceError;
(function (InternalServiceError) {
    /**
     * @internal
     */
    InternalServiceError.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InternalServiceError = exports.InternalServiceError || (exports.InternalServiceError = {}));
var InvalidParameterException;
(function (InvalidParameterException) {
    /**
     * @internal
     */
    InvalidParameterException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InvalidParameterException = exports.InvalidParameterException || (exports.InvalidParameterException = {}));
var InvalidRequestException;
(function (InvalidRequestException) {
    /**
     * @internal
     */
    InvalidRequestException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InvalidRequestException = exports.InvalidRequestException || (exports.InvalidRequestException = {}));
var ResourceNotFoundException;
(function (ResourceNotFoundException) {
    /**
     * @internal
     */
    ResourceNotFoundException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ResourceNotFoundException = exports.ResourceNotFoundException || (exports.ResourceNotFoundException = {}));
var Tag;
(function (Tag) {
    /**
     * @internal
     */
    Tag.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(Tag = exports.Tag || (exports.Tag = {}));
var CreateSecretRequest;
(function (CreateSecretRequest) {
    /**
     * @internal
     */
    CreateSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
        ...(obj.SecretBinary && { SecretBinary: smithy_client_1.SENSITIVE_STRING }),
        ...(obj.SecretString && { SecretString: smithy_client_1.SENSITIVE_STRING }),
    });
})(CreateSecretRequest = exports.CreateSecretRequest || (exports.CreateSecretRequest = {}));
var StatusType;
(function (StatusType) {
    StatusType["Failed"] = "Failed";
    StatusType["InProgress"] = "InProgress";
    StatusType["InSync"] = "InSync";
})(StatusType = exports.StatusType || (exports.StatusType = {}));
var ReplicationStatusType;
(function (ReplicationStatusType) {
    /**
     * @internal
     */
    ReplicationStatusType.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ReplicationStatusType = exports.ReplicationStatusType || (exports.ReplicationStatusType = {}));
var CreateSecretResponse;
(function (CreateSecretResponse) {
    /**
     * @internal
     */
    CreateSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(CreateSecretResponse = exports.CreateSecretResponse || (exports.CreateSecretResponse = {}));
var EncryptionFailure;
(function (EncryptionFailure) {
    /**
     * @internal
     */
    EncryptionFailure.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(EncryptionFailure = exports.EncryptionFailure || (exports.EncryptionFailure = {}));
var LimitExceededException;
(function (LimitExceededException) {
    /**
     * @internal
     */
    LimitExceededException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(LimitExceededException = exports.LimitExceededException || (exports.LimitExceededException = {}));
var MalformedPolicyDocumentException;
(function (MalformedPolicyDocumentException) {
    /**
     * @internal
     */
    MalformedPolicyDocumentException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(MalformedPolicyDocumentException = exports.MalformedPolicyDocumentException || (exports.MalformedPolicyDocumentException = {}));
var PreconditionNotMetException;
(function (PreconditionNotMetException) {
    /**
     * @internal
     */
    PreconditionNotMetException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PreconditionNotMetException = exports.PreconditionNotMetException || (exports.PreconditionNotMetException = {}));
var ResourceExistsException;
(function (ResourceExistsException) {
    /**
     * @internal
     */
    ResourceExistsException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ResourceExistsException = exports.ResourceExistsException || (exports.ResourceExistsException = {}));
var DecryptionFailure;
(function (DecryptionFailure) {
    /**
     * @internal
     */
    DecryptionFailure.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DecryptionFailure = exports.DecryptionFailure || (exports.DecryptionFailure = {}));
var DeleteResourcePolicyRequest;
(function (DeleteResourcePolicyRequest) {
    /**
     * @internal
     */
    DeleteResourcePolicyRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DeleteResourcePolicyRequest = exports.DeleteResourcePolicyRequest || (exports.DeleteResourcePolicyRequest = {}));
var DeleteResourcePolicyResponse;
(function (DeleteResourcePolicyResponse) {
    /**
     * @internal
     */
    DeleteResourcePolicyResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DeleteResourcePolicyResponse = exports.DeleteResourcePolicyResponse || (exports.DeleteResourcePolicyResponse = {}));
var DeleteSecretRequest;
(function (DeleteSecretRequest) {
    /**
     * @internal
     */
    DeleteSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DeleteSecretRequest = exports.DeleteSecretRequest || (exports.DeleteSecretRequest = {}));
var DeleteSecretResponse;
(function (DeleteSecretResponse) {
    /**
     * @internal
     */
    DeleteSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DeleteSecretResponse = exports.DeleteSecretResponse || (exports.DeleteSecretResponse = {}));
var DescribeSecretRequest;
(function (DescribeSecretRequest) {
    /**
     * @internal
     */
    DescribeSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DescribeSecretRequest = exports.DescribeSecretRequest || (exports.DescribeSecretRequest = {}));
var RotationRulesType;
(function (RotationRulesType) {
    /**
     * @internal
     */
    RotationRulesType.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RotationRulesType = exports.RotationRulesType || (exports.RotationRulesType = {}));
var DescribeSecretResponse;
(function (DescribeSecretResponse) {
    /**
     * @internal
     */
    DescribeSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(DescribeSecretResponse = exports.DescribeSecretResponse || (exports.DescribeSecretResponse = {}));
var Filter;
(function (Filter) {
    /**
     * @internal
     */
    Filter.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(Filter = exports.Filter || (exports.Filter = {}));
var GetRandomPasswordRequest;
(function (GetRandomPasswordRequest) {
    /**
     * @internal
     */
    GetRandomPasswordRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetRandomPasswordRequest = exports.GetRandomPasswordRequest || (exports.GetRandomPasswordRequest = {}));
var GetRandomPasswordResponse;
(function (GetRandomPasswordResponse) {
    /**
     * @internal
     */
    GetRandomPasswordResponse.filterSensitiveLog = (obj) => ({
        ...obj,
        ...(obj.RandomPassword && { RandomPassword: smithy_client_1.SENSITIVE_STRING }),
    });
})(GetRandomPasswordResponse = exports.GetRandomPasswordResponse || (exports.GetRandomPasswordResponse = {}));
var GetResourcePolicyRequest;
(function (GetResourcePolicyRequest) {
    /**
     * @internal
     */
    GetResourcePolicyRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetResourcePolicyRequest = exports.GetResourcePolicyRequest || (exports.GetResourcePolicyRequest = {}));
var GetResourcePolicyResponse;
(function (GetResourcePolicyResponse) {
    /**
     * @internal
     */
    GetResourcePolicyResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetResourcePolicyResponse = exports.GetResourcePolicyResponse || (exports.GetResourcePolicyResponse = {}));
var GetSecretValueRequest;
(function (GetSecretValueRequest) {
    /**
     * @internal
     */
    GetSecretValueRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(GetSecretValueRequest = exports.GetSecretValueRequest || (exports.GetSecretValueRequest = {}));
var GetSecretValueResponse;
(function (GetSecretValueResponse) {
    /**
     * @internal
     */
    GetSecretValueResponse.filterSensitiveLog = (obj) => ({
        ...obj,
        ...(obj.SecretBinary && { SecretBinary: smithy_client_1.SENSITIVE_STRING }),
        ...(obj.SecretString && { SecretString: smithy_client_1.SENSITIVE_STRING }),
    });
})(GetSecretValueResponse = exports.GetSecretValueResponse || (exports.GetSecretValueResponse = {}));
var InvalidNextTokenException;
(function (InvalidNextTokenException) {
    /**
     * @internal
     */
    InvalidNextTokenException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(InvalidNextTokenException = exports.InvalidNextTokenException || (exports.InvalidNextTokenException = {}));
var SortOrderType;
(function (SortOrderType) {
    SortOrderType["asc"] = "asc";
    SortOrderType["desc"] = "desc";
})(SortOrderType = exports.SortOrderType || (exports.SortOrderType = {}));
var ListSecretsRequest;
(function (ListSecretsRequest) {
    /**
     * @internal
     */
    ListSecretsRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ListSecretsRequest = exports.ListSecretsRequest || (exports.ListSecretsRequest = {}));
var SecretListEntry;
(function (SecretListEntry) {
    /**
     * @internal
     */
    SecretListEntry.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(SecretListEntry = exports.SecretListEntry || (exports.SecretListEntry = {}));
var ListSecretsResponse;
(function (ListSecretsResponse) {
    /**
     * @internal
     */
    ListSecretsResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ListSecretsResponse = exports.ListSecretsResponse || (exports.ListSecretsResponse = {}));
var ListSecretVersionIdsRequest;
(function (ListSecretVersionIdsRequest) {
    /**
     * @internal
     */
    ListSecretVersionIdsRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ListSecretVersionIdsRequest = exports.ListSecretVersionIdsRequest || (exports.ListSecretVersionIdsRequest = {}));
var SecretVersionsListEntry;
(function (SecretVersionsListEntry) {
    /**
     * @internal
     */
    SecretVersionsListEntry.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(SecretVersionsListEntry = exports.SecretVersionsListEntry || (exports.SecretVersionsListEntry = {}));
var ListSecretVersionIdsResponse;
(function (ListSecretVersionIdsResponse) {
    /**
     * @internal
     */
    ListSecretVersionIdsResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ListSecretVersionIdsResponse = exports.ListSecretVersionIdsResponse || (exports.ListSecretVersionIdsResponse = {}));
var PublicPolicyException;
(function (PublicPolicyException) {
    /**
     * @internal
     */
    PublicPolicyException.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PublicPolicyException = exports.PublicPolicyException || (exports.PublicPolicyException = {}));
var PutResourcePolicyRequest;
(function (PutResourcePolicyRequest) {
    /**
     * @internal
     */
    PutResourcePolicyRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PutResourcePolicyRequest = exports.PutResourcePolicyRequest || (exports.PutResourcePolicyRequest = {}));
var PutResourcePolicyResponse;
(function (PutResourcePolicyResponse) {
    /**
     * @internal
     */
    PutResourcePolicyResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PutResourcePolicyResponse = exports.PutResourcePolicyResponse || (exports.PutResourcePolicyResponse = {}));
var PutSecretValueRequest;
(function (PutSecretValueRequest) {
    /**
     * @internal
     */
    PutSecretValueRequest.filterSensitiveLog = (obj) => ({
        ...obj,
        ...(obj.SecretBinary && { SecretBinary: smithy_client_1.SENSITIVE_STRING }),
        ...(obj.SecretString && { SecretString: smithy_client_1.SENSITIVE_STRING }),
    });
})(PutSecretValueRequest = exports.PutSecretValueRequest || (exports.PutSecretValueRequest = {}));
var PutSecretValueResponse;
(function (PutSecretValueResponse) {
    /**
     * @internal
     */
    PutSecretValueResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(PutSecretValueResponse = exports.PutSecretValueResponse || (exports.PutSecretValueResponse = {}));
var RemoveRegionsFromReplicationRequest;
(function (RemoveRegionsFromReplicationRequest) {
    /**
     * @internal
     */
    RemoveRegionsFromReplicationRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RemoveRegionsFromReplicationRequest = exports.RemoveRegionsFromReplicationRequest || (exports.RemoveRegionsFromReplicationRequest = {}));
var RemoveRegionsFromReplicationResponse;
(function (RemoveRegionsFromReplicationResponse) {
    /**
     * @internal
     */
    RemoveRegionsFromReplicationResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RemoveRegionsFromReplicationResponse = exports.RemoveRegionsFromReplicationResponse || (exports.RemoveRegionsFromReplicationResponse = {}));
var ReplicateSecretToRegionsRequest;
(function (ReplicateSecretToRegionsRequest) {
    /**
     * @internal
     */
    ReplicateSecretToRegionsRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ReplicateSecretToRegionsRequest = exports.ReplicateSecretToRegionsRequest || (exports.ReplicateSecretToRegionsRequest = {}));
var ReplicateSecretToRegionsResponse;
(function (ReplicateSecretToRegionsResponse) {
    /**
     * @internal
     */
    ReplicateSecretToRegionsResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ReplicateSecretToRegionsResponse = exports.ReplicateSecretToRegionsResponse || (exports.ReplicateSecretToRegionsResponse = {}));
var RestoreSecretRequest;
(function (RestoreSecretRequest) {
    /**
     * @internal
     */
    RestoreSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RestoreSecretRequest = exports.RestoreSecretRequest || (exports.RestoreSecretRequest = {}));
var RestoreSecretResponse;
(function (RestoreSecretResponse) {
    /**
     * @internal
     */
    RestoreSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RestoreSecretResponse = exports.RestoreSecretResponse || (exports.RestoreSecretResponse = {}));
var RotateSecretRequest;
(function (RotateSecretRequest) {
    /**
     * @internal
     */
    RotateSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RotateSecretRequest = exports.RotateSecretRequest || (exports.RotateSecretRequest = {}));
var RotateSecretResponse;
(function (RotateSecretResponse) {
    /**
     * @internal
     */
    RotateSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(RotateSecretResponse = exports.RotateSecretResponse || (exports.RotateSecretResponse = {}));
var StopReplicationToReplicaRequest;
(function (StopReplicationToReplicaRequest) {
    /**
     * @internal
     */
    StopReplicationToReplicaRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(StopReplicationToReplicaRequest = exports.StopReplicationToReplicaRequest || (exports.StopReplicationToReplicaRequest = {}));
var StopReplicationToReplicaResponse;
(function (StopReplicationToReplicaResponse) {
    /**
     * @internal
     */
    StopReplicationToReplicaResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(StopReplicationToReplicaResponse = exports.StopReplicationToReplicaResponse || (exports.StopReplicationToReplicaResponse = {}));
var TagResourceRequest;
(function (TagResourceRequest) {
    /**
     * @internal
     */
    TagResourceRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(TagResourceRequest = exports.TagResourceRequest || (exports.TagResourceRequest = {}));
var UntagResourceRequest;
(function (UntagResourceRequest) {
    /**
     * @internal
     */
    UntagResourceRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(UntagResourceRequest = exports.UntagResourceRequest || (exports.UntagResourceRequest = {}));
var UpdateSecretRequest;
(function (UpdateSecretRequest) {
    /**
     * @internal
     */
    UpdateSecretRequest.filterSensitiveLog = (obj) => ({
        ...obj,
        ...(obj.SecretBinary && { SecretBinary: smithy_client_1.SENSITIVE_STRING }),
        ...(obj.SecretString && { SecretString: smithy_client_1.SENSITIVE_STRING }),
    });
})(UpdateSecretRequest = exports.UpdateSecretRequest || (exports.UpdateSecretRequest = {}));
var UpdateSecretResponse;
(function (UpdateSecretResponse) {
    /**
     * @internal
     */
    UpdateSecretResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(UpdateSecretResponse = exports.UpdateSecretResponse || (exports.UpdateSecretResponse = {}));
var UpdateSecretVersionStageRequest;
(function (UpdateSecretVersionStageRequest) {
    /**
     * @internal
     */
    UpdateSecretVersionStageRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(UpdateSecretVersionStageRequest = exports.UpdateSecretVersionStageRequest || (exports.UpdateSecretVersionStageRequest = {}));
var UpdateSecretVersionStageResponse;
(function (UpdateSecretVersionStageResponse) {
    /**
     * @internal
     */
    UpdateSecretVersionStageResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(UpdateSecretVersionStageResponse = exports.UpdateSecretVersionStageResponse || (exports.UpdateSecretVersionStageResponse = {}));
var ValidateResourcePolicyRequest;
(function (ValidateResourcePolicyRequest) {
    /**
     * @internal
     */
    ValidateResourcePolicyRequest.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ValidateResourcePolicyRequest = exports.ValidateResourcePolicyRequest || (exports.ValidateResourcePolicyRequest = {}));
var ValidationErrorsEntry;
(function (ValidationErrorsEntry) {
    /**
     * @internal
     */
    ValidationErrorsEntry.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ValidationErrorsEntry = exports.ValidationErrorsEntry || (exports.ValidationErrorsEntry = {}));
var ValidateResourcePolicyResponse;
(function (ValidateResourcePolicyResponse) {
    /**
     * @internal
     */
    ValidateResourcePolicyResponse.filterSensitiveLog = (obj) => ({
        ...obj,
    });
})(ValidateResourcePolicyResponse = exports.ValidateResourcePolicyResponse || (exports.ValidateResourcePolicyResponse = {}));
//# sourceMappingURL=models_0.js.map