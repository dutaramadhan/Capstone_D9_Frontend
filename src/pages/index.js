import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { io } from "socket.io-client";

import Layout from "@/components/Layout";

import LineChart from "@/components/Chart/LineChart";
import ReadingsChart from "@/components/Chart/ReadingsChart";

import { toast } from "react-toastify";
import { Card } from "@/components/InformationCard";

import WeighingTable from "@/components/Table/WeighingTable";

export default function Home() {
  const router = useRouter();
  const [weighingDataDaily, setWeighingDataDaily] = useState([]);
  const [weighingData, setWeighingData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // data for reading's chart
  const [ readingsData, setReadingsData ] = useState({
    dates: [],
    categories: [],
    series: {}
  })

  const [temperature1, setTemperature1] = useState(null);
  const [temperature2, setTemperature2] = useState(null);
  const [humidity1, setHumidity1] = useState();
  const [humidity2, setHumidity2] = useState();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_ESP2_URL}`);

    ws.onopen = function () {
      console.log("Connected to [SECOND] ESP32 WebSocket");
    };

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      setTemperature1(data.temperature1);
      setHumidity1(data.humidity1);
      setTemperature2(data.temperature2);
      setHumidity2(data.humidity2);
    };

    ws.onclose = function () {
      console.log("Disconnected from [SECOND] ESP32 WebSocket");
    };
  }, []);

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

    // fetch readings data
    (async () => {
      try {
        const thisYear = (new Date()).getFullYear()
        const response = await fetch(`${process.env.NEXT_PUBLIC_PHP_API}/readings.php?tps_id=1&from=${thisYear}-01-01&to=${thisYear}-12-31`)
        let result = await response.json()

        if (!Array.isArray(result)) result = [result]
        else result = result.reverse()
        
        let temp = { dates: [], categories: [], series: {} }

        temp.dates = result.map(data => data.date.split("-").reverse().join("-"))
        delete result[0].id
        delete result[0].tps_id
        delete result[0].date_added
        delete result[0].date
        for (const category in result[0])
          temp.series[category.toUpperCase().replace(/_/g, ' ')] = result.map(data => Number(data[category]))
        temp.categories = Object.keys(temp.series)

        setReadingsData(temp)

      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    })()

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
              className="w-[45%] lg:w-[23%] m-2"
              title={`Total Sampah 30 Masuk Hari Terakhir`}
              id="card1"
            >
              <p className="font-semibold text-xl lg:text-3xl">
                {totalWaste} kg
              </p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Temperatur 1`}
              id="card2"
            >
              <p className="font-semibold text-xl lg:text-3xl">
                {temperature1}
              </p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Humidity 1`}
              id="card5"
            >
              <p className="font-semibold text-xl lg:text-3xl">{humidity1}</p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Temperatur 2`}
              id="card6"
            >
              <p className="font-semibold text-xl lg:text-3xl">
                {temperature2}
              </p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Humidity 2`}
              id="card7"
            >
              <p className="font-semibold text-xl lg:text-3xl">{humidity2}</p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Card 3`}
              id="card3"
            >
              <p className="font-semibold text-xl lg:text-3xl">Data 3</p>
            </Card>
            <Card
              className="w-[45%] lg:w-[23%] m-2"
              title={`Card 4`}
              id="card4"
            >
              <p className="font-semibold text-xl lg:text-3xl">Data 4</p>
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
              className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Sebelumnya
            </button>
            <span className="self-center text-medium">
              Tabel {page} dari {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Berikutnya
            </button>
          </div>
          
          <ReadingsChart data={readingsData} />

        </Layout>
      </main>
    </>
  );
}