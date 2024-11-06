export default function Row({
  index,
  supplier,
  driver,
  license_plate,
  net_weight,
  weighing_time,
  status,
  row_color,
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
      <tr className={`mb-2 ${row_color}`}>
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
