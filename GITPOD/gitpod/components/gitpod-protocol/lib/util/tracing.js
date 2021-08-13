"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerOperationSampler = exports.TracingManager = exports.TraceContext = void 0;
var opentracing = require("opentracing");
var jaeger_client_1 = require("jaeger-client");
var opentracing_1 = require("opentracing");
var inversify_1 = require("inversify");
var TraceContext;
(function (TraceContext) {
    function startSpan(operation, ctx) {
        var options = {
            childOf: ctx.span
        };
        return opentracing.globalTracer().startSpan(operation, options);
    }
    TraceContext.startSpan = startSpan;
    function startAsyncSpan(operation, ctx) {
        var options = {};
        if (!!ctx.span) {
            options.references = [opentracing.followsFrom(ctx.span.context())];
        }
        return opentracing.globalTracer().startSpan(operation, options);
    }
    TraceContext.startAsyncSpan = startAsyncSpan;
    function logError(ctx, err) {
        if (!ctx.span) {
            return;
        }
        ctx.span.log({
            "error": err.message,
            "stacktrace": err.stack
        });
        ctx.span.setTag("error", true);
    }
    TraceContext.logError = logError;
})(TraceContext = exports.TraceContext || (exports.TraceContext = {}));
var TracingManager = /** @class */ (function () {
    function TracingManager() {
    }
    TracingManager.prototype.setup = function (serviceName, opts) {
        opentracing_1.initGlobalTracer(this.getTracerForService(serviceName, opts));
    };
    TracingManager.prototype.getTracerForService = function (serviceName, opts) {
        var config = {
            disable: false,
            reporter: {
                logSpans: false
            },
            serviceName: serviceName
        };
        var t = jaeger_client_1.initTracerFromEnv(config, {
            logger: console
        });
        if (opts) {
            if (opts.perOpSampling) {
                t._sampler = new PerOperationSampler(t._sampler, opts.perOpSampling);
            }
        }
        return t;
    };
    TracingManager = __decorate([
        inversify_1.injectable()
    ], TracingManager);
    return TracingManager;
}());
exports.TracingManager = TracingManager;
var PerOperationSampler = /** @class */ (function () {
    function PerOperationSampler(fallback, strategies) {
        this.fallback = fallback;
        this.strategies = strategies;
    }
    PerOperationSampler.prototype.name = function () {
        return 'PerOperationSampler';
    };
    PerOperationSampler.prototype.toString = function () {
        return "" + this.name();
    };
    PerOperationSampler.prototype.isSampled = function (operation, tags) {
        var shouldSample = this.strategies[operation];
        if (shouldSample === undefined) {
            if (!this.fallback.isSampled) {
                return false;
            }
            return this.fallback.isSampled(operation, tags);
        }
        return shouldSample;
    };
    PerOperationSampler.prototype.onCreateSpan = function (span) {
        var outTags = {};
        var isSampled = this.isSampled(span.operationName, outTags);
        // NB: return retryable=true here since we can change decision after setOperationName().
        return { sample: isSampled, retryable: true, tags: outTags };
    };
    PerOperationSampler.prototype.onSetOperationName = function (span, operationName) {
        var outTags = {};
        var isSampled = this.isSampled(span.operationName, outTags);
        return { sample: isSampled, retryable: false, tags: outTags };
    };
    PerOperationSampler.prototype.onSetTag = function (span, key, value) {
        return { sample: false, retryable: true, tags: null };
    };
    PerOperationSampler.prototype.equal = function (other) {
        return false; // TODO equal should be removed
    };
    PerOperationSampler.prototype.close = function (callback) {
        // all nested samplers are of simple types, so we do not need to Close them
        if (callback) {
            callback();
        }
    };
    return PerOperationSampler;
}());
exports.PerOperationSampler = PerOperationSampler;
//# sourceMappingURL=tracing.js.map