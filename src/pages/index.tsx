import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

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
      <nav className="flex justify-between">
      <ul className="w-full h-20 bg-white dark:bg-slate-800 flex">
        <li>
          <Link href="/">Opening DeviatOr</Link>
        </li>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      <SignedIn><UserButton /></SignedIn>
      <SignedOut><Link href="/sign-in">Sign In</Link></SignedOut>
    </nav>
    </>
  );
};

export default Home;
