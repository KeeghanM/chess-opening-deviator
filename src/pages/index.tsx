import { type NextPage } from "next";
import Head from "next/head";
import NavBar from "~/components/navbar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          Chess Tools - a collection of useful tools to improve your chess training
        </title>
        <meta
          name="description"
          content="Improve your chess game with Opening Deviations! Our website analyzes your chess games and compares them to your opening repertoire to identify where you're going wrong. Get personalized advice on how to improve your openings and take your game to the next level."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <section className="px-6 py-4 md:px-24 md:py-12 md:flex justify-between">
        <h1 className="pb-6 text-4xl font-extrabold underline text-slate-800 dark:text-slate-200">Chess Tools</h1>
      </section>
    </>
  );
};

export default Home;
