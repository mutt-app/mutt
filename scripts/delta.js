const {delay, parsePrice} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate}) => {
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')
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
  await delay(3000)

  const acceptRestrictions = await page.$('#accept_restrictions')
  if (acceptRestrictions !== null) {
    acceptRestrictions.click()
    await delay(100)
    await page.click('.continue-to-basic a')
    await delay(100)
  }



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

  return cheapestReturnPrice
}

/**
 * @param {Date} date
 * @returns {string}
 */
function getLongMonthName(date) {
  const mlist = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return mlist[date.getMonth()]
}
