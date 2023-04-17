import { SignIn } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

const Login: NextPage = () => {
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
      <main className="flex justify-center items-center h-[100vh]"><SignIn /></main>
      </>
  )}

  export default Login