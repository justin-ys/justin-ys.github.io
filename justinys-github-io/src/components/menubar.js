import {Link} from 'react-router'
export default function MenuBar() {
   return <div className="menubar-container" style={{ display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }}>
       {/* font suggestions from Stackoverflow's styling! --> */}
        <div className="menubar" style={{ backgroundColor: "#000000", display: "flex", padding: "0.5em", fontFamily: "Consolas Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif", fontSize: "1.25em",   gap: "2vw", alignItems: "center", justifyContent: "left", width: "100%"}}>
            <div style={{ color: "green", marginLeft: "0.5vw"}}>home@justin-ys.github.io<span style={{ color: 'grey' }}>:</span>~<span style={{ color: 'grey' }}>$ cd</span></div>
            <div className="menubar-items" style={{display: "flex", gap: "3vw", alignItems: "center", justifyContent: "center", marginRight: "0.5vw"}}>
                <div className="menu-item"><Link to={"/home"} style={{color: "green"}}>/Home</Link></div>
                <div className="menu-item"><Link to={"/portfolio"} style={{color: "green"}}>/Portfolio</Link></div>
            </div>
        </div>
    </div>
}