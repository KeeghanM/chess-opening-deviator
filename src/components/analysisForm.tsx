import { useEffect, useState } from "react";
import { parse } from "@mliebelt/pgn-parser";
import ECO from "../utils/eco";

import type { FormEvent } from "react";
import type { ParseTree } from "@mliebelt/pgn-parser";
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

type StatsType = {
  gamesInRepertoire: number;
  gamesNotInRepertoire: number;
  wins: number;
  losses: number;
  draws: number;
  games: { [key: string]: any[] };
};

const AnalysisForm = () => {
  const [accessToken, setAccessToken] = useState<any>();
  useEffect(() => {
    let access_token = localStorage.getItem("at") as string;
    if (access_token != "undefined") setAccessToken(JSON.parse(access_token));
  }, []);

  const [status, setStatus] = useState("default");
  const [stats, setStats] = useState<any>();
  const [colourState, setColour] = useState("");
  let colour = "";
  const [loadedGames, setLoadedGames] = useState(0);
  const [loadedLines, setLoadedLines] = useState(0);
  const [analysedCount, setAnalysedCount] = useState(0);

  let minMoves: number;

  const handleSubmit = async (event: FormEvent<CustomForm>) => {
    event.preventDefault();
    setStatus("loading");
    setLoadedGames(0)
    setLoadedLines(0)
    setAnalysedCount(0)
    const target = event.currentTarget.elements;
    let username = target.username.value;
    let studyId = target.studyId.value;
    setColour(target.colour.value);
    colour = target.colour.value;
    let minDate = target.minDate.value;
    minMoves = parseInt(target.minMoves.value);

    let games = await streamGames(username, minDate);
    if (!games || Object.keys(games).length == 0) {
      setStatus("noGames");
      return;
    }

    let lines = await streamLines(studyId);
    if (!lines || Object.keys(lines).length == 0) {
      setStatus("noLines");
      return;
    }

    setStats(await runAnalysis(games, lines));
  };

  const streamGames = async (username: string, minDate: string) => {
    try {
      let options = {};
      if (accessToken) {
        options = { headers: { Authentication: `Bearer ${accessToken}` } };
      }
      const response = await fetch(
        `https://lichess.org/api/games/user/${username}?moves=true&color=${colour}&since=${Date.parse(
          minDate
        )}&perfType=blitz,rapid,classical&opening=true`,
        options
      );
      if (!response.body) {
        return;
      }

      let games = [];
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        let parsedGames = parse(value, { startRule: "games" }) as ParseTree[];

        for (let game of parsedGames) {
          setLoadedGames((prevLoadedGames) => prevLoadedGames + 1);
          games.push(game);
        }
      }
      return identifyLines(games);
    } catch (error) {
      console.log(error);
    }
  };

  const streamLines = async (studyId: string) => {
    try {
      let options = {};
      if (accessToken) {
        options = { headers: { Authentication: `Bearer ${accessToken}` } };
      }
      console.log(options);
      const response = await fetch(
        `https://lichess.org/api/study/${studyId}.pgn`,
        options
      );
      if (response.body == null) {
        throw new Error("No Lines Found");
      }
      let lines: any[] = [];
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        let parsedLine = parse(value, { startRule: "games" }) as ParseTree[];
        for (let line of parsedLine) {
          recursiveParse([], line.moves, line.tags, lines);
        }
      }
      return identifyLines(lines);
    } catch (error) {
      console.log(error);
    }
  };

  const runAnalysis = async (
    games: { [key: string]: any[] },
    lines: { [key: string]: any[] }
  ) => {
    if (!games || !lines) {
      throw new Error("Missing Games or Lines");
      return;
    }

    let stats: StatsType = {
      gamesInRepertoire: 0,
      gamesNotInRepertoire: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      games: {},
    };

    for (let [id, gamesArray] of Object.entries(games)) {
      for (let game of gamesArray) {
        setAnalysedCount((prevAnalysed) => prevAnalysed + 1);
        if (!lines[id]) {
          stats.gamesNotInRepertoire++;
          continue;
        }
        if (!stats.games[id]) {
          stats.games[id] = [];
        }

        stats.gamesInRepertoire++;
        let longestMatchingLine = 0;
        let deviatingPlayer = "";
        let wrongMove = "";
        let rightMove = "";
        let endOfBook = false;
        for (let line of lines[id] as any[]) {
          let matchingMoveCount = 0;
          for (const [index, bookMove] of line.moves.entries()) {
            if (
              bookMove.notation.notation ==
                game.moves[index].notation.notation &&
              matchingMoveCount < line.moves.length - 1
            ) {
              matchingMoveCount++;
            } else {
              if (matchingMoveCount > longestMatchingLine) {
                longestMatchingLine = matchingMoveCount;
                deviatingPlayer =
                  (bookMove.turn == "w" ? "white" : "black") == colour
                    ? "Player"
                    : "Opponent";
                wrongMove = game.moves[index].notation.notation;
                rightMove = bookMove.notation.notation;
                endOfBook = matchingMoveCount == line.moves.length - 1;
              }
              break;
            }
          }
        }
        let result = calculateResult(game.tags.Result);
        if (result == "Win") stats.wins++;
        if (result == "Draw") stats.draws++;
        if (result == "Loss") stats.losses++;

        let gameStats = {
          movesInBook: Math.floor(longestMatchingLine / 2) + 1,
          deviatingPlayer,
          rightMove,
          wrongMove,
          result,
          endOfBook,
        };
        if (!stats.games[id]) {
          stats.games[id] = [];
        }
        stats.games[id]!.push(gameStats);
      }
    }
    return stats;
  };

  const calculateResult = (result: string) => {
    if (result == "1-0") {
      return colour == "white" ? "Win" : "Loss";
    }
    if (result == "0-1") {
      return colour == "white" ? "Loss" : "Win";
    }
    return "Draw";
  };

  const identifyLines = (linesInput: any[]) => {
    let taggedLines: { [key: string]: any[] } = {};
    for (let line of linesInput) {
      if (line.moves.length <= minMoves) continue;
      let id = getLineId(line.moves);
      if (!Object.keys(taggedLines).includes(id)) {
        taggedLines[id] = [];
      }
      taggedLines[id]!.push(line);
    }
    return taggedLines;
  };

  const getLineId = (moves: any[]) => {
    let id = "";
    for (let i = 0; i < minMoves; i++) {
      id += moves[i].notation.notation;
    }
    return id;
  };

  const recursiveParse = (
    lineSoFar: any,
    newMoves: any,
    tags: any,
    outputArray: any[]
  ) => {
    setLoadedLines((prevLoadedLines) => prevLoadedLines + 1);

    let lineArray = JSON.parse(JSON.stringify(lineSoFar)); // Deep Clone the array
    for (let move of newMoves) {
      for (let variation of move.variations) {
        recursiveParse(lineArray, variation, tags, outputArray);
      }
      lineArray.push(move);
    }
    let line = {
      tags,
      moves: lineArray,
    };
    outputArray.push(line);
  };

  const reset = () => {
    setStatus("default");
    setStats(undefined);
  };

  return stats ? (
    <StatsDisplay stats={stats} colour={colourState} reset={reset} />
  ) : status == "loading" ? (
    <div>
      <p>Currently Loading...</p>
      <p>
        <span>{loadedGames}</span> Games Loaded
      </p>
      <p>
        <span>{loadedLines}</span> Lines Loaded
      </p>
      <p>
        <span>
          {analysedCount}/{loadedGames}
        </span>{" "}
        Games Analyzed
      </p>
    </div>
  ) : status == "noGames" || status == "noLines" ? (
    <div>
      <p>
        Unfortunately, no {status == "noGames" ? "games" : "lines"} found. Try a
        different {status == "noGames" ? "player or date range" : "study ID"}.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-xl font-bold text-slate-200 dark:bg-slate-200 dark:text-slate-800"
      >
        Reset Form
      </button>
    </div>
  ) : (
    <>
      <form
        id="opening-form"
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 bg-slate-100 p-4 dark:bg-slate-800 md:sticky md:top-[100px] md:w-[400px]"
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
            className="border border-orange-500 px-2  py-1 dark:bg-slate-500"
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
            className="border border-orange-500 px-2 py-1 dark:bg-slate-500   "
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
                defaultValue="white"
                defaultChecked
              />
              <label htmlFor="white">White</label>
            </span>
            <span className="flex items-center gap-2">
              <input
                type="radio"
                id="black"
                name="colour"
                defaultValue="black"
              />
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
            className="border border-orange-500 px-2 py-1 dark:bg-slate-500"
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
            defaultValue="6"
            min="2"
            max="20"
            required
            className="border border-orange-500 px-2 py-1 dark:bg-slate-500"
          />
        </fieldset>
        <fieldset className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-2 py-2 text-xl font-bold text-slate-800"
          >
            Run Analysis
          </button>
          <button
            type="reset"
            className="rounded-xl border border-slate-800 px-2 py-2 text-xl font-bold dark:border-slate-200 dark:text-slate-200"
          >
            Reset
          </button>
        </fieldset>
      </form>
    </>
  );
};

