"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Sheleski;
(function (Sheleski) {
    var Scorm;
    (function (Scorm) {
        var ScormApiVersion;
        (function (ScormApiVersion) {
            ScormApiVersion["v1p2"] = "1.2";
            ScormApiVersion["v2004"] = "2004";
        })(ScormApiVersion || (ScormApiVersion = {}));
        ;
        var ConnectionStatus;
        (function (ConnectionStatus) {
            ConnectionStatus[ConnectionStatus["connected"] = 0] = "connected";
            ConnectionStatus[ConnectionStatus["disconnected"] = 1] = "disconnected";
        })(ConnectionStatus || (ConnectionStatus = {}));
        ;
        function getBoolean(value) {
            var t = typeof value;
            switch (t) {
                //typeof new String("true") === "object", so handle objects as string via fall-through.
                //See https://github.com/pipwerks/scorm-api-wrapper/issues/3
                case "object":
                case "string":
                    return (/(true|1)/i).test(value);
                case "number":
                    return !!value;
                case "boolean":
                    return value;
                case "undefined":
                    return null;
                default:
                    return false;
            }
        }
        var Errors;
        (function (Errors) {
            Errors.connectionInactive = "failed: API connection is inactive.";
            Errors.connectionAlreadyActive = "aborted: Connection already active.";
        })(Errors || (Errors = {}));
        var ScormApiWrapperBase = /** @class */ (function () {
            function ScormApiWrapperBase() {
                this.connectionStatus = ConnectionStatus.disconnected;
                this.completionStatus = null;
                this.exitStatus = null;
                this.setExitOnTerminate = true;
                this.setCompletionStatusOnInitialize = true;
                this.commitOnTerminate = true;
                this.errorHandler = function (message) {
                    throw message;
                };
            }
            ScormApiWrapperBase.prototype.onError = function (message) {
                this.errorHandler(message);
            };
            ScormApiWrapperBase.prototype.get = function (name) {
                var val = this.getRaw(name);
                var errorCode = this.getLastError();
                var isSuccessful = (val !== "" || errorCode == 0);
                var errorString = null;
                var errorDiagnostic = null;
                if (isSuccessful) {
                    if (name == this.completionStatusParameter) {
                        this.completionStatus = val;
                    }
                    else if (name == this.exitParameter) {
                        this.exitStatus = val;
                    }
                }
                else {
                    errorString = this.getErrorString();
                    errorDiagnostic = this.getDiagnostic();
                }
                return {
                    value: val,
                    errorCode: errorCode,
                    isSuccessful: isSuccessful,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            };
            ScormApiWrapperBase.prototype.set = function (name, value) {
                var errorString = null;
                var errorDiagnostic = null;
                var errorCode = 0;
                var success = this.setRaw(name, value);
                if (success) {
                    if (name == this.completionStatusParameter) {
                        this.completionStatus = value;
                    }
                }
                else {
                    errorCode = this.getLastError();
                    errorString = this.getErrorString();
                    errorDiagnostic = this.getDiagnostic();
                }
                return {
                    errorCode: errorCode,
                    isSuccessful: success,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            };
            ScormApiWrapperBase.prototype.getRaw = function (name) {
                return this.onGetRaw(name);
            };
            ScormApiWrapperBase.prototype.setRaw = function (name, value) {
                var _a;
                return (_a = getBoolean(this.onSetRaw(name, value))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapperBase.prototype.initialize = function () {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    this.onError(Errors.connectionAlreadyActive);
                }
                else {
                    if (this.onInitialize()) {
                        this.connectionStatus = ConnectionStatus.connected;
                        if (this.setCompletionStatusOnInitialize) {
                            var completionStatusParameter = this.completionStatusParameter;
                            var completionStatus = this.getRaw(completionStatusParameter);
                            if (completionStatus == this.notAttemptedCompletionStatus) {
                                if (this.setRaw(completionStatusParameter, this.incompleteCompletionStatus)) {
                                    this.commit();
                                    return true;
                                }
                            }
                        }
                        else {
                            return true;
                        }
                    }
                }
                return false;
            };
            ScormApiWrapperBase.prototype.terminate = function () {
                if (this.connectionStatus == ConnectionStatus.disconnected) {
                    this.onError(Errors.connectionInactive);
                    return false;
                }
                var success = false;
                if (this.setExitOnTerminate && !this.exitStatus) {
                    if (this.completionStatus !== this.completedCompletionStatus) {
                        success = this.onSetRaw(this.exitParameter, this.suspendExitStatus);
                    }
                    else {
                        success = this.onSetRaw(this.exitParameter, this.logoutExitStatus);
                    }
                }
                if (this.commitOnTerminate) {
                    success = this.onCommitBeforeTerminate();
                }
                success = this.onTerminate();
                if (success) {
                    this.connectionStatus = ConnectionStatus.disconnected;
                }
                return success;
            };
            ScormApiWrapperBase.prototype.commit = function () {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    return this.onCommit();
                }
                return false;
            };
            ScormApiWrapperBase.prototype.getLastError = function () {
                return this.onGetLastError();
            };
            ScormApiWrapperBase.prototype.getErrorString = function () {
                return this.onGetErrorString();
            };
            ScormApiWrapperBase.prototype.getDiagnostic = function () {
                return this.onGetDiagnostic();
            };
            return ScormApiWrapperBase;
        }());
        var ScormApiWrapper1p2 = /** @class */ (function (_super) {
            __extends(ScormApiWrapper1p2, _super);
            function ScormApiWrapper1p2(api) {
                var _this = _super.call(this) || this;
                _this.exitParameter = "cmi.core.exit";
                _this.completedCompletionStatus = "passed";
                _this.suspendExitStatus = "suspend";
                _this.logoutExitStatus = "logout";
                _this.incompleteCompletionStatus = "incomplete";
                _this.notAttemptedCompletionStatus = "not attempted";
                _this.completionStatusParameter = "cmi.core.lesson_status";
                _this._api = api;
                return _this;
            }
            ScormApiWrapper1p2.prototype.onGetRaw = function (name) {
                return this._api.LMSGetValue(name);
            };
            ScormApiWrapper1p2.prototype.onSetRaw = function (name, value) {
                var _a;
                return (_a = getBoolean(this._api.LMSSetValue(name, value))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper1p2.prototype.onInitialize = function () {
                return this._api.LMSInitialize();
            };
            ScormApiWrapper1p2.prototype.onTerminate = function () {
                var _a;
                return (_a = getBoolean(this._api.LMSFinish())) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper1p2.prototype.onCommit = function () {
                var _a;
                return (_a = getBoolean(this._api.LMSCommit(""))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper1p2.prototype.onGetLastError = function () {
                return this._api.LMSGetLastError();
            };
            ScormApiWrapper1p2.prototype.onGetErrorString = function () {
                return this._api.LMSGetErrorString();
            };
            ScormApiWrapper1p2.prototype.onGetDiagnostic = function () {
                return this._api.LMSGetDiagnostic();
            };
            ScormApiWrapper1p2.prototype.getVersion = function () {
                return ScormApiVersion.v1p2;
            };
            ScormApiWrapper1p2.prototype.onCommitBeforeTerminate = function () {
                return this.onCommit();
            };
            return ScormApiWrapper1p2;
        }(ScormApiWrapperBase));
        var ScormApiWrapper2004 = /** @class */ (function (_super) {
            __extends(ScormApiWrapper2004, _super);
            function ScormApiWrapper2004(api) {
                var _this = _super.call(this) || this;
                _this.exitParameter = "cmi.exit";
                _this.completedCompletionStatus = "completed";
                _this.suspendExitStatus = "suspend";
                _this.logoutExitStatus = "normal";
                _this.incompleteCompletionStatus = "incomplete";
                _this.notAttemptedCompletionStatus = "unknown";
                _this.completionStatusParameter = "cmi.completion_status";
                _this._api = api;
                return _this;
            }
            ScormApiWrapper2004.prototype.onGetRaw = function (name) {
                return this._api.GetValue(name);
            };
            ScormApiWrapper2004.prototype.onSetRaw = function (name, value) {
                var _a;
                return (_a = getBoolean(this._api.SetValue(name, value))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper2004.prototype.onInitialize = function () {
                return this._api.Initialize("");
            };
            ScormApiWrapper2004.prototype.onTerminate = function () {
                var _a;
                return (_a = getBoolean(this._api.Terminate(""))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper2004.prototype.onCommit = function () {
                var _a;
                return (_a = getBoolean(this._api.Commit(""))) !== null && _a !== void 0 ? _a : false;
            };
            ScormApiWrapper2004.prototype.onGetLastError = function () {
                return this._api.GetLastError();
            };
            ScormApiWrapper2004.prototype.onGetErrorString = function () {
                return this._api.GetErrorString();
            };
            ScormApiWrapper2004.prototype.onGetDiagnostic = function () {
                return this._api.GetDiagnostic();
            };
            ScormApiWrapper2004.prototype.getVersion = function () {
                return ScormApiVersion.v2004;
            };
            ScormApiWrapper2004.prototype.onCommitBeforeTerminate = function () {
                //not required for 2004 where an implicit commit is applied during the Terminate
                return true;
            };
            return ScormApiWrapper2004;
        }(ScormApiWrapperBase));
        function windowIsValidOrigin(win) {
            // prevent throwing an exception regarding the Same Origin Policy (see: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
            try {
                return win && win.document;
            }
            catch (ex) {
                return false;
            }
        }
        function discoverApi(version) {
            var win = window;
            var findResult = findApiFromWindow(win, version);
            if (!findResult && win.parent && win.parent != win) {
                findResult = findApiFromWindow(win.parent, version);
            }
            if (!findResult && win.top && win.top.opener) {
                findResult = findApiFromWindow(win.top.opener, version);
            }
            if (!findResult && win.top && win.top.opener && windowIsValidOrigin(win.top.opener) && win.top.opener.document) {
                findResult = findApiFromWindow(win.top.opener.document, version);
            }
            return findResult !== null && findResult !== void 0 ? findResult : { v1p2: null, v2004: null };
        }
        function findApiFromWindow(win, version) {
            var findResult, findAttemptLimit = 500;
            for (var findAttempts = 0; findAttempts <= findAttemptLimit; ++findAttempts) {
                findResult = getApiFromWindow(win);
                if (version == ScormApiVersion.v1p2 && findResult.v1p2) {
                    return findResult;
                }
                else if (version == ScormApiVersion.v2004 && findResult.v2004) {
                    return findResult;
                }
                else if (findResult.v2004 || findResult.v1p2) {
                    return findResult;
                }
            }
            return null;
        }
        ;
        function getApiFromWindow(win) {
            var anyWin = win;
            return {
                v1p2: anyWin.API,
                v2004: anyWin.API_1484_11
            };
        }
        function initBase(version) {
            var api = discoverApi(version);
            if (api.v1p2) {
                return new ScormApiWrapper1p2(api.v1p2);
            }
            else if (api.v2004) {
                return new ScormApiWrapper2004(api.v2004);
            }
            return null;
        }
        function init() {
            return initBase(null);
        }
        Scorm.init = init;
        function init2004() {
            return initBase(ScormApiVersion.v2004);
        }
        Scorm.init2004 = init2004;
        function init1p2() {
            return initBase(ScormApiVersion.v1p2);
        }
        Scorm.init1p2 = init1p2;
    })(Scorm = Sheleski.Scorm || (Sheleski.Scorm = {}));
})(Sheleski || (Sheleski = {}));
//# sourceMappingURL=ScormApiWrapper.js.map