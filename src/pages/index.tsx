import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import NavBar from "~/components/navbar";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          Chess Tools - a collection of useful tools to improve your chess
          training
        </title>
        <meta
          name="description"
          content="Improve your chess game with Opening Deviations! Our website analyzes your chess games and compares them to your opening repertoire to identify where you're going wrong. Get personalized advice on how to improve your openings and take your game to the next level."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <section className="px-6 py-4 md:px-24 md:py-12">
        <h1 className="pb-4 text-4xl font-extrabold text-slate-800 underline dark:text-slate-200">
          Chess Tools
        </h1>
        <ul className="w-full md:max-w-[50vw]">
          <li className="hover:bg-slate-100 dark:hover:bg-slate-800  p-4 mb-4">
            <Link href="/opening-deviations">
              <h2 className="text-xl font-bold text-orange-500">
                Opening Deviations
              </h2>
              <p className="mt-2">
                Level up your chess skills with our powerful tool that compares
                your games against your opening repertoires. Discover and
                pinpoint specific areas for improvement, while receiving
                personalized advice to enhance your openings. Take your chess
                game to new heights with our specialized training and learning
                resources.
              </p>
            </Link>
          </li>
          <li className="hover:bg-slate-100 dark:hover:bg-slate-800 p-4 mb-4">
            <Link href="/training-focus">
              <div className="flex items-center gap-4">

              <h2 className="text-xl font-bold text-orange-500">
                Training Focus
              </h2>
              <p className="italic">Coming Soon...</p>
              </div>
              <p className="mt-2">
                Optimize your chess training with Training Focus, an advanced
                tool designed to analyze your recent losses and identify key
                areas that would benefit most from your training efforts. By
                pinpointing specific weaknesses, Training Focus helps you
                allocate your training time effectively, allowing you to focus
                on the aspects that will bring the greatest improvement to your
                game. Elevate your chess skills with targeted training, taking
                your gameplay to the next level.
              </p>
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
};

export default Home;
