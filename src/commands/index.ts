import LambdaCommand from './LambdaCommand';
import InitCommand from './InitCommand';
import ClearCommand from './ClearCommand';
import ReloadDBSchemaCommand from './ReloadDBSchemaCommand';
import CMDListCommand from './CMDListCommand';
import HelpCommand from './HelpCommand';

export default [
    InitCommand,    
    LambdaCommand,
    ClearCommand,
    ReloadDBSchemaCommand,
    CMDListCommand,
    HelpCommand
];