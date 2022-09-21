import './course-list.css';
import {Flag, Spinner} from "story-component";
import {Link} from "react-router-dom";


export function CourseList(props) {
    const courses = props.courses;

    // show spinner if not yet loaded
    if(courses === undefined)
        return <Spinner />

    // sort courses by base language
    let base_languages = {};
    let languages = [];
    // iterate over all courses
    for(let course of courses) {
        // if base language not yet in list
        if(base_languages[course.fromLanguageName] === undefined) {
            // initialize the list
            base_languages[course.fromLanguageName] = [];
            // and add it to the list of all base languages (we will add English after sorting in the front)
            if(course.fromLanguageName !== "English")
                languages.push(course.fromLanguageName);
        }
        base_languages[course.fromLanguageName].push(course)
    }
    // sort the base languages and then add English as first (and most relevant)
    languages = languages.sort();
    
    // Add link to conlangs page in second position (only if conlangs are present and if we are not on the conlangs page)
    if(props?.conlang_count >= 1 && props.filter !== "conlang")
        languages.unshift("Conlangs")
        
    // if we have english courses add "English" as the first entry
    if(base_languages["English"])
        languages.unshift("English");

    return (
        <div>
            <Link key={0} to="/tr-en" className="language_select_button celebration">
                <Flag iso="tr" />
                <div className="language_select_button_text" style={{width: "68%"}}>Celebrating our Turkish team which just reached 100 translated stories!
                    Congratulations to <i>Danika_Dakika</i> and <i>deck</i>. <span className="celebration_date">— 19. Sep. 2022</span></div>
                <span className="celebration_icon">🎉</span>
            </Link>
            {languages.map(name => (
                name === "Conlangs" ?
                    <Link key={name} to="/conlangs" className="language_select_button conlang-link">
                        <Flag iso={"conlangs"} flag_file={"flag_conlangs.svg"} />
                        <span className="language_select_button_text">Conlangs Index:</span>
                        <span className="language_story_count" id="conlangs-count">{props.conlang_count} stories</span>
                        <img className="arrow" src="/stories/icons/arrow.svg" alt=">" />
                    </Link>
                    :
                <div className="course_list" key={name}>
                    <hr/>
                    <div className="course_group_name">Stories for {name} Speakers</div>
                    {base_languages[name].map(course => (
                    <LanguageButton key={course.id} course={course} />
                    ))}
                </div>
            ))
            }
        </div>
    );
}

function LanguageButton(props) {
    let course = props.course;
    return <Link
        data-cy={"language_button_big_"+course.id}
        className="language_select_button"
        to={`/${course.learningLanguage}-${course.fromLanguage}`}
    >
        <Flag iso={course.learningLanguage} flag={course.learningLanguageFlag} flag_file={course.learningLanguageFlagFile} />

        <span className="language_select_button_text">{course.name}</span>
        <span className="language_story_count">{course.count} stories</span>
    </Link>;
}
