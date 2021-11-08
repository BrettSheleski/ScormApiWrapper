namespace Sheleski {
    export namespace Scorm {


        enum ScormApiVersion {
            v1p2 = "1.2",
            v2004 = "2004"
        }

        type emptyString = "";

        export interface IScormEngine2004 {
            Initialize(empty: emptyString): boolean;
            Terminate(empty: emptyString): boolean;
            GetValue(name: string): string;
            SetValue(name: string, value: string): string;
            Commit(empty: emptyString): boolean;
            GetLastError(): number;
            GetErrorString(): string;
            GetDiagnostic(): string;
        };

        export interface IScormEngine1p2 {
            LMSInitialize(): boolean;
            LMSFinish(): boolean;
            LMSGetValue(name: string): string;
            LMSSetValue(name: string, value: string): string;
            LMSCommit(empty: emptyString): string;
            LMSGetLastError(): number;
            LMSGetErrorString(): string;
            LMSGetDiagnostic(): string;
        }

        type GetValueResult = {
            value: string,
            errorCode: number,
            success: boolean,
            errorString: string | null,
            errorDiagnostic: string | null
        };

        type SetValueResult = {
            errorCode: number,
            success: boolean,
            errorString: string | null,
            errorDiagnostic: string | null
        };


        export interface IScormApiWrapper {
            get(name: string): GetValueResult;
            set(name: string, value: string): SetValueResult;


            initialize(): boolean;
            terminate(): void;
            commit(): boolean;
            getLastError(): number;
            getErrorString(): string;
            getDiagnostic(): string;
            getVersion(): ScormApiVersion;
        };

        enum ConnectionStatus {
            connected,
            disconnected
        };

        function getBoolean(value: any): boolean {
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
                default:
                    return false;
            }
        }

        namespace Errors {
            export const connectionInactive = "failed: API connection is inactive."
            export const connectionAlreadyActive = "aborted: Connection already active."
        }


        type errorHandler = (message: string) => void;

        abstract class ScormApiWrapperBase implements IScormApiWrapper {


            private connectionStatus: ConnectionStatus = ConnectionStatus.disconnected;
            private completionStatus: string | null = null;
            private exitStatus: string | null = null;

            public setExitOnTerminate: boolean = true;
            public setCompletionStatusOnInitialize: boolean = true;
            public commitOnTerminate: boolean = true;

            public errorHandler: errorHandler = (message: string) => {
                throw message;
            }

            protected onError(message: string): void {
                this.errorHandler(message);
            }

            get(name: string): GetValueResult {

                if (this.connectionStatus == ConnectionStatus.disconnected) {

                    return {
                        value: "",
                        success: false,
                        errorCode: this.notInitializedErrorCode,
                        errorString: this.notInitializedErorrString,
                        errorDiagnostic: null
                    };

                }

                let val = this.apiGet(name);
                let errorCode = this.getLastError();

                let isSuccessful = (val !== "" || errorCode == 0);

                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;

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
                    success: isSuccessful,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            }

            set(name: string, value: string): SetValueResult {

                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;
                let errorCode = 0;

                let success = this.apiSet(name, value);

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
                    success: success,
                    errorCode: errorCode,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            }

            initialize(): boolean {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    this.onError(Errors.connectionAlreadyActive)
                }
                else {

                    if (this.apiInitialize()) {
                        this.connectionStatus = ConnectionStatus.connected;

                        if (this.setCompletionStatusOnInitialize) {

                            let completionStatusParameter = this.completionStatusParameter;

                            let completionStatus = this.apiGet(completionStatusParameter);

                            if (completionStatus == this.notAttemptedCompletionStatus) {
                                if (this.apiSet(completionStatusParameter, this.incompleteCompletionStatus)) {
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
            }
            terminate(): boolean {

                if (this.connectionStatus == ConnectionStatus.disconnected) {
                    this.onError(Errors.connectionInactive);
                    return false;
                }

                let success: boolean = false;

                if (this.setExitOnTerminate && !this.exitStatus) {
                    if (this.completionStatus !== this.completedCompletionStatus) {
                        success = this.apiSet(this.exitParameter, this.suspendExitStatus);
                    }
                    else {
                        success = this.apiSet(this.exitParameter, this.logoutExitStatus);
                    }
                }

                if (this.commitOnTerminate) {
                    success = this.apiCommitBeforeTerminate();
                }

                success = this.apiTerminate();

                if (success) {
                    this.connectionStatus = ConnectionStatus.disconnected;
                }

                return success;
            }
            commit(): boolean {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    return this.apiCommit();
                }

                return false;
            }
            getLastError(): number {
                return this.apiGetLastError();
            }
            getErrorString(): string {
                return this.apiGetErrorString();
            }
            getDiagnostic(): string {
                return this.apiGetDiagnostic();
            }

            protected abstract readonly exitParameter: string;
            protected abstract readonly completedCompletionStatus: string;
            protected abstract readonly incompleteCompletionStatus: string;
            protected abstract readonly suspendExitStatus: string;
            protected abstract readonly logoutExitStatus: string;
            protected abstract readonly notAttemptedCompletionStatus: string;
            protected abstract readonly completionStatusParameter: string;

            protected abstract readonly notInitializedErrorCode: number;
            protected abstract readonly notInitializedErorrString: string;

            protected abstract apiGet(name: string): string;
            protected abstract apiSet(name: string, value: string): boolean;
            protected abstract apiGetLastError(): number;
            protected abstract apiGetErrorString(): string;
            protected abstract apiGetDiagnostic(): string;
            protected abstract apiInitialize(): boolean;
            protected abstract apiTerminate(): boolean;
            protected abstract apiCommit(): boolean;
            protected abstract apiCommitBeforeTerminate(): boolean;

            abstract getVersion(): ScormApiVersion;

        }

        class ScormApiWrapper1p2 extends ScormApiWrapperBase {



            protected readonly exitParameter = "cmi.core.exit";
            protected readonly completedCompletionStatus = "passed";
            protected readonly suspendExitStatus = "suspend";
            protected readonly logoutExitStatus = "logout";
            protected readonly incompleteCompletionStatus = "incomplete";
            protected readonly notAttemptedCompletionStatus = "not attempted";
            protected readonly completionStatusParameter = "cmi.core.lesson_status";

            protected readonly notInitializedErrorCode: number = 301;
            protected readonly notInitializedErorrString: string = "API call was made before the call to LMSInitialize";

            private _api: IScormEngine1p2;

            constructor(api: IScormEngine1p2) {
                super();
                this._api = api;
            }

            public getVersion = () => ScormApiVersion.v1p2;

            protected apiGet = (name: string): string => this._api.LMSGetValue(name);
            protected apiSet = (name: string, value: string) => getBoolean(this._api.LMSSetValue(name, value));
            protected apiInitialize = () => this._api.LMSInitialize();
            protected apiTerminate = () => getBoolean(this._api.LMSFinish());
            protected apiCommit = () => getBoolean(this._api.LMSCommit(""));
            protected apiGetLastError = () => this._api.LMSGetLastError();
            protected apiGetErrorString = () => this._api.LMSGetErrorString();
            protected apiGetDiagnostic = () => this._api.LMSGetDiagnostic();
            
            protected apiCommitBeforeTerminate = () => this.apiCommit();
        }

        class ScormApiWrapper2004 extends ScormApiWrapperBase {

            protected readonly exitParameter = "cmi.exit";
            protected readonly completedCompletionStatus = "completed";
            protected readonly suspendExitStatus = "suspend"
            protected readonly logoutExitStatus = "normal";
            protected readonly incompleteCompletionStatus = "incomplete";
            protected readonly notAttemptedCompletionStatus = "unknown";
            protected readonly completionStatusParameter = "cmi.completion_status";
            protected readonly notInitializedErrorCode: number = 122;
            protected readonly notInitializedErorrString: string = "Call to GetValue failed because it was made before the call to Initialize.";


            private _api: IScormEngine2004;

            constructor(api: IScormEngine2004) {
                super();
                this._api = api;
            }

            public getVersion = () => ScormApiVersion.v2004;

            protected apiGet = (name: string) => this._api.GetValue(name);
            protected apiSet = (name: string, value: string) => getBoolean(this._api.SetValue(name, value));
            protected apiInitialize = () => this._api.Initialize("");
            protected apiTerminate = () => getBoolean(this._api.Terminate(""));
            protected apiCommit = () => getBoolean(this._api.Commit(""));
            protected apiGetLastError = () => this._api.GetLastError();
            protected apiGetErrorString = () => this._api.GetErrorString();
            protected apiGetDiagnostic = () => this._api.GetDiagnostic();
            
            //not required for 2004 where an implicit commit is applied during the Terminate
            protected apiCommitBeforeTerminate = () => true;
        }


        function windowIsValidOrigin(win: Window) {
            // prevent throwing an exception regarding the Same Origin Policy (see: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
            try {
                return win && win.document;
            }
            catch (ex) {
                return false;
            }
        }

        type FindApiResult = {
            v1p2: IScormEngine1p2 | null,
            v2004: IScormEngine2004 | null
        };

        function discoverApi(version: ScormApiVersion | null): FindApiResult {

            let win = window;

            let findResult: FindApiResult | null = findApiFromWindow(win, version);

            if (!findResult && win.parent && win.parent != win) {
                findResult = findApiFromWindow(win.parent, version);
            }

            if (!findResult && win.top && win.top.opener) {
                findResult = findApiFromWindow(win.top.opener, version);
            }

            if (!findResult && win.top && win.top.opener && windowIsValidOrigin(win.top.opener) && win.top.opener.document) {
                findResult = findApiFromWindow(win.top.opener.document, version);
            }

            return findResult ?? { v1p2: null, v2004: null };
        }

        function findApiFromWindow(win: Window, version: ScormApiVersion | null): FindApiResult | null {

            let findResult: FindApiResult,
                findAttemptLimit = 500;

            for (let findAttempts = 0; findAttempts <= findAttemptLimit; ++findAttempts) {

                findResult = getApiFromWindow(win);

                if (version == ScormApiVersion.v1p2 && findResult.v1p2) {
                    return findResult;
                }
                else if (version == ScormApiVersion.v2004 && findResult.v2004) {
                    return findResult
                }
                else if (findResult.v2004 || findResult.v1p2) {
                    return findResult;
                }
            }

            return null;
        };

        function getApiFromWindow(win: Window): FindApiResult {

            let anyWin: any = win;

            return {
                v1p2: <IScormEngine1p2>anyWin.API,
                v2004: <IScormEngine2004>anyWin.API_1484_11
            };
        }

        function initBase(version: ScormApiVersion | null): IScormApiWrapper | null {
            let api = discoverApi(version);

            if (api.v1p2) {
                return new ScormApiWrapper1p2(api.v1p2);
            }
            else if (api.v2004) {
                return new ScormApiWrapper2004(api.v2004);
            }

            return null;
        }


        export function init(): IScormApiWrapper | null {
            return initBase(null);
        }

        export function init2004(): ScormApiWrapper2004 | null {
            return initBase(ScormApiVersion.v2004) as ScormApiWrapper2004;
        }

        export function init1p2(): ScormApiWrapper1p2 | null {
            return initBase(ScormApiVersion.v1p2) as ScormApiWrapper1p2;
        }

    }
}
