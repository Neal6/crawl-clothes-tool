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
    if (
      stores.filter((s) =>
        s.store.includes('https://www.etsy.com', {
          waitUntil: 'domcontentloaded'
        })
      ).length > 0
    ) {
      await page.goto('https://neal6.github.io/bypass-esty/')
      let isPageChanged = false
      while (!isPageChanged) {
        if (
          page.url().toString() === 'https://www.etsy.com/?ref=lgo/' ||
          page.url().toString() === 'https://neal6.github.io/bypass-esty/'
        ) {
          await page.waitForTimeout(1000)
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
      while (!isDoneStore) {
        const store = removeQueryPageAndAddFirst(stores[index]?.store?.toString()?.trim()).replace(
          /page=[0-9]+/,
          `page=${pageCheck}`
        )
        const websiteName = getWebsiteFromUrl(store)
        await page.goto(store, {
          waitUntil: 'domcontentloaded'
        })

        const products = await page.evaluate(() => {
          const imgProducts = document.querySelectorAll(
            '#sh-wider-items .responsive-listing-grid img.wt-image'
          )
          const productsDetail = []
          if (imgProducts.length > 0) {
            for (let index = 0; index < imgProducts.length; index++) {
              const element = imgProducts[index]
              productsDetail.push({
                title: element.alt,
                id: element.closest('a.listing-link').getAttribute('data-listing-id'),
                link: element.closest('a.listing-link').getAttribute('href')
              })
            }
          }
          return productsDetail
        })
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
        } else {
          isDoneStore = true
        }
      }
      for (let index = 0; index < productsThisStore.length; index++) {
        const element = productsThisStore[index]
        await page.goto(element.link, {
          waitUntil: 'domcontentloaded'
        })
        const imgProduct = await page.evaluate(() => {
          return document.querySelector('#photos ul img.carousel-image')?.src || ''
        })
        productsThisStore[index].imgLink = imgProduct
      }
      allProduct = [...allProduct, ...productsThisStore]
    }
    await browser.close()

    return {
      status: 200,
      products: allProduct
    }
  } catch (error) {
    await browser.close()
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
    return 'ES'
  } else {
    return ''
  }
}
