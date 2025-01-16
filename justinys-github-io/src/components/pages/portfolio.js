import Masonry from "react-responsive-masonry"

import Typewriter from "../typewriter.js"
import PortfolioItem from "../portfolioItem";
import retrograde1 from "../../resource/retrograde-1.png"
import retrograde2 from "../../resource/retrograde-2.png"
import retrograde3 from "../../resource/retrograde-3.png"
import vaxbot1 from "../../resource/vaxbot1.png"
import vaxbot2 from "../../resource/vaxbot2.png"
import dataportal from "../../resource/dataportal.png"
import lightype from "../../resource/lightype.png"
import rgbike from "../../resource/rgbike.jpg"
import rgbike2 from "../../resource/rgbike2.jpg"
export default function Portfolio() {

    return <div style={{ padding: '3em' }}>
        <Typewriter size='4em' text="Things I've Done" time="1" colors={['black']}/>
        <Masonry gutter="1.5em" columnsCount={2}>
            <PortfolioItem title="Retrograde"
                           body={[<p>One of my most ambitious projects yet, <i>Retrograde</i> is a terminal-based
                               platformer and roguelike combo made in an entirely custom C++ engine. It has a custom soundtrack, the ability to load custom levels at runtime,
                               Windows and Linux support with different rendering backends, and a demo with <a href="https://jm-5.itch.io/retrograde">20 minutes of gameplay.</a></p>]}
                            github="https://github.com/justin-ys/Spylike"
                            images={[retrograde1, retrograde2, retrograde3]}/>
            <PortfolioItem title="VaxBot"
                           body={[<p>As part of my work with Vaccine Hunters Canada during the pandemic, I created VaxBot, a Discord interface for
                           the Find Your Immunization vaccine appointment database, a project which I also started and led for some time. I also worked
                           with the Vaccine Ontario project to obtain data, and helped them repair and improve their appointment database. VaxBot was made
                           using the Discord.py library in Python and used a custom algorithm to display the best appointments for users based on testing and feedback.
                           The tool received 400-500 users per day at peak; the parent project, FYI, was even acknowledged <a href="https://x.com/JustinTrudeau/status/1423436187251920907">by the Prime Minister.</a></p>]}
                           github="https://github.com/Vaccine-Hunters-Canada/VaxFinder-Discord"
                            images={[vaxbot1, vaxbot2]}/>
            <PortfolioItem title="CanDIG Data Ingest"
                           body={[<p>I developed a working data ingest pipeline for the <a href="https://www.distributedgenomics.ca/">CanDIG</a> federated cancer research database.
                           This included a new microservice for clinical and genomic data ingest endpoints,
                           and a UI designed in Figma and implemented in React. I was able to present a working version of this at the
                           UHN data tech demo. </p>]}
                           images={[dataportal]}/>
            <PortfolioItem title="Lightype"
                           body="Lightype is a typing training tool made in PyQt5. It has customizable test lengths and word corpi, with a focus
                           on a minimal UI without clutter."
                           images={[lightype]}
                           github="https://github.com/justin-ys/lighttype"/>
            <PortfolioItem title="RGBike"
                           body="RGBike is one of my hardware projects. I installed NeoPixel LED strips on my mountain bike as well as a pushbutton and Arduino,
                           which allowed the lighting pattern to be controlled. I was able to successfully traverse through Markham, Ontario late at night
                           using this setup! In terms of other hardware endeavors, I am also starting out on the firmware team for the
                           Midnight Sun solar car team at UWaterloo."
                           images={[rgbike, rgbike2]}/>
    </Masonry>
    </div>
}