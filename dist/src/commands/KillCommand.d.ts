import Command, { ICmdParams } from './_command';
declare class KillCommand extends Command {
    constructor();
    execute(params: ICmdParams): Promise<void>;
}
declare const _default_1: KillCommand;
export default _default_1;
