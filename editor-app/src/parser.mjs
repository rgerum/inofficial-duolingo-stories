/*
This parser does the syntax highlighting for the editor
 */

import {StreamLanguage} from "@codemirror/stream-parser"
import {HighlightStyle, tags as t} from "@codemirror/highlight"

// Ideally this should be proper tag definitions instead of mapping them to arbitrary tag symbols
// I just did not find out yet how to define custom tag symbols
const STATE_DEFAULT = "atom";

const STATE_DATA_KEY = "heading";
const STATE_DATA_VALUE = "name";

const STATE_TRANS_EVEN = "propertyName";
const STATE_TRANS_ODD = "macroName";
const STATE_TEXT_EVEN = "tagName";
const STATE_TEXT_ODD = "name";

const STATE_TEXT_HIDE_EVEN = "className";
const STATE_TEXT_HIDE_ODD = "typeName";
const STATE_TEXT_HIDE_NEUTRAL = "changed";

const STATE_TEXT_BUTTON_EVEN = "number";
const STATE_TEXT_BUTTON_ODD = "labelName";

const STATE_TEXT_HIDE_BUTTON_EVEN = "meta";
const STATE_TEXT_HIDE_BUTTON_ODD = "comment";
const STATE_TEXT_BUTTON_RIGHT_EVEN = "modifier";

const STATE_BLOCK_TYPE = "keyword";
const STATE_SPEAKER_TYPE = STATE_DATA_KEY;

const STATE_ERROR = "deleted";

const STATE_AUDIO = "color";


const chalky = "#e5c07b",
    coral = "#e06c75",
    cyan = "#56b6c2",
    invalid = "#ffffff",
    ivory = "#abb2bf",
    stone = "#7d8799", // Brightened compared to original to increase contrast
    malibu = "#61afef",
    sage = "#98c379",
    whiskey = "#d19a66",
    violet = "#c678dd"
/*
    darkBackground = "#21252b",
    highlightBackground = "#2c313a",
    background = "#282c34",
    tooltipBackground = "#353a42",
    selection = "#3E4451",
    cursor = "#528bff"
 */

const color_even = "#009623",
    color_odd = "#00389d"


export let highlightStyle = HighlightStyle.define([
    // STATE_TRANS_EVEN
    {tag: t.propertyName, color: color_even, fontStyle: "italic", opacity: 0.5},
    // STATE_TRANS_ODD
    {tag: t.macroName, color: color_odd, fontStyle: "italic", opacity: 0.5},
    // STATE_TEXT_EVEN
    {tag: t.tagName, color: color_even},
    // STATE_TEXT_ODD
    {tag: t.name, color: color_odd},

    // STATE_TEXT_HIDE_EVEN
    {tag: t.className, color: color_even, opacity: 0.4, borderBottom: "2px solid black"}, // textDecoration: "underline",
    // STATE_TEXT_HIDE_ODD
    {tag: t.typeName, color: color_odd, opacity: 0.4, borderBottom: "2px solid black"},
    // STATE_TEXT_HIDE_NEUTRAL
    {tag: t.changed, opacity: 0.4, borderBottom: "2px solid black"},

    // STATE_TEXT_BUTTON_EVEN
    {tag: t.number, color: color_even, background: "#c8c8c8", borderRadius: "10px"},
    // STATE_TEXT_BUTTON_ODD
    {tag: t.labelName, color: color_odd, background: "#c8c8c8", borderRadius: "10px"},

    // STATE_TEXT_HIDE_BUTTON_EVEN
    {tag: t.meta, color: color_even, borderBottom: "2px solid black", background: "#c8c8c8", borderRadius: "10px", opacity: 0.4},
    // STATE_TEXT_HIDE_BUTTON_ODD
    {tag: t.comment, color: color_odd, borderBottom: "2px solid black", background: "#c8c8c8", borderRadius: "10px", opacity: 0.4},
    // STATE_TEXT_BUTTON_RIGHT_EVEN
    {tag: t.modifier, color: "black", background: "#9bd297", borderRadius: "10px"},

    // STATE_BLOCK_TYPE
    {tag: t.keyword, color: violet},
    // STATE_ERROR
    {tag: [t.deleted, t.character], color: coral, textDecoration: "line-through",},
    {
        tag: [t.function(t.variableName)],
        color: malibu
    },
    // STATE_AUDIO
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: whiskey},
    {
        tag: [t.definition(t.name), t.separator],
        color: ivory
    },
    {
        tag: [t.annotation, t.self, t.namespace],
        color: chalky
    },
    {
        tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
        color: cyan
    },

    {
        tag: t.strong,
        fontWeight: "bold"
    },
    {
        tag: t.emphasis,
        fontStyle: "italic"
    },
    {
        tag: t.strikethrough,
        textDecoration: "line-through"
    },
    {
        tag: t.link,
        color: stone,
        textDecoration: "underline"
    },
    {
        tag: t.heading,
        fontWeight: "bold",
        color: coral
    },
    {
        tag: t.atom
    },
    {
        tag: [t.bool, t.special(t.variableName)],
        color: whiskey
    },
    {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: sage
    },
    {
        tag: t.invalid,
        color: invalid
    },
])

