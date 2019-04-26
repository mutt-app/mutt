const {delay, parsePrice} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate}) => {
  const departDateString = toISOString(departDate)
  const returnDateString = toISOString(returnDate)

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')
  await page.goto('https://www.kayak.com?mc=USD')

  // Typing origin
  await page.waitForSelector('div[id$="origin-airport-display-inner"')
  const originInput = await page.$('div[id$="origin-airport-display-inner"')
  await originInput.click()
  await page.keyboard.press('Backspace')
  await delay(200)
  await originInput.type(origin)
  await delay(800)
  await page.keyboard.press('Tab')
  await delay(200)

  // Typing destination
  await page.waitForSelector('div[id$="destination-airport-display-inner')
  await delay(500)
  const destinationInput = await page.$('div[id$="destination-airport-display-inner"')
  await destinationInput.click()
  await page.keyboard.press('Backspace')
  await delay(200)
  await destinationInput.type(destination)
  await delay(800)
  await page.keyboard.press('Tab')
  await delay(200)

  await page.waitForSelector('div[id$="dateRangeInput-display-start-inner')
  await delay(500)
  const departDateInput = await page.$('div[id$="dateRangeInput-display-start-inner"')
  await departDateInput.click()
  await delay(500)
  await page.keyboard.press('Backspace')
  await delay(200)
  await departDateInput.type(departDateString)
  await delay(800)
  await page.keyboard.press('Enter')
  await delay(200)

  await page.waitForSelector('div[id$="dateRangeInput-display-end-inner')
  await delay(500)
  const returnDateInput = await page.$('div[id$="dateRangeInput-display-end-inner"')
  await returnDateInput.click()
  await delay(500)
  await page.keyboard.press('Backspace')
  await delay(200)
  await returnDateInput.type(returnDateString)
  await delay(800)
  await page.keyboard.press('Enter')
  await delay(200)

  const comparedWithButton = await page.$('button[id$="compareTo-noneLink"]')
  await comparedWithButton.click()
  await delay(300)

  const searchButton = await page.$('div[id$="col-button-wrapper"]')
  await delay(500)
  await searchButton.click()

  await delay(30000)
  const prices = await page.$$('span[class^="price option-text"]')
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

function toISOString(date) {
  return ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())
}