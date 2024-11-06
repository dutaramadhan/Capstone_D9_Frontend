function Row({
  index,
  supplier,
  driver,
  license_plate,
  net_weight,
  weighing_time,
  status,
}) {
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
    <>
      <tr
        className={`text-gray-900 mb-2 text-sm lg:text-base bg-gray-50 border p-1`}
      >
        <td className="text-center px-2 border-r">{index + 1}</td>
        <td className="text-center px-2 border-r">{supplier}</td>
        <td className="text-center px-2 border-r">{driver}</td>
        <td className="text-center px-2 border-r">{license_plate}</td>
        <td className="text-center px-2 border-r">
          {net_weight ? net_weight : "-"}
        </td>
        <td className="text-center px-2 border-r">
          {weighing_time ? formatDateToIndonesian(weighing_time) : "-"}
        </td>
        <td className="text-center px-2 border-r">{status}</td>
      </tr>
    </>
  );
}

export default function WeighingTable({ weighings }) {
  return (
    <div className="w-full overflow-x-auto sm:mb-0 pb-5">
      <table className="w-full sm:min-w-fit bg-gray-800 text-white text-sm lg:text-base">
        <tbody>
          <tr className="border-b">
            <th className="text-center py-2 border-r border-yellow min-w-[5px]">
              No
            </th>
            <th className="border-r !select-none">
              <div className="flex justify-center items-center gap-2 min-w-[40px]">
                Supplier
              </div>
            </th>
            <th className="border-r">Supir</th>
            <th className="border-r select-none">
              <div className="flex justify-center items-center gap-2 min-w-[100px]">
                Plat Nomor
              </div>
            </th>
            <th className="border-r select-none">
              <div className="flex justify-center items-center gap-2 min-w-[80px]">
                Berat Sampah (kg)
              </div>
            </th>
            <th className="border-r select-none">
              <div className="flex justify-center items-center gap-2 min-w-[200px]">
                Waktu Selesai Penimbangan
              </div>
            </th>
            <th className="border-r select-none">
              <div className="flex justify-center items-center gap-2 min-w-[40px]">
                Status
              </div>
            </th>
          </tr>
          {weighings?.map((weighing, index) => (
            <Row
              key={weighing.id}
              index={index}
              supplier={weighing.supplier}
              driver={weighing.driver_name}
              license_plate={weighing.license_plate}
              net_weight={weighing.net_weight}
              weighing_time={weighing.second_weighing_time}
              status={weighing.status === "completed" ? "Selesai" : "Draft"}
            />
          ))}
          {weighings && weighings.length === 0 && (
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
