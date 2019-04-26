// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra")

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())

// puppeteer usage as normal
puppeteer.launch({ headless: false, slowMo: 33 }).then(async browser => {
  const page = await browser.newPage()
  // TODO: make width/height random 1000-1200
  await page.setViewport({width: 1180, height: 1080})
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
  await page.type('#LandingPageAirSearchForm_originationAirportCode', 'NYC')
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
  await page.type('#LandingPageAirSearchForm_destinationAirportCode', 'LAX')
  await delay(200)
  await page.keyboard.press('Tab')



  // Typing depart date in calendar
  await page.waitForSelector('#LandingPageAirSearchForm_departureDate')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_departureDate')
  await page.focus('#LandingPageAirSearchForm_departureDate')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_departureDate', '5/12')
  await delay(200)
  await page.keyboard.press('Tab')

  // Typing return date in calendar
  await page.waitForSelector('#LandingPageAirSearchForm_returnDate')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_returnDate')
  await page.focus('#LandingPageAirSearchForm_returnDate')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_returnDate', '6/01')
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
  const departPrices = await page.$$('div[id^="air-booking-fares-0"] .fare-button_primary-yellow .fare-button--value-total')
  for (let i = 0; i < departPrices.length; i++) {
    let val = await page.evaluate(
      span => span.innerText,
      departPrices[i],
    )
    let price = parseInt(val)
    if (minDepartPrice === 0 || minDepartPrice > price){
      minDepartPrice = price
    }
  }

  let minReturnPrice = 0
  const returnPrices = await page.$$('div[id^="air-booking-fares-1"] .fare-button_primary-yellow .fare-button--value-total')
  for (let i = 0; i < returnPrices.length; i++) {
    let val = await page.evaluate(
      span => span.innerText,
      returnPrices[i],
    )

    let price = parseInt(val)
    if (minReturnPrice === 0 || minReturnPrice > price){
      minReturnPrice = price
    }
  }

  console.log(minDepartPrice + minReturnPrice)
  await browser.close()
  return minDepartPrice + minReturnPrice
})


function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}