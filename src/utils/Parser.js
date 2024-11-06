/**
 * example use:
 * 
 * import Parser from '@/utils/Parser';
 * 
 * const parser = new Parser(annotation)
 * const result = parser.parse()
 * 
 */
export default class Parser
{
    constructor (annotation) {
        this.annotation = annotation

        // preprocess annotation word
        this.words = this.annotation.pages.map(page => (
            page.blocks.map(block => (
                block.paragraphs.map(paragraph => (
                    paragraph.words.map(word => ({
                        text: word.symbols.reduce((wordString, symbol) => (
                            wordString += symbol.text
                        ), ''),
                        boundingBox: word.boundingBox,
                        centroid: this._getCentroid(word.boundingBox)
                    }))
                ))
            ))
        )).flat(3) // what the hell
        this.paragraphs = this.annotation.pages.map(page => (
            page.blocks.map(block => (
                block.paragraphs.map(paragraph => (
                    {
                        text: paragraph.words.map(word => (word.symbols.reduce((wordString, symbol) =>  wordString += symbol.text, '') )).join(' '),
                        boundingBox: paragraph.boundingBox,
                        centroid: this._getCentroid(paragraph.boundingBox)
                    }
                ))
            ))
        )).flat(2) // what the hell
        this.symbols = this.annotation.pages.map(page => (
            page.blocks.map(block => (
                block.paragraphs.map(paragraph => (
                    paragraph.words.map(word => (
                        word.symbols.map(symbol => (
                            {
                                text: symbol.text,
                                boundingBox: symbol.boundingBox,
                                centroid: this._getCentroid(symbol.boundingBox)
                            }
                        ))
                    ))
                ))
            ))
        )).flat(4) // what the hell

        // initial properties
        this.orientation = null

        this.anchors = {}
        this.borders = {}
        this.table = {
            upperHalf: [],
            lowerHalf: []
        }
        // this.columns = []
    }

