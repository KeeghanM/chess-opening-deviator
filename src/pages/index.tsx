import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import AnalysisForm from "~/components/analysisForm";
import NavBar from "~/components/navbar";

const Home: NextPage = () => {
  const [validated,setValidated] = useState(false)
  useEffect(()=>{
    let access_token = localStorage.getItem('at')
    if(access_token) setValidated(true)
  },[])
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
      <section className="px-6 py-4 md:px-24 md:py-12 md:flex justify-between">
      <main className="min-w-[50vw]">
        <h1 className="text-4xl text-slate-800 dark:text-slate-200 pb-4">Chess Opening Deviation Analysis</h1>
        {!validated ? <p className="italic">For faster game loading, and analysis of private studies, please log in to your LiChess account in the top right.</p> : <></>}
        <AnalysisForm />
        <div id="stats-container"></div>
      </main>
      <aside>
        <h2 className="text-2xl font-bold">Instructions to use</h2>
        <ul>
          <li>
            <h3 className="font-bold">1. Enter LiChess Username</h3>
            <p>
              The account that you want to analyse the openings of. Please note
              that this is case sensitive.
            </p>
          </li>
          <li>
            <h3  className="font-bold">2. Enter LiChess Study ID</h3>
            <p>
              This can be found by looking at the URL while the study is open.
              For example, the study <a href="https://lichess.org/study/z5agyGou" target="_blank">https://lichess.org/study/z5agyGou</a> has the
              id of "z5agyGou". Feel free to try it out.
            </p>
          </li>
          <li>
            <h3  className="font-bold">3. Select Colour</h3>
            <p>This is the side that matches your repertoire. The tool will only load games matching the colour you pick here.</p>
          </li>
          <li>
            <h3  className="font-bold">4. Select minimum move threshold</h3>
            <p>Use this to only pick games which match a deep line. For example, let's say ou want to analyze your games as black against 1.e4.</p>
            <p>If you wanted every 1.e4 e5 game, set the move threshold to 2. If you only wanted to look at vienna gambit games (1.e4 e5 2. Nc3 Nf6 3. f4) then set the move threshold to 5.</p>
            <p>But say you want to be really specific and only show games where you responded 3...d5 and the game continued 4. fxe5 Nxe4 5. Qf3 Nc6. In that case, you would use 10 as the threshold.</p>
          </li>
          <li>
            <h3  className="font-bold">5. Run analysis</h3>
            <p>Pretty simple! Hit Run Analysis and see where you can improve your opening repertoire!</p>
          </li>
        </ul>
      </aside>
      </section>
    </>
  );
};

export default Home;
