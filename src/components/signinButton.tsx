import crypto from "crypto";
import { useEffect, useState } from "react";

const SignInButton = () => {
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    const access_token = localStorage.getItem("at");
    if (access_token) setValidated(true);
  }, []);
  const login = () => {
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
    const codeVerifier = generateRandomString(43);
    const codeChallenge = transformToCodeChallenge(codeVerifier);
    const state = generateRandomString(12);
    const oauthUrl = `https://lichess.org/oauth?response_type=code&client_id=openingDeviatOr.app&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=study:read&state=${state}`;
    localStorage.setItem("cv", JSON.stringify(codeVerifier));
    localStorage.setItem("st", JSON.stringify(state));
    window.location.assign(oauthUrl);
  };

  const generateRandomString = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }

    return randomString;
  };
  const transformToCodeChallenge = (codeVerifier: string) => {
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();
    const codeChallenge = base64UrlEncode(hash);
    return codeChallenge;
  };

  const base64UrlEncode = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let base64 = Buffer.from(bytes).toString("base64");
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return base64;
  };

  const logout = () => {
    localStorage.removeItem("at");
    localStorage.removeItem("st");
    localStorage.removeItem("cv");
    localStorage.removeItem("un");
    setValidated(false);
  };

  return validated ? (
    <button
      onClick={logout}
      className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-200 hover:bg-orange-500 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-orange-500 md:text-xl"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={login}
      className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-200 hover:bg-orange-500 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-orange-500 md:text-xl"
    >
      LiChess Login
    </button>
  );
};

export default SignInButton;
