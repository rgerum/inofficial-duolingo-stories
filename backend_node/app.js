const express = require('express')
const app = express()
const port = 3001

const path = '/stories/backend_node'

app.use(express.json());

const sql = require("./db.js");


app.get(path+'/', (req, res) => {
    res.send('Hello World!')
})
app.get(path+'/story/:id', (request, result) => {
    sql.query(`SELECT l1.short AS fromLanguage, l2.short AS learningLanguage, story.id, story.json 
              FROM story 
              JOIN course c on story.course_id = c.id 
              LEFT JOIN language l1 ON l1.id = c.fromLanguage
              LEFT JOIN language l2 ON l2.id = c.learningLanguage 
              WHERE story.id = ?;`,
        request.params.id,
        (err, res) => {
        if (err) {
            console.log("error: ", err);
            result.send(err);
            return;
        }
        if (res.length === 0) {
            result.sendStatus(404);
            return
        }
        let data = JSON.parse(res[0]["json"]);
        data.id = res[0]["id"];
        data.fromLanguage = res[0]["fromLanguage"];
        data.learningLanguage = res[0]["learningLanguage"];

        result.json(data);
    });
})
app.get(path+'/courses', (request, result) => {
    sql.query(`
SELECT course.id,  COALESCE(NULLIF(course.name, ''), l2.name) as name,
 l1.short AS fromLanguage, l1.name AS fromLanguageName, l1.flag_file AS fromLanguageFlagFile, l1.flag AS fromLanguageFlag,
 l2.short AS learningLanguage, l2.name AS learningLanguageName, l2.flag_file AS learningLanguageFlagFile, l2.flag AS learningLanguageFlag,
 COUNT(story.id) count, course.public, course.official, course.conlang FROM course
LEFT JOIN language l1 ON l1.id = course.fromLanguage
LEFT JOIN language l2 ON l2.id = course.learningLanguage
LEFT JOIN story ON (course.id = story.course_id)
WHERE story.public = 1
GROUP BY course.id
ORDER BY name;
    `, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result.send(err);
            return;
        }

        let courses = res;

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
        // if we have english courses add "English" as the first entry
        if(base_languages["English"])
            languages.unshift("English");

        // create a new sorted
        let grouped_languages = {};
        for(let lang of languages) {
            grouped_languages[lang] = base_languages[lang];
        }

        console.log("created tutorial: ", res);
        result.json(grouped_languages);
    });
})


app.get(path+'/course/:lang-:lang_base', (request, result) => {
    sql.query(`
    SELECT story.id, story.set_id, story.set_index, story.name, MAX(story_done.time) as time,
    i.active, i.activeLip, i.gilded, i.gildedLip
    FROM story
    LEFT JOIN story_done ON story_done.story_id = story.id AND story_done.user_id = -1
    JOIN image i on story.image = i.id
    WHERE story.public = 1 and story.course_id = (SELECT c.id FROM course c
        JOIN language l1 ON c.learningLanguage = l1.id AND l1.short = ?
        JOIN language l2 ON c.fromLanguage = l2.id AND l2.short = ? WHERE c.official = 0)
    GROUP BY story.id
    ORDER BY set_id, set_index;
    `, [request.params.lang, request.params.lang_base], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result.send(err);
            return;
        }

        // group into sets
        let set = -1;
        let sets = [];
        for(let d of res) {
            if (set !== d.set_id) {
                set = d.set_id;
                sets.push([]);
            }
            sets[sets.length - 1].push(d);
        }

        result.json(sets);
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
