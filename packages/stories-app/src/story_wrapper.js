import React from 'react';
import {Story, Spinner, useDataFetcher} from "story-component";
import {Link, useParams} from "react-router-dom";
import {getStoryJSON} from "./api_calls/course";

function Error() {
    return <div id="login_dialog">
        <div>
            <h2>404 Not Found</h2>
            <img alt={"sad duo"} width="80p" src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg" /><br/>
            <p>The page you requested was not found.<br/></p>
            <p>If you think this is an error on the website, please report it on <a href="https://discord.gg/4NGVScARR3">Discord</a>.</p>
            <p><Link className="link" data-cy="back" to="/">to main</Link></p>
        </div>
    </div>
}

export default function StoryP() {
    let { id } = useParams();
    let test = window.location.href.endsWith("test");
    let story_data = useDataFetcher(getStoryJSON, [id])
    if(story_data === undefined)
        return <Spinner/>
    if(story_data === null)
        return <Error/>
    if(test)
        return <div id="main"><Story id={id} editor={{lineno: 3}} story={story_data} /></div>
    return <Story id={id} story={story_data} />
}