"use client";
import React from "react";
import GapsLine from "./parts/gaps_line";
import Card, { CardCheck, CardTitle } from "./parts/card";
import useChoiceButtons from "./useChoiceButtons";
import WordChoice from "./parts/word_choice";

export default function ExerciseFillChoice({ data, onChecked, ...props }) {
  const [state, setState] = React.useState(0);
  let [params1, check] = useChoiceButtons(
    data.choice.answers,
    data.choice.answers[data.choice.right_answer],
  );

  function Check() {
    if (state !== 0) {
      onChecked(state === 2);
    }
    const correct = check();
    if (correct === undefined) return;
    setState(correct + 1);
  }

  return (
    <Card state={state} {...props}>
      <CardTitle>Select the right answer</CardTitle>
      <GapsLine sentence={data.sentence1} words={[]} state={state} />
      <WordChoice words={params1} />
      <CardCheck onClick={Check}>Check</CardCheck>
    </Card>
  );
}
