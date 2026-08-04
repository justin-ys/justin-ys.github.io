'use client' 

import TerminalWindow from "./terminalWindow";
import TerminalState from "./terminalState";
import CommandArea from "./commandArea";
import styles from './vimulator.module.css'
import resolveFromName from "../assets/asset_resolver";
import { TerminalEvents } from "./terminalEvents";
import mitt from 'mitt';

import { useCallback, useEffect, useMemo, useState } from "react";

export default function TerminalContainer () {
    const [curFile, setCurFile] = useState('welcome');
    const [data, setData] = useState(resolveFromName('welcome'));

    useMemo(() => {
        setData(resolveFromName(curFile));
    }, [curFile]);

    const [terminalState, setTerminalState] = useState(TerminalState.DEFAULT);

    // EVENT HANDLING
    const emitter = mitt<TerminalEvents>();

    emitter.on("CmdClear", e => setTerminalState(TerminalState.DEFAULT));
    emitter.on("ChangeFile", fname => {
        const file = fname.split(".vtxt")[0];
        const data = resolveFromName(file);
        if (!data) emitter.emit("InvalidCmd", "E212: No such file or directory")
        setCurFile(file);
        setData(resolveFromName(file));
    })

    // OTHER HANDLERS

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        if (ev.key == "i" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.INSERT);
        if (ev.key == "v" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.VISUAL);
        if (ev.key == ":" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.CMD);
        if (ev.key == "Escape" && terminalState != TerminalState.DEFAULT) setTerminalState(TerminalState.DEFAULT);
    }, [terminalState])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurFile(e.target.value as 'welcome' | 'portfolio' | 'writings');
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [terminalState, handleKeydown])

    return (
        <div className="flex-col bg-black">
            <div className="h-[95vh] max-h-[95vh] overflow-y-scroll">
                <div className="bg-teal-500">
                    <div className={`text-center text-black font-mono ${styles.terminalText}`}>
                        File: <select value={curFile} onChange={handleFileChange} className="bg-transparent text-black font-mono border-none outline-none cursor-pointer inline-block text-center">
                            <option value="welcome">welcome.vtxt</option>
                            <option value="portfolio">portfolio.vtxt</option>
                            <option value="writings">writings.vtxt</option>
                        </select>
                    </div>
                </div>
                <TerminalWindow prefill={data} terminalState={terminalState}
                    setTerminalState={setTerminalState} />
            </div>
            <CommandArea terminalState={terminalState} emitter={emitter}/>
        </div>
    )
}
