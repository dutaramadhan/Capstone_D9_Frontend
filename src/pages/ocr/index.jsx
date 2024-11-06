import { useEffect, useState, useRef } from "react";
import Link from "next/link";

import Parser from "@/utils/Parser";

import Layout from "@/components/Layout";
import CategoryTable from "@/components/Table/CategoryTable";
import { Card } from "@/components/Card";
import Modal from "@/components/Modal";

export default function OCR() {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const FLOW = {
    INITIAL: 0,
    IMAGE_INPUT: 1,
    LOADING_PREPROCESSING: 2,
    IMAGE_PREPROCESSED: 3,
    LOADING_ANNOTATION: 4,
    IMAGE_ANNOTATED: 5,
    LOADING_SEND_DATA: 6,
    SEND_DATA_SUCCESS: 7,
    SEND_DATA_ERROR: 8,
  };

    const [flowState, setFlowState] = useState(FLOW.INITIAL)
    const [parseResult, setParseResult] = useState({
        table: [
            [{ value: null, isValid: false }]
        ],
        document: {}
    })
    const [table, setTable] = useState([])

    const [imagePreview, setImagePreview] = useState(false)
    const imagePreviewRef = useRef(null)

  /**
   * read the input from files and append it to imageRef.current
   * @param {Event} e
   */
  const handleImageInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      imageRef.current.src = URL.createObjectURL(file);
      setFlowState(FLOW.IMAGE_INPUT);
    }
  };

  /**
   * read image from imageRef.current, write result to canvasRef.current
   * flow goes from LOADING_PREPROCESSING to IMAGE_PREPROCESSED
   * update: also write into imagePreviewRef
   */
  const handleImageProcessing = () => {
    setFlowState(FLOW.LOADING_PREPROCESSING);

    if (!imageRef.current || !canvasRef.current || !imagePreviewRef.current)
      return;

    console.log("preprocessing images...");
    const src = cv.imread(imageRef.current);
    const gray = new cv.Mat();
    const enhanced = new cv.Mat();

    // Step 1: Convert to Grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Step 2: Enhance with CLAHE (Contrast Limited Adaptive Histogram Equalization)
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(gray, enhanced);

    // Step 3: Apply Sharpening
    const kernel = cv.Mat.eye(3, 3, cv.CV_32F);
    kernel.data32F[0] = 0;
    kernel.data32F[1] = -1;
    kernel.data32F[2] = 0;
    kernel.data32F[3] = -1;
    kernel.data32F[4] = 5;
    kernel.data32F[5] = -1;
    kernel.data32F[6] = 0;
    kernel.data32F[7] = -1;
    kernel.data32F[8] = 0;

    const sharpened = new cv.Mat();
    cv.filter2D(enhanced, sharpened, cv.CV_8U, kernel);

    // Display the final result
    cv.imshow(canvasRef.current, sharpened);
    cv.imshow(imagePreviewRef.current, sharpened);

    // Free memory
    src.delete();
    gray.delete();
    enhanced.delete();
    kernel.delete();
    sharpened.delete();

    setFlowState(FLOW.IMAGE_PREPROCESSED);
  };

  /**
   * read image from canvasRef.current, send to process.env.NEXT_PUBLIC_OCR_API
   * method: POST, as in <input type="file" name="image" />
   * if succes, flow goes from LOADING_ANNOTATION to IMAGE_ANNOTATED
   * (todo: error handling?)
   * data stored in parseResult state
   */
  const handleOCR = () => {
    if (!canvasRef.current) return;
    setFlowState(FLOW.LOADING_ANNOTATION);

    console.log("annotating images...");
    canvasRef.current.toBlob(async (blob) => {
      // Create a FormData object to hold the canvas image
      const formData = new FormData();
      formData.append("image", blob, "preprocessed.png"); // Set a filename for the blob

      try {
        // Send a POST request to the PHP API
        const response = await fetch(process.env.NEXT_PUBLIC_OCR_API, {
          method: "POST",
          body: formData,
        });

        // Handle the response
        const result = await response.json();
        console.log(result);

                const parser = new Parser(result)
                setParseResult(parser.parse())
                setTable(parser.parseResult.table.map(row => row.slice().map(cell => cell.value === null ? { ...cell, value: '' } : { ...cell })))

        setFlowState(FLOW.IMAGE_ANNOTATED);
      } catch (error) {
        console.error("Error:", error);
      }
    }, "image/png");
  };

    /**
     * convert parseResult.document into 
     * [
     *  {
     *      "tps_id": 1
     *      "date": "YYYY-MM-DD",
     *      "field_1" isValid? value : null,
     *      ...
     *  }
     * ] then send data to NEXT_PUBLIC_PHP_API/readings.php
     * 
     * flowState goes from LOADING_SEND_DATA into SEND_DATA_SUCCESS or SEND_DATA_ERROR
     */
    const handleSendData = async () => {
        setFlowState(FLOW.LOADING_SEND_DATA)

        const fieldNames = ['date', 'plastik_hd', 'plastik_pp', 'putihan', 'ember_warna', 'ember_hitam', 'ps_kaca', 'bodong_kotor', 'bodong_bersih', 'paralon', 'nilex', 'sepatu', 'duplek', 'arsip', 'kardus', 'jadel', 'besi_a', 'besi_b', 'kabin_rosok', 'kaleng', 'alumunium', 'sari', 'tembaga', 'kabel_isi', 'bagur_karung', 'beling_botol', 'botol_abc', 'botol_ot', 'botol_kecap', 'gepengan', 'mika_pc', 'multi_layer', 'pp_sablon', 'pet', 'kaleng_gas', 'kuningan', 'kerasan', 'bok', 'karpet_mantel', 'nium_tipis', 'bk']
        const nRow = table.length
        const nCol = table[0].length
        const isValidDate = dateString => {
            const [day, month, year] = dateString.split('/').map(Number)
            const date = new Date(year, month - 1, day)
            return (
                /^\d{2}\/\d{2}\/\d{4}$/.test(dateString) && 
                date.getDate() === day &&
                date.getMonth() === month - 1 &&
                date.getFullYear() === year
            )
        }

        const requestBody = []
        for (let colIndex = 0; colIndex < nCol; colIndex++) {
            if (isValidDate(table[0][colIndex].value)) {

                const record = { date: table[0][colIndex].value.split('/').reverse().join('-') }
                for (let rowIndex = 1; rowIndex < nRow; rowIndex++) {
             
                    const parsedRow = Number(table[rowIndex][colIndex].value)
                    record[fieldNames[rowIndex]] = parsedRow > 0 ? parsedRow : null 
                    
                }
                requestBody.push(record)
                
            }
            
        }

        console.log(requestBody)
        try {
            console.log('sending...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_PHP_API}/readings.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            const result = await response.json()
            console.log(result) // Log response from PHP (e.g., success message)

      if (result.status === "success") setFlowState(FLOW.SEND_DATA_SUCCESS);
      else throw new Error(result);
    } catch (error) {
      console.error("Error sending data:", error);
      setFlowState(FLOW.SEND_DATA_ERROR);
    }
  };

  return (
    <Layout>
      {/* hidden elements */}
      <img
        ref={imageRef}
        alt="Preview"
        className="hidden"
        onLoad={handleImageProcessing}
      />
      <input
        type="file"
        id="cameraInput"
        accept="image/*"
        capture="environment"
        name="image"
        className="hidden"
        onChange={handleImageInput}
        disabled={flowState >= FLOW.LOADING_ANNOTATION}
      />

            <Card title="Pendataan Komposisi Sampah dengan Kamera">
                <div className={`w-full lg:h-60 flex flex-col lg:flex-row`}>
                    <label htmlFor="cameraInput" className={`lg:w-48 px-8 py-12 shadow rounded-xl block ${flowState < FLOW.LOADING_ANNOTATION ? "bg-gray-800 hover:bg-gray-900" : "bg-gray-500"}`}>
                        <svg width="100%" height="100%" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
                            <path d="M16.8 9.18602C17.5496 7.83679 18.9717 7 20.5152 7H27.4848C29.0283 7 30.4504 7.83679 31.2 9.18602L32.4855 11.5H36.25C39.4256 11.5 42 14.0744 42 17.25V24.0436C39.9794 22.75 37.5773 22 35 22C33.8186 22 32.6739 22.1576 31.586 22.4529C30.5222 19.2834 27.5278 17 24 17C19.5817 17 16 20.5817 16 25C16 28.7945 18.6418 31.972 22.1865 32.7936C22.0639 33.5107 22 34.2479 22 35C22 36.7718 22.3545 38.4608 22.9963 40H11.75C8.57436 40 6 37.4256 6 34.25V17.25C6 14.0744 8.57436 11.5 11.75 11.5H15.5145L16.8 9.18602Z" fill="#FFFFFF" />
                            <path d="M24 19.5C20.9624 19.5 18.5 21.9624 18.5 25C18.5 27.6415 20.3622 29.8481 22.8454 30.3786C24.0153 27.3035 26.3187 24.7871 29.2451 23.34C28.5411 21.1138 26.459 19.5 24 19.5Z" fill="#FFFFFF" />
                            <path d="M35 46C41.0751 46 46 41.0751 46 35C46 28.9249 41.0751 24 35 24C28.9249 24 24 28.9249 24 35C24 41.0751 28.9249 46 35 46ZM35 28C35.5523 28 36 28.4477 36 29V34H41C41.5523 34 42 34.4477 42 35C42 35.5523 41.5523 36 41 36H36V41C36 41.5523 35.5523 42 35 42C34.4477 42 34 41.5523 34 41V36H29C28.4477 36 28 35.5523 28 35C28 34.4477 28.4477 34 29 34H34V29C34 28.4477 34.4477 28 35 28Z" fill="#FFFFFF" />
                        </svg>
                    </label>
                    <div className="text-center flex-1 max-w-full">
                        <p className={flowState === FLOW.LOADING_PREPROCESSING ? 'text-center' : 'hidden'}>
                            Memproses Gambar...
                        </p>
                        <canvas onClick={() => setImagePreview(true)} className={`max-w-full mt-3 lg:mt-0 h-full rounded-xl lg:rounded mx-auto ${flowState >= FLOW.IMAGE_PREPROCESSED ? '' : 'hidden '}`} ref={canvasRef} />
                    </div>
                </div>
                <div>
                    <button 
                        className={`text-white w-full p-2 rounded-xl mt-2 flex items-center justify-center ${flowState === FLOW.LOADING_ANNOTATION ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} ${FLOW.IMAGE_PREPROCESSED <= flowState &&  flowState <= FLOW.LOADING_ANNOTATION ? '' : 'hidden'}`}
                        onClick={handleOCR}
                        disabled={flowState === FLOW.LOADING_ANNOTATION}>
                        <svg className="mr-2" width="25px" height="25px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM11 12C10.4477 12 10 12.4477 10 13V17V21C10 21.5523 10.4477 22 11 22H15H21C21.5523 22 22 21.5523 22 21V17V13C22 12.4477 21.5523 12 21 12H15H11ZM12 16V14H14V16H12ZM16 16V14H20V16H16ZM16 20V18H20V20H16ZM14 18V20H12V18H14Z" fill="#FFFFFF"/>
                        </svg>
                        Deteksi Tabel Pendataan Sampah            
                    </button>
                    {
                        flowState >= FLOW.IMAGE_ANNOTATED
                        ? <button 
                            className={`text-white w-full p-2 rounded-xl mt-2 flex items-center justify-center ${flowState === FLOW.LOADING_ANNOTATION ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} ${FLOW.IMAGE_ANNOTATED <= flowState &&  flowState <= FLOW.LOADING_SEND_DATA ? '' : 'hidden'}`}
                            onClick={handleSendData}
                            disabled={flowState === FLOW.LOADING_ANNOTATION}>
                            <svg className="mr-2" width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Unggah Data Pendataan Sampah             
                        </button>
                        : null
                    }
                </div>
            </Card>
            <Card className={`mt-4 flex flex-col align-center justify-center text-center pt-6 ${flowState >=  FLOW.LOADING_ANNOTATION ? '' : 'hidden'}`}>
                <p className={`${flowState ===  FLOW.LOADING_ANNOTATION ? '' : 'hidden'}`}>
                    Memproses Deteksi Tabel Pendataan Sampah...
                </p>
                {
                    flowState >= FLOW.IMAGE_ANNOTATED
                    ? <CategoryTable table={table} setTable={setTable} />
                    : null
                }
                
                
            </Card>
            <Modal isOpen={flowState > FLOW.LOADING_SEND_DATA}>
                <img 
                    src={`/modal/${flowState===FLOW.SEND_DATA_SUCCESS ? 'like-button-icon.svg' : 'red-x-icon.svg'}`}
                    className='w-3/4 mx-auto' />
                <p className={`text-xl font-bold mt-2 ${flowState===FLOW.SEND_DATA_SUCCESS ? 'text-green-700' : 'text-red-500'}`}>{flowState===FLOW.SEND_DATA_SUCCESS ? 'BERHASIL' : 'GAGAL'} MENGIRIM DATA</p>
                <Link href='/' className='block rounded-xl bg-gray-800 text-white text-lg py-1 mt-5'>Kembali</Link>
            </Modal>


      {/* modal for image previewing */}
      <Modal
        isOpen={imagePreview}
        closeButton={true}
        onClose={() => setImagePreview(false)}
      >
        <canvas
          style={{
            maxHeight: "calc(90vh - 2rem)",
            maxWidth: "calc(90vw - 2rem)",
          }}
          className="object-contain"
          ref={imagePreviewRef}
        ></canvas>
      </Modal>
    </Layout>
  );
}
