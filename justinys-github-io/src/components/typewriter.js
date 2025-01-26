export default function Typewriter(props) {
    const words = props.text.split(" ");
    return <div style={{display: 'inline-block'}}>
        {words.map((word, idx) => {
            const color = props.colors[idx % props.colors.length]
            const delay = props.time * idx;
            const text = word + (idx !== words.length - 1 ? ' ' : '')
            return <div style={{display: 'inline-block', marginTop: 0, marginBottom: 0}}>
                <pre className="typewriter" style={{color: color, animation: `typing ${props.time}s steps(${text.length}, end) forwards`}}
                        key={idx}>
                {text}
                </pre>
            </div>
        })}
    </div>
}

Typewriter.defaultProps = {
    time: "0.5",
    text: "",
    colors: ["black"]
}