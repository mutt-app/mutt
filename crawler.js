const fs = require('fs')
const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

const scripts = [
  'southwest.com',
  'skyscanner.com',
  'delta.com',
  'aviasales.ru',
  'kayak.com',
  'airasia.com'
]
exports.scripts = scripts

exports.crawlAll = function crawlAll(subscription, onPrice, options = {}) {
  subscription.prevPrices = {...subscription.prices}
  subscription.prices = {}

  let i = 0
  for (let script of scripts) {
    setTimeout(() => crawl(subscription, script, onPrice, options), i * 1000)
    i++
  }
}

exports.crawl = async function crawl(subscription, script, onPrice, options = {}) {
  console.log(`Starting crawling ${script} for subscription #${subscription.id} (${subscription.origin}→${subscription.destination}).`)

  options = {
    headless: true,
    close: true,
    goto: false,
    ...options
  }

  let bin = getChromiumExecPath()
  if (options.goto) {
    const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    try {
      if (fs.existsSync(chrome)) {
        bin = chrome
      }
    } catch (err) {
      console.error(err)
    }
  }

  // NOTE: Demo only
  if (
    options.headless &&
    (
      subscription.origin.toUpperCase() === 'LAX' || subscription.origin.toUpperCase() === 'NYC'
    ) && (
      subscription.destination.toUpperCase() === 'LAX' || subscription.destination.toUpperCase() === 'NYC'
    )) {
    const fakePrices = {
      "southwest.com": 528,
      "skyscanner.com": 348,
      "aviasales.ru": 353,
      "delta.com": 433,
      "kayak.com": 332
    }

    const times = {
      "airasia.com": 21000,
      "southwest.com": 20000,
      "skyscanner.com": 44000,
      "aviasales.ru": 36000,
      "delta.com": 32000,
      "kayak.com": 50000,
    }

    setTimeout(() => {
      onPrice({
        script,
        price: fakePrices[script],
        id: subscription.id
      })
    }, times[script] || 40000 )

    return
  }
  // NOTE: Demo end

  const browser = await createBrowser({
    bin,
    slowMo: 33,
    headless: options.headless,
  })

  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  let price, err

  try {
    const fn = require('./scripts/' + script)
    price = await fn({browser, page, ...subscription, goto: options.goto})
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

  if (options.goto) {
    return
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
    executablePath: options['bin'] || getChromiumExecPath(),
  })
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked')
}
