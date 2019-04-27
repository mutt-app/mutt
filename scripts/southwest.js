const {delay} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate}) => {
  // TODO: choose 1 of the popular useragents
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')

  // Going to southwest
  await page.goto('https://www.southwest.com/')


  // TODO: try to type origin/destination in for and check valid typing
  // Typing origin
  await page.waitForSelector('#LandingPageAirSearchForm_originationAirportCode')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_originationAirportCode')
  await page.focus('#LandingPageAirSearchForm_originationAirportCode')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_originationAirportCode', origin)
  await delay(200)
  await page.keyboard.press('Tab')
  await delay(200)


  // Typing destination
  await page.waitForSelector('#LandingPageAirSearchForm_destinationAirportCode')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_destinationAirportCode')
  await page.focus('#LandingPageAirSearchForm_destinationAirportCode')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_destinationAirportCode', destination)
  await delay(200)
  await page.keyboard.press('Tab')


  // Typing depart date in calendar
  await page.waitForSelector('#LandingPageAirSearchForm_departureDate')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_departureDate')
  await page.focus('#LandingPageAirSearchForm_departureDate')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_departureDate', toDate(departDate))
  await delay(200)
  await page.keyboard.press('Tab')

  // Typing return date in calendar
  await page.waitForSelector('#LandingPageAirSearchForm_returnDate')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_returnDate')
  await page.focus('#LandingPageAirSearchForm_returnDate')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_returnDate', toDate(returnDate))
  await delay(200)
  await page.keyboard.press('Tab')


  // Checking for error in form validation
  await delay(500)
  const error = await page.$('.form-control--error')
  if (error !== null) {
    console.log("data is not valid")
    return
  }


  await page.waitForSelector('#LandingPageAirSearchForm_submit-button')
  await delay(100)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_submit-button')


  await page.waitForSelector('.filters--filter-area')

  // Getting min depart price
  let minDepartPrice = 0
  const departPrices = await page.$$('div[id^="air-booking-fares-0"] .fare-button--value-total')
  for (let i = 0; i < departPrices.length; i++) {
    let val = await page.evaluate(
      span => span.innerText,
      departPrices[i],
    )
    let price = parseInt(val)
    if (minDepartPrice === 0 || minDepartPrice > price) {
      minDepartPrice = price
    }
  }

  let minReturnPrice = 0
  const returnPrices = await page.$$('div[id^="air-booking-fares-1"] .fare-button--value-total')
  for (let i = 0; i < returnPrices.length; i++) {
    let val = await page.evaluate(
      span => span.innerText,
      returnPrices[i],
    )

    let price = parseInt(val)
    if (minReturnPrice === 0 || minReturnPrice > price) {
      minReturnPrice = price
    }
  }

  return minDepartPrice + minReturnPrice
}

function pad(number) {
  if (number < 10) {
    return '0' + number
  }
  return number
}

function toDate(date) {
  return (date.getMonth() + 1) + '/' + pad(date.getDate())
}

