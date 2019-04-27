const {delay, parsePrice} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate, goto}) => {
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')

  const departDateString = toISOString(departDate)
  const returnDateString = toISOString(returnDate)

  // Going to airasia
  await page.goto('https://www.airasia.com/en/gb')
  await delay(3000)

  await page.waitForSelector('#currDrop')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#currDrop')
  await delay(500)

  const currencies = await page.$$('span[class="lang-font-wg"]')
  for (let i = 0; i < currencies.length; i++) {
    let currency = await page.evaluate(
      strong => strong.innerText,
      currencies[i],
    )
    if (currency === 'USD') {
      currencies[i].click()
    }
  }
  await delay(500)

  const flightChoseButton = await page.$('.flex-item.ng-star-inserted.findflights.red')
  if (flightChoseButton !== null) {
    flightChoseButton.click()
  }
  await delay(1000)
  // Typing origin
  await page.waitForSelector('#home-origin-autocomplete-heatmap')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#home-origin-autocomplete-heatmap')
  await page.focus('#home-origin-autocomplete-heatmap')
  await page.keyboard.press('Backspace')
  await page.type('#home-origin-autocomplete-heatmap', origin)
  await delay(300)
  await page.keyboard.press('Tab')



  // Typing destination
  await page.waitForSelector('#home-destination-autocomplete-heatmap')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#home-destination-autocomplete-heatmap')
  await page.focus('#home-destination-autocomplete-heatmap')
  await page.keyboard.press('Backspace')
  await page.type('#home-destination-autocomplete-heatmap', destination)
  await delay(300)
  await page.keyboard.press('Tab')



  // Typing depart date in calendar
  await page.waitForSelector('#home-depart-date-heatmap')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#home-depart-date-heatmap')
  await page.focus('#home-depart-date-heatmap')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#home-depart-date-heatmap', departDateString)
  await delay(200)
  await page.keyboard.press('Tab')

  // Typing return date in calendar
  await page.waitForSelector('#home-return-date-heatmap')
  await delay(500)
  await page.evaluate((selector) => document.querySelector(selector).click(), '#home-return-date-heatmap')
  await page.focus('#home-return-date-heatmap')
  await page.keyboard.press('Backspace')
  await delay(200)
  await page.type('#home-return-date-heatmap', returnDateString)
  await delay(200)
  await page.keyboard.press('Tab')


  await page.waitForSelector('#home-flight-search-airasia-button-inner-button-select-flight-heatmap')
  await page.evaluate((selector) => document.querySelector(selector).click(), '#home-flight-search-airasia-button-inner-button-select-flight-heatmap')

  if (goto) {
    return
  }

  await page.waitForSelector('#select-bottom-booking-summary-airasia-button-inner-button-booking-summary-heatmap')
  await delay(10000)
  const priceElement = await page.$('div[class="amount-text"]')
  let val = await page.evaluate(
    span => span.innerText,
    priceElement,
  )

  return parseAirasiaPrice(val)
}


function toISOString(date) {
  return  pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear()
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function parseAirasiaPrice(price) {
  return parsePrice(price.split(".")[0])
}
