'use client' 

import TerminalWindow from "./terminalWindow";
import TerminalState from "./terminalState"
import styles from './vimulator.module.css'
import resolveFromName from "../assets/asset_resolver";

import { useCallback, useEffect, useState } from "react";

export default function TerminalContainer () {
    const [data, setData] = useState(resolveFromName('welcome'));

    const [terminalState, setTerminalState] = useState(TerminalState.DEFAULT);

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        if (ev.key == "i" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.INSERT);
        if (ev.key == "v" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.VISUAL);
        if (ev.key == "Escape" && terminalState != TerminalState.DEFAULT) setTerminalState(TerminalState.DEFAULT);
    }, [terminalState])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [terminalState, handleKeydown])

    return (
        <div className="flex-col bg-black">
            <div className="h-[95vh] max-h-[95vh] overflow-y-scroll">
                <TerminalWindow title="File: welcome.vtxt" prefill={data} terminalState={terminalState}
                    setTerminalState={setTerminalState} />
            </div>
            <div className={`h-[5vh] sticky flex items-end font-mono text-white ${styles.terminalText}`}>
                {terminalState == TerminalState.INSERT ? "-- INSERT --" : ""}
                {terminalState == TerminalState.VISUAL ? "-- VISUAL --" : ""}
            </div>
        </div>
    )
}
