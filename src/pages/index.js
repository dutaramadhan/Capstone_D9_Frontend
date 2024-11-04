import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "@/components/Layout";
import LineChart from "@/components/Chart/LineChart";
import { toast } from "react-toastify";
import { Card } from "@/components/InformationCard";
import WeighingTable from "@/components/Table/WeighingTable";

export default function Home() {
  const router = useRouter();
  const [weighingDataDaily, setWeighingDataDaily] = useState([]);
  const [weighingData, setWeighingData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     router.push("/auth/login");
  //   }
  // }, [router]);

  useEffect(() => {
    const fetchWeighingDataDaily = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/total_waste`
        );
        setWeighingDataDaily(response.data.data);
      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    };

    fetchWeighingDataDaily();
  }, []);

  useEffect(() => {
    const fetchWeighingData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing`,
          {
            params: {
              page: page,
              per_page: 10,
            },
          }
        );
        setWeighingData(response.data.data);
        setTotalPages(response.data.pagination.total_pages);
      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    };
    fetchWeighingData();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const totalWaste = weighingDataDaily.reduce(
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
              title={`Total Sampah 30 Masuk Hari Terakhir`}
              id="card1"
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
            data={weighingDataDaily}
            title="Data Sampah Masuk 30 Hari Terakhir"
            valueKey="total_weight"
            valueLabel="Total Berat Sampah"
            valueSuffix=" (kg)"
            dateKey="date"
            color="rgb(37, 99, 235)"
            className="mt-4 min-w-full"
          />
          <WeighingTable weighings={weighingData} />
          <div className="flex justify-between ">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg text-white bg-gray-800 hover:bg-blue-700 transition duration-200 ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Sebelumnya
            </button>
            <span className="self-center text-medium">
              Tabel {page} dari {totalPages} Tabel
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg text-white bg-gray-800 hover:bg-blue-700 transition duration-200 ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Berikutnya
            </button>
          </div>
        </Layout>
      </main>
    </>
  );
}
