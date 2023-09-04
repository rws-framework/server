import { IAppConfig } from "./services/AppConfigService";
import 'reflect-metadata';
declare const runShellCommand: (command: string) => Promise<void>;
declare function main(cfg: IAppConfig): Promise<void>;
declare const SetupRWS: typeof main;
export { SetupRWS, runShellCommand };
