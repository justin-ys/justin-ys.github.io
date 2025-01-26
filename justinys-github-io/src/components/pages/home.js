import Typewriter from "../typewriter.js"
import couette from "../../resource/couette.png"
import dataportal from "../../resource/dataportal.png"
import { Splide, SplideSlide } from '@splidejs/react-splide'

import '@splidejs/react-splide/css/skyblue';
export default function HomePage() {
    return (
        <div style={{ padding: '2em' }} className="HomePage">
            <Typewriter size='15vw' text="Justin Y." time="1" colors={["black", "#444887"]} />
            <div className='homeTitle'>Greetings...</div>
            <div className="homeText">I'm a CS student @ <a href='https://uwaterloo.ca/'>UWaterloo</a> looking to make really neat things with computers. Some of my interests include biking, neural networks, audio engineering, automation, culinary experimentation and pseudo-philosophy. Want to learn more about me? Have a look at the menu above for my portfolio, resume and more.</div>
        </div>
    )
}