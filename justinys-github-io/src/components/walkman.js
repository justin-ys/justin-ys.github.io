import walk1 from "../resource/walk_1.png"
import walk2 from "../resource/walk_2.png"
import {useEffect, useState} from "react";
export default function WalkMan() {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {console.log("testing..."); setFrame(lastFrame => !lastFrame)}, 500);
        return () => clearInterval(interval);
    }, []);

    return <img src={frame ? walk1 : walk2} />
}