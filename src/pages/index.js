import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "@/components/Header";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  });

  return (
    <>
      <main>
        <Header />
      </main>
    </>
  );
}
