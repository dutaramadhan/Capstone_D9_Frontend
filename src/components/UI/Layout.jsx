import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-200 relative">
      <Sidebar isOpen={isSidebarOpen} className={closeSidebar} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300  ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4" onClick={closeSidebar}>
          {children}
        </main>
      </div>
    </div>
  );
}
