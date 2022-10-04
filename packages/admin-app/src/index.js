import React from 'react';
import {createRoot} from 'react-dom/client';
import {LoginDialog, useUsername} from "./login";
import {Spinner} from "story-component";
import {UserList} from "./user-editor";
import {LanguageList} from "./language-editor"
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
} from "react-router-dom";
import {CourseList} from "./course-editor";
import {Sync} from "./github-sync";
import {LoggedInButton} from "./login";


export function LoginWrapper() {
    let [username, doLogin, doLogout, showLogin, setShowLogin] = useUsername();

    // loading
    if (username === undefined) return <Spinner/>
    // no username show login
    if (username.username === undefined || username.admin !== 1)
        return <LoginDialog useUsername={[username, doLogin, doLogout, showLogin, setShowLogin]} />

    // logged in and allowed!
    return <>
        <div id="toolbar">
            <Link to="/users">users</Link>
            <Link to="/languages">languages</Link>
            <Link to="/courses">courses</Link>
            <Link to="/sync">sync</Link>
            <LoggedInButton username={username} doLogout={doLogout} page="admin"/>
        </div>
        <div id="root">
            <Routes>
                <Route path='/users' element={<UserList />}></Route>
                <Route path='/languages' element={<LanguageList />}></Route>
                <Route path='/courses' element={<CourseList />}></Route>
                <Route path='/sync' element={<Sync />}></Route>
            </Routes>
        </div>
    </>
}

createRoot(document.getElementById('body')).render(
    <React.StrictMode>
        <Router>
            <LoginWrapper />
        </Router>
    </React.StrictMode>
);
