import Layout from "@/components/Layout";
import ConfirmationToast from "@/components/ConfirmationToast";
import { Skeleton } from "@mui/material";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  FaWeightHanging,
  FaCheckCircle,
  FaFilePdf,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { io } from "socket.io-client";

export default function WeighingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [weighingDetail, setWeighingDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secondWeight, setSecondWeight] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isFetchWeight, setIsFetchWeight] = useState(true);
  const [isFetchRepeat, setIsFetchRepeat] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    setIsLoading(true);
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
        toast.error(
          "Error fetching weighing details: " +
            (error.response?.data?.message || "Network Error")
        );
      } finally {
      }
    };

    fetchWeighingDetail();
    setIsLoading(false);
  }, [id, isFetchRepeat]);

  useEffect(() => {
    if (
      isDataFetched &&
      weighingDetail.second_weight == null &&
      isFetchWeight
    ) {
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

      socket.on("weight_data", (data) => {
        setSecondWeight(data.weight / 1000);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [id, isDataFetched, isFetchWeight]);

  const handleCaptureWeight = () => {
    if (!secondWeight) {
      toast.warn("Data Berat Belum Tersedia");
      return;
    }
    setIsFetchWeight(false);
    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Berat ${secondWeight} Sudah Sesuai?`}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            await axios.put(
              `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}`,
              { second_weight: secondWeight }
            );
            setIsFetchRepeat(true);
            toast.success("Data Berat Sudah Tersimpan");
          } catch (error) {
            toast.error(
              "Gagal Menyimpan Data Berat: " +
                (error.response?.data?.message || "Network Error")
            );
          } finally {
            setIsLoading(false);
          }
          toast.dismiss(toastId);
        }}
        onCancel={() => {
          setIsFetchWeight(true);
          toast.dismiss(toastId);
        }}
      />,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}/pdf`);
    } catch (error) {
      toast.error(
        "Error fetching PDF: " +
          (error.response?.data?.message || "Network Error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Anda Yakin Ingin Menghapus Data Ini?`}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            await axios.delete(
              `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}`
            );
            router.push("/weighing");
            toast.success("Data Berhasil Terhapus");
          } catch (error) {
            toast.error(
              "Gagal Menghapus Data " +
                (error.response?.data?.message || "Network Error")
            );
          } finally {
            setIsLoading(false);
          }
          toast.dismiss(toastId);
        }}
        onCancel={() => toast.dismiss(toastId)}
      />,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  if (!weighingDetail) {
    return (
      <div className="p-6 text-center text-white">Detail tidak ditemukan.</div>
    );
  }

  const formatDateToIndonesian = (timeString) => {
    const date = new Date(timeString);
    const jakartaOffset = 7 * 60 * 60 * 1000;
    const adjustedDate = new Date(date.getTime() - jakartaOffset);

    const optionsDate = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    };
    const optionsTime = {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formattedDate = adjustedDate.toLocaleDateString("id-ID", optionsDate);
    const formattedTime = adjustedDate.toLocaleTimeString("en-US", optionsTime);

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Layout>
      {isLoading && <Skeleton />}
      <div className="p-6 max-w-full mx-auto bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">
          Data Timbangan
        </h1>
        <div className="bg-gray-50 rounded-lg p-6 shadow-lg shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Supir
                </span>
                <span className="flex items-center">
                  {weighingDetail.driver_name}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Supplier
                </span>
                <span className="flex items-center">
                  {weighingDetail.supplier}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Plat Nomor
                </span>
                <span className="flex items-center">
                  {weighingDetail.license_plate}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Catatan
                </span>
                <span className="flex items-center">
                  {weighingDetail.notes}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  {weighingDetail.status === "completed" ? (
                    <FaCheckCircle className="mr-2 text-green-600" />
                  ) : (
                    <FaTimes className="mr-2 text-red-400" />
                  )}
                  Status
                </span>
                <span
                  className={`font-semibold ${
                    weighingDetail.status === "completed"
                      ? "text-green-600"
                      : "text-red-400"
                  }`}
                >
                  {weighingDetail.status === "completed" ? "Selesai" : "Draft"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Berat Penimbangan Pertama
                </span>
                <span className="flex items-center">
                  {weighingDetail.first_weight + " kg"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Waktu Penimbangan Pertama
                </span>
                <span className="flex items-center">
                  {formatDateToIndonesian(weighingDetail.first_weighing_time)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Berat Penimbangan Kedua
                </span>
                <span className="flex items-center">
                  {weighingDetail.second_weight ? (
                    weighingDetail.second_weight + " kg"
                  ) : (
                    <>
                      <span>
                        {secondWeight
                          ? secondWeight + " kg"
                          : "Menunggu data..."}
                      </span>
                      <button
                        onClick={handleCaptureWeight}
                        className="ml-4 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
                      >
                        Simpan
                      </button>
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  Waktu Penimbangan Kedua
                </span>
                <span
                  className={`flex items-center ${
                    weighingDetail.second_weighing_time ? "" : "text-red-400"
                  }`}
                >
                  {weighingDetail.second_weighing_time
                    ? formatDateToIndonesian(
                        weighingDetail.second_weighing_time
                      )
                    : "Penimbangan Kedua Belum Dilakukan"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-lg">
                <span className="font-semibold capitalize flex items-center">
                  <FaWeightHanging className="mr-2 text-indigo-400" />
                  Berat Bersih Sampah
                </span>
                <span
                  className={`flex items-center ${
                    weighingDetail.status === "completed" ? "" : "text-red-400"
                  }`}
                >
                  {weighingDetail.net_weight
                    ? weighingDetail.net_weight + " kg"
                    : "Penimbangan Kedua Belum Dilakukan"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 space-x-2">
            <button
              onClick={
                weighingDetail.second_weight
                  ? handlePrint
                  : (e) => e.preventDefault()
              }
              className={`flex items-center justify-center ml-2 px-6 py-3 text-white rounded-lg transition duration-300 shadow-lg ${
                weighingDetail.second_weight
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-200 hover:bg-blue-300 cursor-not-allowed"
              }`}
            >
              <FaFilePdf className="mr-2" /> Print Nota
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center ml-2 mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
            >
              <FaTrash className="mr-2" /> Hapus
            </button>
            <button
              onClick={() => router.push("/weighing")}
              className="flex items-center justify-center ml-2 mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 shadow-lg"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
