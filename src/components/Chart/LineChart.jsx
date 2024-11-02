import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/Chart/ChartCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineChart({
  data,
  title,
  valueKey,
  valueLabel,
  valueSuffix = "",
  dateKey = "date",
  color = "rgb(37, 99, 235)",
  className = "",
}) {
  const chartData = {
    labels: data.map((item) => item[dateKey]),
    datasets: [
      {
        label: valueLabel,
        data: data.map((item) => item[valueKey]),
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        pointStyle: "circle",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgb(255, 255, 255)",
        titleColor: "rgb(0, 0, 0)",
        bodyColor: "rgb(0, 0, 0)",
        borderColor: "rgb(229, 231, 235)",
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 13,
          weight: "bold",
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              1
            )}${valueSuffix}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: true,
          dash: [4, 4],
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          padding: 8,
          callback: function (value) {
            return `${value}${valueSuffix}`;
          },
        },
        title: {
          display: true,
          text: `${valueLabel} ${valueSuffix}`,
          padding: 16,
          font: {
            size: 13,
          },
        },
      },
      x: {
        border: {
          display: true,
          dash: [4, 4],
        },
        grid: {
          display: false,
        },
        ticks: {
          padding: 8,
        },
        title: {
          display: true,
          text: "Tanggal",
          padding: 16,
          font: {
            size: 13,
          },
        },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "100%", width: "100%", minHeight: "400px" }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
