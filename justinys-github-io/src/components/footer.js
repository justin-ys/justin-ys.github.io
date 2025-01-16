export default function Footer() {
    const date = new Date();
    const month = date.getMonth()+1;
    const year = date.getFullYear();
    return <div className="footer" style={{ display: "inline-block", color: "#3d4c5e",
        fontFamily: "Roboto", fontSize: "0.8em", backgroundColor: "#b9c0c9", bottom: '0%',
        right: '0%', position: 'fixed', zIndex:1000, width: '100%', paddingRight: "0.1em"}}>
        <div>{`© Justin Y — ${month}/${year}`}</div>
    </div>
}