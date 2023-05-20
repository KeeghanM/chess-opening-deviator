import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useTheme } from "next-themes";
import SignInButton from "./signinButton";
import { useState } from "react";

const NavBar = () => {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex h-20 items-center justify-between  bg-slate-200 px-8 py-4 dark:bg-slate-800 sticky top-0">
      <Link
        href="/"
        className="text-xl font-bold text-orange-500 md:mr-8 md:text-4xl"
      >
        Chess Tools
      </Link>
      <ul
        className={`md:flex ${
          isMenuOpen
            ? "absolute right-0 flex flex-col items-center top-0 h-screen w-56 transform bg-gray-900 text-slate-200 pt-12 gap-6"
            : "hidden"
        } md:space-x-4`}
      >
        {isMenuOpen && (
          <button
            className="absolute top-0 right-0 m-4 text-white hover:text-gray-300 focus:outline-none"
            onClick={handleMenuToggle}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
        <li>
          <Link href="/" className="hover:text-orange-500">
            Home
          </Link>
        </li>
        <li>
          <Link href="/opening-deviations" className="hover:text-orange-500">
            Opening Deviations
          </Link>
        </li>
        <li>
          <Link href="/training-focus" className="hover:text-orange-500">
            Training Focus
          </Link>
        </li>
      </ul>
      <div className="flex items-center gap-4 md:ml-auto">
        <SignInButton />
        <button
          onClick={() =>
            currentTheme == "dark" ? setTheme("light") : setTheme("dark")
          }
          className="rounded-[100vw] bg-slate-800 p-1 dark:bg-slate-200"
        >
          {currentTheme == "dark" ? (
            <SunIcon className="h-6 w-6 text-slate-800" />
          ) : (
            <MoonIcon className="h-6 w-6 text-slate-200" />
          )}
        </button>
      </div>
        <button
          className="text-slate-800 hover:text-slate-600 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200 ml-4 md:hidden"
          onClick={handleMenuToggle}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
    </nav>
  );
};

export default NavBar;
