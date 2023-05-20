import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useTheme } from "next-themes";
import SignInButton from "./signinButton";

const NavBar = () => {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  return (
    <nav className="flex h-20 w-full items-center justify-between bg-slate-200 px-12 dark:bg-slate-800">
      <ul className="flex items-center gap-4 text-xl ">
        <li>
          <Link href="/" className="pr-12 text-4xl text-orange-500 font-bold">
            Opening DeviatOr
          </Link>
        </li>
        <li>
          <Link href="/" className="hover:text-orange-500">Home</Link>
        </li>
      </ul>
      <div className="flex items-center gap-4">
        
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
    </nav>
  );
};

export default NavBar;
