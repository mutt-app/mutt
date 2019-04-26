/**
 * @param {number} time
 * @returns {Promise<any>}
 */
exports.delay = function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

/**
 *
 * @param price
 * @returns {number}
 */
exports.parsePrice = function parsePrice(price) {
  const s = `${price}`.replace(/\D/g, '')
  return parseInt(s)
}
