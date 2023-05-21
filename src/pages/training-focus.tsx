import { type NextPage } from "next";
import Head from "next/head";
import NavBar from "~/components/navbar";

const TrainingFocus: NextPage = () => {
 
  return (
    <>
      <Head>
        <title>
          Training Focus - Where should you spend your training time?
        </title>
        <meta
          name="description"
          content="Improve your chess game with Opening Deviations! Our website analyzes your chess games and compares them to your opening repertoire to identify where you're going wrong. Get personalized advice on how to improve your openings and take your game to the next level."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <section className="px-6 py-4 md:px-24 md:py-12">
        <h1 className="pb-6 text-4xl font-extrabold underline text-slate-800 dark:text-slate-200">Training Focus</h1>
        <p className="italic">Coming soon...</p>
      </section>
    </>
  );
};

export default TrainingFocus;
