'use client'

import styles from './vimulator.module.css'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import TerminalState from './terminalState';

interface TerminalWindowProps {
    title?: string;
    prefill?: string;
    terminalState: TerminalState;
    setTerminalState: any;
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
    const [lastFocusedIdx, setLastFocusedIdx] = useState<number>(0);
    const [lastState, setLastState] = useState<TerminalState>(TerminalState.DEFAULT);

    // Default mode vars
    const [caretPos, setCaretPos] = useState<number>(0);
    const [lastCaretPos, setLastCaretPos] = useState<number>(0);

    const caretSet = (newPos: any, line: number = focusedIdx) => {
        setLastCaretPos(caretPos);
        var maxCaret = Math.max(inputs[line].content.length - 1, 0);
        if (isNaN(newPos)) {
            setCaretPos(pos => Math.max(0, Math.min(maxCaret, newPos(pos))));
        }
        else {
            setCaretPos(pos => Math.max(0, Math.min(maxCaret, newPos)))
        }
    }

    const focusedIdxSet = (newIdx: any) => {
        setLastFocusedIdx(focusedIdx);
        setFocusedIdx(Math.min(Math.max(0, newIdx), inputs.length));
    }

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

    const refreshInputs = (index: number) => {
        setTimeout(() => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].style.height = 'auto';
                inputRefs.current[index].style.height = inputRefs.current[index].scrollHeight + 'px';
            }
        }, 0);
    }

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
        setLastCaretPos(caretPos);
        setLastFocusedIdx(focusedIdx);
    }

    useMemo(() => {
        inputs.forEach((_, idx) => refreshInputs(idx));
        if (props.terminalState == TerminalState.INSERT && (lastState == TerminalState.DEFAULT || lastState == TerminalState.VISUAL)) {
            setTimeout(() => {
                inputRefs.current[focusedIdx]?.focus();
                inputRefs.current[focusedIdx]?.setSelectionRange(caretPos, caretPos);
            });
        }
        else {
            updateCaret(lastState);
        }
        setLastState(props.terminalState);
    }, [props.terminalState])

    useEffect(() => {
        if (props.terminalState == TerminalState.DEFAULT) {
            if (containerRef.current) {
                containerRef.current.focus();
            }
        }
    })

    useMemo(() => {
        if (props.terminalState == TerminalState.VISUAL) {
            if (focusedIdx == selectionStart[0]) {
                if (lastFocusedIdx == selectionStart[0]) {
                    if (selectionEnd[0] > focusedIdx) {
                        setSelectionStart([focusedIdx, caretPos]);
                    }
                    else if (lastCaretPos == selectionEnd[1] && caretPos > selectionStart[1]) {
                        setSelectionEnd([focusedIdx, caretPos]);
                    }
                    else {
                        setSelectionStart([focusedIdx, caretPos]);
                    }
                }
                else {
                    if (selectionEnd[0] > focusedIdx && lastFocusedIdx < selectionEnd[0]) {
                        setSelectionStart([focusedIdx, caretPos]);
                    }
                    else {
                        if (caretPos >= selectionStart[1]) {
                            setSelectionEnd([focusedIdx, caretPos]);
                        }
                        else {
                            setSelectionEnd(selectionStart);
                            setSelectionStart([focusedIdx, caretPos]);
                        }
                    }
                }
            }
            else if (focusedIdx < selectionStart[0]) {
                if (lastFocusedIdx == selectionEnd[0] && lastCaretPos == selectionEnd[1]) {
                    setSelectionEnd(selectionStart);
                }
                setSelectionStart([focusedIdx, caretPos]);
            }
            else {
                if (focusedIdx < selectionEnd[0]) {
                    if (lastFocusedIdx == selectionStart[0]) {
                        setSelectionStart([focusedIdx, caretPos]);
                    }
                    else {
                        setSelectionEnd([focusedIdx, caretPos]);
                    }
                }
                else if (focusedIdx > selectionEnd[0]) {
                    setSelectionEnd([focusedIdx, caretPos]);
                }
                else {
                    if (lastFocusedIdx == selectionStart[0] && lastCaretPos == selectionStart[1]) {
                        if (caretPos <= selectionEnd[1]) {
                            setSelectionStart([focusedIdx, caretPos]);
                        }
                        else {
                            setSelectionStart(selectionEnd);
                            setSelectionEnd([focusedIdx, caretPos]);
                        }
                    }
                    else {
                        setSelectionEnd([focusedIdx, caretPos]);
                    }
                }
            }
        }
    }, [caretPos, focusedIdx])

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

    const getSelection = () => {
        const lines = [];
        for (let i=selectionStart[0]; i<=selectionEnd[0]; i++) {
            var lineText = inputs[i].content;
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
    }

    const deleteSelection = () => {
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
            var toRemove = end - start - 1;
            var spliceStart = start+1;
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
    }

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
        setCaretPos(selectionStart[1]);
        setFocusedIdx(selectionStart[0]);
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
            var cIdx = focusedIdx - 1;
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

    const handleKeydown = useCallback((ev: KeyboardEvent) => {
        if (ev.key == "y" && props.terminalState == TerminalState.VISUAL) {
            handleYank();
            props.setTerminalState(TerminalState.DEFAULT);
        }
        if (ev.key == 'c' && props.terminalState == TerminalState.VISUAL) {
            handleCut();
            props.setTerminalState(TerminalState.DEFAULT);
        }
        if (ev.key == 'p' && props.terminalState == TerminalState.DEFAULT) {
            handlePaste();
        }
    }, [props.terminalState, selectionStart, selectionEnd, focusedIdx, caretPos, inputs])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown)
    }, [props.terminalState, selectionStart, selectionEnd, focusedIdx, caretPos, inputs])


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

        setTimeout(() => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].style.height = 'auto';
                inputRefs.current[index].style.height = inputRefs.current[index].scrollHeight + 'px';
            }
        }, 0);
    };

    const containerHandleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (props.terminalState !== TerminalState.INSERT) {
            e.preventDefault();
            if (e.key === 'ArrowLeft') {
                setLastFocusedIdx(focusedIdx);
                caretSet(pos => pos-1);
            }
            else if (e.key == 'ArrowRight') {
                setLastFocusedIdx(focusedIdx);
                caretSet(pos => pos+1);
            } else if (e.key === 'ArrowUp') {
                if (focusedIdx > 0) {
                    focusedIdxSet(focusedIdx - 1);
                    caretSet(pos => pos, focusedIdx - 1);
                }
            } else if (e.key === 'ArrowDown') {
                if (focusedIdx < inputs.length - 1) {
                    focusedIdxSet(focusedIdx + 1);
                    caretSet(pos => pos, focusedIdx + 1);
                }
            }
        }
    }

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
                onKeyDown={containerHandleKeyDown}
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
                                    if (focusedIdx === idx || props.terminalState == TerminalState.VISUAL && (focusedIdx >= selectionStart[0] && focusedIdx <= selectionEnd[0])) {
                                        var chars = value.content.split("");
                                        if (chars.length == 0) {
                                            chars = [" "]; // space character for when the line is empty for cursor/visual blocks
                                        }
                                        if (props.terminalState == TerminalState.VISUAL && caretPos == chars.length && focusedIdx == idx) {
                                            chars.push(" ");
                                        }
                                        return chars.map((c, i) => {
                                            if (i === caretPos && focusedIdx == idx) {
                                                return <span key={i} className="bg-white text-black inline leading-none p-0 m-0">{c}</span>
                                            }
                                            // this needs to be refactored :(
                                            else if (props.terminalState == TerminalState.VISUAL && ((idx > selectionStart[0] && idx < selectionEnd[0]) || (idx == selectionStart[0] && selectionStart[0] == selectionEnd[0] && i >= selectionStart[1] && i <= selectionEnd[1]) || ((idx == selectionStart[0] && idx < selectionEnd[0] && i >= selectionStart[1]) || (idx == selectionEnd[0] && idx > selectionStart[0] && i <= selectionEnd[1])))) {
                                                return <span key={i} className="bg-gray-400 text-black inline leading-none p-0 m-0">{c}</span>
                                            }
                                            else return c;
                                    });
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