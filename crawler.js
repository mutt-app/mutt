const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

const scripts = [
  'southwest',
  'skyscanner',
  'delta',
  'aviasales',
  'kayak',
  'airasia'
]
exports.scripts = scripts

exports.crawlAll = function crawlAll(subscription, onPrice, options = {}) {
  subscription.prevPrices = {...subscription.prices}
  subscription.prices = {}

  let i = 0
  for (let script of scripts) {
    setTimeout(() => crawl(subscription, script, onPrice, options),  i * 1000)
    i++
  }
}

exports.crawl = async function crawl(subscription, script, onPrice, options = {}) {
  console.log(`Starting crawling ${script} for subscription #${subscription.id} (${subscription.origin}→${subscription.destination}).`)

  options = {
    headless: true,
    close: true,
    ...options
  }

  const browser = await createBrowser({
    headless: options.headless,
    slowMo: 33
  })

  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  let price, err

  try {
    const fn = require('./scripts/' + script)
    price = await fn({browser, page, ...subscription})
  } catch (e) {
    err = e
  } finally {
    if (options.close) {
      browser.close()
    }
  }

  if (err) {
    console.error(`Error in "${script}": ${err}`)
    console.error(err.stack)
  } else {
    console.log(`Price from ${script} (${subscription.origin}→${subscription.destination}): $${price}`)
  }

  onPrice({
    script,
    price,
    id: subscription.id
  })
}

function createBrowser(options = {}) {
  return puppeteer.launch({
    ...options,
    executablePath: getChromiumExecPath()
  })
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked')
}
