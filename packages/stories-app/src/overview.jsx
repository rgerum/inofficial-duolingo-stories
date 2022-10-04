import React, {lazy, Suspense} from 'react';
import {Link, Route, Routes, useParams,} from "react-router-dom";

import {Login} from './login'
import {useSuspendedDataFetcher} from "./api_calls/include";
import {getCoursesCount} from "./api_calls/course";
import {Legal, Spinner} from "story-component";

const CourseList = lazy(() => import('./course-list'));
const CourseDropdown = lazy(() => import('./course-dropdown'));
const SetList = lazy(() => import('./story-list'));
const Faq = lazy(() => import('./faq'));

/* ******** */

export default function IndexContent({userdata}) {
    const [isPending, startTransition] = React.useTransition();


    return <div>
        <nav id="header_index">
            <Link to={"/"} className="duostories_title">Duostories</Link>
            <CourseDropdown userdata={userdata} startTransition={startTransition} />
            <Login userdata={userdata} />
        </nav>
        <Suspense fallback={<Spinner />}>
        <div id="main_index" style={{ opacity: isPending ? 0.8 : 1 }}>
            <Routes>
                <Route path='/' element={<MainContent userdata={userdata} startTransition={startTransition}/>}></Route>
                <Route path='conlangs' element={<MainContent userdata={userdata} startTransition={startTransition} filter={'conlang'} />}></Route>
                <Route path='/:lang-:lang_base' element={<MainContent userdata={userdata} startTransition={startTransition}/>}></Route>
                <Route path='/faq' element={<Faq />}></Route>
                <Route path='/*' element={<MainContent userdata={userdata} startTransition={startTransition} error />}></Route>
            </Routes>
        </div>
        </Suspense>

    </div>
}

function MainContent({userdata, filter, startTransition}) {
    let counts = useSuspendedDataFetcher(getCoursesCount, []);
    let {lang} = useParams();

    let conlangs = [];

    return <>
    <header>
        <h1 className={"main_title"}>Unofficial Duolingo Stories</h1>
        <p className={"title_desc"}>
            A community project to bring the original <a href="https://www.duolingo.com/stories">Duolingo Stories</a> to new languages.
            <br/>{counts.count_stories} stories in {counts.count_courses} courses and counting!
        </p>
        <p className={"title_desc"}>
            If you want to contribute or discuss the stories, meet us on <a href="https://discord.gg/4NGVScARR3">Discord</a><br/>
            or learn more about the project in our <Link to={"/faq"}>FAQ</Link>.
        </p>
        {Object.keys(conlangs).length ?
            <p><b>Notice:</b> You're currently on the page for conlangs without ISO-3 codes. We keep them here as to not clutter the front page, but we're always happy to have more!
                <br/> To return to the main page, click <Link to="/" >here</Link>.
            </p>
            : <></>}
    </header>

    <Suspense fallback={<Spinner />}>
        {lang !== undefined ?
            <SetList userdata={userdata} conlang_count={conlangs.length} /> :
            <CourseList filter={filter} startTransition={startTransition} />
        }

        <hr/>
        <Legal/>
    </Suspense>
    </>
}

