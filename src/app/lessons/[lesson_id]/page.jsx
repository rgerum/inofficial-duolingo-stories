"use client";
import React from "react";
import Lesson from "../_components/lesson";
import { convertToComposeObject } from "./convert_parts";

const input = `

[compose]
> Saluton!
% saluton; bonan, tagon, dankon

> Hello!
% hello; night, please, thank


[compose]
> Mi nomiĝas Carlo.
% mi, nomiĝas, Carlo; estas, loĝas, dankon

> My name is Carlo.
% my, name, is, Carlo; he, called, live

[match]
- saluton <> hello
- bonan nokton <> good night
- bonan tagon <> good morning 
- bonvolu <> please 
- dankon <> thank you 

[compose]
> Kiel vi fartas?
% kiel, vi, fartas; estas, nomiĝas, bonvolu

> How are you?
% how, are, you; where, live, thank


[compose]
> Bone, dankon.
% bone, dankon; kiel, vi, ĝis

> Fine, thank you.
% fine, thank, you; how, are, goodbye


[compose]
> Kie vi loĝas?
% kie, vi, loĝas; kiel, fartas, nomiĝas

> Where do you live?
% where, do, you, live; how, are, name


[compose]
> Mi loĝas en Canada.
% mi, loĝas, en, Canada; nomiĝas, estas, vi

> I live in Canada.
% I, live, in, Canada; my, name, is


[compose]
> Ĝis revido!
% ĝis, revido; bone, dankon, kie

> Goodbye!
% goodbye; please, thank, where


[compose]
> Bonvolu.
% bonvolu; dankon, pardonu, loĝas

> Please.
% please; thank, excuse, live

[compose]
> Dankon.
% dankon; bonvolu, pardonu, kiel

> Thank you.
% thank, you; please, excuse, how


[compose]
> Pardonu.
% pardonu; dankon, bonvolu, kie

> Excuse me.
% excuse, me; thank, please, where
`;

const resultObject = convertToComposeObject(input);
console.log(resultObject);

export default function Page() {
  const [current, setCurrent] = React.useState(1);
  let elements = convertToComposeObject(input);
  return (
    <Lesson elements={elements} onFinished={() => setCurrent(current + 1)} />
  );
}
