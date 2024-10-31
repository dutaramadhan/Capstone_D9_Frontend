import Link from "next/link";
import { useState } from "react";

export default function Header() {
  return (
    <nav className="z-[30] bg-[#263544] fixed top-0 w-full py-4 px-6 md:px-10 lg:px-12 flex items-center shadow-md">
      <Link href={"/"}>
        <div className="flex items-center gap-3 cursor-pointer">
          <h1 className="font-Montserrat text-left text-2xl sm:text-2xl md:text-3xl text-white">
            TPS SINDUADI DASHBOARD
          </h1>
        </div>
      </Link>
    </nav>
  );
}
