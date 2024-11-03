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

    const formattedDate = date.toLocaleDateString("id-ID", optionsDate);
    const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

    return `${formattedDate} ${formattedTime}`;
  };

  const formattedDateTime = formatDateToIndonesian(weighing_time);

  return (
    <>
      <tr className={`mb-2 ${row_color}`}>
        <td className="text-center px-2 border-r">{index + 1}</td>
        <td className="text-center px-2 border-r">{supplier}</td>
        <td className="text-center px-2 border-r">{driver}</td>
        <td className="text-center px-2 border-r">{license_plate}</td>
        <td className="text-center px-2 border-r">{net_weight}</td>
        <td className="text-center px-2 border-r">{formattedDateTime}</td>
        <td className="text-center px-2 border-r">{status}</td>
      </tr>
    </>
  );
}
