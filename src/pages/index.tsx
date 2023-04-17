import { type NextPage } from "next";
import Head from "next/head";
import AnalysisForm from "~/components/analysisForm";
import NavBar from "~/components/navbar";

const Home: NextPage = () => {
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
      <main className="px-6 py-4 md:px-24 md:py-12">
        <h1 className="text-4xl text-slate-800 dark:text-slate-200 pb-4">Chess Opening Deviation Analysis</h1>
        <AnalysisForm />
        <div id="stats-container"></div>
      </main>
    </>
  );
};

export default Home;
