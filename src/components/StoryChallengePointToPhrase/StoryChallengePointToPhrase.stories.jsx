import StoryChallengePointToPhrase from "./StoryChallengePointToPhrase";

const meta = {
  component: StoryChallengePointToPhrase,
  argTypes: {},
};

export default meta;

const parts = [
  {
    lang: "nl",
    line: {
      type: "CHARACTER",
      content: {
        text: "The right word has a plus symbol.",
        audio: {
          ssml: {
            id: 0,
            text: "<speak>The right word has a plus symbol.</speak>",
            mapping: [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              32,
              32,
              32,
              32,
              32,
              32,
              32,
              32,
            ],
            speaker: "",
            plan_text: "The (+right) (word) has a plus (symbol).",
            inser_index: 5,
          },
        },
        hints: ["sorry", "my", "love", "I am", "tired", "I work", "a lot"],
        hintMap: [
          {
            rangeTo: 2,
            hintIndex: 0,
            rangeFrom: 0,
          },
          {
            rangeTo: 8,
            hintIndex: 1,
            rangeFrom: 4,
          },
          {
            rangeTo: 13,
            hintIndex: 2,
            rangeFrom: 10,
          },
          {
            rangeTo: 17,
            hintIndex: 3,
            rangeFrom: 15,
          },
          {
            rangeTo: 19,
            hintIndex: 4,
            rangeFrom: 19,
          },
          {
            rangeTo: 24,
            hintIndex: 5,
            rangeFrom: 21,
          },
          {
            rangeTo: 31,
            hintIndex: 6,
            rangeFrom: 26,
          },
        ],
        lang_hints: "en",
      },
      avatarUrl:
        "https://stories-cdn.duolingo.com/image/2b2b64afe0c2af19eed8ac69c36cb8803d0a090e.svg",
      characterId: 560,
    },
    type: "LINE",
    audio: {
      ssml: {
        id: 0,
        text: "<speak>The right word has a plus symbol.</speak>",
        mapping: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31,
          32,
          32,
          32,
          32,
          32,
          32,
          32,
          32,
          32,
        ],
        speaker: "",
        plan_text: "The (+right) (word) has a plus (symbol).",
        inser_index: 5,
      },
    },
    editor: {
      end_no: 37,
      start_no: 35,
      active_no: 36,
      block_start_no: 35,
    },
    trackingProperties: {
      line_index: 5,
    },
    hideRangesForChallenge: [],
  },
  {
    lang: "nl",
    type: "POINT_TO_PHRASE",
    editor: {
      end_no: 40,
      start_no: 37,
    },
    question: {
      text: 'Choose the option that means "right". In the POINT_TO_PHRASE',
      hints: [],
      hintMap: [],
    },
    lang_question: "en",
    transcriptParts: [
      {
        text: "The",
        selectable: false,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "right",
        selectable: true,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "word",
        selectable: true,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "has",
        selectable: false,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "a",
        selectable: false,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "plus",
        selectable: false,
      },
      {
        text: " ",
        selectable: false,
      },
      {
        text: "symbol",
        selectable: true,
      },
      {
        text: ".",
        selectable: false,
      },
    ],
    correctAnswerIndex: 0,
    trackingProperties: {
      line_index: 5,
      challenge_type: "point-to-phrase",
    },
  },
];

export const Normal = {
  render: (args) => (
    <StoryChallengePointToPhrase
      parts={parts}
      {...args}
    ></StoryChallengePointToPhrase>
  ),
};
