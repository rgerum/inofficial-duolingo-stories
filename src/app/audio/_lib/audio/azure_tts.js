const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
import { put } from "@vercel/blob";

function get_raw(text) {
  text = text.replace(/ +/g, " ");
  let text2 = "";
  for (let m of text.matchAll(/(<[^>]+>)|(\w+)|([^\w<>]*)/g)) {
    if (m[1]) {
    } else if (m[2]) {
      text2 += m[2];
    } else if (m[3]) {
      text2 += m[3];
    }
  }
  return text2;
}

async function synthesizeSpeechAzure(filename, voice_id, text, file) {
  return new Promise((resolve, reject) => {
    if (file) text = fs.readFileSync(file, "utf8");
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_APIKEY,
      "westeurope",
    );
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(
      "/dev/null", //filename === undefined ? "/dev/null" : filename,
    );
    speechConfig.speechSynthesisOutputFormat = 5;
    // create the speech synthesizer.
    let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    let last_pos = 0;
    let marks = [];

    synthesizer.wordBoundary = (w, v) => {
      //console.log(v);
      //console.log(text2.substring(last_pos))//
      last_pos = text2.substring(last_pos).search(v.privText) + last_pos;
      let data = {
        time: Math.round(v.privAudioOffset / 10000),
        type: "word",
        start: v.privTextOffset, //last_pos,
        end: v.privTextOffset + v.privWordLength,
        value: v.privText,
      };
      marks.push(data);
    };

    //text = text.replace(/^<speak>/, "");
    //text = text.replace(/<\/speak>$/, "");
    let lang = voice_id.split("-")[0] + "-" + voice_id.split("-")[1];
    if (!text.startsWith("<speak"))
      text = `<speak version='1.0' xml:lang='${lang}'><voice name="${voice_id}">${text}</voice></speak>`;

    let text2 = get_raw(text);
    synthesizer.speakSsmlAsync(
      text,
      async function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          let content;
          //if (filename === undefined)
          content = Buffer.from(result.audioData).toString("base64");
          let output = {
            output_file: filename,
            marks: marks,
            content: content,
          };
          if (filename !== undefined) {
            //let data = fs.readFileSync(filename);
            await put(filename, Buffer.from(result.audioData), {
              access: "public",
              addRandomSuffix: false,
            });
          }
          resolve(output);
        } else {
          console.error(
            "Speech synthesis canceled, " +
              result.errorDetails +
              "\nDid you update the subscription info?",
          );
          reject(result.errorDetails);
        }
        synthesizer.close();
        synthesizer = undefined;
      },
      function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        synthesizer = undefined;
        reject(err);
      },
    );
  });
}

async function getVoices() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_APIKEY,
    "westeurope",
  );

  // create the speech synthesizer.
  let synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  let voices = await synthesizer.getVoicesAsync();
  let result_voices = [];
  for (let voice of voices.voices) {
    result_voices.push({
      language: voice.locale.split("-")[0],
      locale: voice.locale,
      name: voice.shortName,
      gender: voice.gender === 1 ? "FEMALE" : "MALE",
      type: voice.voiceType === 1 ? "NEURAL" : "NORMAL",
      service: "Microsoft Azure",
    });
  }
  return result_voices;
}

async function isValidVoice(voice) {
  return voice.indexOf("-") !== -1;
}

export default {
  name: "azure",
  synthesizeSpeech: synthesizeSpeechAzure,
  getVoices: getVoices,
  isValidVoice: isValidVoice,
};

//getVoices()
