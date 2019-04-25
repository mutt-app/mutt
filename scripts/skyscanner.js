const puppeteer = require('puppeteer');


(async () => {
  const screenshot = 'skyscanner.png'
  try {

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1280,
        height: 800
      },
    })
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36")

    // Going to scyscanner
    await page.goto('https://skyscanner.com?currency=USD&market=US&locale=en-US')

    // Typing origin
    await page.waitForSelector('#fsc-origin-search')
    await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-origin-search')
    await page.type('#fsc-origin-search', 'HKT')
    await page.keyboard.press('Tab')

    // Typing destination
    await page.waitForSelector('#fsc-destination-search')
    await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-destination-search')
    await page.type('#fsc-destination-search', 'MOW')
    await page.keyboard.press('Tab')


    // Opening calendar
    await page.evaluate((selector) => document.querySelector(selector).click(), '#depart-fsc-datepicker-button')
    await page.screenshot({
      path: 'skyscanner.png'
    })
    await page.waitForSelector('#depart-calendar__bpk_calendar_nav_select')

    await page.select('#depart-calendar__bpk_calendar_nav_select', '2019-05')


    await page.screenshot({
      path: 'skyscanner1.png'
    })
    await browser.close()
    console.log('See screenshot: ' + screenshot)

  } catch (err) {
    console.error(err)
  }
})()