const StatsDisplay = (props: any) => {
  let stats = props.stats;
  let colour = props.colour;
  let totalGames = stats.gamesInRepertoire + stats.gamesNotInRepertoire;
  let winPercent = percent(stats.wins, stats.gamesInRepertoire);
  let drawPercent = percent(stats.draws, stats.gamesInRepertoire);
  let lossPercent = percent(stats.losses, stats.gamesInRepertoire);

  const getDeviations = (games: { [key: string]: any[] }) => {
    let endOfBook = 0;
    let playerDeviations = 0;
    let opponentDeviations = 0;
    let winsWhenPlayer = 0;
    let lossesWhenPlayer = 0;
    let drawsWhenPlayer = 0;
    let winsWhenOpponent = 0;
    let lossesWhenOpponent = 0;
    let drawsWhenOpponent = 0;

    for (let [id, gamesArray] of Object.entries(games)) {
      for (let game of gamesArray) {
        if (game.endOfBook) {
          endOfBook++;
          continue;
        }

        if (game.deviatingPlayer == "Player") {
          playerDeviations++;
          game.result == "Win"
            ? winsWhenPlayer++
            : game.result == "Loss"
            ? lossesWhenPlayer++
            : drawsWhenPlayer++;
        } else {
          opponentDeviations++;
          game.result == "Win"
            ? winsWhenOpponent++
            : game.result == "Loss"
            ? lossesWhenOpponent++
            : drawsWhenOpponent++;
        }
      }
    }

    return {
      playerDeviations,
      opponentDeviations,
      winsWhenOpponent,
      winsWhenPlayer,
      drawsWhenPlayer,
      drawsWhenOpponent,
      lossesWhenOpponent,
      lossesWhenPlayer,
      endOfBook,
    };
  };
  let deviationStats = getDeviations(stats.games);

  return stats.gamesInRepertoire > 0 ? (
    <div className="stats">
      <p>
        In total you played <span>{totalGames}</span> games as {colour}, of
        which <span>{stats.gamesInRepertoire}</span> matched a line in your
        provided repertoire.
        <br />
        Of those {stats.gamesInRepertoire} games, you{" "}
        <span>
          won {winPercent}%, lost {lossPercent}%
        </span>{" "}
        and drew the remaining <span>{drawPercent}%</span>.
      </p>
      <p>
        You reached the end of a book line{" "}
        <span>{deviationStats.endOfBook} times</span>, leaving{" "}
        <span>{stats.gamesInRepertoire - deviationStats.endOfBook} games</span>{" "}
        to learn from.
        <br />
        In those games which we can learn from, you deviated from the book{" "}
        <span> {deviationStats.playerDeviations} times</span>, compared to your
        opponent deviating{" "}
        <span>{deviationStats.opponentDeviations} times</span>.<br />
        When your opponent deviated from book, you managed to{" "}
        <span>win {deviationStats.winsWhenOpponent}</span> times which leaves{" "}
        <span>
          {deviationStats.opponentDeviations - deviationStats.winsWhenOpponent}{" "}
          games
        </span>{" "}
        where you can learn refutations to punish your opponents mistakes.
      </p>
      <Breakdown
        stats={stats}
        colour={colour}
        title={"Learn from your mistakes"}
        sideToShow={"Player"}
      />
      <Breakdown
        stats={stats}
        colour={colour}
        title={"Punish your opponents"}
        sub={"Consider adding refutations to your repertoire"}
        sideToShow={"Opponent"}
      />
      <button
        onClick={props.reset}
        className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-xl font-bold text-slate-200 hover:bg-orange-500 dark:bg-slate-200 dark:text-slate-800"
      >
        Reset Form
      </button>
    </div>
  ) : (
    <>
      <p>
        In total you played <span>{totalGames}</span> games as {colour}, however
        none matched your provided repertoire.
        <br />
        Either try a different study id, or adjust the half move count.
        <br />
        <button
          onClick={props.reset}
          className="rounded-xl bg-slate-800 px-4 py-2 text-xl font-bold text-slate-200 dark:bg-slate-200 dark:text-slate-800"
        >
          Reset Form
        </button>
      </p>
    </>
  );
};

