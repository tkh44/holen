import {Component} from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'

export default class Holen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fetching: !props.lazy,
      response: undefined,
      data: undefined,
      error: undefined
    }

    this.doFetch = this.doFetch.bind(this)
  }

  componentDidMount () {
    if (this.props.lazy) {
      return
    }
    this.doFetch()
  }

  componentWillUnmount () {
    this.willUnmount = true
  }

  doFetch (options) {
    const {
      url,
      body,
      credentials,
      headers,
      method
    } = Object.assign({}, this.props, options)

    this.setState({fetching: true})

    const updateState = (error, response) => {
      this.setState(
        {
          data: response.data,
          error,
          fetching: false,
          response
        },
        () => {
          this.props.onResponse(error, response)
        }
      )
    }

    return fetch(url, {
      body,
      credentials,
      headers,
      method
    })
      .then(res => {
        return res
          .json()
          .then(data => {
            res.data = data
            return res
          })
          .catch(e => {
            updateState(e, undefined, res)
            return e
          })
      })
      .then(res => {
        updateState(undefined, res)
        return res
      })
      .catch(e => {
        updateState(e, undefined)
        return e
      })
  }

  render () {
    if (!this.props.children) {
      return null
    }
    return this.props.children({
      fetching: this.state.fetching,
      response: this.state.response,
      data: this.state.data,
      error: this.state.error,
      fetch: this.doFetch
    }) || null
  }
}

Holen.propTypes = {
  body: PropTypes.any,
  children: PropTypes.func,
  credentials: PropTypes.string,
  headers: PropTypes.object,
  lazy: PropTypes.bool,
  method: PropTypes.oneOf(['get', 'post', 'put', 'delete']),
  onResponse: PropTypes.func,
  url: PropTypes.string.isRequired
}

Holen.defaultProps = {
  method: 'get'
}
