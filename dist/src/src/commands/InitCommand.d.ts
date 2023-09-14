import Command, { ICmdParams } from './_command';
declare class InitCommand extends Command {
    constructor();
    execute(params?: ICmdParams): Promise<void>;
}
declare const _default_1: InitCommand;
export default _default_1;
