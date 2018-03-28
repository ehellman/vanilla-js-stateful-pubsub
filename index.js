/**
 *
 *
 * @class Feeder
 */
class Feeder {
  constructor() {
    this.subscribers = []
    this.dispatch = action => {
      if (Object.prototype.toString.call(action) === '[object Function]') {
        action(this.dispatch)
      } else {
        this.subscribers.forEach(feed => feed(action))
      }
    }
    this.subscribe = handler => {
      this.subscribers.push(handler)
    }
    this.getSubscribers = () => this.subscribers
  }
}

/**
 *
 *
 * @class ViewModel
 */
class ViewModel {
  constructor(initialState = {}) {
    this.state = initialState
    this.prevState = {}
    this.resetState = () => {
      this.prevState = this.state
      this.state = {}
    }
    this.getState = () => this.state
    this.setState = newState => {
      this.prevState = this.state
      this.state = {
        ...this.state,
        ...newState,
      }
    }
  }
}

window.feeder = new Feeder()

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * featureExample: Feature
 *
 * @param {any} fetcher
 * @param {any} feed
 * @param {any} [initialData={}]
 * @returns
 */
function featureExample(
  fetcher, // inject fetch logic, allows you to write tests for your feature
  feed,
  initialData = {}, // initialize with data object
) {
  let viewModel = new ViewModel(initialData)

  console.log('mounted with', viewModel.getState())

  feed.subscribe(action => {
    switch (action.type) {
      case 'INFLATE_SERVER':
        viewModel.setState(action.payload.viewModel)
        console.log('inflated feature', viewModel.getState())
      default:
        break
    }
  })
  return viewModel
}

/**
 * Initialize Application
 */
;(function() {
  /**
   * List of features to map against
   */
  const features = {
    featureExample: featureExample,
  }
  const init = feature =>
    features[feature](window.fetch, feeder, window.__SERVER_STATE__.viewModel)
  init(window.__SERVER_STATE__.feature)

  /**
   * On page load, inflate application with server data
   */
  document.addEventListener(
    'load',
    feeder.dispatch({
      type: 'INFLATE_SERVER',
      payload: window.__SERVER_STATE__,
    }),
  )
})()