function parserTextWithTranslation(stream, state, allow_hide, allow_buttons) {
    if(stream.match(/[ |]+/)) {
        state.odd = !state.odd
        if(state.bracket && allow_hide)
            return STATE_TEXT_HIDE_NEUTRAL
        return STATE_DEFAULT;
    }
    if (allow_hide) {
        if (stream.eat("[")) {
            state.bracket = true;
            return STATE_DEFAULT;
        }
        if (stream.eat("]")) {
            state.bracket = false;
            return STATE_DEFAULT;
        }
    }
    if (allow_buttons === 2)
        if (stream.match(/\(\+[^()]*\)/)) {
            return STATE_TEXT_BUTTON_RIGHT_EVEN;
        }
    if (allow_buttons)
        if (stream.match(/\([^()]*\)/)) {
            if (state.bracket) {
                if(state.odd)
                    return STATE_TEXT_HIDE_BUTTON_ODD
                return STATE_TEXT_HIDE_BUTTON_EVEN
            }
            if(state.odd)
                return STATE_TEXT_BUTTON_ODD
            return STATE_TEXT_BUTTON_EVEN
        }

    if( (!allow_buttons && stream.match(/[^ |$\]\[]+/)) || (allow_buttons && stream.match(/[^ |$\]\[()]+/))) {
        if(state.bracket && allow_hide) {
            if (state.odd)
                return STATE_TEXT_HIDE_ODD
            return STATE_TEXT_HIDE_EVEN
        }

        if (state.odd)
            return STATE_TEXT_ODD
        return STATE_TEXT_EVEN
    }
    stream.skipToEnd();
    return STATE_ERROR;
}


function parserTranslation(stream, state) {
    if(stream.match(/[ |]+/)) {
        state.odd = !state.odd
        return STATE_DEFAULT;
    }
    if(stream.match(/[^ |$\]\[]+/)) {
        if (state.odd)
            return STATE_TRANS_ODD
        return STATE_TRANS_EVEN
    }
    stream.skipToEnd();
    return STATE_ERROR;
}

function parserPair(stream, state) {
    if(state.odd === false) {
        stream.match(/.*(?=<>)/);
        state.odd = true;
        return STATE_TEXT_ODD
    }
    else if(stream.eat("<>"))
        return STATE_DEFAULT
    else {
        stream.skipToEnd();
        return STATE_TRANS_ODD
    }
}

