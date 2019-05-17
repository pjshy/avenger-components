function pickByCondition (condition, trueValue, falseValue = false) {
  return condition ? trueValue : falseValue
}

module.exports = {
  pickByCondition
}