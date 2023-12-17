"use client";
import styles from "../index.module.css";
import { useInput } from "lib/hooks";
import { Spinner } from "components/layout/spinner";
import Flag from "components/layout/flag";
import { fetch_post } from "lib/fetch_post";

export async function setLanguage(data) {
  let res = await fetch_post(`/admin/languages/set`, data);
  res = await res.text();
  return res;
}

function ChangeAbleValue(props) {
  const [value, setValue] = useInput(props.obj[props.name]);

  function edited(e) {
    props.callback(props.name, e.target.value);
    setValue(e);
  }

  if (props.edit)
    return (
      <td>
        <input value={value} onChange={edited} />
      </td>
    );
  return <td>{value}</td>;
}

function AttributeList(props) {
  const [edit, setEdit] = useInput(false);

  const data = { ...props.obj };

  function onChange(key, value) {
    data[key] = value === "" ? undefined : value;
  }
  async function save() {
    await setLanguage(data);
    setEdit(false);
  }

  return (
    <tr onClick={() => setEdit(true)}>
      <td>
        <Flag
          iso={props.obj.short}
          width={40}
          flag={props.obj.flag}
          flag_file={props.obj.flag_file}
        />
      </td>
      {props.attributes.map((attr, i) => (
        <ChangeAbleValue
          key={i}
          obj={props.obj}
          name={attr}
          edit={edit}
          callback={onChange}
        />
      ))}
      <td>{edit ? <span onClick={save}>[save]</span> : ""}</td>
    </tr>
  );
}

export default function LanguageList({ users }) {
  const [search, setSearch] = useInput("");

  if (users === undefined) return <Spinner />;

  let filtered_languages = [];
  if (search === "") filtered_languages = users;
  else {
    for (let language of users) {
      if (language.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        filtered_languages.push(language);
      }
    }
  }
  /*
    https://admin.duostories.org/get2/language_list
     */
  return (
    <>
      <div>
        Search
        <input value={search} onChange={setSearch} />
      </div>
      <table
        id="story_list"
        data-cy="story_list"
        className={"js-sort-table js-sort-5 js-sort-desc " + styles.admin_table}
        data-js-sort-table="true"
      >
        <thead>
          <tr>
            <th></th>
            <th data-js-sort-colnum="0">Name</th>
            <th data-js-sort-colnum="1">ISO</th>
            <th data-js-sort-colnum="1">Duo Flag</th>
            <th data-js-sort-colnum="2">Flag File</th>
            <th data-js-sort-colnum="4">Default Voice</th>
            <th data-js-sort-colnum="4">RTL</th>
            <th data-js-sort-colnum="4"></th>
          </tr>
        </thead>
        <tbody>
          <AttributeList
            obj={{
              name: "new language",
              short: "",
              flag: 0,
              flag_file: "",
              speaker: "",
              rtl: 0,
            }}
            attributes={[
              "name",
              "short",
              "flag",
              "flag_file",
              "speaker",
              "rtl",
            ]}
          />
          {filtered_languages.map((user) => (
            <AttributeList
              key={user.id}
              obj={user}
              attributes={[
                "name",
                "short",
                "flag",
                "flag_file",
                "speaker",
                "rtl",
              ]}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
