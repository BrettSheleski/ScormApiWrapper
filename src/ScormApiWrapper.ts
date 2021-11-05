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


        interface IScormApiWrapper {
            get(name: string): GetValueResult;
            set(name: string, value: string): SetValueResult;

            getRaw(name: string): string;
            setRaw(name: string, value: string): string;

            initialize(): boolean;
            terminate(): void;
            commit(): void;
            getLastError(): number;
            getErrorString(): string;
            getDiagnostic(): string;
            getVersion(): ScormApiVersion;
        }

        class ScormApiWrapper1p2 implements IScormApiWrapper {

            private _api: IScormEngine1p2;

            constructor(api: IScormEngine1p2) {
                this._api = api;
            }
            get(name: string): GetValueResult {
                let val = this.getRaw(name);
                let errorCode = this.getLastError();

                let isSuccessful = errorCode == 0;
                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;

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
            }
            set(name: string, value: string): SetValueResult {
                let val = this.setRaw(name, value);
                let errorCode = this.getLastError();

                let isSuccessful = errorCode == 0;
                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;

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
            }
            getRaw(name: string): string {
                return this._api.LMSGetValue(name);
            }
            setRaw(name: string, value: string): string {
                return this._api.LMSSetValue(name, value);
            }
            initialize(): boolean {
                return this._api.LMSInitialize();
            }
            terminate(): void {
                this._api.LMSFinish();
            }
            commit(): void {
                this._api.LMSCommit("");
            }
            getLastError(): number {
                return this._api.LMSGetLastError();
            }
            getErrorString(): string {
                return this._api.LMSGetErrorString();
            }
            getDiagnostic(): string {
                return this._api.LMSGetDiagnostic();
            }
            getVersion(): ScormApiVersion {
                return ScormApiVersion.v1p2;
            }

        }

        class ScormApiWrapper2004 implements IScormApiWrapper {
            private _api: IScormEngine2004;

            constructor(api: IScormEngine2004) {
                this._api = api;
            }

            get(name: string): GetValueResult {
                let val = this.getRaw(name);
                let errorCode = this.getLastError();

                let isSuccessful = errorCode == 0;
                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;

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
            }

            set(name: string, value: string): SetValueResult {
                let val = this.setRaw(name, value);
                let errorCode = this.getLastError();

                let isSuccessful = errorCode == 0;
                let errorString: string | null = null;
                let errorDiagnostic: string | null = null;

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
            }
            getRaw(name: string): string {
                return this._api.GetValue(name);
            }
            setRaw(name: string, value: string): string {
                return this._api.SetValue(name, value);
            }
            initialize(): boolean {
                return this._api.Initialize("");
            }
            terminate(): void {
                this._api.Terminate("");
            }
            commit(): void {
                this._api.Commit("");
            }
            getLastError(): number {
                return this._api.GetLastError();
            }
            getErrorString(): string {
                return this._api.GetErrorString();
            }
            getDiagnostic(): string {
                return this._api.GetDiagnostic();
            }
            getVersion(): ScormApiVersion {
                return ScormApiVersion.v2004;
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

        function getApi(win: Window): FindApiResult {

            let anyWin: any = win;

            return {
                v1p2: <IScormEngine1p2>anyWin.API,
                v2004: <IScormEngine2004>anyWin.API_1484_11
            };
        }

        export function initBase(version: ScormApiVersion | null): IScormApiWrapper | null {
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
