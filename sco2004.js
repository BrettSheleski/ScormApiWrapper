"use strict";
var scorm;
var findScormApiButton = document.getElementById("findScormApiButton");
var initializeButton = document.getElementById("initializeButton");
var getValueButton = document.getElementById("getValueButton");
var setValueButton = document.getElementById("setValueButton");
var commitButton = document.getElementById("commitButton");
var terminateButton = document.getElementById("terminateButton");
var getLastErrorButton = document.getElementById("getLastErrorButton");
var getErrorStringButton = document.getElementById("getErrorStringButton");
var getDiagnosticButton = document.getElementById("getDiagnosticButton");
findScormApiButton === null || findScormApiButton === void 0 ? void 0 : findScormApiButton.addEventListener("click", function () {
    var _a, _b;
    scorm = Sheleski.Scorm.init();
    if (scorm) {
        (_a = document.getElementById("step1")) === null || _a === void 0 ? void 0 : _a.classList.add("visually-hidden");
        (_b = document.getElementById("step2")) === null || _b === void 0 ? void 0 : _b.classList.remove("visually-hidden");
    }
    else {
        alert("Scorm Engine NOT FOUND");
    }
});
initializeButton === null || initializeButton === void 0 ? void 0 : initializeButton.addEventListener("click", function () {
    scorm === null || scorm === void 0 ? void 0 : scorm.initialize();
});
getValueButton === null || getValueButton === void 0 ? void 0 : getValueButton.addEventListener("click", function () {
});
setValueButton === null || setValueButton === void 0 ? void 0 : setValueButton.addEventListener("click", function () {
});
commitButton === null || commitButton === void 0 ? void 0 : commitButton.addEventListener("click", function () {
    scorm === null || scorm === void 0 ? void 0 : scorm.commit();
});
terminateButton === null || terminateButton === void 0 ? void 0 : terminateButton.addEventListener("click", function () {
    scorm === null || scorm === void 0 ? void 0 : scorm.terminate();
});
getLastErrorButton === null || getLastErrorButton === void 0 ? void 0 : getLastErrorButton.addEventListener("click", function () {
});
getErrorStringButton === null || getErrorStringButton === void 0 ? void 0 : getErrorStringButton.addEventListener("click", function () {
});
getDiagnosticButton === null || getDiagnosticButton === void 0 ? void 0 : getDiagnosticButton.addEventListener("click", function () {
});
//# sourceMappingURL=sco2004.js.map