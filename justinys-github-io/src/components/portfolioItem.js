import github from '../resource/github.png';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { Link } from 'react-router'

function PortfolioGithubLink(props) {
    return <div style={{ border: '0.1em solid black', borderRadius: '0.25em',
        backgroundColor: 'white', display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '1em', padding: '0.5em', cursor: 'pointer'}}>
        <img style={{ width: '2em', height: 'auto'}} src={github}/>
        {props.github}
    </div>
}

export default function PortfolioItem(props) {
    return <div className="portfolio-item">
        <div className="portfolio-title">{props.title}</div>
        <div className="portfolio-body">{props.body}</div>
        {props.github ? <PortfolioGithubLink github={props.github} /> : <div />}
        {props.images ?
            <div style={{ maxWidth: '40vw', marginTop: '1em', backgroundColor: '#c2ccd1', border: '3px solid black', borderRadius: '6px', boxShadow: 'inset 0 0 0.2em #1d1e1f' }}>
                <Splide options={{ fixedWidth: '40vw', autoplay: true }}>
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