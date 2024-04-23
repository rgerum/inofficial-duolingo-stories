import React from "react";
import styles from "./DocsSearchModal.module.css";
import useKeypress from "../../hooks/use-keypress.hook";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";

// https://beta.duostories.org/docs/story-creation/import.mdx
const basefolder = "/docs";

export async function getPageData(path) {
  try {
    const res = await (await fetch(basefolder + "/" + path + ".mdx")).text();
    let data = res.split("---");
    let metadata = {};
    for (let line of data[1].split("\n")) {
      let pos = line.indexOf(":");
      if (pos === -1) continue;
      let key = line.slice(0, pos).trim();
      let value = line.slice(pos + 1).trim();
      metadata[key.trim()] = value.match(/\s*"(.*)"\s*/)[1];
    }
    metadata.body = data[2];
    let parts = [];
    let current_link = path;
    let current_index = undefined;
    for (let line of metadata.body.split("\n")) {
      line = line.trim();
      if (line.substring(0, 1).match(/\w/)) {
        if (current_index !== undefined) {
          parts[current_index].text += " " + line;
        } else {
          parts.push({ type: "text", text: line, link: current_link });
          current_index = parts.length - 1;
        }
        continue;
      }
      current_index = undefined;
      if (line.startsWith("#")) {
        parts.push({
          type: "heading",
          text: line.match("#*s*(.*)")[1],
          link: current_link,
        });
      }
    }
    metadata.parts = parts;
    metadata.link = path;
    return metadata;
  } catch (e) {
    console.log("getPageDate", path, e);
  }
}

let data = undefined;
let pages = undefined;
async function loadAll() {
  if (!data) data = await (await fetch("/docs/docs.json")).json();
  if (!pages) {
    pages = [];
    let promises = [];
    for (let group of data.navigation) {
      for (let page of group.pages) {
        promises.push(getPageData(page).then((page) => pages.push(page)));
      }
    }
    await Promise.all(promises);
  }
  return pages;
}

function DocsSearchModal({
  showSearch,
  setShowSearch,
  searchText,
  setSearchText,
}) {
  const ref = React.useRef();
  const [searchResults, setSearchResults] = React.useState([]);
  // close on Escape if open
  useKeypress("Escape", () => showSearch && setShowSearch(false), [showSearch]);

  React.useEffect(() => {
    if (showSearch) {
      //ref.current.focus();
      setSearchResults(undefined);
    }
  }, [showSearch]);

  async function search(value) {
    setSearchText(value);
    const pages = await loadAll();

    const results = [];
    for (let page of pages) {
      let found = false;
      for (let part of page.parts) {
        if (part.text.includes(value)) {
          if (!found) {
            found = true;
            results.push({ link: page.link, type: "main", text: page.title });
          }
          results.push({ link: part.link, type: "sub", text: part.text });
        }
      }
    }
    setSearchResults(results);
  }
  /*
            <Dialog.Title />
          <Dialog.Description />
   */

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.blur} data-show={showSearch} />
        <Dialog.Content
          className={styles.search_modal}
          id="search_modal"
          data-show={showSearch}
        >
          <div>
            <input
              id="search_input"
              ref={ref}
              placeholder=" Search Documentation..."
              value={searchText}
              onChange={(e) => search(e.target.value)}
            ></input>
            <Dialog.Close asChild={true}>
              <button onClick={() => setShowSearch(false)}>Esc</button>
            </Dialog.Close>
          </div>
          <div id="search_results">
            {searchResults === undefined && <span>Type to search</span>}
            {searchResults && searchResults.length === 0 && (
              <span>No results</span>
            )}
            {searchResults &&
              searchResults.map((item, index) => (
                <Link
                  key={item.link + "-" + index}
                  href={`/docs/${item.link}`}
                  data-type={item.type}
                  onClick={() => showSearch(false)}
                >
                  {item.text}
                </Link>
              ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
}

export default DocsSearchModal;
