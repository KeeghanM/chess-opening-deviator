import React, { FormEvent } from "react";
interface CustomElements extends HTMLFormControlsCollection   {
  username: HTMLInputElement;
  studyId: HTMLInputElement;
  colour: HTMLInputElement;
  minDate: HTMLInputElement;
  minMoves: HTMLInputElement;
}
 
interface CustomForm extends HTMLFormElement {
  readonly elements: CustomElements;
}

let username:string, studyId:string, colour:string, minDate:string, minMoves:number
let loadedGames: number = 0
let loadedLines: number = 0
let games = []
let lines = []

const AnalysisForm = () => {
  const handleSubmit = async (event: FormEvent<CustomForm>) => {
    event.preventDefault();
    const target = event.currentTarget.elements;
  username = target.username.value
  studyId = target.studyId.value
  colour = target.colour.value
  minDate = target.minDate.value
  minMoves = parseInt(target.minMoves.value)

  };

  return (
    <>
      <form
        id="opening-form"
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 md:w-[400px]"
      >
        <fieldset className="flex flex-col md:flex-row justify-between md:items-center">
          <label htmlFor="username" className="font-bold">LiChess Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col md:flex-row justify-between md:items-center">
          <label className="font-bold" htmlFor="study-id">Study ID</label>
          <input
            type="text"
            id="studyId"
            name="studyId"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col md:flex-row justify-between md:items-center">
          <label className="font-bold" htmlFor="colour">Colour</label>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                id="white"
                name="colour"
                value="white"
                checked
              />
              <label htmlFor="white">White</label>
            </span>
            <span className="flex items-center gap-2">
              <input type="radio" id="black" name="colour" value="black" />
              <label htmlFor="black">Black</label>
            </span>
          </span>
        </fieldset>
        <fieldset className="flex flex-col md:flex-row justify-between md:items-center">
          <label className="font-bold" htmlFor="min-date">Games Since</label>
          <input
            type="date"
            id="minDate"
            name="minDate"
            required
            className="dark:text-black"
          />
        </fieldset>
        <fieldset className="flex flex-col md:flex-row justify-between md:items-center">
          <label className="font-bold" htmlFor="min-moves">Half Move Threshold</label>
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
      {/* <div id="loading">
          <p>Currently Loading...</p>
          <p><span id="games-loaded-count">0</span> Games Loaded</p>
          <p><span id="lines-loaded-count">0</span> Lines Loaded</p>
          <p><span id="games-analyzed-count">0/0</span> Games Analyzed</p>
        </div> */}
    </>
  );
};

export default AnalysisForm;
