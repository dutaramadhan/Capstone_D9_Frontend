import React from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

export function WeighingCard({ weighing, onClick }) {
  const {
    id,
    license_plate,
    supplier,
    driver_name,
    net_weight,
    status,
    first_weighing_time,
  } = weighing;

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

  const cardColor =
    status === "completed" ? "border-green-500" : "border-red-500";
  const Icon = status === "completed" ? FaCheckCircle : FaCircleExclamation;

  return (
    <div
      onClick={() => onClick(id)}
      className={`cursor-pointer p-5 rounded-lg border-l-4 shadow-lg transform transition duration-200 hover:scale-105 bg-white hover:shadow-xl text-black ${cardColor}`}
    >
      <div className="flex items-center mb-3">
        <Icon
          className={`w-6 h-6 mr-2 ${
            status == "completed" ? "text-green-700" : "text-red-700"
          }`}
        />
        <h3 className="text-lg font-semibold">
          {" "}
          Penimbangan Pada: {formatDateToIndonesian(first_weighing_time)}
        </h3>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">
          <span className="font-bold">Plat Nomor:</span> {license_plate}
        </p>
        <p className="text-sm font-medium">
          <span className="font-bold">Supplier:</span> {supplier}
        </p>
        <p className="text-sm font-medium">
          <span className="font-bold">Supir:</span> {driver_name}
        </p>
        <p className="text-sm font-medium">
          <span className="font-bold">Berat Sampah:</span>{" "}
          {net_weight == null ? "Belum Selesai Ditimbang" : net_weight + " kg"}
        </p>
        <p className="text-sm font-medium">
          <span className="font-bold">Status:</span>{" "}
          <span className="capitalize">
            {status == "completed" ? "Selesai" : "Draft"}
          </span>
        </p>
      </div>
    </div>
  );
}
