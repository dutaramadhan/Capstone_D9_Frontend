import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaTemperatureFull, FaWeightHanging } from "react-icons/fa6";
import { IoIosWater } from "react-icons/io";
import { WiHumidity } from "react-icons/wi";

import Layout from "@/components/Layout";

import LineChart from "@/components/Chart/LineChart";
import ReadingsChart from "@/components/Chart/ReadingsChart";
import WeighingTable from "@/components/Table/WeighingTable";

import { toast } from "react-toastify";
import { Card } from "@/components/Card";

import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const [weighingDataDaily, setWeighingDataDaily] = useState([]);
  const [weighingData, setWeighingData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [temperatureFish, setTemperatureFish] = useState();
  const [waterQualityFish, setWaterQualityFish] = useState();
  const [temperatureMaggot, setTemperatureMaggot] = useState();
  const [humidityMaggot, setHumidityMaggot] = useState();

  // data for reading's chart
  const [readingsData, setReadingsData] = useState({
    dates: [],
    categories: [],
    series: {},
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const wsFish = new WebSocket(`${process.env.NEXT_PUBLIC_ESP2_URL}`);
    const wsMaggot = new WebSocket(`${process.env.NEXT_PUBLIC_ESP3_URL}`);

    wsFish.onopen = function () {
      console.log("Connected to [SECOND] ESP32 WebSocket");
    };

    wsMaggot.onopen = function () {
      console.log("Connected to [Third] ESP32 WebSocket");
    };

    wsFish.onmessage = function (event) {
      const data = JSON.parse(event.data);
      setTemperatureFish(data.temperature1);
      setWaterQualityFish(data.tds);
    };

    wsMaggot.onmessage = function (event) {
      const data = JSON.parse(event.data);
      setTemperatureMaggot(data.temperature2);
      setHumidityMaggot(data.humidity2);
    };

    wsFish.onclose = () =>
      console.log("Disconnected from [SECOND] ESP32 WebSocket");
    wsMaggot.onclose = () =>
      console.log("Disconnected from [THIRD] ESP32 WebSocket");

    return () => {
      wsFish.close();
      wsMaggot.close();
      console.log("WebSocket cleaned up");
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
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
        const thisYear = new Date().getFullYear();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PHP_API}/readings.php?tps_id=1&from=${thisYear}-01-01&to=${thisYear}-12-31`
        );
        let result = await response.json();

        if (!Array.isArray(result)) result = [result];
        else result = result.reverse();

        let temp = { dates: [], categories: [], series: {} };

        temp.dates = result.map((data) =>
          data.date.split("-").reverse().join("-")
        );
        delete result[0].id;
        delete result[0].tps_id;
        delete result[0].date_added;
        delete result[0].date;
        for (const category in result[0])
          temp.series[category.toUpperCase().replace(/_/g, " ")] = result.map(
            (data) => Number(data[category])
          );
        temp.categories = Object.keys(temp.series);

        setReadingsData(temp);
      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    })();

    fetchWeighingDataDaily();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchWeighingData = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
          {isLoading && <Loading />}
          <div className="flex flex-wrap justify-between">
            <Card
              className="w-[98%] xl:w-[32%] m-2"
              title={`Total Sampah Masuk 30 Hari Terakhir`}
              id="weight"
            >
              <span className="flex">
                <FaWeightHanging className="mr-2 text-indigo-600 text-base lg:text-3xl" />
                <p className="font-semibold text-base lg:text-3xl ml-1">
                  {totalWaste.toFixed(1)} kg
                </p>
              </span>
            </Card>
            <Card
              className="w-[48%] xl:w-[32%] m-2"
              title={`Temperatur Kolam`}
              id="cardtemperaturefish"
            >
              <span className="flex">
                <FaTemperatureFull className="mr-2 text-red-600 text-base lg:text-3xl" />
                <p className="font-semibold text-base lg:text-3xl ml-1">
                  {temperatureFish ?? "Menunggu Data..."} °C
                </p>
              </span>
            </Card>
            <Card
              className="w-[48%] xl:w-[32%] m-2"
              title={`Kualitas Air Kolam`}
              id="cardwaterqualityfish"
            >
              <span className="flex">
                <IoIosWater className="mr-2 text-blue-600 text-base lg:text-3xl" />
                <p className="font-semibold text-base lg:text-3xl ml-1">
                  {waterQualityFish ?? "Menunggu Data..."} PPM
                </p>
              </span>
            </Card>
            <Card
              className="w-[48%] xl:w-[48.5%] m-2"
              title={`Temperatur Maggot`}
              id="cardtemperaturemaggot"
            >
              <span className="flex">
                <FaTemperatureFull className="mr-2 text-red-600 text-base lg:text-3xl" />
                <p className="font-semibold text-base lg:text-3xl ml-1">
                  {temperatureMaggot ?? "Menunggu Data..."} °C
                </p>
              </span>
            </Card>
            <Card
              className="w-[48%] xl:w-[48.5%] m-2"
              title={`Kelembaban Maggot`}
              id="cardhumidymaggot"
            >
              <span className="flex">
                <WiHumidity className="mr-2 text-blue-600 text-base lg:text-3xl" />
                <p className="font-semibold text-base lg:text-3xl ml-1">
                  {humidityMaggot ?? "Menunggu Data..."} %
                </p>
              </span>
            </Card>
          </div>
          <LineChart
            data={weighingDataDaily}
            title="Grafik Data Sampah Masuk 30 Hari Terakhir"
            valueKey="total_weight"
            valueLabel="Total Berat Sampah"
            valueSuffix=" (kg)"
            dateKey="date"
            color="rgb(37, 99, 235)"
            className="mt-4 min-w-full"
          />
          <Card
            className="w-full mt-6"
            title={`Data Sampah Masuk`}
            id="card-table"
          >
            <WeighingTable weighings={weighingData} />
            <div className="flex justify-between ">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 text-sm lg:text-base font-medium ${
                  page === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Sebelumnya
              </button>
              <span className="self-center text-sm lg:text-base">
                Tabel {page} dari {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 text-sm lg:text-base ${
                  page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Berikutnya
              </button>
            </div>
          </Card>
          <ReadingsChart data={readingsData} />
        </Layout>
      </main>
    </>
  );
}
