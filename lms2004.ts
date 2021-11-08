class ScormEngine implements Sheleski.Scorm.IScormEngine2004 {

    private isInitialized = false;
    private isTerminated = false;

    Initialize(empty: ""): boolean {
        if (this.isInitialized) {
            return false;
        }
        else if (this.isTerminated){
            return false;
        }

        this.isInitialized = true;

        return true;
    }
    Terminate(empty: ""): boolean {
        if (!this.isInitialized) {
            return false;
        }
        else if (this.isTerminated){
            return false;
        }

        this.isTerminated = true;

        return true;
    }
    GetValue(name: string): string {
        throw new Error("Method not implemented.");
    }
    SetValue(name: string, value: string): string {
        throw new Error("Method not implemented.");
    }
    Commit(empty: ""): boolean {
        throw new Error("Method not implemented.");
    }
    GetLastError(): number {
        throw new Error("Method not implemented.");
    }
    GetErrorString(): string {
        throw new Error("Method not implemented.");
    }
    GetDiagnostic(): string {
        throw new Error("Method not implemented.");
    }

}

(<any>window).API_1484_11 = new ScormEngine();