const Breakdown = (props: any) => {
  let stats: StatsType = props.stats;
  let sideToShow = props.sideToShow;
  let colour = props.colour;

  return (
    <>
      <h2 className="mt-4 text-2xl font-bold">{props.title}</h2>
      {props.sub ? <h3 className="italic">{props.sub}</h3> : <></>}
      {Object.entries(stats.games).map(([id, gamesArray], i) => (
        <div key={id}>
          <h4 className="mt-1 font-bold">{ECO[id.toLowerCase()]}</h4>
          {gamesArray
            .reduce((accumulator: any[], game: any) => {
              const foundItem = accumulator.find((obj: any) => {
                return (
                  obj.deviatingPlayer === game.deviatingPlayer &&
                  obj.endOfBook === game.endOfBook &&
                  obj.movesInBook === game.movesInBook &&
                  obj.result === game.result &&
                  obj.rightMove === game.rightMove &&
                  obj.wrongMove === game.wrongMove
                );
              });

              if (foundItem) {
                foundItem.count++;
              } else {
                accumulator.push({ ...game, count: 1 });
              }

              return accumulator;
            }, [])
            .sort((a, b) => {
              if (a.count !== b.count) {
                return b.count - a.count;
              }
              if (a.wrongMove !== b.wrongMove) {
                return a.wrongMove - b.wrongMove;
              }
              return a.rightMove - b.rightMove;
            })
            .map((game, i) => {
              if (game.deviatingPlayer != sideToShow || game.endOfBook)
                return <></>;
              let ellipses = "";
              if (sideToShow == "Player") {
                ellipses = colour == "white" ? ". " : "... ";
              } else {
                ellipses = colour == "white" ? "... " : ". ";
              }
              let moveNumber = game.movesInBook + ellipses;
              return (
                <p key={i}>
                  {sideToShow == "Player" ? (
                    <>
                      <span>{game.count}</span> times you played{" "}
                      <span>
                        {moveNumber}
                        {game.wrongMove}
                      </span>
                      , correct was{" "}
                      <span>
                        {moveNumber}
                        {game.rightMove}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{game.count}</span> times you didn't win when{" "}
                      <span>
                        {moveNumber}
                        {game.wrongMove}
                      </span>{" "}
                      was played
                    </>
                  )}
                </p>
              );
            })}
        </div>
      ))}
    </>
  );
};

function percent(number: number, of: number) {
  return Math.round((number / of) * 100);
}
export default AnalysisForm;
