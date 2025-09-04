'use client' 

import TerminalWindow from "./terminalWindow";
import TerminalState from "./terminalState"
import { useCallback, useEffect, useState } from "react";
import styles from './vimulator.module.css'

interface TerminalContainerProps {
    data?: string;
}

export default function TerminalContainer (props: TerminalContainerProps) {
    const [terminalState, setTerminalState] = useState(TerminalState.DEFAULT);

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        if (ev.key == "i" && terminalState == TerminalState.DEFAULT) setTerminalState(TerminalState.INSERT);
        if (ev.key == "Escape" && terminalState == TerminalState.INSERT) setTerminalState(TerminalState.DEFAULT);
    }, [terminalState])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [terminalState])

    return (
        <div className="flex-col">
            <div className="h-[95vh] max-h-[95vh]">
                <TerminalWindow title="File: welcome.vtxt" prefill={props.data} terminalState={terminalState}/>
            </div>
            <div className={`h-[5vh] flex items-end font-mono ${styles.terminalText}`}>
                {terminalState == TerminalState.INSERT ? "-- INSERT --" : ""}
            </div>
        </div>
    )
}
