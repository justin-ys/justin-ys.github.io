import github from '../resource/github.png';
import { Splide, SplideSlide } from '@splidejs/react-splide';

function PortfolioGithubLink(props) {
    return <a href={props.github} style={{ border: '0.1em solid black', borderRadius: '0.25em',
        backgroundColor: 'white', display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '1em', padding: '0.5em'}}>
        <img style={{ width: '2em', height: 'auto'}} src={github}/>
        {props.github}
    </a>
}

export default function PortfolioItem(props) {
    return <div className="portfolio-item">
        <div className="portfolio-title">{props.title}</div>
        <div className="portfolio-body">{props.body}</div>
        {props.github ? <PortfolioGithubLink github={props.github} /> : <div />}
        {props.images ?
            <div className="portfolio-image-container">
                <Splide options={{ fixedWidth: '50em', breakpoints: {
                    1200: {
                        fixedWidth: '20em'
                    }
                },
                autoplay: true, type: 'loop', rewind: 'true'}}>
                    {props.images.map((img) =>
                        <SplideSlide>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                                <img style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} src={img} />
                            </div>
                        </SplideSlide>
                    )}
                </Splide>
            </div>
            : <div />
        }
    </div>
}