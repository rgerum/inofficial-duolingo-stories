import React, { cache } from "react";
import styles from "./flag.module.css";
import { sql } from "lib/db";
import { unstable_cache } from "next/cache";

let get_langs = unstable_cache(async () => {
  let langs = await sql`
SELECT id, short AS iso, flag_file, flag FROM language
    `;
  let lang_list = {};
  for (let lang of langs) {
    lang_list[lang.id] = lang;
  }
  return lang_list;
}, ["get_langsYYYYaasa"]);

let get_lang = cache(async (id) => {
  return (await get_langs())[id];
});

export default async function FlagById({ id, ...props }) {
  /**
   * A big flag button
   * @type {{flag_file: string, flag: number}}
   */
  let { iso, flag_file } = await get_lang(id);
  let order = [
    "en", //0
    "es", //1
    "fr", //2
    "de", //3
    "ja", //4
    "it", //5
    "ko", //6
    "zh", //7
    "ru", //8
    "pt", //9
    "tr", //10
    "nl", //11
    "sv", //12
    "ga", //13
    "el", //14
    "he", //15
    "pl", //16
    "no", //17
    "vi", //18
    "da", //19
    "hv", //20
    "ro", //21
    "sw", //22
    "eo", //23
    "hu", //24
    "cy", //25
    "uk", //26
    "tlh", //27
    "cs", //28
    "hi", //29
    "id", //30
    "hw", //31
    "nv", //32
    "ar", //33
    "ca", //34
    "th", //35
    "gn", //36
    "world", //37
    "duo", //38
    "tools", //39
    "reader", //40
    "la", //41
    "gd", //42
    "fi", //43
    "yi", //44
    "ht", //45
    "tl", //46
    "zu", //47
  ];
  let flag = 0;
  for (let i in order) {
    if (order[i] === (iso || "world")) flag = i;
  }
  let count = Math.round(flag) * 66;
  let style = {
    width: props.width || 88,
    height: (66 / 82) * (props.width || 88),
    minWidth: props.width || 88,
  };
  if (flag_file) {
    return (
      <svg
        className={props.className + " " + styles.flag}
        viewBox={`-2 -2 82 66`}
        data-test={`flag-${iso}`}
        style={style}
        onClick={props.onClick}
      >
        <image
          height="62"
          href={`https://carex.uber.space/stories/flags/${flag_file}`}
          width="78"
        ></image>
        <rect
          className={styles.flag_border_rect}
          x="2"
          y="2"
          rx="12"
          ry="12"
          width="74"
          height="58"
        ></rect>
      </svg>
    );
  }
  return (
    <svg
      className={props.className + " " + styles.flag}
      viewBox={`0 ${count} 82 66`}
      data-test={`flag-${iso}`}
      style={style}
      onClick={props.onClick}
    >
      <image
        height="3168"
        href="https://d35aaqx5ub95lt.cloudfront.net/vendor/87938207afff1598611ba626a8c4827c.svg"
        width="82"
      ></image>
      <rect
        className={styles.flag_border_rect}
        x="4"
        y={count + 4}
        rx="12"
        ry="12"
        width="74"
        height="58"
      ></rect>
    </svg>
  );
}

export function DoubleFlag({ lang1, lang2, width, onClick, className }) {
  return (
    <>
      <Flag
        iso={lang1?.short}
        flag={lang1?.flag}
        flag_file={lang1?.flag_file}
        width={width}
        onClick={onClick}
        className={className}
      />
      <Flag
        iso={lang2?.short}
        flag={lang2?.flag}
        flag_file={lang2?.flag_file}
        width={width * 0.9}
        onClick={onClick}
        className={className + " " + styles.flag_sub}
      />
    </>
  );
}
