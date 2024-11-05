// components/AddWeighingButton.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function AddButton() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleAddWeighing = () => {
    router.push("/weighing/add");
  };

  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={handleAddWeighing}
      className={`fixed bottom-10 right-10 bg-gray-800 hover:bg-gray-900 text-white text-3xl font-bold w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-opacity duration-300 transform ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{ transition: "opacity 0.3s, transform 0.3s" }}
    >
      +
    </button>
  );
}
