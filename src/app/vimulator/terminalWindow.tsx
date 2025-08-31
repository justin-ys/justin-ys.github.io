'use client'

import styles from './vimulator.module.css'
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

export default function TerminalWindow() {
    const [inputs, setInputs] = useState(['']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [lineHeight, setLineHeight] = useState<number>(0);
    const [showTildes, setShowTildes] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.clientHeight);
        }
        if (lineRef.current) {
            setLineHeight(lineRef.current.offsetHeight);
        }
    }, [inputs.length]);

    useEffect(() => {
        if (containerHeight && lineHeight) {
            const totalLinesHeight = inputs.length * lineHeight;
            setShowTildes(totalLinesHeight <= containerHeight);
        }
    }, [containerHeight, lineHeight, inputs.length]);

    // Calculate how many ~ lines to show
    let tildeCount = 0;
    if (showTildes && lineHeight > 0 && containerHeight > 0) {
        tildeCount = Math.max(0, Math.floor(containerHeight / lineHeight) - inputs.length);
    }

    const handleInputChange = (index: number, value: string) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            setInputs(prevInputs => [
                ...prevInputs.slice(0, index+1),
                '',
                ...prevInputs.slice(index + 1)
            ]);
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }
        if (e.key == 'Backspace') {
            if (inputs[index].length == 0 && index > 0) {
                setInputs(prevInputs => [
                    ...prevInputs.slice(0, index),
                    ...prevInputs.slice(index + 1)
                ]);
                setTimeout(() => {
                    inputRefs.current[index - 1]?.focus();
                }, 0);
            }
        }
        if (e.key == 'ArrowUp') {
            if (index > 0) {
                const pos = inputRefs.current[index]?.selectionStart;
                if (pos != null) {
                    setTimeout(() => {
                        inputRefs.current[index-1]?.focus();
                        inputRefs.current[index-1]?.setSelectionRange(pos, pos);
                    }, 0);
                }
            }
        }
        if (e.key == 'ArrowDown') {
            if (index < inputs.length - 1) {
                const pos = inputRefs.current[index]?.selectionStart;
                if (pos != null) {
                    setTimeout(() => {
                        inputRefs.current[index+1]?.focus();
                        inputRefs.current[index+1]?.setSelectionRange(pos, pos);
                    }, 0);
                }
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col overflow-y-auto min-h-0"
            style={{ minHeight: 0, height: '100%' }}
        >
            {inputs.map((value, idx) => (
                <div
                    key={idx}
                    ref={idx === 0 ? lineRef : undefined}
                    className={`flex flex-row gap-2 ${styles.terminalText}`}
                >
                    <div className="text-right w-6">{`${idx}`}</div>
                    <input
                        type="text"
                        value={value}
                        ref={el => { inputRefs.current[idx] = el; }}
                        onChange={e => handleInputChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        className="block w-full font-mono text-base bg-transparent outline-none border-none mb-1"
                    />
                </div>
            ))}
            {showTildes && tildeCount > 0 && (
                <div className="flex flex-col flex-grow select-none" aria-hidden="true">
                    {Array.from({ length: tildeCount }, (_, i) => (
                        <div key={i} className="text-right w-6 block font-mono" style={{ 'height': lineHeight }}>~</div>
                    ))}
                </div>
            )}
        </div>
    );
}