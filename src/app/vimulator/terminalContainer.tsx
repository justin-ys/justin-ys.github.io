'use client' 

import TerminalWindow from "./terminalWindow";
import TerminalState from "./terminalState"
import styles from './vimulator.module.css'
import resolveFromName from "../assets/asset_resolver";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function TerminalContainer () {
    const [curFile, setCurFile] = useState('welcome');
    const [data, setData] = useState(resolveFromName('welcome'));

    useMemo(() => {
        setData(resolveFromName(curFile));
    }, [curFile]);

    const [terminalState, setTerminalState] = useState(TerminalState.DEFAULT);

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        if (ev.key == "i" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.INSERT);
        if (ev.key == "v" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.VISUAL);
        if (ev.key == "Escape" && terminalState != TerminalState.DEFAULT) setTerminalState(TerminalState.DEFAULT);
    }, [terminalState])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurFile(e.target.value as 'welcome' | 'portfolio');
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
                        </select>
                    </div>
                </div>
                <TerminalWindow prefill={data} terminalState={terminalState}
                    setTerminalState={setTerminalState} />
            </div>
            <div className={`h-[5vh] sticky flex items-end font-mono text-white ${styles.terminalText}`}>
                {terminalState == TerminalState.INSERT ? "-- INSERT --" : ""}
                {terminalState == TerminalState.VISUAL ? "-- VISUAL --" : ""}
            </div>
        </div>
    )
}
