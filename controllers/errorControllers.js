const errorController = {}

errorController.triggerError = (req, res, next) => {
  // intentionally throw an error to simulate server failure
  // you can also do: next(new Error('Intentional test error'))
  throw new Error("Intentional 500 test error")
}

module.exports = errorController
