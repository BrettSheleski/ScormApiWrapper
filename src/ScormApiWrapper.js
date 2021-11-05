"use strict";
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
        var ScormApiWrapper1p2 = /** @class */ (function () {
            function ScormApiWrapper1p2(api) {
                this._api = api;
            }
            ScormApiWrapper1p2.prototype.get = function (name) {
                var val = this.getRaw(name);
                var errorCode = this.getLastError();
                var isSuccessful = errorCode == 0;
                var errorString = null;
                var errorDiagnostic = null;
                if (isSuccessful) {
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
            ScormApiWrapper1p2.prototype.set = function (name, value) {
                var val = this.setRaw(name, value);
                var errorCode = this.getLastError();
                var isSuccessful = errorCode == 0;
                var errorString = null;
                var errorDiagnostic = null;
                if (isSuccessful) {
                    errorString = this.getErrorString();
                    errorDiagnostic = this.getDiagnostic();
                }
                return {
                    errorCode: errorCode,
                    isSuccessful: isSuccessful,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            };
            ScormApiWrapper1p2.prototype.getRaw = function (name) {
                return this._api.LMSGetValue(name);
            };
            ScormApiWrapper1p2.prototype.setRaw = function (name, value) {
                return this._api.LMSSetValue(name, value);
            };
            ScormApiWrapper1p2.prototype.initialize = function () {
                return this._api.LMSInitialize();
            };
            ScormApiWrapper1p2.prototype.terminate = function () {
                this._api.LMSFinish();
            };
            ScormApiWrapper1p2.prototype.commit = function () {
                this._api.LMSCommit("");
            };
            ScormApiWrapper1p2.prototype.getLastError = function () {
                return this._api.LMSGetLastError();
            };
            ScormApiWrapper1p2.prototype.getErrorString = function () {
                return this._api.LMSGetErrorString();
            };
            ScormApiWrapper1p2.prototype.getDiagnostic = function () {
                return this._api.LMSGetDiagnostic();
            };
            ScormApiWrapper1p2.prototype.getVersion = function () {
                return ScormApiVersion.v1p2;
            };
            return ScormApiWrapper1p2;
        }());
        var ScormApiWrapper2004 = /** @class */ (function () {
            function ScormApiWrapper2004(api) {
                this._api = api;
            }
            ScormApiWrapper2004.prototype.get = function (name) {
                var val = this.getRaw(name);
                var errorCode = this.getLastError();
                var isSuccessful = errorCode == 0;
                var errorString = null;
                var errorDiagnostic = null;
                if (isSuccessful) {
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
            ScormApiWrapper2004.prototype.set = function (name, value) {
                var val = this.setRaw(name, value);
                var errorCode = this.getLastError();
                var isSuccessful = errorCode == 0;
                var errorString = null;
                var errorDiagnostic = null;
                if (isSuccessful) {
                    errorString = this.getErrorString();
                    errorDiagnostic = this.getDiagnostic();
                }
                return {
                    errorCode: errorCode,
                    isSuccessful: isSuccessful,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            };
            ScormApiWrapper2004.prototype.getRaw = function (name) {
                return this._api.GetValue(name);
            };
            ScormApiWrapper2004.prototype.setRaw = function (name, value) {
                return this._api.SetValue(name, value);
            };
            ScormApiWrapper2004.prototype.initialize = function () {
                return this._api.Initialize("");
            };
            ScormApiWrapper2004.prototype.terminate = function () {
                this._api.Terminate("");
            };
            ScormApiWrapper2004.prototype.commit = function () {
                this._api.Commit("");
            };
            ScormApiWrapper2004.prototype.getLastError = function () {
                return this._api.GetLastError();
            };
            ScormApiWrapper2004.prototype.getErrorString = function () {
                return this._api.GetErrorString();
            };
            ScormApiWrapper2004.prototype.getDiagnostic = function () {
                return this._api.GetDiagnostic();
            };
            ScormApiWrapper2004.prototype.getVersion = function () {
                return ScormApiVersion.v2004;
            };
            return ScormApiWrapper2004;
        }());
        var Internal;
        (function (Internal) {
            function initBase(version) {
                return null;
            }
            Internal.initBase = initBase;
        })(Internal || (Internal = {}));
        function init() {
            return Internal.initBase(null);
        }
        Scorm.init = init;
        function init2004() {
            return Internal.initBase(ScormApiVersion.v2004);
        }
        Scorm.init2004 = init2004;
        function init1p2() {
            return Internal.initBase(ScormApiVersion.v1p2);
        }
        Scorm.init1p2 = init1p2;
    })(Scorm || (Scorm = {}));
})(Sheleski || (Sheleski = {}));
