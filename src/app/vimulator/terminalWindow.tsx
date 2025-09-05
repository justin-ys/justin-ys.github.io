'use client'

import styles from './vimulator.module.css'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import TerminalState from './terminalState';

interface TerminalWindowProps {
    title?: string;
    prefill?: string;
    terminalState: TerminalState;
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
    const [currentlyEditing, setCurrentlyEditing] = useState<number>(0);
    const [focusedIdx, setFocusedIdx] = useState<number>(0);
    const [caretPos, setCaretPos] = useState<number>(0);

    useMemo(() => {
        if (inputs.length > 20) {
            setShowTildes(false);
        }
        else {
            setTildeCount(20 - inputs.length);
        }
    }, [inputs.length]);

    const refreshInputs = (index: number) => {
        setTimeout(() => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].style.height = 'auto';
                inputRefs.current[index].style.height = inputRefs.current[index].scrollHeight + 'px';
            }
        }, 0);
    }

    const updateCaret = useCallback(() => {
        setFocusedIdx(currentlyEditing);
        if (inputRefs.current[currentlyEditing]) {
            setCaretPos(inputRefs.current[currentlyEditing]?.selectionStart)
        }
    }, [currentlyEditing]);

    useMemo(() => {
        inputs.forEach((_, idx) => refreshInputs(idx));
        if (props.terminalState == TerminalState.INSERT) {
            setTimeout(() => {
                inputRefs.current[focusedIdx]?.focus();
                inputRefs.current[focusedIdx]?.setSelectionRange(caretPos, caretPos);
            });
        }
        else {
            updateCaret();
        }
            
    }, [props.terminalState])

    useEffect(() => {
        if (props.terminalState == TerminalState.DEFAULT) {
            if (containerRef.current) {
                containerRef.current.focus();
            }
        }
    })

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInputs = [...inputs];
        newInputs[index] = {...newInputs[index], content: event.target.value};
        setInputs(newInputs);
        refreshInputs(index);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputs[index].content.length == 0) {
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
            inputRefs.current[index+1]?.setSelectionRange(0, 0);
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
            e.preventDefault();
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
            e.preventDefault();
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

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>, idx: number) => {
        setCurrentlyEditing(idx);
    }

    return (
        <div>
            {props.title &&
                <div className="bg-teal-50">
                    <div className={`text-center text-black font-mono ${styles.terminalText}`}>{props.title}</div>
                </div>
            }
            <div
                ref={containerRef}
                className="w-full h-full flex flex-col overflow-y-auto min-h-0 focus:outline-none"
                style={{ minHeight: 0, height: '100%' }}
                tabIndex={0}
                onKeyDown={e => {
                    if (props.terminalState !== TerminalState.INSERT) {
                        e.preventDefault();
                        if (e.key === 'ArrowLeft') {
                            setCaretPos(pos => Math.max(0, pos - 1));
                        } else if (e.key === 'ArrowRight') {
                            setCaretPos(pos => Math.min(inputs[focusedIdx].content.length, pos + 1));
                        } else if (e.key === 'ArrowUp') {
                            if (focusedIdx > 0) {
                                const pos = caretPos;
                                setFocusedIdx(focusedIdx - 1);
                                setCaretPos(Math.min(pos, inputs[focusedIdx - 1].content.length));
                            }
                        } else if (e.key === 'ArrowDown') {
                            if (focusedIdx < inputs.length - 1) {
                                const pos = caretPos;
                                setFocusedIdx(focusedIdx + 1);
                                setCaretPos(Math.min(pos, inputs[focusedIdx + 1].content.length));
                            }
                        }
                    }
                }}
            >
                {inputs.map((value, idx) => (
                    <div
                        key={idx}
                        ref={idx === 0 ? lineRef : undefined}
                        className={`flex flex-row gap-2 ${styles.terminalText}`}
                    >
                        <div className="text-right w-6">{`${idx}`}</div>
                        {props.terminalState === TerminalState.INSERT ? (
                            <textarea
                                rows={1}
                                value={value.content}
                                ref={el => { inputRefs.current[idx] = el; }}
                                onChange={e => handleInputChange(idx, e)}
                                onKeyDown={e => handleKeyDown(e, idx)}
                                onFocus={e => handleFocus(e, idx)}
                                className={`block w-full font-mono text-base bg-transparent outline-none border-none mb-1 ${inputs[idx].center ? 'text-center' : ''}`}
                                spellCheck={false}
                            />
                        ) : (
                            <div
                                className={`relative block w-full font-mono text-base bg-transparent outline-none border-none mb-1 whitespace-pre-wrap ${inputs[idx].center ? 'text-center' : ''}`}
                                style={{ minHeight: '1.5em', cursor: 'default' }}
                            >
                                {(() => {
                                    if (focusedIdx === idx) {
                                        const chars = value.content.split("");
                                        if (caretPos >= chars.length) {
                                            return <div>
                                                {chars.join("")}
                                                <span className="bg-white text-black inline leading-none p-0 m-0">&nbsp;</span>
                                            </div>;
                                        }
                                        return chars.map((c, i) =>
                                            i === caretPos ?
                                                <span key={i} className="bg-white text-black inline leading-none p-0 m-0">{c}</span>
                                                : c
                                        );
                                    } else {
                                        return value.content;
                                    }
                                })()}
                            </div>
                        )}
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
        </div>
    );
}