function parseBockData(stream, state) {
    if(stream.match(/[^=]+/)) {
        if(state.odd) {
            state.odd = false;
            return STATE_DATA_VALUE;
        }
        return STATE_DATA_KEY;
    }
    if(stream.eat("=")) {
        state.odd = true;
        return STATE_DEFAULT
    }

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockHeader(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, 1, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockLine(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.line===0 && stream.match(/\S+:/)) {
            startLine(state, 1, true, "text", true);
            return STATE_SPEAKER_TYPE;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, 1, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function startLine(state, line, allow_trans, line_type, allow_audio) {
    var block = {...state.block};
    if(line)
        block.line = line;
    if(allow_audio === undefined && state.block.allow_trans && state.block.allow_audio)
        allow_audio = state.block.allow_audio;
    block.allow_audio = allow_audio;
    block.allow_trans = allow_trans;
    state.odd = false;
    block.line_type = line_type;
    state.block = block;
}

function parseBockSelectPhrase(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line===1 && stream.match(/\S+:/)) {
            startLine(state, 2, true, "text", true);
            return STATE_SPEAKER_TYPE;
        }
        if(state.block.line===1 && stream.eat(/>/)) {
            startLine(state, 2, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }

        if(state.block.line>=2 && stream.eat("+")) {
            startLine(state, 3, false, "text");
            stream.skipToEnd();
            return STATE_DEFAULT;
        }
        if(state.block.line>=2 && stream.eat("-")) {
            startLine(state, 3, false, "text");
            stream.skipToEnd();
            return STATE_DEFAULT;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state, state.block.line === 2)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockContinuation(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line===1 && stream.match(/\S+:/)) {
            startLine(state, 2, true, "text", true);
            return STATE_SPEAKER_TYPE;
        }
        if(state.block.line===1 && stream.eat(">")) {
            startLine(state, 2, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }

        if(state.block.line>=2 && stream.eat("+")) {
            startLine(state, 3, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.line>=2 && stream.eat("-")) {
            startLine(state, 3, true, "text");
            return STATE_DEFAULT;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state, state.block.line === 2)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockMultipleChoice(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line>=1 && stream.eat("+")) {
            startLine(state, 2, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.line>=1 && stream.eat("-")) {
            startLine(state, 2, true, "text");
            return STATE_DEFAULT;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockArrange(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line===1 && stream.match(/\S+:/)) {
            startLine(state, 2, true, "text", true);
            return STATE_SPEAKER_TYPE;
        }
        if(state.block.line===1 && stream.eat(">")) {
            startLine(state, 2, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state, state.block.line === 2, state.block.line === 2)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

function parseBockPointToPhrase(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line===1 && stream.match(/\S+:/)) {
            startLine(state, 2, true, "text", true);
            return STATE_SPEAKER_TYPE;
        }
        if(state.block.line===1 && stream.eat(">")) {
            startLine(state, 2, true, "text", true);
            return STATE_DEFAULT;
        }
        if(state.block.allow_audio && stream.eat("$")) {
            startLine(state); stream.skipToEnd();
            return STATE_AUDIO;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state, state.block.line === 2, (state.block.line === 2)*2)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}


function parseBockMatch(stream, state) {
    if(stream.sol()) {
        if(state.block.line===0 && stream.eat(">")) {
            startLine(state, 1, true, "text");
            return STATE_DEFAULT;
        }
        if(state.block.allow_trans && stream.eat("~")) {
            startLine(state, undefined, false, "trans");
            return STATE_DEFAULT;
        }
        if(state.block.line===1 && stream.eat("-")) {
            startLine(state, 1, false, "pair");
            return STATE_DEFAULT;
        }

        stream.skipToEnd();
        return STATE_ERROR;
    }
    if(state.block.line_type === "text")
        return parserTextWithTranslation(stream, state)
    if(state.block.line_type === "trans")
        return parserTranslation(stream, state)
    if(state.block.line_type === "pair")
        return parserPair(stream, state)

    stream.skipToEnd();
    return STATE_ERROR;
}

const BLOCK_FUNCS = {
    "DATA": parseBockData,
    "HEADER": parseBockHeader,
    "LINE": parseBockLine,
    "MULTIPLE_CHOICE": parseBockMultipleChoice,
    "SELECT_PHRASE": parseBockSelectPhrase,
    "CONTINUATION": parseBockContinuation,
    "ARRANGE": parseBockArrange,
    "MATCH": parseBockMatch,
    "POINT_TO_PHRASE": parseBockPointToPhrase,
}

function parseBlockDef(stream, state) {
    if(stream.eat("]")) {
        state.func = BLOCK_FUNCS[state.block.name];
        return STATE_DEFAULT;
    }
    state.block = {name: stream.match(/[^\]]+/)[0], line: 0};
    return STATE_BLOCK_TYPE;
}

function parserWithMetadata(stream, state) {
    if(stream.sol()) {
        stream.match(/\s*/);
        if(stream.eat("[")) {
            state.func = parseBlockDef;
            return STATE_DEFAULT;
        }
    }
    if(state.func)
        return state.func(stream, state);

    stream.skipToEnd();
    return STATE_ERROR;
}


export const exampleLanguage = StreamLanguage.define({
    token: parserWithMetadata,
    startState() { return {pos:"default"}
    }
})

import {LanguageSupport} from "@codemirror/language"

export function example() {
    return new LanguageSupport(exampleLanguage)
}
