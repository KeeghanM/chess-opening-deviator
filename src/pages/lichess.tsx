import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "~/components/navbar";

const LiChess: NextPage = () => {
  const router = useRouter();
  const [errorState, setError] = useState("");
  useEffect(() => {
    if (router.isReady) {
      const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";

      let codeVerifier = JSON.parse(localStorage.getItem("cv") as string);
      let state = JSON.parse(localStorage.getItem("st") as string);
      const code = router.query["code"] as string;
      const returnedState = router.query["state"];
      const error = router.query["error"];

      if (state != returnedState || !codeVerifier || !state || error) {
        setError("Bad Request, try again.");
        return;
      }

      try {
        const formData = new URLSearchParams();
        formData.append("grant_type", "authorization_code");
        formData.append("code", code);
        formData.append("code_verifier", codeVerifier);
        formData.append("redirect_uri", redirectUri);
        formData.append("client_id", "openingDeviatOr.app");

        let options = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        };
        fetch(`https://lichess.org/api/token`, options)
          .then((response) => response.json())
          .then((data) => {
            localStorage.setItem("at", JSON.stringify(data.access_token));
            fetch("https://lichess.org/api/account", {
              headers: { Authentication: `Bearer ${data.access_token}` },
            }).then((res) => res.json())
              .then((account) => {
                console.log(account);
                router.push("/");
              })
          });
      } catch (err: any) {
        setError(err.toString());
      }
    }
  }, [router.isReady]);

  return (
    <>
      <NavBar />
      <div className="ml-[40vw] mt-[30vh]">
        {errorState ? (
          <>
            <p>Error!</p>
            <p>{errorState}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
};

export default LiChess;
