import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "@/components/Layout";
import LineChart from "@/components/Chart/LineChart";
import { toast } from "react-toastify";
import { Card } from "@/components/Dashboard/Card";

export default function Home() {
  const router = useRouter();
  const [wasteData, setWasteData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/total_waste`
        );
        setWasteData(response.data.data);
      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalWaste = wasteData.reduce(
    (total, item) => total + item.total_weight,
    0
  );

  return (
    <>
      <main>
        <Layout>
          <div className="flex flex-wrap justify-between">
            <Card
              className="w-full sm:w-[48%] lg:w-[23%] m-2"
              title={`Total Sampah 30 Hari Terakhir`}
              id="mainCard"
            >
              <p className="font-semibold text-3xl">{totalWaste} kg</p>
            </Card>
            <Card
              className="w-full sm:w-[48%] lg:w-[23%] m-2"
              title={`Card 2`}
              id="card2"
            >
              <p className="font-semibold text-3xl">Data 2</p>
            </Card>
            <Card
              className="w-full sm:w-[48%] lg:w-[23%] m-2"
              title={`Card 3`}
              id="card3"
            >
              <p className="font-semibold text-3xl">Data 3</p>
            </Card>
            <Card
              className="w-full sm:w-[48%] lg:w-[23%] m-2"
              title={`Card 4`}
              id="card4"
            >
              <p className="font-semibold text-3xl">Data 4</p>
            </Card>
          </div>
          <LineChart
            data={wasteData}
            title="Data Sampah Masuk 30 Hari Terakhir"
            valueKey="total_weight"
            valueLabel="Total Berat Sampah"
            valueSuffix=" (kg)"
            dateKey="date"
            color="rgb(37, 99, 235)"
            className="mt-4 max-w-full"
          />
        </Layout>
      </main>
    </>
  );
}
