/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare const IAnalyticsWriter: unique symbol;
declare type Identity =
  | {
      userId: string | number;
    }
  | {
      userId?: string | number;
      anonymousId: string | number;
    };
interface Message {
  messageId?: string;
}
export declare type IdentifyMessage = Message &
  Identity & {
    traits?: any;
    timestamp?: Date;
    context?: any;
  };
export declare type TrackMessage = Message &
  Identity & {
    event: string;
    properties?: any;
    timestamp?: Date;
    context?: any;
  };
export declare type RemoteTrackMessage = Omit<
  TrackMessage,
  "timestamp" | "userId" | "anonymousId"
>;
export interface IAnalyticsWriter {
  identify(msg: IdentifyMessage): void;
  track(msg: TrackMessage): void;
}
export {};
//# sourceMappingURL=analytics.d.ts.map
