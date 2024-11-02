import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'
import firstSheetJson from './sheet_one_json.json'
function App() {
  const [firstLoading, setFirstLoading] = useState(true)
  const [isPassId, setIsPassId] = useState(false)
  const [id, setId] = useState('')
  const [stores, setStores] = useState([])
  const [prices, setPrices] = useState([])
  const [filters, setFilters] = useState([])
  const [pageStart, setPageStart] = useState('')
  const [pageEnd, setPageEnd] = useState('')
  const [loading, setLoading] = useState(false)

  const checkID = async () => {
    const checkId = await window.api.checkId()
    if (checkId) {
      setId(checkId)
      setIsPassId(false)
    } else {
      setIsPassId(true)
    }
    setFirstLoading(false)
  }

  useEffect(() => {
    checkID()
  }, [])

  const handleUploadData = async (event) => {
    const file = event.target.files[0]
    const data = await file.arrayBuffer()
    /* data is an ArrayBuffer */
    const workbook = XLSX.read(data)
    const storeSheet = workbook.Sheets[workbook.SheetNames[0]]
    const priceSheet = workbook.Sheets[workbook.SheetNames[1]]
    const filterSheet = workbook.Sheets[workbook.SheetNames[2]]
    const storeFromSheet = XLSX.utils.sheet_to_json(storeSheet)
    const priceFromSheet = XLSX.utils.sheet_to_json(priceSheet)
    if (storeFromSheet.length > 0) {
      const filterFromSheet = XLSX.utils.sheet_to_json(filterSheet)
      const excelStores = storeFromSheet
        .filter((d) => !!d['Store link'])
        .map((w) => {
          return {
            store: w['Store link']?.toString()?.trim(),
            brand: w['Brand']?.toString()?.trim(),
            des: w['Description']?.toString()?.trim(),
            img: w['Additional Image URL (+)']?.toString()?.trim()
          }
        })
      let arrET = []
      let arrRE = []
      let arrTE = []
      let arrAM = []
      excelStores.forEach((s) => {
        if (s.store.includes('https://www.etsy.com')) {
          return arrET.push(s)
        } else if (s.store.includes('https://www.redbubble.com')) {
          return arrRE.push(s)
        } else if (s.store.includes('https://www.teepublic.com')) {
          return arrTE.push(s)
        } else if (s.store.includes('https://www.amazon.com')) {
          return arrAM.push(s)
        }
      })
      let newStore = [...arrET, ...arrRE, ...arrTE, ...arrAM]
      const excelPrices = priceFromSheet.map((w) => {
        return {
          stt: w['STT SKU']?.toString()?.trim(),
          price: w['Selling Price']?.toString()?.trim(),
          color: w['Color (+)']?.toString()?.trim(),
          size: w['Clothing Size']?.toString()?.trim(),
          swatchImg: w['Swatch Image URL']?.toString()?.trim(),
          addImg: w['Additional Image URL (+)']?.toString()?.trim(),
          sku2: w['SKU 2']?.toString()?.trim()
        }
      })
      const excelFilters = filterFromSheet.map((w) => w['Filter']?.toString()?.trim())
      setStores(newStore)
      setPrices(excelPrices)
      setFilters(excelFilters)
      document.querySelector('.store-file-name').innerHTML = file.name
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
      stores,
      pageStart,
      pageEnd
    })
    dataChecked.products.forEach((p) => {
      downloadFile(p)
    })
  }

  const downloadFile = (products) => {
    const dataProductsFormat = products
      .filter((p) => !!p.imgLink)
      .filter((p) => {
        if (filters.find((f) => !!p.title.match(new RegExp(f, 'gi')))) {
          return false
        }
        return true
      })
    console.log(dataProductsFormat)
    let wb = XLSX.utils.book_new()

    // Create a new worksheet
    let worksheet_data = [
      ['Version=4.8,marketplace,clothing_other,en,external,Clothing'],
      [
        '',
        '',
        '',
        'SKU',
        'Required to sell on Walmart.com',
        '',
        '',
        '',
        '',
        '',
        'Required for the item to be visible on Walmart.com',
        '',
        'Recommended to improve search and browse on Walmart.com',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Recommended to create a variant experience on Walmart.com',
        '',
        '',
        '',
        '',
        '',
        'Optional',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ],
      [
        '',
        '',
        '',
        '',
        '',
        'Product Identifiers (productIdentifiers)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Chest Size (chestSize)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Additional Product Attributes (additionalProductAttributes) (+)',
        '',
        'Skirt Length (skirtLength)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Sleeve Length (sleeveLength)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Neck Size (neckSize)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Fabric Content (fabricContent) (+)',
        '',
        '',
        '',
        '',
        'Bra Band Size (braBandSize)',
        '',
        '',
        'Inseam (inseam)',
        '',
        '',
        '',
        'Recycled Material Content (recycledMaterialContent) (+)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Waist Size (waistSize)',
        '',
        '',
        '',
        '',
        '',
        '',
        'Swatch Images (swatchImages) (+)',
        '',
        '',
        '',
        '',
        'External Product Identifier (externalProductIdentifier) (+)',
        '',
        'Sale Restrictions (stateRestrictions) (+)',
        '',
        '',
        '',
        '',
        'Price Per Unit (pricePerUnit)',
        '',
        '',
        'Additional Offer Attributes (additionalOfferAttributes) (+)',
        '',
        '',
        '',
        'Local Delivery Dimensions (localDeliveryDimensions)',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ],
      [
        '',
        '',
        '',
        '',
        'Product Name',
        'Product ID Type',
        'Product ID',
        'Selling Price',
        'Brand',
        'Shipping Weight (lbs)',
        'Main Image URL',
        'Site Description',
        'Jean Style (+)',
        'Sock Size',
        'Character (+)',
        'Clothing Weight',
        'Brand License (+)',
        'Weather (+)',
        'Season (+)',
        'Waist Rise',
        'Sweater Style (+)',
        'Warranty Text',
        'Season Code',
        'Is Set',
        'Skirt Length Style',
        'Bra Style (+)',
        'Jacket Style (+)',
        'Bra Cup Size',
        'Suit Breasting Style',
        'Outerwear Coat Jacket and Vest Type',
        'Measure',
        'Unit',
        'Clothing Top Style (+)',
        'Closure Type',
        'Pant Leg Cut',
        'Clothing Length Style',
        'Hosiery Style (+)',
        'Shoe Size',
        'Gender',
        'Activity (+)',
        'Pattern (+)',
        'GOTS Certification',
        'Jean Finish (+)',
        'T-Shirt Type (+)',
        'Swimsuit Style',
        'Manufacturer Name',
        'Count Per Pack',
        'Leg Opening Cut',
        'Additional Product Attribute Name',
        'Additional Product Attribute Value',
        'Measure',
        'Unit',
        'Fabric Care Instructions (+)',
        'Dress Shirt Size',
        'MSRP',
        'Sock Rise',
        'Theme (+)',
        'Additional Image URL (+)',
        'Additional Image URL 1 (+)',
        'Additional Image URL 2 (+)',
        'Additional Image URL 3 (+)',
        'Academic Institution',
        'Model Number',
        'Measure',
        'Unit',
        'Small Parts Warning Code (+)',
        'Clothing Fit',
        'Upper Body Strap Configuration (+)',
        'Sports League (+)',
        'Belt Style (+)',
        'Waist Style (+)',
        'Underpant/Swim Bottom Style',
        'Sock Style',
        'Clothing Cut (+)',
        'Scarf Style (+)',
        'Pant Style',
        'Number of Pieces',
        'Measure',
        'Unit',
        'Additional Features (+)',
        'Pant Fit (+)',
        'Bra Size',
        'Season Year',
        'Hat Size Measurement',
        'Athlete (+)',
        'Clothing Style (+)',
        'Sleeve Style',
        'Shorts Style (+)',
        'Accent Color',
        'Hat Style (+)',
        'Sheerness',
        'Total Count',
        'Jean Wash',
        'Underwear Style (+)',
        'Age Group (+)',
        'Manufacturer Part Number',
        'Autographed by',
        'Country of Origin - Textiles',
        'Warranty URL',
        'California Prop 65 Warning Text',
        'Occasion (+)',
        'Underpants Type',
        'Color (+)',
        'Dress Style',
        'Key Features (+)',
        'Key Features 1 (+)',
        'Key Features 2 (+)',
        'Clothing Neck Style',
        'Fabric Material Name',
        'Fabric Material Percentage',
        'Skirt Style (+)',
        'Clothing Size',
        'Collar Style',
        'Measure',
        'Unit',
        'Pajama Type',
        'Measure',
        'Unit',
        'Clothing Size Group',
        'Is Maternity',
        'Recycled Material',
        'Percentage of Recycled Material',
        'Color Category (+)',
        'Pant Size',
        'Panty Size',
        'Belt Buckle Style',
        'Material (+)',
        'Sleeve Length Style',
        'Measure',
        'Unit',
        'Sports Team (+)',
        'Sport (+)',
        'Variant Group ID',
        'Variant Attribute Names (+)',
        'Variant Attribute Names 1 (+)',
        'Swatch Variant Attribute',
        'Swatch Image URL',
        'Is Primary Variant',
        'Contained Battery Type',
        'Site End Date',
        'External Product ID Type',
        'External Product ID',
        'Restriction Type',
        'States',
        'ZIP Codes',
        'Must ship alone?',
        'SKU Update',
        'PPU Quantity of Units',
        'PPU Unit of Measure',
        'Multipack Quantity',
        'Additional Offer Attribute Name',
        'Additional Offer Attribute Value',
        'Contains Electronic Component?',
        'Ships in Original Packaging',
        'Local Delivery Depth (in)',
        'Local Delivery Width (in)',
        'Local Delivery Height (in)',
        'Local Delivery Weight (lbs)',
        'Contains Chemical, Aerosol or Pesticide?',
        'Fulfillment Lag Time',
        'Product Id Update',
        'Site Start Date'
      ],
      [
        '',
        '',
        '',
        'sku',
        'productName',
        'productIdType',
        'productId',
        'price',
        'brand',
        'ShippingWeight',
        'mainImageUrl',
        'shortDescription',
        'jeanStyle',
        'sockSize',
        'character',
        'clothingWeight',
        'globalBrandLicense',
        'weather',
        'season',
        'pantRise',
        'sweaterStyle',
        'warrantyText',
        'seasonCode',
        'isSet',
        'skirtLengthStyle',
        'braStyle',
        'jacketStyle',
        'braCupSize',
        'suitBreastingStyle',
        'outerwearCoatJacketAnVestType',
        'measure',
        'unit',
        'clothingTopStyle',
        'fastenerType',
        'pantLegCut',
        'clothingLengthStyle',
        'hosieryStyle',
        'shoeSize',
        'gender',
        'activity',
        'pattern',
        'gotsCertification',
        'jeanFinish',
        'tShirtType',
        'swimsuitStyle',
        'manufacturer',
        'countPerPack',
        'legOpeningCut',
        'productAttributeName',
        'productAttributeValue',
        'measure',
        'unit',
        'fabricCareInstructions',
        'dressShirtSize',
        'msrp',
        'sockRise',
        'theme',
        'productSecondaryImageURL',
        'productSecondaryImageURL',
        'productSecondaryImageURL',
        'productSecondaryImageURL',
        'academicInstitution',
        'modelNumber',
        'measure',
        'unit',
        'smallPartsWarnings',
        'clothingFit',
        'upperBodyStrapConfiguration',
        'sportsLeague',
        'beltStyle',
        'waistStyle',
        'pantyStyle',
        'sockStyle',
        'clothingCut',
        'scarfStyle',
        'pantStyle',
        'pieceCount',
        'measure',
        'unit',
        'features',
        'pantFit',
        'braSize',
        'seasonYear',
        'hatSize',
        'athlete',
        'clothingStyle',
        'sleeveStyle',
        'shortsStyle',
        'accentColor',
        'hatStyle',
        'tightsSheerness',
        'count',
        'jeanWash',
        'underwearStyle',
        'ageGroup',
        'manufacturerPartNumber',
        'autographedBy',
        'countryOfOriginTextiles',
        'warrantyURL',
        'prop65WarningText',
        'occasion',
        'underpantsType',
        'color',
        'dressStyle',
        'keyFeatures',
        'keyFeatures',
        'keyFeatures',
        'shirtNeckStyle',
        'materialName',
        'materialPercentage',
        'skirtAndDressCut',
        'clothingSize',
        'collarType',
        'measure',
        'unit',
        'pajamaType',
        'measure',
        'unit',
        'clothingSizeGroup',
        'isMaternity',
        'recycledMaterial',
        'percentageOfRecycledMaterial',
        'colorCategory',
        'pantSize',
        'pantySize',
        'beltBuckleStyle',
        'material',
        'sleeveLengthStyle',
        'measure',
        'unit',
        'sportsTeam',
        'sport',
        'variantGroupId',
        'variantAttributeNames',
        'variantAttributeNames',
        'swatchVariantAttribute',
        'swatchImageUrl',
        'isPrimaryVariant',
        'batteryTechnologyType',
        'endDate',
        'externalProductIdType',
        'externalProductId',
        'stateRestrictionsText',
        'states',
        'zipCodes',
        'MustShipAlone',
        'SkuUpdate',
        'pricePerUnitQuantity',
        'pricePerUnitUom',
        'multipackQuantity',
        'additionalOfferAttributeName',
        'additionalOfferAttributeValue',
        'electronicsIndicator',
        'shipsInOriginalPackaging',
        'pickupAndLocalDeliveryDepth',
        'pickupAndLocalDeliveryWidth',
        'pickupAndLocalDeliveryHeight',
        'pickupAndLocalDeliveryWeight',
        'chemicalAerosolPesticide',
        'fulfillmentLagTime',
        'ProductIdUpdate',
        'startDate'
      ],
      [
        '',
        '',
        '',
        `Alphanumeric, 50 characters - The string of letters and/or numbers a partner uses to identify the item. Walmart includes this value in all communications regarding item information such as orders. Example: TRVAL28726`,
        `Alphanumeric, 200 characters - Title of the product to be displayed on the Item Page. The standard form is: Brand + Defining Qualities + Item Name + Pack Count, if applicable. Example: George Girls' Short-Sleeve Polo`,
        `Closed List - UPC: GTIN-12, the 12-digit number including check-digit. If less than 12-digits, such as UPC-E which is 8-digits, add leading zeros up to 12-digits.; GTIN: GTIN-14, the 14-digit number including check-digit. If less than 14-digits add leading zeros up to 14-digits. ISBN: International Standard Book Number, the 10 or 13-digit number including check-digit.; EAN: GTIN-13, the 13-digit number including check-digit. If less than 13-digits add leading zeros up to 13-digits.`,
        `Alphanumeric, 14 characters - Provide the GTIN that identifies the product's consumable (selling) unit. Expand the GTIN to 14 digits by adding preceding zeroes and check digit. A GTIN (Global Trade Item Number) is used to identify an item at any point in the Supply Chain. A GTIN refers to the data structure (not symbology) used to identify the scannable item, case, inner pack (i.e., break pack) or pallet that make up the hierarchy. Example: 00123456781011`,
        `Decimal, 9 characters - The price the customer pays for the product. Please do not use commas or currency symbols. Only 2 digits allowed after decimal point. Example: 100.33`,
        `Alphanumeric, 60 characters - Name, term, design or other feature that distinguishes one seller's product from those of others. This can be the name of the company associated with the product, but not always. If item does not have a brand, use"Unbranded". Example: M&Ms`,
        `Decimal, 9 characters - The weight (in pounds) including all of its packaging materials. Only 3 digits maximum allowed after decimal point. Example: 5.255`,
        `"URL, 2000 characters - Main image of the item. File Format: JPEG (.jpg). Recommended Pixel Dimensions: 2200px x 2200px. Minimum Pixel Dimensions for Zoom 1500px x 1500px. Swatch Pixel Dimensions: 50px x 50px. Resolution: 300 ppi. Maximum file size: 5MB. Aspect Ratio: 1:1 (Square). Recommended File Naming: GTIN-14 digit
Image URLs should end in an image file type (.jpg) to follow best practices. They must link to a public image file that loads as an image"`,
        `Alphanumeric, 4000 characters - Overview of the key selling points of the item, marketing content, and highlights in paragraph form. For SEO purposes, repeat the product name and relevant keywords here. Example: The George - Girls' Short Sleeve Polo Shirt will make a great addition to your daughter's uniform wardrobe. This short-sleeved girls' shirt has a flat knit collar and cuff for a comfortable fit. Plus, it's tagless, so your daughter's skin won't be irritated by a scratchy tag. This girls' short sleeve polo is made from a cotton blend, and treated with Scotchgard for stain protection. It has a two-button placket, an extended back hem and vents on each side hem. The girls' polo shirt is machine washable and very easy to maintain.`,
        `Alphanumeric, 400 characters - Style terms specific to jeans. Example: Boyfriend`,
        `Alphanumeric, 100 characters - Sock size. Generic sized (small/med/large) socks may not have this information (generic s/m/l size information should be entered under the clothing size attribute). Example: 7-9; 9-11`,
        `Alphanumeric, 400 characters - A person or entity portrayed in print or visual media. A character might be a fictional personality or an actual living person. Example: Dora the Explorer; SpongeBob SquarePants`,
        `Closed List - Commonly used in retail clothing, these terms describe the density or weight of fabric material.`,
        `Alphanumeric, 4000 characters - A brand name that is not owned by the product brand, but is licensed for the particular product. (Often character and media tie-ins and promotions.) Example: Disney, Marvel, LEGO`,
        `Alphanumeric, 400 characters - The type of weather the clothing or fashion accessory was designed for. Example: Snow; Sun; Wind; Rain; Fog; All-Weather`,
        `Alphanumeric, 200 characters - If designed to be used during a specific type of year, the appropriate season this item may be used. Example: Spring; Summer; Fall; Winter; All-Season`,
        `Alphanumeric, 100 characters - The height at which the waistline rests on the body. Example: High; Low; Mid; Ultra-Low`,
        `Alphanumeric, 400 characters - Styles specific to sweaters. Example: Cardigan; Pullover; Twin Set`,
        `Alphanumeric, 20000 characters - The full text of the warranty terms, including what is covered by the warranty and the duration of the warranty. Example: This warranty covers any defects in materials or workmanship, including installation, with the exceptions of fading or discoloration caused by exposure to sunlight or chemicals. This warranty runs for five years from the date your carpet is installed. Counterpoint will either replace your carpet with new carpet of similar composition and price, or refund the full purchase price of your carpet, whichever you prefer. Contact Counterpoint at 800-867-5309... [continued].`,
        `Closed List - Enter the Code for the apparel season: 0- Basic; 1- Spring; 2- Summer; 3- BTS/Fall; 4- Winter`,
        `Closed List - Indicates that the product consists of two or more different items sold together as a set. Example: A bedding set that includes sheets, pillow shams, and a comforter.`,
        `Alphanumeric, 400 characters - Descriptive terms for length specific to skirts and dresses. Example: Long; Mid-Length; Cocktail-Length; Mini; Tea-Length; Maxi`,
        `Alphanumeric, 300 characters - Brassiere styles/defining features. Enter as many as are relevant to the bra. Do not enter strap styles here. To enter descriptive terms for strap styles, please use the "Upper Body Strap Configuration" attribute. Example: Convertible; Push-Up; Bandeau; Demi Cup; Nursing; Full Coverage; Full-Figure; Sport Bra; Underwire; Wire-Free; Lightly Lined; T-Shirt; Minimizer`,
        `Alphanumeric, 400 characters - Styles specific to coats and jackets. Example: Bomber; Motorcycle; Parka; Sport; Smoking; Suit; Trenchcoat;`,
        `Alphanumeric, 200 characters - A letter size to optimize bra fit, calculated by measuring the chest at its widest point and subtracting the bra band size. 1 inch corresponds to 1 cup letter (e.g. if the difference is 5, the bra cup size is DD or E). Use this to record separate cup sizes for search discovery. Example: AA; A; B; C; D; DD`,
        `Closed List - The closure style of a suit jacket or coat; Double-Breasted suits have more fabric where they overlap in front and commonly have 2 rows of buttons.`,
        `Alphanumeric, 1000 characters - Describes the type of outerwear, coat, jacket or vest. Example: Rain Coat`,
        `Decimal, 9 characters - Chest measurement in inches, around the largest part of the chest. Often used for men's jackets and women's full slips. Example: 34`,
        `Closed List - Chest measurement in inches, around the largest part of the chest. Often used for men's jackets and women's full slips.`,
        `Alphanumeric, 400 characters - Style terms descriptive of clothing tops. Example: Bandeau, Camisole, Chemise, Cover-Up, Crop, Dolman, Halter, Henley, Hoodie, One-Piece, Peplum, Pullover, Tank, Torsette, Triangle, Tube`,
        `Alphanumeric, 200 characters - The type of fastener used to keep a garment closed on the wearer and to facilitate putting on the garment. Example: Snap; Magnetic; Turn Lock; Tuck Lock`,
        `Closed List - Common style terms describing how the garment leg has been cut to make a specific sillhoutte/shape.`,
        `Alphanumeric, 400 characters - Descriptive terms for where on the lower-body a garment ends. Example: Ankle-Length; Below The Knee; Cropped; Extra long; Full-Length; Knee-Length; Mid-Length; Short`,
        `Alphanumeric, 400 characters - Styles/features specific to tights and hosiery. Example: Back Seam; Built-In Sock; Control Top; Footless; Pantyhose; Shaper; Shimmer`,
        `Alphanumeric, 200 characters - The alphanumeric representation of the size of the shoe, as issued by the manufacturer. Example: 5; 5.5; 6; 6.5; 7; US 7.5; UK 42;`,
        `Closed List - Indicate whether this item is meant for a particular gender or meant to be gender-agnostic (unisex).`,
        `Alphanumeric, 600 characters - The general type of activity one might perform while wearing this garment. Example: Pilates`,
        `Alphanumeric, 400 characters - Decorative design or visual ornamentation, often with a thematic, recurring motif. Example: Mosaic; Geometric; Sun; Baby`,
        `Closed List - Indicates if the product is certified under requirements of the Global Organic Textile Standard.`,
        `Alphanumeric, 400 characters - Fabric finishes specific to jeans. Example: Coated; Colored; Distressed; Wrinkle; Gummy; Ripped`,
        `Alphanumeric, 1000 characters - Describes the T-Shirt type. Example: V neck`,
        `Alphanumeric, 400 characters - Descriptive styles common to swimwear. Style terms specific to the bottom half of swimwear appear under the Underpant/Swim Bottom Style attribute. Example: Board Shorts; Cover-ups; Mix & Match Separates; One-pieces; Swim Dress; Slimming; Two-piece Sets; Bikinis; Tankinis`,
        `Alphanumeric, 60 characters - The name of the manufacturer. Example: Procter & Gamble; Apple; Sony; General Motors; Yamaha`,
        `Number, 9 characters - The number of identical items inside each individual package. Example: 3`,
        `Closed List - How high on the body the leg opening sits. Commonly referenced for leotards, swimwear, underwear or other legless garments.`,
        `Alphanumeric, 100 characters - Add an additional attribute not present in this template. Use camelCase for the name. Example: additionalAttributeName`,
        `Alphanumeric, 4000 characters - Write your "Additional Product Attribute Value" to give a description or answer for your "Additional Product Attribute Name." Together, these allow you to create your own descriptor that is not already in the taxonomy. Example: 15"; 19mm; Yes; No`,
        `Decimal, 9 characters - The measurement of the skirt from waist to bottom hem. Example: 50`,
        `Closed List - The measurement of the skirt from waist to bottom hem.`,
        `Alphanumeric, 4000 characters - Describes how the fabric should be cleaned. Enter details of the fabric care label found on the item. (For garments, typically located inside on the top of the back or the lower left side.) Example: Dry Clean Only; Machine Washable; Hand Wash`,
        `Alphanumeric, 400 characters - A grouping of sizes for dress shirts based on collar measurement and sleeve measurement. Example: 14-14.5 (32/33);17-17.5 (36/37)`,
        `Decimal, 8 characters - Manufacturer's suggested retail price. This is not the price that Walmart customers will pay for your product. You can use up to 8 digits before the decimal place. Do not use commas or dollar signs. Example: 19.95`,
        `Closed List - Descriptive terms for sock height.`,
        `Alphanumeric, 800 characters - A dominant idea, meaning, or setting applied to an item. Example: Science; Nature; Animals; TV & Movies; Fashion; Transportation`,
        `"URL, 2000 characters - Secondary images of the item. File Format: JPEG (.jpg). Recommended Pixel Dimensions: 2200px x 2200px. Minimum Pixel Dimensions for Zoom 1500px x 1500px. Swatch Pixel Dimensions: 50px x 50px. Resolution: 300 ppi. Maximum file size: 5MB. Aspect Ratio: 1:1 (Square). Recommended File Naming: GTIN-14 digit
Image URLs should end in an image file type (.jpg) to follow best practices. They must link to a public image file that loads as an image"`,
        `"URL, 2000 characters - Secondary images of the item. File Format: JPEG (.jpg). Recommended Pixel Dimensions: 2200px x 2200px. Minimum Pixel Dimensions for Zoom 1500px x 1500px. Swatch Pixel Dimensions: 50px x 50px. Resolution: 300 ppi. Maximum file size: 5MB. Aspect Ratio: 1:1 (Square). Recommended File Naming: GTIN-14 digit
Image URLs should end in an image file type (.jpg) to follow best practices. They must link to a public image file that loads as an image"`,
        `"URL, 2000 characters - Secondary images of the item. File Format: JPEG (.jpg). Recommended Pixel Dimensions: 2200px x 2200px. Minimum Pixel Dimensions for Zoom 1500px x 1500px. Swatch Pixel Dimensions: 50px x 50px. Resolution: 300 ppi. Maximum file size: 5MB. Aspect Ratio: 1:1 (Square). Recommended File Naming: GTIN-14 digit
Image URLs should end in an image file type (.jpg) to follow best practices. They must link to a public image file that loads as an image"`,
        `"URL, 2000 characters - Secondary images of the item. File Format: JPEG (.jpg). Recommended Pixel Dimensions: 2200px x 2200px. Minimum Pixel Dimensions for Zoom 1500px x 1500px. Swatch Pixel Dimensions: 50px x 50px. Resolution: 300 ppi. Maximum file size: 5MB. Aspect Ratio: 1:1 (Square). Recommended File Naming: GTIN-14 digit
Image URLs should end in an image file type (.jpg) to follow best practices. They must link to a public image file that loads as an image"`,
        `Alphanumeric, 100 characters - Name of College or other school. This is to distinguish the school from its sports team. Example: Stanford University; California State University, Berkeley; MIT;`,
        `Alphanumeric, 60 characters - Model numbers allow manufacturers to keep track of each hardware device and identify or replace the proper part when needed. Model numbers are often found on the bottom, back, or side of a product. Having this information allows customers to search for items on the site and informs product matching. Example: G62-465DX; MFP00112BBQN`,
        `Decimal, 9 characters - The distance from the shoulder to the bottom hem of the sleeve, measured in inches. Example: 34`,
        `Closed List - The distance from the shoulder to the bottom hem of the sleeve, measured in inches.`,
        `Closed List - To determine if any choking warnings are applicable, check current product packaging for choking warning message(s). Please indicate the warning number (0-6). 0- No warning applicable; 1- Choking hazard is a small ball; 2- Choking hazard contains small ball; 3- Choking hazard contains small parts; 4- Choking hazard balloon; 5- Choking hazard is a marble; 6- Choking hazard contains a marble.`,
        `Alphanumeric, 400 characters - Terms that describe the way a garment will fit when worn. Does not include fit values specific to pants. Example: Active Fit; Big & Tall; Shrink-to-Fit; Slim; Tight; Relaxed Fit; Loose; Maternity Fit; Modern Fit`,
        `Alphanumeric, 400 characters - Strap configuration style for bras, swimsuit tops, leotards and other clothing tops. Example: Cross-Back; Halter; Racerback; Strapless; Regular`,
        `Alphanumeric, 100 characters - If your item has any association with a specific sports league, enter the league name. Abbreviations are fine. NOTE: This attribute flags an item for inclusion in the online fan shop. Example: NFL; WWE; MLB; Little League; NBA; NASCAR; USA Archery`,
        `Alphanumeric, 400 characters - Styles specific to belts. Example: Casual; Chain; Classic; Skinny; Stretch`,
        `Closed List - Waist styles/defining features.`,
        `Alphanumeric, 4000 characters - Descriptive styles common to underwear bottoms and lower body elements of swimwear and leotards. Example: Bikini; String Bikinis; V-Strings; V-Kinis; Bloomers; Boxer Briefs; Boxers; Boy Shorts; Boyleg; Girl Shorts; Girltrunks; Briefs; Culottes; High Cut; Hiphuggers; Hipster; Seamless; Sliqs; Tangas; Thong; Boyshort Thongs; G-Strings; Trunks`,
        `Alphanumeric, 100 characters - Styles specific to socks. Does not include descriptive terms for sock height - those are in the Sock Rise attribute. Example: Dress; Athletic; Casual;  Knee-High; Trouser; Tube`,
        `Alphanumeric, 400 characters - Common clothing cut styles. Example: Babydoll; Broomstick; Square Cut; Full Cut; Maxi`,
        `Alphanumeric, 400 characters - Styles specific to scarves. Example: Evening; Wrap; Infinity; Long; Extra-Long`,
        `Alphanumeric, 100 characters - Style terms specific to pants. Example: Capri; Cargo; Carpenter; Harem; Jodhpur`,
        `Number, 9 characters - The number of small pieces, slices, or different items within the product. Piece Count applies to things such as puzzles, building block sets, and products that contain multiple different items (such as tool sets, dinnerware sets, gift baskets, art sets, makeup kits, or shaving kits). EXAMPLE: (1) A 500-piece puzzle has a "Piece Count" of 500. (2) A 105-Piece Socket Wrench set has a piece count of "105." (3) A gift basket of 5 different items has a "Piece Count" of 5. Example: 200`,
        `Decimal, 9 characters - Neck size in inches. Example: 15.5`,
        `Closed List - Neck size in inches.`,
        `Alphanumeric, 4000 characters - List notable features of the item. Example: Fire-Resistant; Has Handles; Removable Cover; Engraved; As Seen On TV`,
        `Alphanumeric, 400 characters - Terms that describe the way pants will fit when worn. Example: Relaxed; Skinny; Cigarette; Curvy`,
        `Alphanumeric, 400 characters - Bra size, consisting of band and cup. Use this attribute if the garment has both measurements. If the bra has standard clothing sizes (e.g. S, M, L), enter the size under "Clothing Size".  NOTE: for garments that have chest size (measured as the largest part of the chest, i.e. some women's slips), use "Chest Size". Example: 32A; 36C; 40DD`,
        `Number, 4 characters - The four-digit year. Example: 2020`,
        `Closed List - The sizing information specific to hats, ranging from 6 1/4 to 8 1/8. Generic sized (small/med/large) hats may not have this information (generic s/m/l size information should be entered under the "Clothing Size" attribute).`,
        `Alphanumeric, 400 characters - A well-known athlete associated with a product, if applicable. This is used to group items in Fan Shop, not to describe a line of clothing. Example: Serena Williams, Stephen Curry, Cristiano Ronaldo`,
        `Alphanumeric, 300 characters - Styles and designations that apply generally to various types of clothing. Example: Activewear; Workwear; Streetwear; Sleepwear; Outerwear; Leisure; Layered Look; Cover-Up; Maternity; Uniform`,
        `Alphanumeric, 400 characters - Descriptive terms for the style of garment sleeves. Does not include descriptive terms for sleeve length (which appear under the Sleeve Length Style attribute). Example: Batwing; Bell; Bracelet; Cap; Dolman; Flutter; Kimono; Rolled; Tab`,
        `Alphanumeric, 400 characters - Styles specific to shorts. Example: Bermuda; Board; Cargo; Shorty; Walkshorts`,
        `Alphanumeric, 200 characters - A secondary product color. Example: Periwinkle; Seafoam; Burnt Sienna`,
        `Alphanumeric, 400 characters - Styles specific to hats. Example: Baseball Cap; Beanie; Beret; Bomber; Bucket; Cowboy; Fedora; Newsboy; Pirate; Rain; Running; Sun; Trucker`,
        `Closed List - Sheerness/opacities specific to tights and hosiery.`,
        `Alphanumeric, 50 characters - The total number of identical items in the package. Example: 27`,
        `Alphanumeric, 400 characters - Description of post-process wash treatment effecting the appearance of dye and fabric texture, specific to jeans. Example: Acid Wash; Contrast; Dark Rinse; Raw; Unwashed; Dirty Wash; Iron Wash; Light Rinse; Medium Rinse; Harrison Wash; Stanton Wash; Stone Wash; Light-Stonewash; Perry Wash; Transient; Twilight Wash; Vintage Wash; Washed; White Wash`,
        `Alphanumeric, 400 characters - Descriptive styles specific to underwear. Example: Brazilian; Control; Full Slip; Half Slip; Invisible; Naked; Lingerie; Intimate`,
        `Closed List - General grouping of ages into commonly used demographic labels.`,
        `Alphanumeric, 60 characters - MPN uniquely identifies the product to its manufacturer. For many products this will be identical to the model number. Some manufacturers distinguish part number from model number. Having this information allows customers to search for items on the site and informs product matching. Example: 5061025; TSR-1002; 4-40-3/4-pan-phil`,
        `Alphanumeric, 4000 characters - The full name of the person who has autographed this copy. Example: Wayne Gretzky; Bradley Wiggins`,
        `Closed List - Use "Made in U.S.A. and Imported" to indicate manufacture in the U.S. from imported materials, or part processing in the U.S. and part in a foreign country. Use "Made in U.S.A. or Imported" to reflect that some units of an item originate from a domestic source and others from a foreign source. Use "Made in U.S.A." only if all units were made completely in the U.S. using materials also made in the U.S. Use "Imported" if units are completely imported.`,
        `URL, The Warranty URL is the web location of the image, PDF, or link to the manufacturer's warranty page, showing the warranty and its terms, including the duration of the warranty. URLs must begin with http:// or https:// NOTE: Please remember to update the link and/or text of the warranty as the warranty changes. If supplying an image, provide the final destination image URL (no-redirects) that is publicly accessible (no username/password required) and ends in a proper image extension. Recommended file type: JPEG Accepted file types: JPG, PNG, GIF, BMP Maximum file size: 10 MB. Example: http://www.walmart.com/warranty_info.pdf`,
        `Alphanumeric, 5000 characters - This is a particular statement legally required by the State of California for certain products to warn consumers about potential health dangers. See the portions of the California Health and Safety Code related to Proposition 65 to see what products require labels and to verify the text of your warning label. If no warning please enter the value,"None". Example: For example purposes only:  WARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other reproductive harm.`,
        `Alphanumeric, 2000 characters - The particular target time, event, or holiday for the product. Example: Halloween; Christmas; Wedding; Anniversary; Work; School; Weekend; Vacation`,
        `Alphanumeric, 1000 characters - The cut of the underpants. Example: Boxers`,
        `Alphanumeric, 600 characters - Color as described by the manufacturer. Example: Aqua; Burgundy; Mauve; Fuchsia`,
        `Alphanumeric, 600 characters - Style terms specific to dresses. Other style terms that specifically describe a dress's skirt may be found under the Skirt Style attribute. Some values are shared between skirts and dresses: both "mini" dresses and "mini" skirts exist as separate products. Example: Jacket Dress; Little Black Dress; Polo; Sun Dress; Fit & Flare; A-Line; Shift; Sheath; Poodle; Mini; Peplum; Surplice; Wrap; Faux-Wrap; Twofer`,
        `Alphanumeric, 10000 characters - Recommended to use short, 200 character key features which will appear as bulleted text on the item page and in search results. Key features help the user understand the benefits of the product with a simple and clean format. We highly recommended using three or more key features. Example: Wicks away moisture; Looks fabulous with wedge heels; Won't shrink in wash`,
        `Alphanumeric, 10000 characters - Recommended to use short, 200 character key features which will appear as bulleted text on the item page and in search results. Key features help the user understand the benefits of the product with a simple and clean format. We highly recommended using three or more key features. Example: Wicks away moisture; Looks fabulous with wedge heels; Won't shrink in wash`,
        `Alphanumeric, 10000 characters - Recommended to use short, 200 character key features which will appear as bulleted text on the item page and in search results. Key features help the user understand the benefits of the product with a simple and clean format. We highly recommended using three or more key features. Example: Wicks away moisture; Looks fabulous with wedge heels; Won't shrink in wash`,
        `Alphanumeric, 4000 characters - A garment's neckline or neck style. Example: Crew Neck; Henley; Jewel Neck; Round Neckline; Scoop Neck; Slit Neck; Square Neckline; Sweetheart Neckline; V-Neck; Deep V-Neck; Wide Neck; Boat Neck; Off-the-Shoulder; One Shoulder; Neck; Cowl Neck; Drape Neck; Funnel Neck; Lace Neckline; Turtleneck; Mock Neck; Zip Mock Neck; Scrunch Neck`,
        `Alphanumeric, 4000 characters - A list of every major constituent fiber by percentage using its generic name, as is legally required for yarns, fabrics, clothing and other household items. Example: Organic Cotton`,
        `Decimal, 9 characters - The percentage of each fiber within the garment. Example: 95`,
        `Alphanumeric, 4000 characters - Terms describing a garment's skirt style, applicable to dresses and skirt products. Example: A-Frame; Asymmetrical; Handkerchief; High-Low; Bubble; Fish Tail; Flare; Flowing; Peasant; Flutter; Pencil; Pleated; Kilt; Scooter; Sheath; Straight; Wrap; Sarong`,
        `Alphanumeric, 4000 characters - Clothing size as it appears on the garment label. Use this attribute for general sizes (S, M, L) as well as general numbered sizes (2, 4, 6, etc). For items that have unique sizes (dress shirts, bras, etc.) use the specific size attribute. Example: Large`,
        `Alphanumeric, 200 characters - Style of collar, as expressed by shape or design. Example: Band Collar; Button Down Collar; Clifford Collar; Club Collar; Contrast Collar; Flat Collar; Chelsea Collar; Peter Pan Collar; Keyhole Collar; Mandarin Collar; Notched Lapel; Peak Lapel; Pin Collar; Point Collar; Polo Collar; Sailor Collar; Shawl Collar; Spread Collar; Cutaway Collar; Extreme Cutaway; Semi Cutaway; Straight Collar; Tennis Collar; Tab Collar; Button Tab Collar; Snap Tab Collar; Wing Collar`,
        `Decimal, 9 characters - A measurement in inches of the band of the bra, which fits around the ribcage just under the bust. Use this if the garment has a band size only or to separate band and cup size for search discovery. Example: 34`,
        `Closed List - A measurement in inches of the band of the bra, which fits around the ribcage just under the bust. Use this if the garment has a band size only or to separate band and cup size for search discovery.`,
        `Alphanumeric, 1000 characters - Describes the type of pajamas. Example: Onesie`,
        `Decimal, 9 characters - For pants, the distance from the bottom of the leg to the seam in the crotch, measured in inches. Example: 32`,
        `Closed List - For pants, the distance from the bottom of the leg to the seam in the crotch, measured in inches.`,
        `Closed List - The common sizing groups used by the retail clothing industry.`,
        `Closed List - Is this item marketed specifically to women who are pregnant?`,
        `Alphanumeric, 4000 characters - Type of recycled material used to create the item. Example: Bamboo; Cotton; Glass`,
        `Decimal, 16 characters - Corresponding percentage of the recycled material used to create the item. Used in conjunction with Recycled Material attribute. Example: 90; 80`,
        `Closed List - Select the color from a short list that best describes the general color of the item. This improves searchability as it allows customers to view items by color from the left navigation when they perform a search.`,
        `Alphanumeric, 400 characters - A composite of Waist Size and Inseam. Do not fill in this attribute if you have separately filled in both "Waist Size" and "Inseam". If the pant size is in numbers (e.g. 12) or standard sizes (e.g. Large), enter the information under "Clothing Size". Example: 38x36`,
        `Closed List - Panty size. Generic sized (small/med/large) panties may not have this information (generic s/m/l size information should be entered under the "Clothing Size" attribute). Clothing size style values (Plus Size, Petite, Juniors, etc) should be entered under the "Clothing Size Style" attribute.`,
        `Alphanumeric, 400 characters - Belt buckle configurations. Example: Loop Buckle; Roller Buckle; Swivel Buckle`,
        `Alphanumeric, 1000 characters - The main material(s) in the  product. Example: Stainless Steel; Oak; MDF`,
        `Closed List - Descriptive terms for sleeve length.`,
        `Decimal, 9 characters - Waist measurement in inches, around the smallest section of the natural waist (typically located just above the belly button). Example: 38`,
        `Closed List - Waist measurement in inches, around the smallest section of the natural waist (typically located just above the belly button).`,
        `Alphanumeric, 200 characters - If your item has any association with a specific sports team, enter the team name. NOTE: This attribute flags an item for inclusion in the online fan shop. Example: San Jose Earthquakes; San Jose Sharks; Golden State Warriors; Oakland Raiders; San Francisco 49ers; San Francisco Giants; Stanford Cardinal; Oakland Athletics;`,
        `Alphanumeric, 600 characters - If the product is sports-related, the name of the specific sport depicted on the product, or the target sport for the product use Example: Tennis; Lacrosse`,
        `Alphanumeric, 300 characters - Required if item is a variant. Make up a number and/or letter code for “Variant Group ID” and add this to all variations of the same product. Variant Group id should be unique for one group. Partners must ensure uniqueness of their Variant Group IDs. Example: HANESV025`,
        `Closed List - Designate all attributes by which the item is varying (specific to each category). Variant attribute type needs to be specified within the individual columns, e.g. if choosing color in “Variant Attribute Names”, search for “color” on the sheet and fill out the column corresponding to color.`,
        `Closed List - Designate all attributes by which the item is varying (specific to each category). Variant attribute type needs to be specified within the individual columns, e.g. if choosing color in “Variant Attribute Names”, search for “color” on the sheet and fill out the column corresponding to color.`,
        `Closed List - Attribute name corresponding to the swatch.`,
        `URL, 2000 characters - This is required for products with visual variations and will be shown as a small square on the item page. Recommended resolution is 100 x 100 pixels. Provide the final destination image URL (no-redirects) that is publicly accessible (no username/password required) and ends in a proper image extension such as, .jpg, .png or .gif. We recommend using a unique URL that is not the same as the primary or secondary image URLs. Example: http://www.walmart.com/somepath/some-image.jpg`,
        `Closed List - Note whether item is intended as the main variant in a variant grouping. The primary variant will appear as the image when customers search and the first image displayed on the item page. This should be set as "Yes" for only one item in a group of variants.`,
        `Closed List - Please select the Battery Technology Type from the list provided. NOTE: If battery type is lead acid, lead acid (nonspillable), lithium ion, or lithium metal, please ensure that you have obtained a hazardous materials risk assessment through WERCS before setting up your item.`,
        `Date, Indicates the date when the partner's item should be removed from the site. Example: yyyy-mm-dd`,
        `Closed List - ASIN is the Amazon Standard Identification Number. It is the unique 10-digit sequence of letters and/or numbers`,
        `Alphanumeric, 10 characters - Provide the ID for your “External Product ID Type”. Example: B002Z36VJE`,
        `Closed List - Please select the level of restriction you are applying to your item, Illegal for Sale or Commercial. Illegal for Sale restrictions apply to items for sale in the United States of America which have a federal, state, and or local law/regulation. Commercial Restrictions apply to items for any reason out side of local or state laws. If your item does not have any Restriction please select None. If your item has a Commercial or Illegal for Sale Restrictions you must provide the States or Zip Codes which the item is Restricted in.`,
        `Alphanumeric, 4000 characters - Please list all States in which your product must and/or should be prohibited from being sold. You MUST provide us a list of all States and Zip Codes where your product is prohibited or restricted from being sold due to a law, regulation, ordinance, etc. You MAY, at your discretion, provide Walmart a list of all States and Zip Codes where you prefer to prohibit your product from being sold. Please remember that it is your obligation to understand and inform Walmart of any laws, regulations, ordinances etc. that would prohibit or restrict your product from being sold in a specific State or Zip Code. Example: CA, AR, AL`,
        `Alphanumeric, 4000 characters - Please list all Zip Codes where your product should not be sold for legal or commercial reasons. You have an obligation to notify Walmart of any Zip Codes where laws, regulations, ordinances etc. prohibit or restrict your product from being sold.  At your discretion, you may also specify any Zip Codes where you prefer not to have your product sold for commercial reasons.  Please be aware that placing a Zip Code restriction on a product will only restrict that product from being sold within that Zip Code.  To restrict an entire State, please specify the State instead of using Zip Codes. Example: 94085, 94086, 94087, 72712, 72716`,
        `Closed List - Select "Y" if your item cannot ship with another item in the same box. If marked "Y," the ship alone item will not be grouped for ship price calculation.`,
        `Closed List - Selecting Y allows the replacement of a previously submitted SKU associated with a standardized unique identifier (i.e. GTIN, ISBN, UPC, EAN) without generating an error. If Y is not selected, the system will not permit the uploading of two SKUs with the same standardized unique identifier. NOTE: You should only select Y if you are deliberately replacing a SKU. Selecting Y in other circumstances may lead to data loss.`,
        `Decimal, 9 characters - Enter the quantity of units for the item, based on the "PPU Unit of Measure" you selected. For example, a gallon of milk should be 128.  NOTE: Do not enter the price. Example: 12`,
        `Closed List - The units that will be used to calculate the "Price Per Unit" for your product. For example, a gallon of milk has a "PPU Unit of Measure" of Fluid Ounces. NOTE: This may not be the Unit of Measure on the label.`,
        `Number, 4 characters - The number of identical, individually packaged-for-sale items. If an item does not contain other items, does not contain identical items, or if the items contained within cannot be sold individually, the value for this attribute should be "1." Examples: (1) A single bottle of 50 pills has a "Multipack Quantity" of "1." (2) A package containing two identical bottles of 50 pills has a "Multipack Quantity" of 2. (3) A 6-pack of soda labelled for individual sale connected by plastic rings has a "Multipack Quantity" of "6." (4) A 6-pack of soda in a box whose cans are not marked for individual sale has a "Multipack Quantity" of "1." (5) A gift basket of 5 different items has a "Multipack Quantity" of "1." Example: 1; 5`,
        `Alphanumeric, 100 characters - Add an additional offer attribute not present in this template. Use camelCase for the name. Example: planetNames`,
        `Alphanumeric, 100 characters - Write your "Additional Offer Attribute Value" to give a description or answer for your "Additional Offer Attribute Name." Together, these allow you to create your own descriptor that is not already in the taxonomy. Example: 36418238480545`,
        `Closed List - Electronic is defined as item of merchandise containing a circuit board and/or electrical wiring, including but not limited to any item of merchandise with a screen.`,
        `Closed List - Can this product be shipped in the original packaging without being put in an outer box? Notes: 1) This is to indicate whether it's *possible* for the item to be shipped in original box, not whether it is required. 2) This was previously known as"Ships As-Is."`,
        `Decimal, 17 characters - The longest horizontal measurement (in inches), front to back, with the product sitting on its natural base and facing forward, excluding additional packaging. The depth of an item for shipping purpose, without the additional packaging. This is being used for Local Delivery program as the items are being delivered off-the-shelf without additional packaging. Example: 5.25`,
        `Decimal, 17 characters - The shortest horizontal measurement (in inches), left to right, with the product sitting on its natural base and facing forward, excluding additional packaging. The width of an item for shipping purpose, without the additional packaging. This is being used for Local Delivery program as the items are being delivered off-the-shelf without additional packaging. Example: 5.25`,
        `Decimal, 17 characters - The shortest horizontal measurement (in inches), left to right, with the product sitting on its natural base and facing forward, excluding additional packaging. The height of an item for shipping purpose, without the additional packaging. This is being used for Local Delivery program as the items are being delivered off-the-shelf without additional packaging. Example: 5.25`,
        `Decimal, 17 characters - The weight (in pounds) of the item, including all of its packaging materials, excluding additional packaging. The weight of an item for shipping purpose, without the additional packaging. This is being used for Local Delivery program as the items are being delivered off-the-shelf without additional packaging. Example: 5.25`,
        `Closed List - Indicates whether the item contains a chemical, pesticide, or aerosol. Definitions and examples can be found at: https://supplierhelp.walmart.com/s/guide?article=000007868. If Yes, the item requires a hazardous materials risk assessment through WERCS.`,
        `Closed List - The time required to process the items (in days). Fulfillment Lag Time determines the number of days it takes the Seller to prepare an order for shipment. The default value is 0 if no entry is provided. If you are approved for a Lag Time Exception for 2 days or more, you will need to use the Lag Time Spec to update your items.`,
        `Closed List - Update an Item's Product ID (eg: GTIN, UPC, ISBN, ISSN, EAN). Product ID is an important identifier in Walmart systems. Walmart merges items with the same Product ID and shows them as one item sold by multiple sellers. If you provide the wrong Product ID, your item will be merged incorrectly, which can increase your order cancellation rate, create bad customer experience, produce customers fraud complaints and result in a lower rating on your Vendor Scorecard`,
        `Date, Indicates the date when the item is available to be published on the site. Example: yyyy-mm-dd
`
      ]
    ]
    dataProductsFormat.forEach((element) => {
      for (let j = 0; j < prices.length; j++) {
        worksheet_data.push([
          '',
          '',
          '',
          `${prices[j]?.sku2 ? `${prices[j].sku2}-` : ''}${element.wsn}-${element.id}-${formatDate(new Date())}-${j + 1}`,
          `${element.title} T-Shirt Hoodie`,
          'GTIN',
          'CUSTOM',
          prices[j]?.price || '',
          element.brand,
          '1',
          element.imgLink,
          element.des.replace(/{Title}/g, element.title),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'Unisex',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          prices[j]?.addImg,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'USA',
          '',
          '',
          '',
          '',
          prices[j]?.color || '',
          '',
          '',
          '',
          '',
          '',
          'Gildan 5000 - Heavy Cotton',
          '100',
          '',
          prices[j]?.size || '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          `${element.wsn}-${element.id}-${formatDate(new Date())}`,
          'clothingSize',
          'color',
          'color',
          prices[j]?.swatchImg,
          j === 0 ? 'Yes' : 'No',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '1',
          '',
          ''
        ])
      }
    })

    // Convert the worksheet data to a worksheet object
    let worksheet = XLSX.utils.aoa_to_sheet(worksheet_data)

    // merge cell
    worksheet['!merges'] = [
      { s: { r: 1, c: 4 }, e: { r: 1, c: 9 } },
      { s: { r: 1, c: 10 }, e: { r: 1, c: 11 } },
      { s: { r: 1, c: 12 }, e: { r: 1, c: 131 } },
      { s: { r: 1, c: 132 }, e: { r: 1, c: 137 } },
      { s: { r: 1, c: 138 }, e: { r: 1, c: 161 } },
      { s: { r: 1, c: 3 }, e: { r: 4, c: 3 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } },
      { s: { r: 2, c: 30 }, e: { r: 2, c: 31 } },
      { s: { r: 2, c: 48 }, e: { r: 2, c: 49 } },
      { s: { r: 2, c: 50 }, e: { r: 2, c: 51 } },
      { s: { r: 2, c: 63 }, e: { r: 2, c: 64 } },
      { s: { r: 2, c: 77 }, e: { r: 2, c: 78 } },
      { s: { r: 2, c: 108 }, e: { r: 2, c: 109 } },
      { s: { r: 2, c: 113 }, e: { r: 2, c: 114 } },
      { s: { r: 2, c: 116 }, e: { r: 2, c: 117 } },
      { s: { r: 2, c: 120 }, e: { r: 2, c: 121 } },
      { s: { r: 2, c: 128 }, e: { r: 2, c: 129 } },
      { s: { r: 2, c: 135 }, e: { r: 2, c: 136 } },
      { s: { r: 2, c: 140 }, e: { r: 2, c: 141 } },
      { s: { r: 2, c: 142 }, e: { r: 2, c: 143 } },
      { s: { r: 2, c: 147 }, e: { r: 2, c: 148 } },
      { s: { r: 2, c: 150 }, e: { r: 2, c: 151 } },
      { s: { r: 2, c: 154 }, e: { r: 2, c: 157 } }
    ]
    let colCount = [...Array(159).keys()]
    worksheet['!cols'] = colCount.map((a, index) => ({
      wpx: index < 3 ? 50 : 250
    }))

    // color
    worksheet['D2'].s = {
      font: { bold: true, sz: 14 },
      fill: { fgColor: { rgb: 'FFFF00' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
    worksheet['E2'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '008dff' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
    worksheet['K2'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '22db16' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
    worksheet['M2'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'e57f16' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
    worksheet['EC2'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '063fe1' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
    worksheet['EI2'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '757575' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
    // Convert the worksheet data to a worksheet object

    // style row

    const columnCount = worksheet_data[0].length // Number of columns in the worksheet

    for (let col = 0; col < columnCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col })
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {} // Ensure the cell exists
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    for (let col = 0; col < columnCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col })
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {} // Ensure the cell exists
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    for (let col = 0; col < columnCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col })
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {} // Ensure the cell exists
      worksheet[cellAddress].s = {
        font: { color: { rgb: 'ababab' } }
      }
    }

    // style col
    for (let row = 0; row < worksheet_data.length; row++) {
      // Adjust the range as needed
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 3 })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: 'FFFF00' } // Yellow color
          }
        }
      }
    }

    // Append the worksheet to the wb
    const ws1 = XLSX.utils.aoa_to_sheet(firstSheetJson)
    removeEmptyCells(ws1)
    removeEmptyCells(worksheet)
    XLSX.utils.book_append_sheet(wb, ws1, 'Hidden_clothing_other')
    XLSX.utils.book_append_sheet(wb, worksheet, 'Clothing')

    // Write the wb to a binary string
    const workbookBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary', compression: true })

    // Convert the binary string to an array buffer
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff
      }
      return buf
    }

    // Create a Blob from the array buffer and trigger the download
    const blob = new Blob([s2ab(workbookBinary)], { type: 'application/octet-stream' })
    setLoading(false)
    saveAs(blob, `DATA-CÀO-${dataProductsFormat[0].wsn}-${formatDateExcel(new Date())}.xlsx`)
  }

  function removeEmptyCells(worksheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = { c: C, r: R }
        const cell_ref = XLSX.utils.encode_cell(cell_address)
        const cell = worksheet[cell_ref]

        if (cell && (cell.v === undefined || cell.v === null || cell.v === '')) {
          delete worksheet[cell_ref]
        }
      }
    }
    // Cập nhật phạm vi của worksheet
    worksheet['!ref'] = XLSX.utils.encode_range(range)
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
  const formatDateExcel = (date) => {
    // Extract day, month, and year components from the Date object
    var day = date.getDate().toString().padStart(2, '0')
    var month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
    var year = date.getFullYear().toString().slice(-2)
    const hour = date.getHours() // returns 0-23

    // Get the current minute
    const minute = date.getMinutes() // returns 0-59

    // Get the current second
    const second = date.getSeconds() // returns 0-59

    // Get the current millisecond
    const millisecond = date.getMilliseconds() // returns 0-999
    // Construct the formatted date string in "DD/MM/YY" format
    var formattedDate = `${day}-${month}-${year}-${hour}-${minute}-${second}-${millisecond}`

    return formattedDate
  }

  return (
    <div className="con tainer">
      {!firstLoading && !isPassId && (
        <div>
          <input
            type="text"
            value={id}
            style={{
              padding: '12px 16px',
              width: 400,
              border: '1px solid #c1c1c1',
              borderRadius: 8,
              textAlign: 'center'
            }}
          />
        </div>
      )}
      {!firstLoading && isPassId && (
        <div className="form">
          <p className="title">UPLOAD FILE</p>
          <div>
            <div className="formbold-mb-5 formbold-file-input">
              <input type="file" name="store" id="store" onChange={handleUploadData} />
              <label htmlFor="store">
                <div>
                  <span className="formbold-drop-file"> DATA </span>
                  <span className="formbold-or"> OR </span>
                  <span className="formbold-browse"> BROWSE </span>
                  <p className="file-name store-file-name"></p>
                </div>
              </label>
            </div>
            <div id="line"></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <input
              type="text"
              className="start"
              placeholder="trang bắt đầu"
              value={pageStart}
              onChange={(e) => setPageStart(e.target.value)}
            />
            <input
              type="text"
              className="end"
              placeholder="trang kết thúc"
              value={pageEnd}
              onChange={(e) => setPageEnd(e.target.value)}
            />
          </div>
          <button className="btn-submit" onClick={handleCheck}>
            START CHECK
          </button>
        </div>
      )}
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
