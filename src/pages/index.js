import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useRouter } from "next/router";
import Layout from "@/components/dashboard/Layout";

export default function Home() {
  const router = useRouter();

  const [weight, setWeight] = useState(null);
  const [capturedData, setCapturedData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  });

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    socket.on("weight_data", (data) => {
      setWeight(data.weight);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <main>
        <Layout>
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Weight Measurement Simulation</h1>
            <div style={{ fontSize: "2rem", margin: "20px" }}>
              Current Weight: {weight || "Loading..."} kg
            </div>
            {/* <button onClick={handleCapture}>Capture Weight</button>
        {capturedData.map((data, index) => (
          <div key={index} style={{ fontSize: "1.2rem", marginTop: "10px" }}>
            Captured Weight: {data.weight} kg at {data.timestamp}
          </div>
        ))} */}
          </div>
        </Layout>
      </main>
    </>
  );
}
