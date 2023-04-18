import React, { FormEvent } from "react";
import { parse } from '@mliebelt/pgn-parser'
interface CustomElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  studyId: HTMLInputElement;
  colour: HTMLInputElement;
  minDate: HTMLInputElement;
  minMoves: HTMLInputElement;
}

interface CustomForm extends HTMLFormElement {
  readonly elements: CustomElements;
}


let lines = [];

const AnalysisForm = () => {
  const [status, setStatus] = React.useState("default");
  const [loadedGames, setLoadedGames] = React.useState(0);
  const [loadedLines, setLoadedLines] = React.useState(0);

  const handleSubmit = async (event: FormEvent<CustomForm>) => {
    event.preventDefault();
    setStatus("loading")
    const target = event.currentTarget.elements;
    let username = target.username.value;
    let studyId = target.studyId.value;
    let colour = target.colour.value;
    let minDate = target.minDate.value;
    let minMoves = parseInt(target.minMoves.value);

    let games = []
    await streamGames(games,username,colour,minDate)
    if(games.length == 0){
        setStatus("noGames")
        return
    }
    console.log(games)
    setStatus("analysis")


  };

  const streamGames = async (games,username,colour,minDate) => {
    try {

    const response = await fetch(
      `https://lichess.org/api/games/user/${username}?moves=true&color=${colour}&since=${Date.parse(
        minDate
      )}&perfType=blitz,rapid,classical`
    );
    if (!response.body) {
      return;
    }

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      let parsedGames = parse(value, {startRule: "games"});
      
      for(let game of parsedGames) {
        console.log(game)
          setLoadedGames(loadedGames+1);
        games.push(game)
      }
    }
    }
    catch (error) {
        console.log(error)
    }
  };

  return status == "loading" ? (
    <div>
      <p>Currently Loading...</p>
      <p>
        <span>{loadedGames}</span> Games Loaded
      </p>
      <p>
        <span>{loadedLines}</span> Lines Loaded
      </p>
      <p>
        <span>0/{loadedGames}</span> Games Analyzed
      </p>
    </div>
  ) : status == "noGames" ? (<><div><p>Unfortunately, no games found</p></div></>) : (
    <>
      <form
        id="opening-form"
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 md:w-[400px]"
      >
        <fieldset className="flex flex-col justify-between md:flex-row md:items-center">
          <label htmlFor="username" className="font-bold">
            LiChess Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col justify-between md:flex-row md:items-center">
          <label className="font-bold" htmlFor="study-id">
            Study ID
          </label>
          <input
            type="text"
            id="studyId"
            name="studyId"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col justify-between md:flex-row md:items-center">
          <label className="font-bold" htmlFor="colour">
            Colour
          </label>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                id="white"
                name="colour"
                value="white"
                defaultChecked
              />
              <label htmlFor="white">White</label>
            </span>
            <span className="flex items-center gap-2">
              <input type="radio" id="black" name="colour" value="black" />
              <label htmlFor="black">Black</label>
            </span>
          </span>
        </fieldset>
        <fieldset className="flex flex-col justify-between md:flex-row md:items-center">
          <label className="font-bold" htmlFor="min-date">
            Games Since
          </label>
          <input
            type="date"
            id="minDate"
            name="minDate"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col justify-between md:flex-row md:items-center">
          <label className="font-bold" htmlFor="min-moves">
            Half Move Threshold
          </label>
          <input
            type="number"
            id="minMoves"
            name="minMoves"
            value="6"
            min="2"
            max="20"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-400 px-4 py-2 text-xl font-bold text-slate-800"
          >
            Run Analysis
          </button>
          <button
            type="reset"
            className="rounded-xl border border-slate-800 px-4 py-2 text-xl font-bold dark:border-slate-200 dark:text-slate-200"
          >
            Reset
          </button>
        </fieldset>
      </form>
    </>
  );
};

export default AnalysisForm;
