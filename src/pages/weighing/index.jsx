import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import Layout from "@/components/Layout";
import { WeighingCard } from "@/components/WeighingCard";
import Loading from "@/components/Loading";
import AddButton from "@/components/AddButton";

export default function Weighing() {
  const router = useRouter();

  const [weighingData, setWeighingData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    setIsLoading(true);
    const fetchWeighingData = async () => {
      try {
        const params = {
          page: page,
          per_page: 12,
        };

        if (filterType === "day" && startDate) {
          params.start_date = startDate;
          params.end_date = new Date(
            new Date(startDate).setDate(new Date(startDate).getDate() + 1)
          )
            .toISOString()
            .split("T")[0];
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing`,
          { params }
        );
        setWeighingData(response.data.data);
        setTotalPages(response.data.pagination.total_pages);
        console.log(response.data.pagination.total_pages);
      } catch (error) {
        setWeighingData([]);
        toast.error(
          "Error fetching data: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeighingData();
  }, [page, filterType, startDate]);

  const handleCardClick = (id) => {
    router.push(`/weighing/${id}`);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(1);
  };

  return (
    <Layout>
      {isLoading && <Loading />}
      <div className="p-2">
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="border shadow rounded p-2"
          >
            <option value="all">Semua Data</option>
            <option value="day">Hari</option>
          </select>

          {filterType === "day" && (
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="border border-gray-300 rounded p-2"
            />
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weighingData.length > 0 ? (
            weighingData.map((weighing) => (
              <WeighingCard
                key={weighing.id}
                weighing={weighing}
                onClick={() => handleCardClick(weighing.id)}
              />
            ))
          ) : (
            <p>Tidak ada data yang ditemukan.</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 text-sm lg:text-base ${
              page === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Sebelumnya
          </button>
          <span className="self-center text-sm lg:text-base">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-white bg-gray-800 transition duration-200 text-sm lg:text-base ${
              page === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Berikutnya
          </button>
        </div>
      </div>
      <AddButton />
    </Layout>
  );
}
