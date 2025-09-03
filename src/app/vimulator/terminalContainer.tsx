'use client' 

import TerminalWindow from "./terminalWindow";
import TerminalState from "./terminalState"
import { useState } from "react";

interface TerminalContainerProps {
    data?: string;
}

export default function TerminalContainer (props: TerminalContainerProps) {
    const [terminalState, setTerminalState] = useState(TerminalState.DEFAULT);

    return (
        <div className="h-screen max-h-screen">
             <TerminalWindow title="File: welcome.vtxt" prefill={props.data} terminalState={terminalState}/>
        </div> 
    )
}
