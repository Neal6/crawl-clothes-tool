const puppeteer = require('puppeteer-extra')
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

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
    console.log(page.url().toString())
    let isPageChanged = false
    while (!isPageChanged) {
      if (page.url().toString().includes('sign_in')) {
        await page.waitForTimeout(1000)
      } else {
        isPageChanged = true
      }
    }
    // for (let index = 0; index < stores.length; index++) {
    //   const store = stores[index]?.store?.toString()?.trim()
    //   console.log(store)
    //   await page.goto('https://www.etsy.com/?ref=lgo', {
    //     waitUntil: 'domcontentloaded'
    //   })
    //   console.log('done')
    //   const products = await page.evaluate(() => {
    //     return document.querySelectorAll('#sh-wider-items .responsive-listing-grid img.wt-image')
    //   })
    //   console.log(products)
    // }
    // await browser.close()
    return {
      status: 200
    }
  } catch (error) {
    await browser.close()
    console.log(error)
    return {
      status: 400
    }
  }
}

const checkHasSearchResult = async (page) => {
  const isHasResults = await page.evaluate(() => {
    if (document.querySelector('.kw-left-table-container').nextElementSibling) {
      return false
    } else {
      return true
    }
  })
  return isHasResults
}

const getAllSearchKeywords = async (page, kd) => {
  let searchKeywords = []
  let scrollStart = 0
  let stopScroll = false
  while (!stopScroll) {
    await page.evaluate((scrollStart) => {
      document
        .querySelector('.kw-left .mg-results-inner')
        .scroll({ top: scrollStart, behavior: 'instant' })
      return
    }, scrollStart)
    await page.waitForTimeout(300)
    const keywords = await page.evaluate(() => {
      const listKeywordVal = []
      document.querySelectorAll('.kw-left .mg-results-tr').forEach((ele) => {
        const keyword = ele?.querySelector(
          '.mg-results-td.is-kw >span:nth-child(1) > span:nth-child(1)'
        )?.textContent
        const searchValue = ele?.querySelector('.mg-results-td.is-sv')?.textContent
        const kd = ele?.querySelector('.mg-results-td.is-seo')?.textContent || '0'
        listKeywordVal.push({
          keyword,
          searchValue,
          kd
        })
      })

      return listKeywordVal
    })
    if (
      searchKeywords.length > 0 &&
      searchKeywords[searchKeywords.length - 1]?.keyword === keywords[keywords.length - 1]?.keyword
    ) {
      stopScroll = true
    } else {
      searchKeywords = [...searchKeywords, ...keywords]
      scrollStart += 500
    }
  }
  const searchKeywordsFilterDuplicate = removeDuplicates(searchKeywords, 'keyword')
  return searchKeywordsFilterDuplicate
}

const removeDuplicates = (array, key) => {
  return array.filter((obj, index, self) => index === self.findIndex((o) => o[key] === obj[key]))
}
