const {delay, parsePrice} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate}) => {
  const departDateString = toISOString(departDate)
  const returnDateString = toISOString(returnDate)
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')

  // Going to scyscanner
  await page.goto('https://skyscanner.com?currency=USD&market=US&locale=en-US')


  await delay(1000)
  // Typing origin
  await page.waitForSelector('#fsc-origin-search')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-origin-search')
  await page.focus('#fsc-origin-search')
  await page.keyboard.press('Backspace')
  await page.type('#fsc-origin-search', origin)
  await page.keyboard.press('Tab')

  // Typing destination
  await page.waitForSelector('#fsc-destination-search')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#fsc-destination-search')
  await page.focus('#fsc-destination-search')
  await page.keyboard.press('Backspace')
  await page.type('#fsc-destination-search', destination)
  await page.keyboard.press('Tab')


  // Choosing first segment
  // Opening calendar
  await page.evaluate((selector) => document.querySelector(selector).click(), '#depart-fsc-datepicker-button')
  await page.waitForSelector('#depart-calendar__bpk_calendar_nav_select')

  // Cut first 0 from depart day
  let departDay = departDateString.substr(8, 2)
  if (departDay.substr(0, 1) === '0') {
    departDay = departDay.substr(1, 1)
  }

  // Select correct month/year  in calendar
  await page.select('#depart-calendar__bpk_calendar_nav_select', departDateString.substr(0, 7))

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

  if (returnDateString !== '') {
    // Choosing second segment
    // Opening calendar
    await page.evaluate((selector) => document.querySelector(selector).click(), '#return-fsc-datepicker-button')
    await page.waitForSelector('#return-calendar__bpk_calendar_nav_select')

    // Cut first 0 from depart day
    let returnDay = returnDateString.substr(8, 2)
    if (returnDay.substr(0, 1) === '0') {
      returnDay = departDay.substr(1, 1)
    }

    // Select correct month/year  in calendar
    await page.select('#return-calendar__bpk_calendar_nav_select', returnDateString.substr(0, 7))

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

  return parsePrice(price)
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function toISOString(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}
