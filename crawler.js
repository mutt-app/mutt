const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

const scripts = [
  'southwest',
  'skyscanner',
  'delta',
]

exports.crawlAll = function crawlAll(subscription, onPrice, options = {}) {
    for (let script of scripts) {
      crawl(subscription, script, onPrice, options)
    }
}

async function crawl(subscription, script, onPrice, options = {}) {
  console.log(`Starting crawling ${script} for subscription #${subscription.id} (${subscription.origin}→${subscription.destination}).`)

  options = {
    headless: true,
    ...options
  }

  const browser = await createBrowser({
    headless: options.headless,
    slowMo: 33
  })

  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  let price = undefined

  try {
    const fn = require('./scripts/' + script)
    price = await fn({browser, page, ...subscription})
  } catch (e) {
    console.error(`Error in ${script}!`)
    throw e
  } finally {
    browser.close()
  }

  console.log(`Price from ${script} (${subscription.origin}→${subscription.destination}): $${price}`)
  onPrice({script, price, id: subscription.id})
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
