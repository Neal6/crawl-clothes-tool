const puppeteer = require('puppeteer-extra')
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
export const startCheck = async (params) => {
  const { stores } = params.data
  const browser = await puppeteer.launch({
    headless: false
  })
  try {
    let page = await browser.newPage()
    await page.setViewport({
      width: 1200,
      height: 1620,
      deviceScaleFactor: 1
    })
    page.setUserAgent(ua)
    const isETSY =
      stores.filter((s) => {
        return s.store.includes('https://www.etsy.com')
      }).length > 0
    const isAMZ =
      stores.filter((s) => {
        return s.store.includes('https://www.amazon.com')
      }).length > 0
    if (isETSY || isAMZ) {
      await page.goto(
        `https://neal6.github.io/bypass-esty/?${isAMZ ? 'amz=true&' : ''}${isETSY ? 'etsy=true&' : ''}`
      )
      let isPageChanged = false
      while (!isPageChanged) {
        if (page.url().toString().includes('https://neal6.github.io/bypass-esty')) {
          await delay(1000)
        } else {
          isPageChanged = true
        }
      }
    }
    let allProduct = []
    for (let index = 0; index < stores.length; index++) {
      let isDoneStore = false
      let pageCheck = 1
      let productsThisStore = []

      const websiteName = getWebsiteFromUrl(stores[index]?.store)
      while (!isDoneStore) {
        const store = removeQueryPageAndAddFirst(stores[index]?.store?.toString()?.trim()).replace(
          /page=[0-9]+/,
          `page=${pageCheck}`
        )
        try {
          await page.goto('https://www.google.com/', {
            waitUntil: 'domcontentloaded'
          })
          await page.goto(store, {
            waitUntil: 'domcontentloaded'
          })
        } catch (error) {}
        const products = await page.evaluate((ws) => {
          switch (ws) {
            case 'ET': {
              const imgProducts = document.querySelectorAll(
                '#sh-wider-items .responsive-listing-grid img.wt-image'
              )
              const productsDetail = []
              if (imgProducts.length > 0) {
                for (let index = 0; index < imgProducts.length; index++) {
                  const element = imgProducts[index]
                  productsDetail.push({
                    title: element.alt,
                    id: element.closest('a.listing-link')?.getAttribute('data-listing-id'),
                    link: element.closest('a.listing-link')?.getAttribute('href'),
                    imgInList: element?.src || ''
                  })
                }
              }
              return productsDetail
            }
            case 'RE': {
              const imgProducts = document.querySelectorAll(
                '#SearchResultsGrid [class^=styles__card] [class^=styles__imageDiv] img'
              )
              const productsDetail = []
              if (imgProducts.length > 0) {
                for (let index = 0; index < imgProducts.length; index++) {
                  const element = imgProducts[index]
                  productsDetail.push({
                    title: element.alt,
                    id: element
                      .closest('a[class^=styles__link]')
                      ?.getAttribute('href')
                      .split('/')
                      .at(-1)
                      .split('.')[0],
                    link: element.closest('a[class^=styles__link]')?.getAttribute('href')
                  })
                }
              }
              return productsDetail
            }
            case 'TE': {
              const imgProducts = document.querySelectorAll(
                '.m-store__tiles .tp-design-tile__image'
              )
              const productsDetail = []
              if (imgProducts.length > 0) {
                for (let index = 0; index < imgProducts.length; index++) {
                  const element = imgProducts[index]
                  productsDetail.push({
                    title: element.alt,
                    id: element.closest('.tp-design-tile')?.getAttribute('data-id'),
                    link: element.closest('a').href
                  })
                }
              }
              return productsDetail
            }
            case 'AM': {
              const imgProducts = document.querySelectorAll('.s-product-image-container .s-image')
              const productsDetail = []
              if (imgProducts.length > 0) {
                for (let index = 0; index < imgProducts.length; index++) {
                  const element = imgProducts[index]
                  productsDetail.push({
                    title: element.alt,
                    id: element.closest('.s-result-item')?.getAttribute('data-asin'),
                    link: element.closest('.a-link-normal').href
                  })
                }
              }
              return productsDetail
            }
            default:
              break
          }
        }, websiteName)
        productsThisStore = [
          ...productsThisStore,
          ...products.map((product) => ({
            ...product,
            wsn: websiteName,
            brand: stores[index]?.brand,
            des: stores[index]?.des,
            img: stores[index]?.img
          }))
        ]
        if (products.length > 0) {
          pageCheck++
          if (websiteName === 'ET') {
            await page.type('#global-enhancements-search-query', Math.random().toString())
            await page.click('.global-enhancements-search-input-btn-group__btn')
            await delay(1000)
          }
        } else {
          isDoneStore = true
        }
      }
      for (let index = 0; index < productsThisStore.length; index++) {
        const element = productsThisStore[index]
        if (websiteName === 'ET') {
          productsThisStore[index].imgLink =
            element.imgInList.split('/c/')[0] +
            '/r/il/' +
            element.imgInList.split('/il/')[1].replace(/_[0-9]+x[0-9]+/, '_794xN')
          continue
        }
        try {
          await page.goto('https://www.google.com/', {
            waitUntil: 'domcontentloaded'
          })
          await page.goto(element.link, {
            waitUntil: 'domcontentloaded'
          })
          const imgProduct = await page.evaluate((ws) => {
            window.scrollTo(0, document.body.scrollHeight)
            switch (ws) {
              case 'ET': {
                return document.querySelector('#photos ul img.carousel-image')?.src || ''
              }
              case 'RE': {
                return (
                  document.querySelector('[data-testid=product-preview-image] picture img')?.src ||
                  ''
                )
              }
              case 'TE': {
                return document.querySelector('.jsProductMainImage')?.src || ''
              }
              case 'AM': {
                const imgSplit = document.querySelector('#landingImage')?.src?.split('.')
                imgSplit?.splice(imgSplit.length - 2, 1)
                return imgSplit?.join('.') || ''
              }
              default:
                break
            }
          }, websiteName)
          productsThisStore[index].imgLink = imgProduct
          continue
        } catch (error) {
          if (websiteName === 'ET') {
            await delay(2000)
          }
          const imgProduct = await page.evaluate((ws) => {
            window.scrollTo(0, document.body.scrollHeight)
            switch (ws) {
              case 'ET': {
                return document.querySelector('#photos ul img.carousel-image')?.src || ''
              }
              case 'RE': {
                return (
                  document.querySelector('[data-testid=product-preview-image] picture img')?.src ||
                  ''
                )
              }
              case 'TE': {
                return document.querySelector('.jsProductMainImage')?.src || ''
              }
              case 'AM': {
                const imgSplit = document.querySelector('#landingImage')?.src?.split('.')
                imgSplit?.splice(imgSplit.length - 2, 1)
                return imgSplit?.join('.') || ''
              }
              default:
                break
            }
          }, websiteName)
          productsThisStore[index].imgLink = imgProduct
          continue
        }
      }
      allProduct = [...allProduct, [...productsThisStore]]
    }
    // await browser.close()
    return {
      status: 200,
      products: allProduct
    }
  } catch (error) {
    // await browser.close()
    console.log(error)
    return {
      status: 400
    }
  }
}

const removeQueryPageAndAddFirst = (url) => {
  if (url.match(/page=[0-9]+/)) {
    return url.replace(/page=[0-9]+/, 'page=1')
  } else {
    if (url.includes('?')) {
      return url + '&page=1'
    } else {
      return url + '?page=1'
    }
  }
}

const getWebsiteFromUrl = (url) => {
  if (url.includes('https://www.etsy.com')) {
    return 'ET'
  } else if (url.includes('https://www.redbubble.com')) {
    return 'RE'
  } else if (url.includes('https://www.teepublic.com')) {
    return 'TE'
  } else if (url.includes('https://www.amazon.com')) {
    return 'AM'
  } else {
    return ''
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
