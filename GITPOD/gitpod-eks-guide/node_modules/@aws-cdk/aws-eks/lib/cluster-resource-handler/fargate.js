"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FargateProfileResourceHandler = void 0;
const common_1 = require("./common");
const MAX_NAME_LEN = 63;
class FargateProfileResourceHandler extends common_1.ResourceHandler {
    async onCreate() {
        var _a;
        const fargateProfileName = (_a = this.event.ResourceProperties.Config.fargateProfileName) !== null && _a !== void 0 ? _a : this.generateProfileName();
        const createFargateProfile = {
            fargateProfileName,
            ...this.event.ResourceProperties.Config,
        };
        this.log({ createFargateProfile });
        const createFargateProfileResponse = await this.eks.createFargateProfile(createFargateProfile);
        this.log({ createFargateProfileResponse });
        if (!createFargateProfileResponse.fargateProfile) {
            throw new Error('invalid CreateFargateProfile response');
        }
        return {
            PhysicalResourceId: createFargateProfileResponse.fargateProfile.fargateProfileName,
            Data: {
                fargateProfileArn: createFargateProfileResponse.fargateProfile.fargateProfileArn,
            },
        };
    }
    async onDelete() {
        if (!this.physicalResourceId) {
            throw new Error('Cannot delete a profile without a physical id');
        }
        const deleteFargateProfile = {
            clusterName: this.event.ResourceProperties.Config.clusterName,
            fargateProfileName: this.physicalResourceId,
        };
        this.log({ deleteFargateProfile });
        const deleteFargateProfileResponse = await this.eks.deleteFargateProfile(deleteFargateProfile);
        this.log({ deleteFargateProfileResponse });
        return;
    }
    async onUpdate() {
        // all updates require a replacement. as long as name is generated, we are
        // good. if name is explicit, update will fail, which is common when trying
        // to replace cfn resources with explicit physical names
        return this.onCreate();
    }
    async isCreateComplete() {
        return this.isUpdateComplete();
    }
    async isUpdateComplete() {
        const status = await this.queryStatus();
        return {
            IsComplete: status === 'ACTIVE',
        };
    }
    async isDeleteComplete() {
        const status = await this.queryStatus();
        return {
            IsComplete: status === 'NOT_FOUND',
        };
    }
    /**
     * Generates a fargate profile name.
     */
    generateProfileName() {
        const suffix = this.requestId.replace(/-/g, ''); // 32 chars
        const prefix = this.logicalResourceId.substr(0, MAX_NAME_LEN - suffix.length - 1);
        return `${prefix}-${suffix}`;
    }
    /**
     * Queries the Fargate profile's current status and returns the status or
     * NOT_FOUND if the profile doesn't exist (i.e. it has been deleted).
     */
    async queryStatus() {
        var _a;
        if (!this.physicalResourceId) {
            throw new Error('Unable to determine status for fargate profile without a resource name');
        }
        const describeFargateProfile = {
            clusterName: this.event.ResourceProperties.Config.clusterName,
            fargateProfileName: this.physicalResourceId,
        };
        try {
            this.log({ describeFargateProfile });
            const describeFargateProfileResponse = await this.eks.describeFargateProfile(describeFargateProfile);
            this.log({ describeFargateProfileResponse });
            const status = (_a = describeFargateProfileResponse.fargateProfile) === null || _a === void 0 ? void 0 : _a.status;
            if (status === 'CREATE_FAILED' || status === 'DELETE_FAILED') {
                throw new Error(status);
            }
            return status;
        }
        catch (describeFargateProfileError) {
            if (describeFargateProfileError.code === 'ResourceNotFoundException') {
                this.log('received ResourceNotFoundException, this means the profile has been deleted (or never existed)');
                return 'NOT_FOUND';
            }
            this.log({ describeFargateProfileError });
            throw describeFargateProfileError;
        }
    }
}
exports.FargateProfileResourceHandler = FargateProfileResourceHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFyZ2F0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZhcmdhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQTJDO0FBRTNDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUV4QixNQUFhLDZCQUE4QixTQUFRLHdCQUFlO0lBQ3RELEtBQUssQ0FBQyxRQUFROztRQUN0QixNQUFNLGtCQUFrQixTQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGtCQUFrQixtQ0FBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUVqSCxNQUFNLG9CQUFvQixHQUF3QztZQUNoRSxrQkFBa0I7WUFDbEIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU07U0FDeEMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFDbkMsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxjQUFjLEVBQUU7WUFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsT0FBTztZQUNMLGtCQUFrQixFQUFFLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxrQkFBa0I7WUFDbEYsSUFBSSxFQUFFO2dCQUNKLGlCQUFpQixFQUFFLDRCQUE0QixDQUFDLGNBQWMsQ0FBQyxpQkFBaUI7YUFDakY7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVTLEtBQUssQ0FBQyxRQUFRO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0Ms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Z0JBQzNHLE9BQU8sV0FBVyxDQUFDO2FBQ3BCO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQztZQUMxQyxNQUFNLDJCQUEyQixDQUFDO1NBQ25DO0lBQ0gsQ0FBQztDQUNGO0FBaEhELHNFQWdIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGF3cyBmcm9tICdhd3Mtc2RrJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IFJlc291cmNlSGFuZGxlciB9IGZyb20gJy4vY29tbW9uJztcblxuY29uc3QgTUFYX05BTUVfTEVOID0gNjM7XG5cbmV4cG9ydCBjbGFzcyBGYXJnYXRlUHJvZmlsZVJlc291cmNlSGFuZGxlciBleHRlbmRzIFJlc291cmNlSGFuZGxlciB7XG4gIHByb3RlY3RlZCBhc3luYyBvbkNyZWF0ZSgpIHtcbiAgICBjb25zdCBmYXJnYXRlUHJvZmlsZU5hbWUgPSB0aGlzLmV2ZW50LlJlc291cmNlUHJvcGVydGllcy5Db25maWcuZmFyZ2F0ZVByb2ZpbGVOYW1lID8/IHRoaXMuZ2VuZXJhdGVQcm9maWxlTmFtZSgpO1xuXG4gICAgY29uc3QgY3JlYXRlRmFyZ2F0ZVByb2ZpbGU6IGF3cy5FS1MuQ3JlYXRlRmFyZ2F0ZVByb2ZpbGVSZXF1ZXN0ID0ge1xuICAgICAgZmFyZ2F0ZVByb2ZpbGVOYW1lLFxuICAgICAgLi4udGhpcy5ldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQ29uZmlnLFxuICAgIH07XG5cbiAgICB0aGlzLmxvZyh7IGNyZWF0ZUZhcmdhdGVQcm9maWxlIH0pO1xuICAgIGNvbnN0IGNyZWF0ZUZhcmdhdGVQcm9maWxlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmVrcy5jcmVhdGVGYXJnYXRlUHJvZmlsZShjcmVhdGVGYXJnYXRlUHJvZmlsZSk7XG4gICAgdGhpcy5sb2coeyBjcmVhdGVGYXJnYXRlUHJvZmlsZVJlc3BvbnNlIH0pO1xuXG4gICAgaWYgKCFjcmVhdGVGYXJnYXRlUHJvZmlsZVJlc3BvbnNlLmZhcmdhdGVQcm9maWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgQ3JlYXRlRmFyZ2F0ZVByb2ZpbGUgcmVzcG9uc2UnKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgUGh5c2ljYWxSZXNvdXJjZUlkOiBjcmVhdGVGYXJnYXRlUHJvZmlsZVJlc3BvbnNlLmZhcmdhdGVQcm9maWxlLmZhcmdhdGVQcm9maWxlTmFtZSxcbiAgICAgIERhdGE6IHtcbiAgICAgICAgZmFyZ2F0ZVByb2ZpbGVBcm46IGNyZWF0ZUZhcmdhdGVQcm9maWxlUmVzcG9uc2UuZmFyZ2F0ZVByb2ZpbGUuZmFyZ2F0ZVByb2ZpbGVBcm4sXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgb25EZWxldGUoKSB7XG4gICAgaWYgKCF0aGlzLnBoeXNpY2FsUmVzb3VyY2VJZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZGVsZXRlIGEgcHJvZmlsZSB3aXRob3V0IGEgcGh5c2ljYWwgaWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWxldGVGYXJnYXRlUHJvZmlsZTogYXdzLkVLUy5EZWxldGVGYXJnYXRlUHJvZmlsZVJlcXVlc3QgPSB7XG4gICAgICBjbHVzdGVyTmFtZTogdGhpcy5ldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuQ29uZmlnLmNsdXN0ZXJOYW1lLFxuICAgICAgZmFyZ2F0ZVByb2ZpbGVOYW1lOiB0aGlzLnBoeXNpY2FsUmVzb3VyY2VJZCxcbiAgICB9O1xuXG4gICAgdGhpcy5sb2coeyBkZWxldGVGYXJnYXRlUHJvZmlsZSB9KTtcbiAgICBjb25zdCBkZWxldGVGYXJnYXRlUHJvZmlsZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5la3MuZGVsZXRlRmFyZ2F0ZVByb2ZpbGUoZGVsZXRlRmFyZ2F0ZVByb2ZpbGUpO1xuICAgIHRoaXMubG9nKHsgZGVsZXRlRmFyZ2F0ZVByb2ZpbGVSZXNwb25zZSB9KTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBvblVwZGF0ZSgpIHtcbiAgICAvLyBhbGwgdXBkYXRlcyByZXF1aXJlIGEgcmVwbGFjZW1lbnQuIGFzIGxvbmcgYXMgbmFtZSBpcyBnZW5lcmF0ZWQsIHdlIGFyZVxuICAgIC8vIGdvb2QuIGlmIG5hbWUgaXMgZXhwbGljaXQsIHVwZGF0ZSB3aWxsIGZhaWwsIHdoaWNoIGlzIGNvbW1vbiB3aGVuIHRyeWluZ1xuICAgIC8vIHRvIHJlcGxhY2UgY2ZuIHJlc291cmNlcyB3aXRoIGV4cGxpY2l0IHBoeXNpY2FsIG5hbWVzXG4gICAgcmV0dXJuIHRoaXMub25DcmVhdGUoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBpc0NyZWF0ZUNvbXBsZXRlKCkge1xuICAgIHJldHVybiB0aGlzLmlzVXBkYXRlQ29tcGxldGUoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBpc1VwZGF0ZUNvbXBsZXRlKCkge1xuICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHRoaXMucXVlcnlTdGF0dXMoKTtcbiAgICByZXR1cm4ge1xuICAgICAgSXNDb21wbGV0ZTogc3RhdHVzID09PSAnQUNUSVZFJyxcbiAgICB9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGlzRGVsZXRlQ29tcGxldGUoKSB7XG4gICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgdGhpcy5xdWVyeVN0YXR1cygpO1xuICAgIHJldHVybiB7XG4gICAgICBJc0NvbXBsZXRlOiBzdGF0dXMgPT09ICdOT1RfRk9VTkQnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgZmFyZ2F0ZSBwcm9maWxlIG5hbWUuXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlUHJvZmlsZU5hbWUoKSB7XG4gICAgY29uc3Qgc3VmZml4ID0gdGhpcy5yZXF1ZXN0SWQucmVwbGFjZSgvLS9nLCAnJyk7IC8vIDMyIGNoYXJzXG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5sb2dpY2FsUmVzb3VyY2VJZC5zdWJzdHIoMCwgTUFYX05BTUVfTEVOIC0gc3VmZml4Lmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBgJHtwcmVmaXh9LSR7c3VmZml4fWA7XG4gIH1cblxuICAvKipcbiAgICogUXVlcmllcyB0aGUgRmFyZ2F0ZSBwcm9maWxlJ3MgY3VycmVudCBzdGF0dXMgYW5kIHJldHVybnMgdGhlIHN0YXR1cyBvclxuICAgKiBOT1RfRk9VTkQgaWYgdGhlIHByb2ZpbGUgZG9lc24ndCBleGlzdCAoaS5lLiBpdCBoYXMgYmVlbiBkZWxldGVkKS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgcXVlcnlTdGF0dXMoKTogUHJvbWlzZTxhd3MuRUtTLkZhcmdhdGVQcm9maWxlU3RhdHVzIHwgJ05PVF9GT1VORCcgfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAoIXRoaXMucGh5c2ljYWxSZXNvdXJjZUlkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBkZXRlcm1pbmUgc3RhdHVzIGZvciBmYXJnYXRlIHByb2ZpbGUgd2l0aG91dCBhIHJlc291cmNlIG5hbWUnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZXNjcmliZUZhcmdhdGVQcm9maWxlOiBhd3MuRUtTLkRlc2NyaWJlRmFyZ2F0ZVByb2ZpbGVSZXF1ZXN0ID0ge1xuICAgICAgY2x1c3Rlck5hbWU6IHRoaXMuZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkNvbmZpZy5jbHVzdGVyTmFtZSxcbiAgICAgIGZhcmdhdGVQcm9maWxlTmFtZTogdGhpcy5waHlzaWNhbFJlc291cmNlSWQsXG4gICAgfTtcblxuICAgIHRyeSB7XG5cbiAgICAgIHRoaXMubG9nKHsgZGVzY3JpYmVGYXJnYXRlUHJvZmlsZSB9KTtcbiAgICAgIGNvbnN0IGRlc2NyaWJlRmFyZ2F0ZVByb2ZpbGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuZWtzLmRlc2NyaWJlRmFyZ2F0ZVByb2ZpbGUoZGVzY3JpYmVGYXJnYXRlUHJvZmlsZSk7XG4gICAgICB0aGlzLmxvZyh7IGRlc2NyaWJlRmFyZ2F0ZVByb2ZpbGVSZXNwb25zZSB9KTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGRlc2NyaWJlRmFyZ2F0ZVByb2ZpbGVSZXNwb25zZS5mYXJnYXRlUHJvZmlsZT8uc3RhdHVzO1xuXG4gICAgICBpZiAoc3RhdHVzID09PSAnQ1JFQVRFX0ZBSUxFRCcgfHwgc3RhdHVzID09PSAnREVMRVRFX0ZBSUxFRCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0YXR1cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgfSBjYXRjaCAoZGVzY3JpYmVGYXJnYXRlUHJvZmlsZUVycm9yKSB7XG4gICAgICBpZiAoZGVzY3JpYmVGYXJnYXRlUHJvZmlsZUVycm9yLmNvZGUgPT09ICdSZXNvdXJjZU5vdEZvdW5kRXhjZXB0aW9uJykge1xuICAgICAgICB0aGlzLmxvZygncmVjZWl2ZWQgUmVzb3VyY2VOb3RGb3VuZEV4Y2VwdGlvbiwgdGhpcyBtZWFucyB0aGUgcHJvZmlsZSBoYXMgYmVlbiBkZWxldGVkIChvciBuZXZlciBleGlzdGVkKScpO1xuICAgICAgICByZXR1cm4gJ05PVF9GT1VORCc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubG9nKHsgZGVzY3JpYmVGYXJnYXRlUHJvZmlsZUVycm9yIH0pO1xuICAgICAgdGhyb3cgZGVzY3JpYmVGYXJnYXRlUHJvZmlsZUVycm9yO1xuICAgIH1cbiAgfVxufVxuIl19