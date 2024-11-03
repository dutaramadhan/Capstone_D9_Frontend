import { useState } from "react";
import WeighingRow from "@/components/Table/WeighingRow";

export default function WeighingTable({ weighings }) {
  const completedWeighings = weighings?.filter(
    (weighing) => weighing.status === "completed"
  );

  return (
    <div className="w-full overflow-x-auto mt-6 sm:mb-0 pb-5">
      <table className="w-full sm:min-w-fit bg-gray-800 text-white">
        <tbody>
          <tr className="border-b">
            <th className="text-center py-2 border-r border-yellow min-w-[5px]">
              No
            </th>
            <th className="border-r cursor-pointer !select-none">
              <div className="flex justify-center items-center gap-2 min-w-[40px]">
                Supplier
              </div>
            </th>
            <th className="border-r">Supir</th>
            <th className="border-r select-none cursor-pointer">
              <div className="flex justify-center items-center gap-2 min-w-[100px]">
                Plat Nomor
              </div>
            </th>
            <th className="border-r select-none cursor-pointer">
              <div className="flex justify-center items-center gap-2 min-w-[80px]">
                Berat Sampah (kg)
              </div>
            </th>
            <th className="border-r select-none cursor-pointer">
              <div className="flex justify-center items-center gap-2 min-w-[200px]">
                Waktu Selesai Penimbangan
              </div>
            </th>
            <th className="border-r select-none cursor-pointer">
              <div className="flex justify-center items-center gap-2 min-w-[40px]">
                Status
              </div>
            </th>
          </tr>
          {completedWeighings?.map((weighing, index) => (
            <WeighingRow
              key={weighing.id}
              index={index}
              supplier={weighing.supplier}
              driver={weighing.driver_name}
              license_plate={weighing.license_plate}
              net_weight={weighing.net_weight}
              weighing_time={weighing.second_weighing_time}
              row_color={index % 2 === 0 ? "bg-gray-700" : "bg-gray-600"}
            />
          ))}
          {completedWeighings && completedWeighings.length === 0 && (
            <tr className="border-b">
              <td className="text-center py-5 border-r" colSpan={5}>
                Belum Ada Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
