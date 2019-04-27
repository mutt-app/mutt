const {delay, parsePrice} = require('.')

module.exports = async ({page, origin, destination, departDate, returnDate, goto}) => {
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36')
  // Going to aviasales
  await page.goto('https://aviasales.ru/search/' + origin + toISOString(departDate) + destination + toISOString(returnDate) + '1')
  await delay(3000)

  const currencySwitcher = await page.$('span[class="currency-control__label-text"]')
  await currencySwitcher.click()
  await delay(200)

  const currencies = await page.$$('strong[class="currency-control__code"]')
  for (let i = 0; i < currencies.length; i++) {
    let currency = await page.evaluate(
      strong => strong.innerText,
      currencies[i],
    )
    if (currency === 'USD') {
      currencies[i].click()
    }
  }

  if (goto) {
    return
  }

  await delay(35000)
  const priceElement = await page.$('div[class="minimized-calendar-matrix__item is-current"] span[class="price --usd"]')
  let val = await page.evaluate(
    span => span.innerText,
    priceElement,
  )

  return parsePrice(val)
}

function pad(number) {
  if (number < 10) {
    return '0' + number
  }
  return number.toString()
}

function toISOString(date) {
  return (pad(date.getDate()) + pad(date.getMonth() + 1))
}
