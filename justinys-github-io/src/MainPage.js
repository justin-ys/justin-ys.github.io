import MenuBar from "./components/menubar";
import Portfolio from "./components/pages/portfolio";
import HomePage from "./components/pages/home";
import WalkMan from "./components/walkman";
import Footer from "./components/footer";

import {useLocation} from "react-router-dom";
import {useState, useEffect} from 'react';

export default function MainPage() {
    const location = useLocation();
    const [path, setPath] = useState("/home");

    useEffect(() => {
        setPath(location.pathname);
        document.title = location.pathname == "/portfolio" ? "Things I've Done" : "Welcome!"
    }, [location])

    return <div className="MainPage">
        <MenuBar />
        {path == "/portfolio" ? <Portfolio /> : <HomePage />}
        <WalkMan />
        <Footer />
    </div>
}