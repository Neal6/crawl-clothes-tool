import { useState } from 'react'
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'

function App() {
  const [stores, setStores] = useState([])
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)

  const handleUploadStore = async (event) => {
    const file = event.target.files[0]
    const data = await file.arrayBuffer()
    /* data is an ArrayBuffer */
    const workbook = XLSX.read(data)
    const sheetData = workbook.Sheets[workbook.SheetNames[0]]
    const dataFromSheet = XLSX.utils.sheet_to_json(sheetData)
    if (dataFromSheet.length > 0) {
      const excelStores = dataFromSheet
        .filter((d) => !!d['Store link'])
        .map((w) => {
          return {
            store: w['Store link']?.toString()?.trim(),
            brand: w['Brand']?.toString()?.trim(),
            des: w['Description']?.toString()?.trim(),
            img: w['Additional Image URL (+)']?.toString()?.trim()
          }
        })
      document.querySelector('.store-file-name').innerHTML = file.name
      setStores(excelStores)
    } else {
      window.electron.ipcRenderer.send('data-upload-invalid')
    }

    // remove value file
    document.getElementById('store').value = null
  }

  const handleUploadPrice = async (event) => {
    const file = event.target.files[0]
    const data = await file.arrayBuffer()
    /* data is an ArrayBuffer */
    const workbook = XLSX.read(data)
    const sheetData = workbook.Sheets[workbook.SheetNames[0]]
    const dataFromSheet = XLSX.utils.sheet_to_json(sheetData)
    if (dataFromSheet.length > 0) {
      const excelPrices = dataFromSheet.map((w) => {
        return {
          stt: w['STT SKU']?.toString()?.trim(),
          price: w['Selling Price']?.toString()?.trim(),
          color: w['Color (+)']?.toString()?.trim(),
          size: w['Clothing Size']?.toString()?.trim(),
          swatchImg: w['Swatch Image URL']?.toString()?.trim()
        }
      })
      document.querySelector('.price-file-name').innerHTML = file.name
      setPrices(excelPrices)
    } else {
      window.electron.ipcRenderer.send('data-upload-invalid')
    }

    // remove value file
    document.getElementById('store').value = null
  }

  const handleCheck = async () => {
    if (stores.length < 1 || prices.length < 1) {
      window.electron.ipcRenderer.send('show-error-form-msg')
      return
    }
    setLoading(true)
    const dataChecked = await window.api.startCheck({
      stores
    })
    setLoading(false)
    if (dataChecked?.status === 400) {
      window.electron.ipcRenderer.send('show-system-error')
      return
    }
    if (dataChecked.fullLimit) {
      window.electron.ipcRenderer.send('show-warning-full-limit')
    }
    if (dataChecked.finalSearchKerword.length === 0) {
      window.electron.ipcRenderer.send('show-warning-no-find')
      return
    }
    const workbook = {
      Sheets: {
        'Keyword Checked': XLSX.utils.json_to_sheet(
          dataChecked.finalSearchKerword.map((item) => {
            return {
              KEYWORD: item.keyword,
              SEARCH: item.search,
              KD: item.kd,
              DA: item.da
            }
          })
        )
      },
      SheetNames: ['Keyword Checked']
    }
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })
    const dataExcel = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    })
    saveAs(dataExcel, `keyword-checked-${formatDate(new Date())}.xlsx`)
  }

  const formatDate = (date) => {
    // Extract day, month, and year components from the Date object
    var day = date.getDate().toString().padStart(2, '0')
    var month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
    var year = date.getFullYear()

    // Construct the formatted date string in "DD/MM/YYYY" format
    var formattedDate = day + '/' + month + '/' + year

    return formattedDate
  }

  return (
    <div className="con tainer">
      <div className="form">
        <p className="title">UPLOAD FILE</p>
        <div>
          <div className="formbold-mb-5 formbold-file-input">
            <input type="file" name="store" id="store" onChange={handleUploadStore} />
            <label htmlFor="store">
              <div>
                <span className="formbold-drop-file"> STORE </span>
                <span className="formbold-or"> OR </span>
                <span className="formbold-browse"> BROWSE </span>
                <p className="file-name store-file-name"></p>
              </div>
            </label>
          </div>
          <div id="line"></div>
          <div className="formbold-mb-5 formbold-file-input">
            <input type="file" name="price" id="price" onChange={handleUploadPrice} />
            <label htmlFor="price">
              <div>
                <span className="formbold-drop-file"> PRICE </span>
                <span className="formbold-or"> OR </span>
                <span className="formbold-browse"> BROWSE </span>
                <p className="file-name price-file-name"></p>
              </div>
            </label>
          </div>
        </div>
        <button className="btn-submit" onClick={handleCheck}>
          START CHECK
        </button>
      </div>
      {loading && (
        <div className="loading">
          <div className="waviy">
            <span>L</span>
            <span>O</span>
            <span>A</span>
            <span>D</span>
            <span>I</span>
            <span>N</span>
            <span>G</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
