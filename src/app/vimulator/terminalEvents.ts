export type TerminalEvents = {
    CmdClear: undefined;
    InvalidCmd: string; // error msg
    ChangeFile: string; // filename
}