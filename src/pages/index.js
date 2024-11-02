import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "@/components/UI/Layout";
import LineChart from "@/components/Chart/LineChart";

export default function Home() {
  const router = useRouter();
  const [wasteData, setWasteData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/total_waste`
        );
        setWasteData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <main>
        <Layout>
          <LineChart
            data={wasteData}
            title="Data Sampah Masuk 30 Hari Terakhir"
            valueKey="total_weight"
            valueLabel="Total Berat Sampah"
            valueSuffix=" (kg)"
            dateKey="date"
            color="rgb(37, 99, 235)"
            className="w-full"
          />
        </Layout>
      </main>
    </>
  );
}
