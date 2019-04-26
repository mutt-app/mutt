const puppeteer = require('puppeteer-extra')

puppeteer.use(require('puppeteer-extra-plugin-stealth')())

puppeteer.launch({headless: false, slowMo: 33}).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  const origin = 'NYC'
  const destination = 'LAX'
  const departDate = new Date('2019-05-13')
  const returnDate = new Date('2019-05-17')

  await page.goto('https://www.delta.com/')

  // Typing origin
  await page.waitForSelector('#fromAirportName')
  await page.click('#fromAirportName')
  await page.keyboard.type(origin)
  await page.waitForSelector('.airport-list')
  await page.keyboard.press('Enter')

  await page.keyboard.press('Tab')

  // Typing desc
  await page.click('#toAirportName')
  await page.keyboard.type(destination)
  await page.waitForSelector('.airport-list')
  await page.keyboard.press('Enter')
  await delay(200)

  // Type dates
  await page.click('.travelDateSelectionView')
  await page.waitForSelector('.dl-datepicker-month-0')
  const monthElement = await page.$('.dl-datepicker-month-0')

  let monthName = await (await monthElement.getProperty('textContent')).jsonValue()
  while (monthName.toLowerCase() !== getLongMonthName(departDate).toLowerCase()) {
    await page.click('.dl-datepicker-1 > .monthSelector')
    await delay(100)
    monthName = await (await monthElement.getProperty('textContent')).jsonValue()
  }

  await delay(100)
  await page.click(`[aria-label^="${departDate.getDate()}"]`)

  // Type return date
  while (monthName.toLowerCase() !== getLongMonthName(returnDate).toLowerCase()) {
    await page.click('.dl-datepicker-1 > .monthSelector')
    await delay(100)
    monthName = await (await monthElement.getProperty('textContent')).jsonValue()
  }

  await delay(100)
  await page.click(`[aria-label^="${returnDate.getDate()}"]`)

  await delay(200)
  await page.click('[aria-label="done"]')
  await delay(100)

  // Start search.
  await page.click('#btn-book-submit')

  await page.waitForSelector('.flightResultTableHolder')
  await delay(2000)

  // Depart price
  let cheapestDepartPrice = undefined
  let cheapestDepartPriceElement = undefined
  {
    const prices = await page.$$('.priceBfrDec')

    for (let priceElement of prices) {
      const price = parsePrice(await (
        await priceElement.getProperty('textContent')
      ).jsonValue())

      if (typeof cheapestDepartPrice === 'undefined' || price < cheapestDepartPrice) {
        cheapestDepartPrice = price
        cheapestDepartPriceElement = priceElement
      }
    }
  }

  // Select cheapest depart flight.
  await cheapestDepartPriceElement.hover()
  await page.mouse.down()
  await page.mouse.up()
  await delay(1000)

  await page.click('#accept_restrictions')
  await delay(100)

  await page.click('.continue-to-basic a')

  // Return flight
  await page.waitForSelector('.select-outbound')
  await delay(2000)

  const prices = await page.$$('.priceBfrDec')

  let cheapestReturnPrice = undefined
  for (let priceElement of prices) {
    const price = parsePrice(await (
      await priceElement.getProperty('textContent')
    ).jsonValue())

    if (typeof cheapestReturnPrice === 'undefined' || price < cheapestReturnPrice) {
      cheapestReturnPrice = price
    }
  }

  console.log('Total price:', cheapestReturnPrice)

  //browser.close()
})

/**
 * @param {number} time
 * @returns {Promise<any>}
 */
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

/**
 * @param {Date} date
 * @returns {string}
 */
function getLongMonthName(date) {
  const mlist = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return mlist[date.getMonth()]
}

/**
 *
 * @param price
 * @returns {number}
 */
function parsePrice(price) {
  const s = price.replace(/\D/g, '')
  return parseInt(s)
}