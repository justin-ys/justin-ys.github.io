import styles from './vimulator.module.css'
import TerminalState from "./terminalState"
import { useEffect, useRef, useState } from 'react';
import { Emitter } from 'mitt';
import { TerminalEvents } from './terminalEvents';

interface CommandAreaProps {
    terminalState: TerminalState;
    emitter: Emitter<TerminalEvents>;
}

interface CommandInputProps {
    emitter: Emitter<TerminalEvents>;
}
function CommandInput({ emitter }: CommandInputProps) {
    const [value, setValue] = useState(':');
    const initialInput = useRef<number>(undefined);
    const [commandComplete, setCommandComplete] = useState<boolean>(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!initialInput.current) {
                initialInput.current = 1;
                if (event.key == ":") return; // TODO TERRIBLE TERRIBLE TERRIBLE FIX
            }
            if (event.key === 'Enter' || event.key === 'NumpadEnter') {
                event.preventDefault();
                setCommandComplete(true);
                return;
            }

            if (event.key === 'Backspace') {
                event.preventDefault();
                setValue((currentValue) => currentValue.slice(0, -1));
                return;
            }

            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                setValue((currentValue) => currentValue + event.key);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (initialInput.current && !value) emitter.emit("CmdClear");
        if (commandComplete && value) {
            const cmd = value.slice(1);
            const parts = cmd.split(" ");
            if (parts[0] == 'n') {
                if (parts.length < 2) emitter.emit("InvalidCmd", "E119: Not enough arguments for function: n");
                else {
                    const fname = parts[1];
                    emitter.emit("ChangeFile", fname);
                }
            }
            else if (parts[0] == "help") {
                emitter.emit("ChangeFile", "help.vtxt");
            }
            else emitter.emit("InvalidCmd", `E492: Not an editor command: ${cmd}`);
            emitter.emit("CmdClear");
        }
    }, [value, commandComplete])

    return (
        <div
            className={`min-w-0 flex-1 overflow-x-scroll overflow-y-hidden whitespace-nowrap ${styles.commandInput}`}
            aria-label="Command input"
            role="textbox"
            tabIndex={0}
        >
            {value}
        </div>
    )
}

export default function CommandArea ({ terminalState, emitter }: CommandAreaProps) {
    const [invalidCommand, setInvalidCommand] = useState<string | null>(null);

    useEffect(() => {
        if (terminalState != TerminalState.DEFAULT) setInvalidCommand(null);
    }, [terminalState]);

    useEffect(() => {
        const handleInvalidCmd = (command: string) => {
            setInvalidCommand(command);
        };

        emitter.on('InvalidCmd', handleInvalidCmd);
        return () => {
            emitter.off('InvalidCmd', handleInvalidCmd);
        };
    }, [emitter]);

    return (
        <div className={`h-[5vh] sticky flex items-end font- ${styles.terminalText} text-white`}>
            {invalidCommand ? (
                <div className="m-1 bg-red-600 whitespace-nowrap">{invalidCommand}</div>
            ) : ""}
            {!invalidCommand ? (
                <div>
                    {terminalState == TerminalState.INSERT ? "-- INSERT --" : ""}
                    {terminalState == TerminalState.VISUAL ? "-- VISUAL --" : ""}
                    {terminalState == TerminalState.CMD ? 
                        (<div className="flex flex-row">
                            <CommandInput emitter={emitter}/>
                        </div>
                    ): ""}
                </div>
            ): ""}
        </div>
    );
}