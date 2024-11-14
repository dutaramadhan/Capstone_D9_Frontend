import Layout from "@/components/Layout";
import ConfirmationToast from "@/components/ConfirmationToast";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

export default function AddWeighing() {
  const router = useRouter();
  const [isFetchedData, setIsFetchedData] = useState(true);
  const [firstWeight, setFirstWeight] = useState(0);
  const [driverName, setDriverName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isFetchedData) {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_ESP1_URL}`);

      ws.onopen = () => console.log("Connected to [FIRST] ESP32 WebSocket");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setFirstWeight(data.weight / 1000);
      };
      ws.onclose = () =>
        console.log("Disconnected from [FIRST] ESP32 WebSocket");

      return () => {
        ws.close();
        console.log("WebSocket cleaned up");
      };
    }
  }, [isFetchedData]);

  const handleCaptureWeight = () => {
    if (firstWeight == null) {
      toast.warn("Data Belum Tersedia");
      return;
    }

    setIsFetchedData(false);
    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Berat ${firstWeight} Sudah Sesuai?`}
        secondWeight={firstWeight}
        onConfirm={() => {
          toast.dismiss(toastId);
        }}
        onCancel={() => {
          setIsFetchedData(true);
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

  const handleSubmitWeight = async () => {
    if (!driverName || !supplier || !licensePlate || firstWeight == null) {
      toast.warn("Data Belum Lengkap");
      return;
    }

    const toastId = toast(
      <ConfirmationToast
        message={`Apakah Semua Data Sudah Sesuai?`}
        onConfirm={async () => {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/weighing`,
              {
                license_plate: licensePlate,
                supplier: supplier,
                driver_name: driverName,
                notes: note ? note : "-",
                first_weight: firstWeight,
              }
            );
            router.push("/weighing");
            toast.success("Data Sudah Tersimpan");
          } catch (error) {
            toast.error(
              "Gagal Menyimpan Data: " +
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

  return (
    <Layout>
      <div className="p-6 max-w-full mx-auto bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">
          Data Timbangan
        </h1>
        <div className="bg-gray-50 rounded-lg p-6 shadow-lg shadow-inner">
          <div className="grid grid-cols-1 gap-4 text-gray-800">
            <div className="flex justify-between items-center pl-4 p-2 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
              <span className="font-semibold capitalize flex items-center">
                Supir
              </span>
              <input
                className="ml-8 w-full md:w-[30%] focus:outline-none px-4 py-2 rounded-lg shadow bg-gray-200 placeholder:text-gray-800"
                onChange={(e) => setDriverName(e.target.value)}
                value={driverName}
                placeholder="Masukkan Nama Supir"
              />
            </div>
            <div className="flex justify-between items-center pl-4 p-2 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
              <span className="font-semibold capitalize flex items-center">
                Supplier
              </span>
              <input
                className="ml-8 w-full md:w-[30%] focus:outline-none px-4 py-2 rounded-lg shadow bg-gray-200 placeholder:text-gray-800"
                onChange={(e) => setSupplier(e.target.value)}
                value={supplier}
                placeholder="Masukkan Nama Supplier"
              />
            </div>
            <div className="flex justify-between items-center pl-4 p-2 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
              <span className="font-semibold capitalize flex items-center">
                Plat Nomor
              </span>
              <input
                className="ml-8 w-full md:w-[30%] focus:outline-none px-4 py-2 rounded-lg shadow bg-gray-200 placeholder:text-gray-800"
                onChange={(e) => setLicensePlate(e.target.value)}
                value={licensePlate}
                placeholder="Masukkan Plat Nomor"
              />
            </div>
            <div className="flex justify-between items-center pl-4 p-2 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
              <span className="font-semibold capitalize flex items-center">
                Catatan
              </span>
              <input
                className="ml-8 w-full md:w-[30%] focus:outline-none px-4 py-2 rounded-lg shadow bg-gray-200 placeholder:text-gray-800"
                onChange={(e) => setNote(e.target.value)}
                value={note}
                placeholder="Masukkan Catatan"
              />
            </div>
            <div className="flex justify-between items-center pl-4 p-2 bg-gray-300 rounded-lg shadow-sm transition duration-200 hover:shadow-md">
              <span className="font-semibold capitalize flex items-center">
                Berat Penimbangan Pertama
              </span>
              <span className="text-gray-800">
                {firstWeight.toFixed(3) ?? "Menunggu data..."} kg
                <button
                  onClick={handleCaptureWeight}
                  className="ml-4 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
                >
                  Simpan
                </button>
              </span>
            </div>
          </div>
          <div className="text-center mt-6 space-x-2">
            <button
              onClick={handleSubmitWeight}
              className="flex items-center justify-center ml-2 mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 shadow-lg"
            >
              Simpan
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
