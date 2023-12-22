import Command, { ICmdParams } from './_command';
declare class ClearCommand extends Command {
    constructor();
    removeDirRecursively(path: string): Promise<void>;
    execute(params?: ICmdParams): Promise<void>;
}
declare const _default: ClearCommand;
export default _default;
