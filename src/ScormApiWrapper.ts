namespace Sheleski {
    export namespace Scorm {


        enum ScormApiVersion {
            v1p2 = "1.2",
            v2004 = "2004"
        }

        type emptyString = "";

        interface IScormEngine2004 {
            Initialize(empty: emptyString): boolean;
            Terminate(empty: emptyString): boolean;
            GetValue(name: string): string;
            SetValue(name: string, value: string): string;
            Commit(empty: emptyString): boolean;
            GetLastError(): number;
            GetErrorString(): string;
            GetDiagnostic(): string;
        };

        interface IScormEngine1p2 {
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
            isSuccessful: boolean,
            errorString: string | null,
            errorDiagnostic: string | null
        };

        type SetValueResult = {
            errorCode: number,
            isSuccessful: boolean,
            errorString: string | null,
            errorDiagnostic: string | null
        };


        export interface IScormApiWrapper {
            get(name: string): GetValueResult;
            set(name: string, value: string): SetValueResult;

            getRaw(name: string): string;
            setRaw(name: string, value: string): boolean;

            initialize(): boolean;
            terminate(): void;
            commit(): boolean;
            getLastError(): number;
            getErrorString(): string;
            getDiagnostic(): string;
            getVersion(): ScormApiVersion;
        }

        enum ConnectionStatus {
            connected,
            disconnected
        };

        function getBoolean(value: any): boolean | null {
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
                let val = this.getRaw(name);
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
                    isSuccessful: isSuccessful,
                    errorString: errorString,
                    errorDiagnostic: errorDiagnostic
                };
            }

            set(name: string, value: string): SetValueResult {

                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;
                let errorCode = 0;

                let success = this.setRaw(name, value);

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
            }

            getRaw(name: string): string {
                return this.onGetRaw(name);
            }
            setRaw(name: string, value: string): boolean {
                return getBoolean(this.onSetRaw(name, value)) ?? false;
            }
            initialize(): boolean {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    this.onError(Errors.connectionAlreadyActive)
                }
                else {

                    if (this.onInitialize()) {
                        this.connectionStatus = ConnectionStatus.connected;

                        if (this.setCompletionStatusOnInitialize) {

                            let completionStatusParameter = this.completionStatusParameter;

                            let completionStatus = this.getRaw(completionStatusParameter);

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
            }
            terminate(): boolean {

                if (this.connectionStatus == ConnectionStatus.disconnected) {
                    this.onError(Errors.connectionInactive);
                    return false;
                }

                let success: boolean = false;

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
            }
            commit(): boolean {
                if (this.connectionStatus == ConnectionStatus.connected) {
                    return this.onCommit();
                }

                return false;
            }
            getLastError(): number {
                return this.onGetLastError();
            }
            getErrorString(): string {
                return this.onGetErrorString();
            }
            getDiagnostic(): string {
                return this.onGetDiagnostic();
            }

            protected abstract readonly exitParameter: string;
            protected abstract readonly completedCompletionStatus: string;
            protected abstract readonly incompleteCompletionStatus: string;
            protected abstract readonly suspendExitStatus: string;
            protected abstract readonly logoutExitStatus: string;
            protected abstract readonly notAttemptedCompletionStatus: string;
            protected abstract readonly completionStatusParameter: string;

            protected abstract onGetRaw(name: string): string;
            protected abstract onSetRaw(name: string, value: string): boolean;
            protected abstract onGetLastError(): number;
            protected abstract onGetErrorString(): string;
            protected abstract onGetDiagnostic(): string;
            protected abstract onInitialize(): boolean;
            protected abstract onTerminate(): boolean;
            protected abstract onCommit(): boolean;
            protected abstract onCommitBeforeTerminate(): boolean;

            abstract getVersion(): ScormApiVersion;

        }

        class ScormApiWrapper1p2 extends ScormApiWrapperBase {

            protected readonly exitParameter = "cmi.core.exit";
            protected readonly completedCompletionStatus = "passed";
            protected readonly suspendExitStatus = "suspend";
            protected readonly logoutExitStatus = "logout";
            protected readonly incompleteCompletionStatus =  "incomplete";
            protected readonly notAttemptedCompletionStatus =  "not attempted";
            protected readonly completionStatusParameter =  "cmi.core.lesson_status";

            private _api: IScormEngine1p2;

            constructor(api: IScormEngine1p2) {
                super();
                this._api = api;
            }

            onGetRaw(name: string): string {
                return this._api.LMSGetValue(name);
            }
            onSetRaw(name: string, value: string): boolean {
                return getBoolean(this._api.LMSSetValue(name, value)) ?? false;
            }
            onInitialize(): boolean {
                return this._api.LMSInitialize();
            }
            onTerminate(): boolean {
                return getBoolean(this._api.LMSFinish()) ?? false;
            }
            onCommit(): boolean {
                return getBoolean(this._api.LMSCommit("")) ?? false;
            }
            onGetLastError(): number {
                return this._api.LMSGetLastError();
            }
            onGetErrorString(): string {
                return this._api.LMSGetErrorString();
            }
            onGetDiagnostic(): string {
                return this._api.LMSGetDiagnostic();
            }
            getVersion(): ScormApiVersion {
                return ScormApiVersion.v1p2;
            }



            

            protected onCommitBeforeTerminate(): boolean {
                return this.onCommit();
            }

        }

        class ScormApiWrapper2004 extends ScormApiWrapperBase {

            protected readonly exitParameter = "cmi.exit";
            protected readonly completedCompletionStatus ="completed";
            protected readonly suspendExitStatus = "suspend"
            protected readonly logoutExitStatus =  "normal";
            protected readonly incompleteCompletionStatus =  "incomplete";
            protected readonly notAttemptedCompletionStatus = "unknown";
            protected readonly completionStatusParameter =  "cmi.completion_status";

            private _api: IScormEngine2004;

            constructor(api: IScormEngine2004) {
                super();
                this._api = api;
            }


            onGetRaw(name: string): string {
                return this._api.GetValue(name);
            }
            onSetRaw(name: string, value: string): boolean {
                return getBoolean(this._api.SetValue(name, value)) ?? false;
            }
            onInitialize(): boolean {
                return this._api.Initialize("");
            }
            onTerminate(): boolean {
                return getBoolean(this._api.Terminate("")) ?? false;
            }
            onCommit(): boolean {
                return getBoolean(this._api.Commit("")) ?? false;
            }
            onGetLastError(): number {
                return this._api.GetLastError();
            }
            onGetErrorString(): string {
                return this._api.GetErrorString();
            }
            onGetDiagnostic(): string {
                return this._api.GetDiagnostic();
            }
            getVersion(): ScormApiVersion {
                return ScormApiVersion.v2004;
            }

            
            protected onCommitBeforeTerminate(): boolean {
                //not required for 2004 where an implicit commit is applied during the Terminate
                return true;
            }

            
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
