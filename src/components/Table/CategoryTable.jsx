export default function CategoryTable({ table, setTable, className }) {

    // table and setTable is a state 

    const dates = table[0].slice() // copy
    const data  = table.slice(1).map(row => row.slice()) // copy
    const ROW_NAME = [
        'PLASTIK HD',
        'PLASTIK PP',
        'PUTIHAN',
        'EMBER WARNA',
        'EMBER HITAM',
        'PS KACA',
        'BODONG KOTOR',
        'BODONG BERSIH',
        'PARALON',
        'NILEX',
        'SEPATU',
        'DUPLEK',
        'ARSIP',
        'KARDUS',
        'JADEL',
        'BESI A',
        'BESI B',
        'KABIN/ROSOK',
        'KALENG',
        'ALUMUNIUM',
        'SARI',
        'TEMBAGA',
        'KABEL ISI',
        'BAGUR/KARUNG',
        'BELING BOTOL',
        'BOTOL ABC',
        'BOTOL OT',
        'BOTOL KECAP',
        'GEPENGAN',
        'MIKA PC',
        'MULTI LAYER',
        'PP SABLON',
        'PET',
        'KALENG GAS',
        'KUNINGAN',
        'KERASAN',
        'BOK',
        'KARPET/MANTEL',
        'NIUM TIPIS',
        'BK'
    ]

    const thProps = { className: "border p-1 whitespace-nowrap" }
    const tdProps = { className: "border p-1" }

    const handleChange = event => {
        //i, j, newValue
        const i = Number(event.target.getAttribute('data-row'))
        const j = Number(event.target.getAttribute('data-col'))
        setTable(prevTable =>
            prevTable.map((row, rowIndex) =>
            rowIndex === i
                ? row.map((cell, colIndex) => (colIndex === j ? { ...cell, value: event.target.value } : cell))
                : row.slice()
            )
        )
    }

    return (
        <div className={`w-full overflow-x-auto mt-6 sm:mb-0 pb-5 ${className}`}>
            <table className="w-full sm:min-w-fit">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th {...thProps} rowSpan={2} >Nama Rongsok</th>
                        <th {...thProps} >Hari-1</th>
                        <th {...thProps} >Hari-2</th>
                        <th {...thProps} >Hari-3</th>
                        <th {...thProps} >Hari-4</th>
                        <th {...thProps} >Hari-5</th>
                    </tr>
                    <tr>
                        {   // render tanggal
                            dates.map((dateString, i) => ( 
                                <th {...thProps} key={`date_${i}`}>
                                    <input 
                                        className="bg-gray-800 max-w-24 text-center"
                                        data-row={0}
                                        data-col={i}
                                        key={`0-${i}`}
                                        value={table[0][i].value}
                                        onChange={handleChange}
                                        type="text" />
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody className="bg-gray-50 text-gray-900">
                    {
                        data.map((row, i) => (
                            <tr key={`data_row_${i}`}>
                                <th {...thProps} key={`label_${ROW_NAME[i]}`}>{ROW_NAME[i]}</th>
                                {
                                    row.map((cell, j) => (
                                        <td {...tdProps} key={`data_${i}_${j}`}>
                                            <input 
                                                className="bg-gray-50 max-w-24 text-center"
                                                data-row={i+1}
                                                data-col={j}
                                                key={`${i+1}-${j}`}
                                                value={table[i+1][j].value}
                                                onChange={handleChange}
                                                type="number" />
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}