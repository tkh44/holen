import {Component} from 'react'
import PropTypes from 'prop-types'
import fetch from 'unfetch'

function checkStatus (res) {
  if (res.ok) {
    return res
  } else {
    const error = new Error(res.statusText)
    error.response = res
    return Promise.reject(error)
  }
}

export default class Holen extends Component {
  static propTypes = {
    body: PropTypes.any,
    children: PropTypes.func,
    credentials: PropTypes.string,
    data: PropTypes.object,
    headers: PropTypes.object,
    lazy: PropTypes.bool,
    method: PropTypes.oneOf(['get', 'post', 'put', 'delete']),
    onData: PropTypes.func,
    onError: PropTypes.func,
    onResponse: PropTypes.func,
    url: PropTypes.string.isRequired
  };

  static defaultProps = {method: 'get'};

  state = {
    fetching: !this.props.lazy,
    response: null,
    data: null,
    error: null
  };

  componentDidMount () {
    if (this.props.lazy) {
      return
    }
    this.fetch(this.props)
  }

  componentWillUnmount () {
    this.willUnmount = true
  }

  fetch = options => {
    const {
      url,
      body,
      credentials,
      headers,
      method
    } = Object.assign({}, this.props, options)

    this.setState({fetching: true}, () => {
      fetch(url, {
        body,
        credentials,
        headers,
        method
      })
        .then(checkStatus)
        .then(r => r.json().then(d => {
          r.data = d
          return r
        }))
        .then(response => {
          if (this.willUnmount) {
            return
          }
          this.setState(
            {
              data: response.data,
              fetching: false,
              response: {
                ...response,
                data: response.body
              }
            },
            () => {
              if (this.props.onResponse) {
                this.props.onResponse(null, this.state.response)
              }
              if (this.props.onData) {
                this.props.onData(this.state.data)
              }
            }
          )
        })
        .catch(error => {
          if (this.willUnmount) {
            return
          }
          this.setState(
            {
              fetching: false,
              response: error.response,
              error
            },
            () => {
              if (this.props.onResponse) {
                this.props.onResponse(this.state.response)
              }
              if (this.props.onError) {
                this.props.onError(this.state.error)
              }
            }
          )
        })
    })
  };

  render () {
    if (!this.props.children) {
      return null
    }
    return this.props.children({
      fetching: this.state.fetching,
      response: this.state.response,
      data: this.state.response.data,
      error: this.state.error,
      fetch: this.fetch
    }) || null
  }
}
