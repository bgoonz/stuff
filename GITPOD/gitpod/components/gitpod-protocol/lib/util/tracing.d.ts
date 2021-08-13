/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import * as opentracing from "opentracing";
import { Sampler, SamplingDecision } from "jaeger-client";
export interface TraceContext {
  span?: opentracing.Span;
}
export declare namespace TraceContext {
  function startSpan(operation: string, ctx: TraceContext): opentracing.Span;
  function startAsyncSpan(
    operation: string,
    ctx: TraceContext
  ): opentracing.Span;
  function logError(ctx: TraceContext, err: Error): void;
}
export declare class TracingManager {
  setup(serviceName: string, opts?: CustomTracerOpts): void;
  getTracerForService(
    serviceName: string,
    opts?: CustomTracerOpts
  ): opentracing.Tracer;
}
export interface CustomTracerOpts {
  perOpSampling?: PerOperationSampling;
}
export interface PerOperationSampling {
  [key: string]: boolean;
}
export declare class PerOperationSampler implements Sampler {
  protected readonly fallback: Sampler;
  protected readonly strategies: PerOperationSampling;
  constructor(fallback: Sampler, strategies: PerOperationSampling);
  name(): string;
  toString(): string;
  isSampled(operation: string, tags: any): boolean;
  onCreateSpan(span: opentracing.Span): SamplingDecision;
  onSetOperationName(
    span: opentracing.Span,
    operationName: string
  ): SamplingDecision;
  onSetTag(span: opentracing.Span, key: string, value: any): SamplingDecision;
  equal(other: Sampler): boolean;
  close(callback: () => void): void;
}
//# sourceMappingURL=tracing.d.ts.map
