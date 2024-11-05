import React from 'react'
import { Line, Bar } from 'react-chartjs-2'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

import Slider from '@mui/material/Slider';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/Chart/ChartCard";

const ReadingsChart = ({ data }) => {

    const [ dateRange, setDateRange ] = React.useState([0, data.dates.length - 1])
    const handleSliderChange = (event, newValue) => setDateRange(newValue)
    const dateString = (date = false) => date ? `${Number(date.slice(0,2))} ${[ 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][Number(date.slice(3, 5))-1]} ${date.slice(6)}` : ''

    return (
        <Card className='px-4 mt-6'>
            <CardHeader>
                <CardTitle>Data Komposisi Sampah Anorganik</CardTitle>
                <p className='text-xs'>{dateString(data.dates[dateRange[0]])} - {dateString(data.dates[dateRange[1]])}</p>
                <Slider
                    value={dateRange}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={data.dates.length - 1}
                    sx={{ width: 300, marginBottom: 3 }}
                />
            </CardHeader>
            <CardContent>

            <div style={{ height: "100%", width: "100%", minHeight: "400px" }}>
                {/* <Line data={chartData} options={options} /> */}
                <div className="overflow-x-auto w-full px-3">
                    <div className="min-w-[800px] min-h-64">
                        <CumulativeBarChart data={data} range={dateRange}  />
                    </div>
                </div>
                <StackedLineChart data={data} range={dateRange}  />
            </div>
            </CardContent>
        </Card>
    )
}
export default ReadingsChart


const CumulativeBarChart = ({ data, range }) => {
    const barChartData = {
        labels: data.categories,
        datasets: [
            {
                label: 'Kumulatif Berat Sampah (Kg)',
                data: data.categories.map(
                    category => data.series[category]
                        .slice(range[0], range[1] + 1)
                        .reduce((acc, curr) => acc + curr, 0)
                ),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    }

    return <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false, scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 90
          },
        },
      }, }} />
}

const StackedLineChart = ({ data, range }) => {

    const lineChartData = {
        labels: data.dates.slice(range[0], range[1] + 1),
        datasets: data.categories.map((category, index) => ({
            label: category,
            data: data.series[category].slice(range[0], range[1] + 1),
            fill: true,
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 60) % 360}, 70%, 50%, 0.5)`,
        })),
    }

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true },
        },
    }

    return <Line data={lineChartData} options={lineChartOptions} />
}