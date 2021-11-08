"use strict";
var ScormEngine = /** @class */ (function () {
    function ScormEngine() {
        this.isInitialized = false;
        this.isTerminated = false;
    }
    ScormEngine.prototype.Initialize = function (empty) {
        if (this.isInitialized) {
            return false;
        }
        else if (this.isTerminated) {
            return false;
        }
        this.isInitialized = true;
        return true;
    };
    ScormEngine.prototype.Terminate = function (empty) {
        if (!this.isInitialized) {
            return false;
        }
        else if (this.isTerminated) {
            return false;
        }
        this.isTerminated = true;
        return true;
    };
    ScormEngine.prototype.GetValue = function (name) {
        throw new Error("Method not implemented.");
    };
    ScormEngine.prototype.SetValue = function (name, value) {
        throw new Error("Method not implemented.");
    };
    ScormEngine.prototype.Commit = function (empty) {
        throw new Error("Method not implemented.");
    };
    ScormEngine.prototype.GetLastError = function () {
        throw new Error("Method not implemented.");
    };
    ScormEngine.prototype.GetErrorString = function () {
        throw new Error("Method not implemented.");
    };
    ScormEngine.prototype.GetDiagnostic = function () {
        throw new Error("Method not implemented.");
    };
    return ScormEngine;
}());
window.API_1484_11 = new ScormEngine();
//# sourceMappingURL=lms2004.js.map