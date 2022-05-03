import React from 'react';
import {useDataFetcher, useDataFetcher2, useEventListener} from './hooks'
import {Spinner} from './react/spinner'
import {Flag} from './react/flag'
import {useUsername, LoginDialog} from './login'
import {getCourses, getCourse, getImportList, setImport} from "./api_calls.mjs";
import "./course-editor.css"


function CourseList(props) {
    const courses = props.courses;
    if(courses === undefined)
        return <div id="languages"><Spinner/></div>;
    return <div id="languages">
        {courses.map((course, index) =>
            <div key={index}>
                <a className={"course_selection_button" + (props.course_id === course.id ? " course_selection_button_active" : "")}
                   href={`?course=${course.id}`}
                   onClick={(e) => {e.preventDefault(); props.setCourse(course.id);}}
                >
                    <span className="course_count">{course.count}</span>
                    <Flag flag={course.learningLanguageFlag} flag_file={course.learningLanguageFlagFile}/>
                    <span>{`${course.learningLanguageName} [${course.fromLanguage}]`}</span>
                </a>
            </div>
        )}
    </div>
}

function ImportList(props) {
    let course = props.course;
    const [courseImport, ] = useDataFetcher2(getImportList, [12, course.id]);
    async function do_import(id) {
        console.log("do_impor", id, course.id);
        let id2 = await setImport(id, course.id);
        console.log(id2, "?story="+id2);
        window.location.href = "?story="+id2;
    }
    return courseImport ?
        <>
        <div>Importing from Spanish (from English).</div>
        <table id="story_list" data-cy="import_list" className="js-sort-table js-sort-5 js-sort-desc" data-js-sort-table="true">
            <thead>
            <tr>
                <th data-js-sort-colnum="0">Set</th>
                <th colSpan="2" data-js-sort-colnum="1">Name</th>
                <th style={{textAlign: "center"}} data-js-sort-colnum="7">Copies</th>
                <th data-js-sort-colnum="8" />
            </tr>
            </thead>
            <tbody>
            {courseImport.map(story =>
                <tr key={story.id}>
                    <td><span><b>{pad(story.set_id)}</b>&nbsp;-&nbsp;{pad(story.set_index)}</span></td>
                    <td width="44px"><img alt={"story title"} src={story.copies ? story.gilded : story.active} width="44px" /></td>
                    <td><a href={`#`} title={story.duo_id} onClick={()=>do_import(story.id)}>{story.name}</a></td>
                    <td style={{textAlign: "right"}}><span>{story.copies}x&nbsp;</span>

                    </td>
                    <td style={{textAlign: "right"}}>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
        </>
        :
        <Spinner/>
}

function pad(x) {
    if(x < 10)
        return <><>&nbsp;</><>{x}</></>;
    return x;
}

function EditList(props) {
    let course = props.course;
    let stories = props.course?.stories
    if(stories === undefined)
        stories = []
    return <>
        <table id="story_list" data-cy="story_list" className="js-sort-table js-sort-5 js-sort-desc" data-js-sort-table="true">
            <thead>
            <tr>
                <th data-js-sort-colnum="0">Set</th>
                <th style={{width: "100%"}} colSpan="2" data-js-sort-colnum="1">Name</th>
                <th data-js-sort-colnum="4">Author</th>
                <th data-js-sort-colnum="5" className="js-sort-active">Creation</th>
                <th data-js-sort-colnum="6">Change</th>
            </tr>
            </thead>
            <tbody>
            {stories.map(story =>
                <tr key={story.id}>
                    <td><span><b>{pad(story.set_id)}</b>&nbsp;-&nbsp;{pad(story.set_index)}</span></td>
                    <td width="44px"><img alt={"story title"}
                        src={"https://stories-cdn.duolingo.com/image/" + story.image + ".svg"}
                        width="44px" height={"40px"}/></td>
                    <td style={{width: "100%"}}><a href={`?story=${story.id}`}>{story.name}</a></td>
                    <td>{story.username}</td>
                    <td>{story.date}</td>
                    <td>{story.change_date}</td>
                </tr>
            )}
            </tbody>
        </table>
        {course ? <></> : <Spinner/>}
    </>
}


export function EditorOverviewLogin() {
    let [username, doLogin, doLogout, showLogin, setShowLogin] = useUsername();

    // loading
    if (username === undefined) return <Spinner/>
    // no username show login
    if (username.username === undefined || username.role !== 1)
        return <LoginDialog useUsername={[username, doLogin, doLogout, showLogin, setShowLogin]} />
    // logged in and allowed!
    return <EditorOverview/>
}

export function EditorOverview() {
    let urlParams = new URLSearchParams(window.location.search);

    const courses = useDataFetcher(getCourses);

    const [course_id, setCourseID] = React.useState(parseInt(urlParams.get("course")) || undefined);
    const [course, ] = useDataFetcher2(getCourse, [course_id]);

    const [showImport, do_setShowImport] = React.useState(false);

    function doSetCourse(course_new) {
        if(showImport)
            do_setShowImport(false);
        if(course_new === course_id) {
            return
        }

        history.pushState({course: course_new}, "Language"+course_new, `?course=${course_new}`);
        setCourseID(course_new);
    }

    useEventListener("popstate", (event) => {
        let course = parseInt((new URLSearchParams(window.location.search)).get("course"))
        if(event.state?.story)
            changeStory(event.state?.story)
        else {
            setCourseID(event.state?.course || course)
        }
    })

    return <>
        <div id="toolbar">
            <CourseEditorHeader courses={courses} course_id={course_id} showImport={showImport} do_setShowImport={do_setShowImport} />
        </div>
        <div id="root">
            <CourseList courses={courses} course_id={course_id} setCourse={doSetCourse}/>
            <div id="main_overview">
                { course_id && showImport ?
                    <ImportList course={course}/>
                  : course_id ?
                    <EditList course={course}/>
                  :
                    <p id="no_stories">Click on one of the courses to display its stories.</p>
                }
            </div>
        </div>
    </>
}


export function CourseEditorHeader(props) {
    let courses = props.courses;
    let course = undefined;
    if(courses) {
        for (let c of courses) {
            if(c.id === props.course_id) {
                course = c;
                break;
            }
        }
    }

    if(!course || course.fromLanguageName === undefined)
        return <><div className="AvatarEditorHeader">
            <b>Course-Editor</b>
        </div></>
    return <><div className="AvatarEditorHeader">
        <b>Course-Editor</b>
        <Flag flag={course.learningLanguageFlag} flag_file={course.learningLanguageFlagFile}/>
        <Flag className={"flag_sub"} flag={course.fromLanguageFlag} flag_file={course.fromLanguageFlagFile}/>
        <span className={"AvatarEditorHeaderFlagname"} data-cy="course-title">{`${course.learningLanguageName} (from ${course.fromLanguageName})`}</span>
        {course.official ? <span data-cy="label_official"><i>official</i></span> :
            !props.showImport ?
            <div id="button_import" className="editor_button" onClick={() => props.do_setShowImport(1)}
            style={{marginLeft: "auto"}} data-cy="button_import">
            <div><img alt="import button" src="icons/import.svg"/></div>
            <span>Import</span>
            </div> :
            <div id="button_back" className="editor_button" onClick={() => props.do_setShowImport(0)}
            style={{marginLeft: "auto"}} data-cy="button_back">
            <div><img alt="back button" src="icons/back.svg"/></div>
            <span>Back</span>
            </div>
        }
    </div></>
}
