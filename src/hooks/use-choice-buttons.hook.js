import React from "react";
import useKeypress from "./use-keypress.hook";

export function useChoiceButtons(
  count,
  rightIndex,
  callRight,
  callWrong,
  active,
) {
  // create a list with one state for each button
  let [buttonState, setButtonState] = React.useState([...new Array(count)]);

  let click = React.useCallback(
    (index) => {
      // when the button was already clicked, do nothing
      if (buttonState[index] !== undefined) return;
      // if the button was the right one
      if (index === rightIndex) {
        // update all button states
        setButtonState((buttonState) =>
          buttonState.map((v, i) =>
            i === index ? "right" : v === "false" ? "false" : "done",
          ),
        );
        // callback for clicking the right button
        callRight();
      } else {
        // set the state of the current button to display that the answer was wrong
        setButtonState((buttonState) =>
          buttonState.map((v, i) => (i === index ? "false" : v)),
        );
        // callback for clicking the wrong button
        callWrong();
      }
    },
    [buttonState, callRight, callWrong],
  );

  useKeypress(
    "number",
    (value) => {
      if (value <= count) click(value - 1);
    },
    [click],
  );

  // return button states and click callback
  return [buttonState, click];
}
