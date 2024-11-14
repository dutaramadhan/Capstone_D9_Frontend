import Link from "next/link";
import { useRouter } from "next/router";
import { LiaWeightSolid } from "react-icons/lia";
import { RxDashboard } from "react-icons/rx";
import { IoCameraOutline } from "react-icons/io5";

export default function Sidebar({ isOpen, closeSidebar }) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transform transition-transform duration-300 ease-in-out fixed flex-col w-64 bg-gray-800 h-full`}
    >
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white text-base">Dashboard Capstone D-09</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800">
          <Link
            href="/"
            className={`flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700 ${
              currentPath === "/" ? "bg-gray-700 shadow" : ""
            }`}
          >
            <RxDashboard className="h-6 w-6 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/ocr"
            className={`flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700 ${
              currentPath === "/ocr" ? "bg-gray-700 shadow" : ""
            }`}
          >
            <IoCameraOutline className="h-6 w-6 mr-2" />
            OCR
          </Link>
          <Link
            href="/weighing"
            className={`flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700 ${
              currentPath.startsWith("/weighing") ? "bg-gray-700 shadow" : ""
            }`}
          >
            <LiaWeightSolid className="h-6 w-6 mr-2" />
            Timbangan
          </Link>
        </nav>
      </div>
    </div>
  );
}
