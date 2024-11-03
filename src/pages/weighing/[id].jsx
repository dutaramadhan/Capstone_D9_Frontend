import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useRouter } from "next/router";

export default function WeighingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [weighingDetail, setWeighingDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secondWeight, setSecondWeight] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const fetchWeighingDetail = async () => {
      if (!id) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}`
        );
        setWeighingDetail(response.data.data);
        setSecondWeight(response.data.data.second_weight);
        setIsDataFetched(true);
      } catch (error) {
        toast.error("Error fetching weighing details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeighingDetail();
  }, [id]);

  useEffect(() => {
    if (isDataFetched) {
      if (secondWeight == null) {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

        socket.on("weight_data", (data) => {
          setSecondWeight(data.weight);
        });

        return () => {
          socket.disconnect();
        };
      }
    }
  }, [id, isDataFetched]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!weighingDetail) {
    return <div className="p-6 text-center">Detail tidak ditemukan.</div>;
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-600">
          Detail Weighing
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                License Plate:
              </span>
              <span className="text-gray-600">
                {weighingDetail.license_plate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Supplier:</span>
              <span className="text-gray-600">{weighingDetail.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Driver Name:</span>
              <span className="text-gray-600">
                {weighingDetail.driver_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Notes:</span>
              <span className="text-gray-600">{weighingDetail.notes}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">First Weight:</span>
              <span className="text-gray-600">
                {weighingDetail.first_weight}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                Second Weight:
              </span>
              <span className="text-gray-600">
                {secondWeight !== null ? secondWeight : "Menunggu data..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Net Weight:</span>
              <span className="text-gray-600">
                {weighingDetail.net_weight != null
                  ? weighingDetail.net_weight
                  : "Tidak tersedia"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                First Weighing Time:
              </span>
              <span className="text-gray-600">
                {new Date(weighingDetail.first_weighing_time).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">
                Second Weighing Time:
              </span>
              <span className="text-gray-600">
                {new Date(weighingDetail.second_weighing_time).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className="text-gray-600">{weighingDetail.status}</span>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/weighing")}
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
