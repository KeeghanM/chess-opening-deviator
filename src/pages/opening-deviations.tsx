import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import AnalysisForm from "~/components/analysisForm";
import NavBar from "~/components/navbar";

const OpeningDeviations: NextPage = () => {
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    let access_token = localStorage.getItem("at");
    if (access_token) setValidated(true);
  }, []);
  return (
    <>
      <Head>
        <title>
          Openings Deviations - Check how well you know your Chess Openings
        </title>
        <meta
          name="description"
          content="Improve your chess game with Opening Deviations! Our website analyzes your chess games and compares them to your opening repertoire to identify where you're going wrong. Get personalized advice on how to improve your openings and take your game to the next level."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />

      <section className="px-6 py-4 md:px-24 md:py-12">
        <h1 className="pb-2 text-4xl font-extrabold text-slate-800 underline dark:text-slate-200">
          Chess Opening Deviation Analysis
        </h1>
        <p className="pb-6 md:max-w-[50vw]">
          Level up your chess skills with our powerful tool that compares your
          games against your opening repertoires. Discover and pinpoint specific
          areas for improvement, while receiving personalized advice to enhance
          your openings. Take your chess game to new heights with our
          specialized training and learning resources.
        </p>
        <div className="md:flex md:gap-24 ">
          <aside className="md:max-w-[30vw]">
            <h2 className="mb-2 text-2xl font-bold">Instructions to use</h2>
            <ul>
              <li className="mb-4">
                <h3 className="font-bold">1. Enter LiChess Username</h3>
                <p className="pl-6">
                  The account that you want to analyse the openings of. Please
                  note that this is case sensitive.
                </p>
              </li>
              <li className="mb-4">
                <h3 className="font-bold">2. Enter LiChess Study ID</h3>
                <p className="pl-6">
                  This can be found by looking at the URL while the study is
                  open. For example, the study{" "}
                  <a href="https://lichess.org/study/z5agyGou" target="_blank">
                    https://lichess.org/study/z5agyGou
                  </a>{" "}
                  has the id of "z5agyGou". Feel free to try it out.
                </p>
              </li>
              <li className="mb-4">
                <h3 className="font-bold">3. Select Colour</h3>
                <p className="pl-6">
                  This is the side that matches your repertoire. The tool will
                  only load games matching the colour you pick here.
                </p>
              </li>
              <li className="mb-4">
                <h3 className="font-bold">4. Select minimum move threshold</h3>
                <p className="pl-6">
                  Use this to only pick games which match a deep line. For
                  example, let's say ou want to analyze your games as black
                  against 1.e4.
                </p>
                <p className="pl-6">
                  If you wanted every 1.e4 e5 game, set the move threshold to 2.
                  If you only wanted to look at vienna gambit games (1.e4 e5 2.
                  Nc3 Nf6 3. f4) then set the move threshold to 5.
                </p>
                <p className="pl-6">
                  But say you want to be really specific and only show games
                  where you responded 3...d5 and the game continued 4. fxe5 Nxe4
                  5. Qf3 Nc6. In that case, you would use 10 as the threshold.
                </p>
              </li>
              <li className="mb-4">
                <h3 className="font-bold">5. Run analysis</h3>
                <p className="pl-6">
                  Pretty simple! Hit Run Analysis and see where you can improve
                  your opening repertoire!
                </p>
              </li>
            </ul>
          </aside>
          <main>
            <AnalysisForm />
            {!validated ? (
              <p className="italic">
                For faster game loading, and analysis of private studies, please
                log in to your LiChess Account using the menu button.
              </p>
            ) : (
              <></>
            )}
            <div id="stats-container"></div>
          </main>
        </div>
      </section>
    </>
  );
};

export default OpeningDeviations;