    parse() {

        // init
        this.getAnchors()
        this.getBorders()
        
        this.determineOrientation()

        // calculate data position
        this.estimateCell()
        this.scanTable()

        // parse the data
        this.parseResult = this.parseScanResult()

        return this.parseResult
    }

    
    /**
     * mengolah this.table menjadi satu objek tabel yang diinginkan
     * format:
     *  {
     *      rawTable: [], // table[row][col]
     *      document: [
     *          {
     *              date: '',
     *              readings: {
     *                  dataName1: {
     *                      value: 1,
     *                      isValid:
     *                  },
     *                  dataname2: {...}
     *                  ...
     *              }
     *          },
     *          { ... }
     *          ...
     *      ]
     *  }
     * 
     */
    parseScanResult() {
        /**
         * init1. definisikan parse int -> return { value isValid }
         * init2. definisikan parse tanggal, gatau ini gmn
         * 
         * 1. ubah cell jadi per kolom (gabungin atas bawah) // jadi deh table
         * 2. yauda parse jadiin dokumen per table
         *      2.a butuh converter indeks ke nama
         * 3. untuk table, ambil aja .value nya semua
         * 
         */

        const letterToNum = { 
            'S': '5', 
            's': '5', 
            'g': '9', 
            'G': '6', 
            'O': '0', 
            'o': '0', 
            'I': '1', 
            'l': '1', 
            'B': '8', 
            'Z': '2',
            'z': '2',
        };
        const evalNumber = cell => {
            const numString = cell.texts.symbols.replace(/[SsGgOoIlBZ]/g, char => letterToNum[char] || char);
            const parsedValue = parseInt(numString, 10)
            
            return !isNaN(parsedValue) && cell.texts.symbols.trim() === parsedValue.toString()
                ? { value: parsedValue, isEmpty: false, isValid: true }
                : { value: cell.texts.symbols, isEmpty: Boolean(cell.texts.symbols), isValid: false }
        }
        const evalDate = cell => {
            const parts = cell.texts.symbols.replace(/\s+/g, '').split('/');
                
            if (parts.length !== 3) {
                return { value: cell.texts.symbols, isValid: false };
            }
        
            const [day, month, year] = parts.map(part => part.padStart(2, '0'));
            const dayInt = parseInt(day, 10);
            const monthInt = parseInt(month, 10);
            const yearInt = parseInt(year, 10);
        
            const isValid =
            parts[0].trim() === dayInt.toString() &&
            parts[1].trim() === monthInt.toString() &&
            parts[2].trim() === yearInt.toString() &&
            dayInt >= 1 && dayInt <= 31 &&
            monthInt >= 1 && monthInt <= 12 &&
            yearInt >= 1900 && yearInt <= 2100

            return isValid
                ? { value: `${dayInt}/${monthInt}/${yearInt}`, isValid: true }
                : { value: cell.texts.symbols, isValid: false }
        }

        const table = []
        const document = []
        for (let col=0; col<this.table.upperHalf.length; col++)
        {
            // satukan upper & lower
            const colCells = [...this.table.upperHalf[col], ...this.table.lowerHalf[col].slice(1)]

            // eval
            colCells[0] = evalDate(colCells[0])
            for (let i=1; i<colCells.length; i++) colCells[i] = evalNumber(colCells[i])
            
            // table
            table.push(colCells)

            // document
            if (!colCells[0].isValid && colCells[0].value.trim() === '') continue
            document[col] = {
                date: colCells[0],
                readings: {}
            }
            Parser.COL_NAME.forEach((colName, index) => {
                // change "" to null in readings
                document[col].readings[colName] = colCells[index+1]
                if (!document[col].readings[colName].isValid) document[col].readings[colName].value = null
            })
            
        }

        // transpose the table
        const transpose = matrix => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))

        return { table: transpose(table), document: document }

    }

    /**
     * membagi tabel jadi 2 segmen dgn menandakan 6 'anchor'
     *  o---o <- topLeft - topRight
     *  |   | 
     *  o---o <- middleLeft - middleRight
     *  |   |
     *  o---o <- bottomLeft - bottomRight
     * 
     * format dari this.anchors
     *  {
     *      "anchorName": {
     *          x: number,
     *          y: number,
     *      },
     *      "anchorName2": {...},
     *      ...
     *  }
     * 
     */
    getAnchors() {

        // [1.] sesuaikan secara horizontal

        // TABEL sudah sesuai dengan NAMA RONGSOK
        let topRight = this._getWord('TABEL').centroid

        // sesuaikan KOMODITAS dengan ALUMUNIUM 
        let middleRight = this._selectPointInLine(
            topRight, 
            this._getWord('KOMODITAS').centroid, 
            755/764
        )

        // sesuaikan INTEGRASI dengan BK
        let bottomRight = this._selectPointInLine(
            middleRight, 
            this._getWord('TERINTEGRASI').centroid,
            755/640
        )

        // [2.] potong garis horizontal

        // untuk tiap pasangan horizontal yg sesuai, ambil titik estimasi
        // dimana centroid kolom hari pertama dan terakhir berada
        const hariPertamaConstant  = 205/875
        const hariTerakhirConstant = 780/875

        // nama rongsok - tabel (atas)
        let topLeft = this._getParagraph('NAMA RONGSOK').centroid
        this.anchors.topLeft = this._selectPointInLine(
            topLeft,
            topRight,
            hariPertamaConstant
        )
        this.anchors.topRight = this._selectPointInLine(
            topLeft,
            topRight,
            hariTerakhirConstant
        )

        // nama rongsok - tabel (atas)
        let middleLeft = this._getParagraph('ALUMUNIUM').centroid
        this.anchors.middleLeft = this._selectPointInLine(
            middleLeft,
            middleRight,
            hariPertamaConstant
        )
        this.anchors.middleRight = this._selectPointInLine(
            middleLeft,
            middleRight,
            hariTerakhirConstant
        )

        // nama rongsok - tabel (atas)
        let bottomLeft = this._getParagraph('BK').centroid
        this.anchors.bottomLeft = this._selectPointInLine(
            bottomLeft,
            bottomRight,
            hariPertamaConstant
        )
        this.anchors.bottomRight = this._selectPointInLine(
            bottomLeft,
            bottomRight,
            hariTerakhirConstant
        )

    }

    
    /**
     *  a----r
     *  |     jika jarak x dari a-r lebih besar 
     *  |     dari jarak y dari a-b, maka normal (portrait)
     *  b     
     *  
     *  disini a->topLeft, r->topRight, b->middleLeft
     *  diambil dari this.anchors
     */
    determineOrientation() {
        const { x: xa, y: ya } = this.anchors.topLeft
        const { x: xr, y: yr } = this.anchors.topRight
        const { x: xb, y: yb } = this.anchors.middleLeft
        
        if (Math.abs(xr-xa) > Math.abs(yr-ya)) // orientation is portrait
            this.orientation = yb > ya ? Parser.Enum.ORIENTATION.PORTRAIT : Parser.Enum.ORIENTATION.PORTRAIT_REVERSED
        else // orientation is landscape
            this.orientation = xa > xb ? Parser.Enum.ORIENTATION.LANDSCAPE : Parser.Enum.ORIENTATION.LANDSCAPE_REVERSED

    }

    /**
     * membagi tabel jadi 7 garis dgn menandakan 6 'anchor'
     *     topCenter -> o---o 
     *                  |   | <- topLeft - topRight
     *  middleCenter -> o---o 
     *                  |   | <- bottomLeft - bottomRight
     *  bottomCenter -> o---o 
     *  
     *  tiap garis dibagi menjadi beberapa titik
     *  horizontal : divC = 5  titik (kolom hari)
     *  vertikal   : divR = 20 titik (baris jenis)
     *  
     *  format dari this.borders
     *  {
     *      "lineName1": [
     *          { x: number, y: number },
     *          { ... },
     *          ...
     *      ],
     *      "lineName2": [...],
     *      ...
     *  }
     * 
     *  untuk horizonal, urutan array dimulai dari kiri-kanan (hari pertama-terakhir)
     *  untuk vertikal, urutan array dimulai dari atas-bawah (jenis pertama-terakhir)
     * 
     */
    getBorders() {

        const COLS_SEGMENT = 5
        const ROWS_SEGMENT = 21

        // center borders
        for (const ends of ['top', 'middle', 'bottom'])
            this.borders[`${ends}Center`] = 
                this._divideLineBy(
                    this.anchors[`${ends}Left`],
                    this.anchors[`${ends}Right`],
                    COLS_SEGMENT
                )

        // side upper borders
        for (const side of ['Left', 'Right'])
            this.borders[`top${side}`] = 
                this._divideLineBy(
                    this.anchors[`top${side}`],
                    this.anchors[`middle${side}`],
                    ROWS_SEGMENT
                )
        
        // side lower borders
        for (const side of ['Left', 'Right'])
            this.borders[`bottom${side}`] = 
                this._divideLineBy(
                    this.anchors[`middle${side}`],
                    this.anchors[`bottom${side}`],
                    ROWS_SEGMENT
                )

    }

    /**
     * estimasi sel. ide: sel tabel adalah 'versi mini' dari tabel dimana
     * nilai scale untuk 'memperkecil' kolom dan barisnya adalah konstanta tertentu.
     *              l1
     *        o------------o                  Sc.l1
     *    l0 /             | l2               o---o
     *      /              |     -->   Sr.l0 /    | Sr.l2
     *     o---------------o                o-----o
     *             l3                        Sc.l3
     *        Table Borders           Cell Borders (estimation)
     * 
     *  step 1. mengubah border menjadi 'translate vector'
     *              T1
     *        p----------->.        
     *                     | T2     
     *                     v       
     *     .<--------------.        
     *             T3              
     * 
     *  step 2. scale 'translate vector' tsb menjadi estimasi sel
     *             Sc.T1      
     *             p-->.      
     *                 | Sr.T2
     *           <----.v      
     *            Sc.T3        
     * 
     *  step 3. problem: cari p dimana apabila poligon digambar dari p, maka
     *                   titik berat/centroid dari poligon tsb adalah c
     *  
     *  let Sc.l1 = t1, Sc.l2 t2. Sc.l3 = t3
     *  maka titik poligon p adalah: [ p, p+t1, p+t1+t2, p+t1+t2+t3 ]
     *  dan centroid c = sum(p, p+t1, p+t1+t2, p+t1+t2+t3) / 4
     *  --> c = (4p + 3t1 + 2t2 + t3) / 4
     *  --> p = c - (3t1 + 2t2 + t3) / 4
     *  p didapatkan
     * 
     *  step 4. hitung poligon dari p, simpan sebagai estimasi border cell
     *  output:
     *  this.table = {
     *      "upperHalf": [
     *          [ 
     *              {
     *                  "centroid": { x: number, y: number },
     *                  "vertices": [
     *                      { x: number, y: number },
     *                      {...},
     *                      ...
     *                  ]
     *              },
     *              { "centroid": {...}, "vertices": [...] },
     *              ...
     *          ], // column 1
     *          [ ... ], // column 2
     *          ...
     *      ]
     *      "lowerHalf": [...] // same format as upperhalf
     *  }
     */
    estimateCell() {
        const sub = (p1, p2) => ({ x: p1.x-p2.x, y: p1.y-p2.y })
        const add = (p1, p2) => ({ x: p1.x+p2.x, y: p1.y+p2.y })
        const mul = (s, p) => ({ x: s*p.x, y: s*p.y })

        const COL_SCALE = 0.24
        const ROW_SCALE = 0.04
        
        const numCols = this.borders.topCenter.length
        const numRows = this.borders.topLeft.length

        this.table = { upperHalf: [], lowerHalf: [] } // reset

        // for upper half of table
        {
            const t1 = mul(COL_SCALE, sub(this.anchors.topRight, this.anchors.topLeft))
            const t2 = mul(ROW_SCALE, sub(this.anchors.middleRight, this.anchors.topRight))
            const t3 = mul(COL_SCALE, sub(this.anchors.middleLeft, this.anchors.middleRight))

            // define - (3t1 + 2t2 + t3) / 4 as bakso
            const bakso = mul(-0.25, add(add(mul(3, t1), mul(2, t2)), t3))

            const getVertices = c => {
                const p = add(c, bakso)
                return [ p, add(p, t1), add(add(p, t1), t2), add(add(add(p, t1), t2), t3) ]
            }

            // iterate through cells
            for (let colIndex=0; colIndex<numCols; colIndex++) {
                this.table.upperHalf.push(
                    this._divideLineBy(
                        this.borders.topCenter[colIndex],
                        this.borders.middleCenter[colIndex],
                        numRows
                    ).map(centroid => ({ centroid, vertices: getVertices(centroid) }))
                )
            }
        }

        // for lower half of table
        {
            const t1 = mul(COL_SCALE, sub(this.anchors.middleRight, this.anchors.middleLeft))
            const t2 = mul(ROW_SCALE, sub(this.anchors.bottomRight, this.anchors.middleRight))
            const t3 = mul(COL_SCALE, sub(this.anchors.bottomLeft, this.anchors.bottomRight))

            // define - (3t1 + 2t2 + t3) / 4 as bakso
            const bakso = mul(-0.25, add(add(mul(3, t1), mul(2, t2)), t3))

            const getVertices = c => {
                const p = add(c, bakso)
                return [ p, add(p, t1), add(add(p, t1), t2), add(add(add(p, t1), t2), t3) ]
            }

            // iterate through cells
            for (let colIndex=0; colIndex<numCols; colIndex++) {
                this.table.lowerHalf.push(
                    this._divideLineBy(
                        this.borders.middleCenter[colIndex],
                        this.borders.bottomCenter[colIndex],
                        numRows
                    ).map(centroid => ({ centroid, vertices: getVertices(centroid) }))
                )
            }
        }

    }

    /**
     * run this._isInsidePolygon() for each estimated cell's vertices 
     * on detected this.symbols
     * 
     * add property "symbols": [{ text, centroid }, {...}, ...] for each cell
     */
    scanTable() {
        const getAllSymbols = vertices => this.symbols.filter(symbol => (
            this._isInsidePolygon(symbol.centroid, vertices)
        ))
        const getAllWords = vertices => this.words.filter(word => (
            this._isInsidePolygon(word.centroid, vertices)
        ))
        const getAllParagraphs = vertices => this.paragraphs.filter(paragraph => (
            this._isInsidePolygon(paragraph.centroid, vertices)
        ))


        const updateCell = cell => {
            // raw
            cell.symbols    = getAllSymbols(cell.vertices)
            cell.words      = getAllWords(cell.vertices)
            cell.paragraphs = getAllParagraphs(cell.vertices)

            // concatenated
            cell.texts = {
                symbols: cell.symbols.reduce((text, symbol) => text + symbol.text, ""),
                words: cell.words.reduce((text, word) => text + word.text, ""),
                paragraphs: cell.paragraphs.reduce((text, paragraph) => text + paragraph.text, ""),
            }

        }


        this.table.upperHalf.forEach(column => column.forEach(updateCell))
        this.table.lowerHalf.forEach(column => column.forEach(updateCell))
    }


    // ================= PRIVATE FUNCTIONS =================
    _getCentroid(boundingBox) {
        const centroid = boundingBox.vertices.reduce((acc, point) => {
            acc.x += point.x ; acc.y += point.y
            return acc
        }, { x: 0, y: 0 })
        centroid.x /= boundingBox.vertices.length
        centroid.y /= boundingBox.vertices.length
        return centroid
    }

    _getWord(string) {
        for (const word of this.words) if (word.text === string) return word
        throw new Error(`${string} word not found in Parser.words`)
    }
    _getSymbol(string) {
        for (const symbol of this.symbols) if (symbol.text === string) return symbol
        throw new Error(`${string} symbol not found in Parser.symbols`)
    }
    _getParagraph(string) {
        for (const paragraph of this.paragraphs) if (paragraph.text === string) return paragraph
        throw new Error(`${string} paragraph not found in Parser.paragraphs`)
    }

    _divideLineBy(p1, p2, number) {
        const points = [];
        const dx = (p2.x - p1.x) / --number;
        const dy = (p2.y - p1.y) / number;
      
        for (let i = 0; i <= number; i++) {
            points.push({
                x: p1.x + dx * i,
                y: p1.y + dy * i
            });
        }
        return points
    }

    _isInsidePolygon(p, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const { x: xi, y: yi } = vertices[i];
            const { x: xj, y: yj } = vertices[j];
            if (
                ((yi > p.y) !== (yj > p.y)) &&
                (p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi)
            ) inside = !inside;
        }
        return inside;
    }
    
    _selectPointInLine(p1, p2, constant) {
        const delta_x = p2.x - p1.x
        const delta_y = p2.y - p1.y
        return {
            x: p1.x + delta_x * constant,
            y: p1.y + delta_y * constant,
        }
    }


    // CONSTANT
    static Enum = {
        ORIENTATION: {
            LANDSCAPE: 'landscape (90deg ccw rotation)',
            PORTRAIT: 'portrait (normal)',
            PORTRAIT_REVERSED: 'portrait (180deg rotation)',
            LANDSCAPE_REVERSED: 'landscape (90deg cw rotation)'
        }
    }

    static COL_NAME = [
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

}