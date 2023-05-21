import crypto from "crypto";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const SignInButton = () => {
  const [validated,setValidated] = useState(false)
  useEffect(()=>{
    let access_token = localStorage.getItem('at')
    if(access_token) setValidated(true)
  },[])
  const login = () => {
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
    let uuid = uuidv4();
    let hash = crypto.createHash("sha256").update(uuid).digest("hex");
    let codeVerifier = Buffer.from(hash).toString("base64");
    let state = uuidv4();
    let oauthUrl = `https://lichess.org/oauth?response_type=code&client_id=openingDeviatOr.app&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${codeVerifier}&scope=study:read&state=${state}`;
    localStorage.setItem("cv", JSON.stringify(codeVerifier));
    localStorage.setItem("st", JSON.stringify(state));
    window.location.assign(oauthUrl);
  };

  const logout = () => {
    localStorage.removeItem("at")
    localStorage.removeItem("st")
    localStorage.removeItem("cv")
    setValidated(false)
  }

  return (
    validated ? <button
      onClick={logout}
      className="rounded-xl bg-slate-800 px-4 py-2 md:text-xl font-bold text-slate-200 hover:bg-orange-500 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-orange-500"
    >
      Logout
    </button> :
    <button
      onClick={login}
      className="rounded-xl bg-slate-800 px-4 py-2 md:text-xl font-bold text-slate-200 hover:bg-orange-500 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-orange-500"
    >
      LiChess Login
    </button>
  );
};

export default SignInButton;
