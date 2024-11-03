import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
  }, []);

  return (
    <div className="min-h-screen min-w-screen bg-gray-200 relative">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300  ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main
          className="p-4"
          onClick={() => {
            if (window.innerWidth < 728) {
              closeSidebar();
            }
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
