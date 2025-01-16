import {BrowserRouter as Router, useLocation} from 'react-router-dom'

import logo from './logo.svg';
import './App.css';
import MainPage from "./MainPage"
import HomePage from "./components/pages/home"
import MenuBar from "./components/menubar"
import Footer from "./components/footer"
import WalkMan from "./components/walkman"
import Portfolio from "./components/pages/portfolio";

function App() {
    return (<Router>
    <div className="App">
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400..700" rel="stylesheet" />
        <MainPage />
    </div>
    </Router>
  );
}

export default App;
