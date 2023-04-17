import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SunIcon,MoonIcon } from '@heroicons/react/24/solid'
import Link from "next/link";
import { useTheme } from "next-themes";

const NavBar = () => {
    const { systemTheme, theme, setTheme } = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;
  return (
    <nav className="flex h-20 w-full justify-between bg-white dark:bg-slate-800">
      <ul className="flex">
        <li>
          <Link href="/">Opening DeviatOr</Link>
        </li>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
      <div className="flex items-center">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">Sign In</Link>
          </SignedOut>
          <button
            onClick={() => currentTheme == "dark"? setTheme('light'): setTheme("dark")}
            className='bg-slate-800 dark:bg-slate-200 p-2 rounded-[100vw]'>
            {currentTheme == "dark" ? <SunIcon className="h-6 w-6 text-slate-800" /> :
            <MoonIcon className="h-6 w-6 text-slate-200" /> }
        </button>
      </div>
    </nav>
  );
};

export default NavBar
