// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra")

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())

// puppeteer usage as normal
puppeteer.launch({ headless: false, slowMo: 33 }).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  const departDate = '2019-05-13'
  const returnDate = '2019-05-17'
  const screenshot = 'south-west.png'

  // Going to scyscanner
  await page.goto('https://www.southwest.com/')

  // Typing origin
  await page.waitForSelector('#LandingPageAirSearchForm_originationAirportCode')
  await delay(1000)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_originationAirportCode')
  await page.focus('#LandingPageAirSearchForm_originationAirportCode')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_originationAirportCode', 'NYC', 200)
  await delay(200)
  await page.keyboard.press('Tab')


  ///#LandingPageAirSearchForm_destinationAirportCode
  await page.waitForSelector('#LandingPageAirSearchForm_destinationAirportCode')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#LandingPageAirSearchForm_destinationAirportCode')
  await page.focus('#LandingPageAirSearchForm_destinationAirportCode')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#LandingPageAirSearchForm_destinationAirportCode', 'LAX', 200)
  await delay(200)
  await page.keyboard.press('Tab')

  await delay(1000)
  await page.screenshot({
    path: screenshot
  })
})


function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}