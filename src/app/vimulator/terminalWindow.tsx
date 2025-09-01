'use client'

import styles from './vimulator.module.css'
import { useState, useRef, useEffect, useMemo } from 'react';

interface TerminalWindowProps {
    title?: string;
    prefill?: string;
}

interface Vimput {
    content: string;
    center?: boolean;
}

export default function TerminalWindow(props: TerminalWindowProps) {
    const [inputs, setInputs] = useState<Vimput[]>([{content: ''}]);
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const [showTildes, setShowTildes] = useState<boolean>(true);
    const [tildeCount, setTildeCount] = useState<number>(20);
    const tildeRef = useRef<HTMLDivElement>(null);

    useMemo(() => {
        if (inputs.length > 20) {
            setShowTildes(false);
        }
        else {
            setTildeCount(20 - inputs.length);
        }
    }, [inputs.length]);

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInputs = [...inputs];
        newInputs[index] = {...newInputs[index], content: event.target.value};
        setInputs(newInputs);
        setTimeout(() => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].style.height = 'auto';
                inputRefs.current[index].style.height = inputRefs.current[index].scrollHeight + 'px';
            }
        }, 0);
    };

    const addLine = (index: number, data: Vimput) => {
        setInputs(prevInputs => [
            ...prevInputs.slice(0, index+1),
            data,
            ...prevInputs.slice(index + 1)
        ]);
        setTimeout(() => {
            const ref= inputRefs.current[index+1];
            if (ref) {
                ref.style.height = ref.scrollHeight + 'px';
            }
        }, 0);
    }

    const deleteLine = (index: number) => {
        if (inputs[index].content.length == 0 && index > 0) {
            setInputs(prevInputs => [
                ...prevInputs.slice(0, index),
                ...prevInputs.slice(index + 1)
            ]);
        }
    }

    useEffect(() => {
        if (props.prefill) {
            setInputs([]);
            const lines = props.prefill.split("\n");
            const curLength = inputs.length;
            lines.forEach((line, idx) => {
                if (line.startsWith('[center]')) {
                    addLine(curLength+idx, {content: line.slice(8), center: true})
                } else {
                    addLine(curLength+idx, {content: line})
                }
            }
            )
        }
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputRefs.current[index]?.selectionStart == 0 && inputRefs.current[index]?.selectionEnd == 0) {
                addLine(index, {content: ''});
            }
            else {
                if (inputRefs.current[index]) {
                    const part1 = inputs[index].content.slice(0, inputRefs.current[index].selectionStart);
                    const part2 = inputs[index].content.slice(inputRefs.current[index].selectionStart);
                    const newInput = inputs[index];
                    newInput.content = part1;
                    setInputs(prevInputs => [
                        ...prevInputs.slice(0, index),
                        newInput,
                        {content: part2},
                        ...prevInputs.slice(index + 1)
                    ])
                }
            }
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }
        if (e.key == 'Backspace') {
            if (inputs[index].content.length == 0 && index > 0) {
                deleteLine(index);
                setTimeout(() => {
                    inputRefs.current[index - 1]?.focus();
                }, 0);
            }
            else if (inputRefs.current[index]?.selectionStart == 0 && inputRefs.current[index]?.selectionEnd == 0 && index > 0) {
                const combinedLines = inputs[index-1].content + inputs[index].content;
                const newInput = inputs[index-1];
                newInput.content = combinedLines;
                setInputs(prevInputs => [
                    ...prevInputs.slice(0, index-1),
                    newInput,
                    ...prevInputs.slice(index + 1)
                ])
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

        setTimeout(() => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].style.height = 'auto';
                inputRefs.current[index].style.height = inputRefs.current[index].scrollHeight + 'px';
            }
        }, 0);
    };

    return (
        <>
            {props.title &&
                <div className="bg-teal-50">
                    <div className={`text-center text-black font-mono ${styles.terminalText}`}>{props.title}</div>
                </div>
            }
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
                        <textarea
                            rows={1}
                            value={value.content}
                            ref={el => { inputRefs.current[idx] = el; }}
                            onChange={e => handleInputChange(idx, e)}
                            onKeyDown={e => handleKeyDown(e, idx)}
                            className={`block w-full font-mono text-base bg-transparent outline-none border-none mb-1 ${inputs[idx].center ? 'text-center' : ''}`}
                        />
                    </div>
                ))}
                    {showTildes && (
                    <div className="flex flex-col flex-grow select-none" aria-hidden="true">
                        {Array.from({ length: tildeCount }, (_, i) => (
                            <div key={i} ref={i === 0 ? tildeRef : null} className="text-right w-6 mb-1 block font-mono">~</div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}