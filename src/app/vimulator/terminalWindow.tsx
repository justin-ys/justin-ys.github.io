'use client'

import styles from './vimulator.module.css'
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import TerminalState from './terminalState';

interface TerminalWindowProps {
    prefill?: string;
    terminalState: TerminalState;
    setTerminalState: (arg0: TerminalState) => void;
}

interface Vimput {
    content: string;
    center?: boolean;
}

export default function TerminalWindow({ prefill, terminalState, setTerminalState }: TerminalWindowProps) {
    const [inputs, setInputs] = useState<Vimput[]>([{content: ''}]);
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const [showTildes, setShowTildes] = useState<boolean>(true);
    const [tildeCount, setTildeCount] = useState<number>(20);
    const tildeRef = useRef<HTMLDivElement>(null);
    const [currentlyEditing, setCurrentlyEditing] = useState<number>(0);
    const lastState = useRef<TerminalState>(TerminalState.DEFAULT);
    const curState = useRef<TerminalState>(terminalState);

    // Default mode vars
    const [caretPos, setCaretPos] = useState<number>(0);
    const lastCaretPos = useRef<number>(0);
    const curCaretPos = useRef<number>(0);
    const [focusedIdx, setFocusedIdx] = useState<number>(0);
    const lastFocusedIdx = useRef<number>(0);
    const curFocusedIdx = useRef<number>(0);

    const caretSet = useCallback((newPos: number | ((arg0: number) => number), line: number = focusedIdx) => {
        lastCaretPos.current = caretPos;
        const maxCaret = Math.max(inputs[line].content.length - 1, 0);
        if (typeof newPos == 'number') {
            setCaretPos(Math.max(0, Math.min(maxCaret, newPos)));
        }
        else {
            setCaretPos(pos => Math.max(0, Math.min(maxCaret, newPos(pos))));
        }
    }, [inputs, caretPos, focusedIdx]);

    const focusedIdxSet = useCallback((newIdx: number) => {
        lastFocusedIdx.current = focusedIdx;
        setFocusedIdx(Math.min(Math.max(0, newIdx), inputs.length));
    }, [inputs, focusedIdx]);

    // Visual mode vars
    const [selectionStart, setSelectionStart] = useState<number[]>([0, 0]);
    const [selectionEnd, setSelectionEnd] = useState<number[]>([0, 0]);

    useMemo(() => {
        if (inputs.length > 20) {
            setShowTildes(false);
        }
        else {
            setTildeCount(20 - inputs.length);
        }
    }, [inputs.length]);

    useMemo(() => {
        const updateCaret = (ls: TerminalState) => {
            if (ls == TerminalState.INSERT) {
                focusedIdxSet(currentlyEditing);
                if (inputRefs.current[currentlyEditing]) {
                    caretSet(inputRefs.current[currentlyEditing]?.selectionStart)
                    setSelectionStart([currentlyEditing, inputRefs.current[currentlyEditing]?.selectionStart]);
                    setSelectionEnd([currentlyEditing, inputRefs.current[currentlyEditing]?.selectionStart]);
                }
            }
            else if (ls == TerminalState.DEFAULT) {
                setSelectionStart([focusedIdx, caretPos]);
                setSelectionEnd([focusedIdx, caretPos]);
            }
            lastCaretPos.current = caretPos;
            lastFocusedIdx.current = focusedIdx;
            curCaretPos.current = caretPos;
            curFocusedIdx.current = focusedIdx;
        };

        if (curState.current != terminalState) {
            if (terminalState == TerminalState.INSERT && (curState.current == TerminalState.DEFAULT || curState.current == TerminalState.VISUAL)) {
                setTimeout(() => {
                    inputRefs.current[focusedIdx]?.focus();
                    inputRefs.current[focusedIdx]?.setSelectionRange(caretPos, caretPos);
                });
            }
            else {
                updateCaret(curState.current);
            }
            lastState.current = curState.current;
            curState.current = terminalState;
        }
    }, [terminalState, caretPos, focusedIdx, currentlyEditing, focusedIdxSet, caretSet])

    useEffect(() => {
        if (terminalState == TerminalState.DEFAULT) {
            if (containerRef.current) {
                containerRef.current.focus();
            }
        }
    })

    useMemo(() => {
        if (terminalState == TerminalState.VISUAL && (curCaretPos.current != caretPos || curFocusedIdx.current != focusedIdx)) {
            if (lastCaretPos.current == selectionStart[1] && lastFocusedIdx.current == selectionStart[0]) {
                if (focusedIdx > selectionEnd[0] || (focusedIdx == selectionEnd[0] && caretPos >= selectionEnd[1])) {
                    setSelectionStart(selectionEnd);
                    setSelectionEnd([focusedIdx, caretPos]);
                }
                else {
                    setSelectionStart([focusedIdx, caretPos]);
                }
            }
            else {
                if (focusedIdx < selectionStart[0] || (focusedIdx == selectionStart[0] && caretPos <= selectionStart[1])) {
                    setSelectionEnd(selectionStart);
                    setSelectionStart([focusedIdx, caretPos]);
                }
                else {
                    setSelectionEnd([focusedIdx, caretPos]);
                }
            }
            curCaretPos.current = caretPos;
            curFocusedIdx.current = focusedIdx;
        }
    }, [caretPos, focusedIdx, terminalState, selectionEnd, selectionStart])

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInputs = [...inputs];
        newInputs[index] = {...newInputs[index], content: event.target.value};
        setInputs(newInputs);
    };

    const addLine = (index: number, data: Vimput) => {
        setInputs(prevInputs => [
            ...prevInputs.slice(0, index+1),
            data,
            ...prevInputs.slice(index + 1)
        ]);
        setTimeout(() => {
            const ref = inputRefs.current[index+1];
            if (ref) {
                ref.style.height = ref.scrollHeight + 'px';
            }
        }, 0);
    }

    const deleteLine = (index: number) => {
        if (index > 0) {
            setInputs(prevInputs => [
                ...prevInputs.slice(0, index),
                ...prevInputs.slice(index + 1)
            ]);
        }
    }

    useEffect(() => {
        if (prefill) {
            setInputs([]);
            const lines = prefill.split("\n");
            const curLength = 0;
            lines.forEach((line, idx) => {
                if (line.startsWith('[center]')) {
                    addLine(curLength+idx, {content: line.slice(8), center: true})
                } else {
                    addLine(curLength+idx, {content: line})
                }
            }
            )
        }
    }, [prefill])

    const getSelection = useCallback(() => {
        const lines = [];
        for (let i=selectionStart[0]; i<=selectionEnd[0]; i++) {
            let lineText = inputs[i].content;
            if (selectionStart[0] == selectionEnd[0]) {
                lineText = lineText.slice(selectionStart[1], selectionEnd[1]+1);
            }
            else if (i == selectionStart[0]) {
                lineText = lineText.slice(selectionStart[1]);
            }
            else if (i == selectionEnd[0]) {
                lineText = lineText.slice(0, selectionEnd[1]+1)
            }
            lines.push(lineText);
        }
        return lines.join("\n");
    }, [inputs, selectionStart, selectionEnd]);

    const deleteSelection = useCallback(() => {
        const newInputs = inputs;
        const start = selectionStart[0];
        const end = selectionEnd[0];
        if (start == end) {
            newInputs[start].content = inputs[start].content.slice(0, selectionStart[1]) + inputs[start].content.slice(selectionEnd[1]+1);
        }
        else {
            newInputs[start].content = inputs[start].content.slice(0, selectionStart[1]);
            newInputs[end].content = inputs[end].content.slice(selectionEnd[1]+1);
        }
        if (end > start + 1) {
            let toRemove = end - start - 1;
            let spliceStart = start+1;
            if (newInputs[start].content.length == 0) {
                spliceStart -= 1;
                toRemove += 1;
            }
            if (newInputs[end].content.length == 0) {
                toRemove += 1;
            }
            newInputs.splice(spliceStart, toRemove);
        }
        else {
            if (newInputs[start].content.length == 0) {
                newInputs.splice(start, 1);
            }
        }
        setInputs(newInputs);
    }, [inputs, selectionStart, selectionEnd]);

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        
        const handleYank = async () => {
            const text = getSelection();
            focusedIdxSet(selectionStart[0]);
            caretSet(selectionStart[1], selectionStart[0]);
            try {
                await navigator.clipboard.writeText(text);
            }
            catch (err) {
                console.log(err);
            }
        }
    
        const handleCut = async () => {
            const text = getSelection();
            deleteSelection();
            caretSet(selectionStart[1]);
            focusedIdxSet(selectionStart[0]);
            try {
                await navigator.clipboard.writeText(text);
            }
            catch (err) {
                console.log(err);
            }
        }
    
        const handlePaste = async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text.length == 0) return;
                const lines = text.split("\n");
                const beforePaste = inputs[focusedIdx].content.slice(0, caretPos+1);
                const afterPaste = inputs[focusedIdx].content.slice(caretPos+1, inputs[focusedIdx].content.length);
                deleteLine(focusedIdx);
                let cIdx = focusedIdx - 1;
                if (lines.length == 1) {
                    addLine(cIdx, {'content': beforePaste + lines[0] + afterPaste});
                }
                else {
                    addLine(cIdx, {'content': beforePaste + lines[0]});
                    cIdx++;
                    for (let i=1; i<lines.length-1; i++) {
                        addLine(cIdx, {'content': lines[i]});
                        cIdx++;
                    }
                    addLine(cIdx, {'content': lines[lines.length - 1] + afterPaste})
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        if (ev.key == "y" && terminalState == TerminalState.VISUAL) {
            handleYank();
            setTerminalState(TerminalState.DEFAULT);
        }
        if (ev.key == 'c' && terminalState == TerminalState.VISUAL) {
            handleCut();
            setTerminalState(TerminalState.DEFAULT);
        }
        if (ev.key == 'p' && terminalState == TerminalState.DEFAULT) {
            handlePaste();
        }
    }, [terminalState, setTerminalState, caretPos, caretSet, deleteSelection, getSelection, inputs, selectionStart, focusedIdx, focusedIdxSet])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [terminalState, selectionStart, selectionEnd, focusedIdx, caretPos, inputs, handleKeydown])


    const insertHandleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>, index: number) => {
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
    };

    const containerHandleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (terminalState !== TerminalState.INSERT) {
            e.preventDefault();
            if (e.key === 'ArrowLeft') {
                lastFocusedIdx.current = focusedIdx;
                caretSet((pos: number) => pos-1);
            }
            else if (e.key == 'ArrowRight') {
                lastFocusedIdx.current = focusedIdx;
                caretSet((pos: number)  => pos+1);
            } else if (e.key === 'ArrowUp') {
                if (focusedIdx > 0) {
                    focusedIdxSet(focusedIdx - 1);
                    caretSet((pos: number)  => pos, focusedIdx - 1);
                }
            } else if (e.key === 'ArrowDown') {
                if (focusedIdx < inputs.length - 1) {
                    focusedIdxSet(focusedIdx + 1);
                    caretSet((pos: number)  => pos, focusedIdx + 1);
                }
            }
        }
    }

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>, idx: number) => {
        setCurrentlyEditing(idx);
    }

    const findUrls = (text: string): Array<{start: number, end: number}> => {
        const urls: Array<{start: number, end: number}> = [];
        const urlRegex = /https:\/\/[^\s]+/g;
        let match;
        while ((match = urlRegex.exec(text)) !== null) {
            urls.push({ start: match.index, end: match.index + match[0].length - 1 });
        }
        return urls;
    }

    const isInUrl = (position: number, urls: Array<{start: number, end: number}>): boolean => {
        return urls.some(url => position >= url.start && position <= url.end);
    }


    return (
        <div>
            <div
                ref={containerRef}
                className="w-full h-full flex flex-col overflow-y-auto min-h-0 focus:outline-none text-white"
                style={{ minHeight: 0, height: '100%' }}
                tabIndex={0}
                onKeyDown={containerHandleKeyDown}
            >
                {inputs.map((value, idx) => (
                    <div
                        key={idx}
                        ref={idx === 0 ? lineRef : undefined}
                        className={`flex flex-row gap-2 ${styles.terminalText}`}
                    >
                        <div className="text-right w-6">{`${idx}`}</div>
                        {terminalState === TerminalState.INSERT ? (
                            <textarea
                                rows={1}
                                value={value.content}
                                ref={el => { 
                                    inputRefs.current[idx] = el;
                                    if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                    }
                                }}
                                onChange={e => handleInputChange(idx, e)}
                                onKeyDown={e => insertHandleKeyDown(e, idx)}
                                onFocus={e => handleFocus(e, idx)}
                                className={`block w-full font-mono text-base bg-transparent outline-none border-none resize-none mb-1 ${inputs[idx].center ? 'text-center' : ''}`}
                                spellCheck={false}
                            />
                        ) : (
                            <div
                                className={`relative block w-full font-mono text-base bg-transparent outline-none border-none mb-1 whitespace-pre-wrap ${inputs[idx].center ? 'text-center' : ''}`}
                                style={{ minHeight: '1.5em', cursor: 'default' }}
                            >
                                {(() => {
                                    const urls = findUrls(value.content);
                                    if (focusedIdx === idx || terminalState == TerminalState.VISUAL && (focusedIdx >= selectionStart[0] && focusedIdx <= selectionEnd[0])) {
                                        let chars = value.content.split("");
                                        if (chars.length == 0) {
                                            chars = [" "]; // space character for when the line is empty for cursor/visual blocks
                                        }
                                        if (terminalState == TerminalState.VISUAL && caretPos == chars.length && focusedIdx == idx) {
                                            chars.push(" ");
                                        }
                                        const elements: React.ReactNode[] = [];
                                        let currentUrlSegment: string[] = [];
                                        let currentUrlStart = -1;
                                        
                                        chars.forEach((c, i) => {
                                            const inUrl = isInUrl(i, urls);
                                            const isCursor = i === caretPos && focusedIdx == idx;
                                            // this needs to be refactored :(
                                            const isSelected = terminalState == TerminalState.VISUAL && ((idx > selectionStart[0] && idx < selectionEnd[0]) || (idx == selectionStart[0] && selectionStart[0] == selectionEnd[0] && i >= selectionStart[1] && i <= selectionEnd[1]) || ((idx == selectionStart[0] && idx < selectionEnd[0] && i >= selectionStart[1]) || (idx == selectionEnd[0] && idx > selectionStart[0] && i <= selectionEnd[1])));
                                            
                                            if (inUrl && !isCursor && !isSelected) {
                                                if (currentUrlStart === -1) {
                                                    currentUrlStart = i;
                                                }
                                                currentUrlSegment.push(c);
                                            } else {
                                                if (currentUrlSegment.length > 0) {
                                                    const urlText = currentUrlSegment.join("");
                                                    const urlStart = currentUrlStart;
                                                    
                                                    elements.push(
                                                        <a
                                                            key={`url-${urlStart}`}
                                                            href={urlText}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline text-blue-400 hover:text-blue-300"
                                                            onClick={(e) => {
                                                                if (terminalState !== TerminalState.DEFAULT) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            {urlText}
                                                        </a>
                                                    );
                                                    currentUrlSegment = [];
                                                    currentUrlStart = -1;
                                                }
                                                
                                                if (isCursor) {
                                                    elements.push(<span key={i} className="bg-white text-black inline leading-none p-0 m-0">{c}</span>);
                                                } else if (isSelected) {
                                                    elements.push(<span key={i} className="bg-gray-400 text-black inline leading-none p-0 m-0">{c}</span>);
                                                } else {
                                                    elements.push(c);
                                                }
                                            }
                                        });
                                        
                                        if (currentUrlSegment.length > 0) {
                                            const urlText = currentUrlSegment.join("");
                                            const urlStart = currentUrlStart;
                                            
                                            elements.push(
                                                <a
                                                    key={`url-${urlStart}`}
                                                    href={urlText}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline text-blue-400 hover:text-blue-300"
                                                    onClick={(e) => {
                                                        if (terminalState !== TerminalState.DEFAULT) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    {urlText}
                                                </a>
                                            );
                                        }
                                        
                                        return elements;
                                    } else {
                                        const urls = findUrls(value.content);
                                        if (urls.length === 0) {
                                            return value.content;
                                        }
                                        
                                        const elements: React.ReactNode[] = [];
                                        let lastIndex = 0;
                                        
                                        urls.forEach((url) => {
                                            if (url.start > lastIndex) {
                                                elements.push(value.content.slice(lastIndex, url.start));
                                            }
                                            const urlText = value.content.slice(url.start, url.end + 1);
                                            elements.push(
                                                <a
                                                    key={`url-${url.start}`}
                                                    href={urlText}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline text-blue-400 hover:text-blue-300"
                                                >
                                                    {urlText}
                                                </a>
                                            );
                                            lastIndex = url.end + 1;
                                        });
                                        
                                        if (lastIndex < value.content.length) {
                                            elements.push(value.content.slice(lastIndex));
                                        }
                                        
                                        return elements;
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