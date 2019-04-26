// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra")

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

function createBrowser(options = {}) {
  return puppeteer.launch({
    ...options,
    executablePath: getChromiumExecPath()
  });
}

// puppeteer usage as normal
createBrowser({headless: false, slowMo: 20}).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  const screenshot = 'skyscanner.png'
  const departDate = '2019-05-13'
  const returnDate = '2019-05-17'

  // Going to scyscanner
  await page.goto('https://skyscanner.com?currency=USD&market=US&locale=en-US')


  await delay(1000)
  // Typing origin
  await page.waitForSelector('#fsc-origin-search')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-origin-search')
  await page.focus('#fsc-origin-search')
  await page.keyboard.press('Backspace')
  await page.type('#fsc-origin-search', 'HKT')
  await page.keyboard.press('Tab')

  // Typing destination
  await page.waitForSelector('#fsc-destination-search')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-destination-search')
  await page.focus('#fsc-destination-search')
  await page.keyboard.press('Backspace')
  await page.type('#fsc-destination-search', 'MOW')
  await page.keyboard.press('Tab')


  // Choosing first segment
  // Opening calendar
  await page.evaluate((selector) => document.querySelector(selector).click(), '#depart-fsc-datepicker-button')
  await page.waitForSelector('#depart-calendar__bpk_calendar_nav_select')

  // Cut first 0 from depart day
  let departDay = departDate.substr(8, 2)
  if (departDay.substr(0, 1) === '0') {
    departDay = departDay.substr(1, 1)
  }

  // Select correct month/year  in calendar
  await page.select('#depart-calendar__bpk_calendar_nav_select', departDate.substr(0, 7))

  // Select correct day in calendar
  const dates = await page.$$('button[class^="bpk-calendar-date_bpk-calendar-date"]')
  for (let i = 0; i < dates.length; i++) {
    let className = await page.evaluate(
      date => date.getAttribute('class'),
      dates[i],
    )

    if (className.includes("outside") || className.includes("blocked")) {
      continue
    }

    let buttonSpan = await dates[i].$('span')
    let val = await page.evaluate(
      span => span.innerText,
      buttonSpan,
    )

    if (val === departDay) {
      dates[i].click()
    }
  }

  if (returnDate !== '') {
    // Choosing second segment
    // Opening calendar
    await page.evaluate((selector) => document.querySelector(selector).click(), '#return-fsc-datepicker-button')
    await page.waitForSelector('#return-calendar__bpk_calendar_nav_select')

    // Cut first 0 from depart day
    let returnDay = returnDate.substr(8, 2)
    if (returnDay.substr(0, 1) === '0') {
      returnDay = departDay.substr(1, 1)
    }

    // Select correct month/year  in calendar
    await page.select('#return-calendar__bpk_calendar_nav_select', returnDate.substr(0, 7))

    // Select correct day in calendar
    const dates = await page.$$('button[class^="bpk-calendar-date_bpk-calendar-date"]')
    for (let i = 0; i < dates.length; i++) {
      let className = await page.evaluate(
        date => date.getAttribute('class'),
        dates[i],
      )

      if (className.includes("outside") || className.includes("blocked")) {
        continue
      }

      let buttonSpan = await dates[i].$('span')
      let val = await page.evaluate(
        span => span.innerText,
        buttonSpan,
      )

      if (val === returnDay) {
        dates[i].click()
      }
    }
  }

  const buttons = await page.$$('button[class^="bpk-button_bpk-button"]')
  for (let i = 0; i < buttons.length; i++) {
    let ariaLabel = await page.evaluate(
      button => button.getAttribute('aria-label'),
      buttons[i],
    )

    if (ariaLabel !== null && ariaLabel.toString() === 'Search flights') {
      buttons[i].click()
    }
  }

  await delay(10000)
  const cheapestPriceElement = await page.$('[data-tab="price"] .fqs-price')
  const price = await (await cheapestPriceElement.getProperty('textContent')).jsonValue()

  console.log(price)
  await browser.close()
})


function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}