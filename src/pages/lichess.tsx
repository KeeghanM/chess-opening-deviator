import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "~/components/navbar";

const LiChess: NextPage = () => {
  const router = useRouter();
  const [errorState, setError] = useState();
  useEffect(() => {
    let codeVerifier = JSON.parse(localStorage.getItem("cv"));
    let state = JSON.parse(localStorage.getItem("st"));
    const code = router.query.code;
    const returnedState = router.query.state;
    const error = router.query.error;

    if(state != returnedState || !codeVerifier || !state || error) {
        setError("Bad Request, try again.")
        return
    }

    try {
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: "http://localhost:3000/lichess/",
          client_id: "openingDeviatOr.app",
        }),
      };
      fetch(`https://lichess.org/api/token`, options)
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem("at", JSON.stringify(data.access_token));
          router.push("/");
        });
    } catch (err) {
      setError(err);
    }
  }, []);

  return (
    <>
    <NavBar />
    <div className="ml-[40vw] mt-[30vh]">
      <p>Error!</p>
      <p>{errorState}</p>
      </div>
    </>
  );
};

export default LiChess;
