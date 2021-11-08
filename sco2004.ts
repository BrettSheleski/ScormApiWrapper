let scorm: Sheleski.Scorm.IScormApiWrapper | null;


let findScormApiButton = document.getElementById("findScormApiButton") as HTMLButtonElement | null;

let initializeButton = document.getElementById("initializeButton") as HTMLButtonElement | null;
let getValueButton = document.getElementById("getValueButton") as HTMLButtonElement | null;
let setValueButton = document.getElementById("setValueButton") as HTMLButtonElement | null;
let commitButton = document.getElementById("commitButton") as HTMLButtonElement | null;
let terminateButton = document.getElementById("terminateButton") as HTMLButtonElement | null;
let getLastErrorButton = document.getElementById("getLastErrorButton") as HTMLButtonElement | null;
let getErrorStringButton = document.getElementById("getErrorStringButton") as HTMLButtonElement | null;
let getDiagnosticButton = document.getElementById("getDiagnosticButton") as HTMLButtonElement | null;

findScormApiButton?.addEventListener("click", function(){
    scorm = Sheleski.Scorm.init();

    if (scorm){
        document.getElementById("step1")?.classList.add("visually-hidden");
        document.getElementById("step2")?.classList.remove("visually-hidden");
    }
    else{
        alert("Scorm Engine NOT FOUND");
    }
});

initializeButton?.addEventListener("click", function(){
    scorm?.initialize();
});

getValueButton?.addEventListener("click", function(){
    
});

setValueButton?.addEventListener("click", function(){
    
});

commitButton?.addEventListener("click", function(){
    scorm?.commit();
});

terminateButton?.addEventListener("click", function(){
    scorm?.terminate();
});

getLastErrorButton?.addEventListener("click", function(){
    
});

getErrorStringButton?.addEventListener("click", function(){
    
});

getDiagnosticButton?.addEventListener("click", function(){
    
});