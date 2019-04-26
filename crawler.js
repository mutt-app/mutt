const puppeteer = require('puppeteer-extra')
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

const scripts = [
  'southwest',
  'skyscanner',
  'delta',
]
const subscriptions = [{
  origin: 'NYC',
  destination: 'LAX',
  departDate: new Date('2019-05-13'),
  returnDate: new Date('2019-05-17'),
}]

void async function main() {
  for (let subscription of subscriptions) {
    for (let script of scripts) {
      crawl(subscription, script)
    }
  }
}()

async function crawl(subscription, script) {
  const browser = await createBrowser({
    headless: false,
    slowMo: 33
  })

  const page = await browser.newPage()
  await page.setViewport({width: 1180, height: 1000})

  let price = undefined

  try {
    const fn = require('./scripts/' + script)
    price = await fn({browser, page, ...subscription})
  } catch (e) {
    throw e
  } finally {
    browser.close()
  }

  console.log(script, price)
}

function createBrowser(options = {}) {
  return puppeteer.launch({
    ...options,
    executablePath: getChromiumExecPath()
  });
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}
