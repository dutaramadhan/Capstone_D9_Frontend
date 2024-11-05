import Layout from "@/components/Layout";
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
    <span className="ml-4 text-white">Loading...</span>
  </div>
);

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
        toast.error(
          "Error fetching weighing details: " +
            (error.response?.data?.message || "Network Error")
        );
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

  const ConfirmationToast = ({ message, onConfirm, onCancel }) => (
    <div className="text-center">
      <p className="mb-4 text-lg font-medium">{message}</p>
      <div className="flex justify-center space-x-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={onConfirm}
        >
          Yakin
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={onCancel}
        >
          Batal
        </button>
      </div>
    </div>
  );

  const handleCaptureWeight = () => {
    if (!secondWeight) {
      toast.warn("Data Berat Belum Tersedia");
      return;
    }

    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Berat ${secondWeight} Sudah Sesuai?`}
        onConfirm={async () => {
          try {
            await axios.put(
              `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}`,
              { second_weight: secondWeight }
            );
            router.push("/weighing");
            toast.success("Data Berat Sudah Tersimpan");
          } catch (error) {
            toast.error(
              "Gagal Menyimpan Data Berat: " +
                (error.response?.data?.message || "Network Error")
            );
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

  const handlePrint = async () => {
    try {
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}/pdf`);
    } catch (error) {
      toast.error(
        "Error fetching PDF: " +
          (error.response?.data?.message || "Network Error")
      );
    }
  };

  const handleDelete = () => {
    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Anda Yakin Ingin Menghapus Data Ini?`}
        onConfirm={async () => {
          try {
            await axios.delete(
              `${process.env.NEXT_PUBLIC_API_URL}/api/weighing/${id}`
            );
            router.push("/weighing");
            toast.success("Data Berat Sudah Terhapus");
          } catch (error) {
            toast.error(
              "Gagal Menghapus Data " +
                (error.response?.data?.message || "Network Error")
            );
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

  if (loading) {
    return <LoadingSpinner />;
  }

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
      <div className="p-6 max-w-full mx-auto bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">
          Data Timbangan
        </h1>
        <div className="bg-gray-700 rounded-lg p-6 shadow-lg shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Supir
                </span>
                <span className="text-gray-200 flex items-center">
                  {weighingDetail.driver_name}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Supplier
                </span>
                <span className="text-gray-200 flex items-center">
                  {weighingDetail.supplier}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Plat Nomor
                </span>
                <span className="text-gray-200 flex items-center">
                  {weighingDetail.license_plate}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Catatan
                </span>
                <span className="text-gray-200 flex items-center">
                  {weighingDetail.notes}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-medium text-gray-300 flex items-center">
                  {weighingDetail.status === "completed" ? (
                    <FaCheckCircle className="mr-2 text-green-400" />
                  ) : (
                    <FaTimes className="mr-2 text-red-400" />
                  )}
                  Status:
                </span>
                <span className="text-gray-200 font-semibold">
                  {weighingDetail.status === "completed" ? "Selesai" : "Draft"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Berat Penimbangan Pertama
                </span>
                <span className="text-gray-200 flex items-center">
                  {weighingDetail.first_weight + " kg"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Waktu Penimbangan Pertama
                </span>
                <span className="text-gray-200 flex items-center">
                  {formatDateToIndonesian(weighingDetail.first_weighing_time)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Berat Penimbangan Kedua
                </span>
                <span className="text-gray-200 flex items-center">
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
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  Waktu Penimbangan Kedua
                </span>
                <span
                  className={`flex items-center ${
                    weighingDetail.second_weighing_time
                      ? "text-gray-200"
                      : "text-red-400"
                  }`}
                >
                  {weighingDetail.second_weighing_time
                    ? formatDateToIndonesian(
                        weighingDetail.second_weighing_time
                      )
                    : "Penimbangan Kedua Belum Dilakukan"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-600 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
                <span className="font-semibold text-gray-300 capitalize flex items-center">
                  <FaWeightHanging className="mr-2 text-indigo-400" />
                  Berat Bersih Sampah
                </span>
                <span
                  className={`flex items-center ${
                    weighingDetail.status === "completed"
                      ? "text-gray-200"
                      : "text-red-400"
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
              onClick={handlePrint}
              className="flex items-center justify-center ml-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg"
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
