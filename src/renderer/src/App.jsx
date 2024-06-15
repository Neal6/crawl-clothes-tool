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
    const dataProductsFormat = formatCrawlData(dataChecked.products)
    const workbook = {
      Sheets: {
        'Keyword Checked': XLSX.utils.json_to_sheet(dataProductsFormat)
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
    saveAs(dataExcel, `products-crawl-${formatDate(new Date())}.xlsx`)
  }

  const formatCrawlData = (products) => {
    const newProducts = []
    for (let index = 0; index < products.length; index++) {
      const element = products[index]
      for (let j = 0; j < 84; j++) {
        newProducts.push({
          sku: `${element.wsn}-${element.id}-${formatDate(new Date())}-${j + 1}`,
          'Product Name': `${element.title} T-Shirt Hoodie`,
          'Product ID Type': 'GTIN',
          'Product ID': 'CUSTOM',
          'Selling Price': prices[j].price,
          Brand: element.brand,
          'Shipping Weight (lbs)': '1',
          'Main Image URL': element.imgLink,
          'Site Description': element.des.replace(/{Title}/g, element.title),
          'Jean Style (+)': '',
          'Sock Size': '',
          'Clothing Weight': '',
          'Brand License (+)': '',
          'Weather (+)': '',
          'Season (+)': '',
          'Waist Rise': '',
          'Sweater Style (+)': '',
          'Warranty Text': '',
          'Season Code': '',
          'Is Set': '',
          'Skirt Length Style': '',
          'Bra Style (+)': '',
          'Jacket Style (+)': '',
          'Bra Cup Size': '',
          'Suit Breasting Style': '',
          'Outerwear Coat Jacket and Vest Type': '',
          Measure: '',
          Unit: '',
          'Clothing Top Style (+)': '',
          'Closure Type': '',
          'Pant Leg Cut': '',
          'Clothing Length Style': '',
          'Hosiery Style (+)': '',
          'Shoe Size': '',
          Gender: 'Unisex',
          'Activity (+)': '',
          'Pattern (+)': '',
          'GOTS Certification': '',
          'Jean Finish (+)': '',
          'T-Shirt Type (+)': '',
          'Swimsuit Style': '',
          'Manufacturer Name': '',
          'Count Per Pack': '',
          'Leg Opening Cut': '',
          'Additional Product Attribute Name': '',
          'Additional Product Attribute Value': '',
          'Measure ': '',
          'Unit ': '',
          'Fabric Care Instructions (+)': '',
          'Dress Shirt Size': '',
          MSRP: '',
          'Sock Rise': '',
          'Theme (+)': '',
          'Additional Image URL (+)': element.img,
          'Additional Image URL 1 (+)': '',
          'Additional Image URL 2 (+)': '',
          'Additional Image URL 3 (+)': '',
          'Academic Institution': '',
          'Model Number': '',
          'Measure  ': '',
          'Unit  ': '',
          'Small Parts Warning Code (+)': '',
          'Clothing Fit': '',
          'Upper Body Strap Configuration (+)': '',
          'Sports League (+)': '',
          'Belt Style (+)': '',
          'Waist Style (+)': '',
          'Underpant/Swim Bottom Style': '',
          'Sock Style': '',
          'Clothing Cut (+)': '',
          'Scarf Style (+)': '',
          'Pant Style': '',
          'Number of Pieces': '',
          'Measure   ': '',
          'Unit   ': '',
          'Additional Features (+)': '',
          'Pant Fit (+)': '',
          'Bra Size': '',
          'Season Year': '',
          'Hat Size Measurement': '',
          'Athlete (+)': '',
          'Clothing Style (+)': '',
          'Sleeve Style': '',
          'Shorts Style (+)': '',
          'Accent Color': '',
          'Hat Style (+)': '',
          Sheerness: '',
          'Total Count': '',
          'Jean Wash': '',
          'Underwear Style (+)': '',
          'Age Group (+)': '',
          'Manufacturer Part Number': '',
          'Autographed by': '',
          'Country of Origin - Textiles': 'USA',
          'Warranty URL': '',
          'California Prop 65 Warning Text': '',
          'Occasion (+)': '',
          'Underpants Type': '',
          'Color (+)': prices[j].color,
          'Dress Style': '',
          'Key Features (+)': '',
          'Key Features 1 (+)': '',
          'Key Features 2 (+)': '',
          'Clothing Neck Style': '',
          'Fabric Material Name': 'Gildan 5000 - Heavy Cotton',
          'Fabric Material Percentage': '100',
          'Skirt Style (+)': '',
          'Clothing Size': prices[j].size,
          'Collar Style': '',
          'Measure    ': '',
          'Unit    ': '',
          'Pajama Type': '',
          'Measure     ': '',
          'Unit     ': '',
          'Clothing Size Group': '',
          'Is Maternity': '',
          'Recycled Material': '',
          'Percentage of Recycled Material': '',
          'Color Category (+)': '',
          'Pant Size': '',
          'Panty Size': '',
          'Belt Buckle Style': '',
          'Material (+)': '',
          'Sleeve Length Style': '',
          'Measure      ': '',
          'Unit      ': '',
          'Sports Team (+)': '',
          'Sport (+)': '',
          'Variant Group ID': `${element.wsn}-${element.id}-${formatDate}}`,
          'Variant Attribute Names (+)': 'clothingSize',
          'Variant Attribute Names 1 (+)': 'color',
          'Swatch Variant Attribute': 'color',
          'Swatch Image URL': 'https://pod1102.s3.ap-southeast-2.amazonaws.com/BLACK.jpg',
          'Is Primary Variant': j === 0 ? 'Yes' : 'No',
          'Contained Battery Type': '',
          'Site End Date': '',
          'External Product ID Type': '',
          'External Product ID': '',
          'Restriction Type': '',
          States: '',
          'ZIP Codes': '',
          'Must ship alone?': '',
          'SKU Update': '',
          'PPU Quantity of Units': '',
          'PPU Unit of Measure': '',
          'Multipack Quantity': '',
          'Additional Offer Attribute Name': '',
          'Additional Offer Attribute Value': '',
          'Contains Electronic Component?': '',
          'Ships in Original Packaging': '',
          'Local Delivery Depth (in)': '',
          'Local Delivery Width (in)': '',
          'Local Delivery Height (in)': '',
          'Local Delivery Weight (lbs)': '',
          'Contains Chemical, Aerosol or Pesticide?': '',
          'Fulfillment Lag Time': '1',
          'Product Id Update': '',
          'Site Start Date': ''
        })
      }
    }
    return newProducts
  }

  const formatDate = (date) => {
    // Extract day, month, and year components from the Date object
    var day = date.getDate().toString().padStart(2, '0')
    var month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
    var year = date.getFullYear().toString().slice(-2)

    // Construct the formatted date string in "DD/MM/YY" format
    var formattedDate = day + month + year

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
