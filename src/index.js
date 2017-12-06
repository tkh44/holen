import React from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'

function childrenToArray (children) {
  return Array.isArray && Array.isArray(children)
    ? children
    : [].concat(children)
}

export default class Holen extends React.Component {
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
    const {url, body, credentials, headers, method} = Object.assign(
      {},
      this.props,
      options
    )

    this.setState({fetching: true})

    const updateState = (error, response) => {
      this.setState(
        {
          data: response && response.data
            ? this.props.transformResponse(response.data)
            : undefined,
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
        if (this.willUnmount) {
          return
        }

        const bodyMethod = res[this.props.type]
        return bodyMethod.apply(res).then(data => {
          res.data = data
          return res
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

    const children = childrenToArray(this.props.children)
    return (
      children[0]({
        fetching: this.state.fetching,
        response: this.state.response,
        data: this.state.data,
        error: this.state.error,
        fetch: this.doFetch
      }) || null
    )
  }
}

Holen.propTypes = {
  body: PropTypes.any,
  children: PropTypes.func,
  credentials: PropTypes.string,
  headers: PropTypes.object,
  lazy: PropTypes.bool,
  method: PropTypes.oneOf([
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
  ]),
  onResponse: PropTypes.func,
  url: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['json', 'text', 'blob']),
  transformResponse: PropTypes.func
}

Holen.defaultProps = {
  method: 'get',
  type: 'json',
  onResponse: () => {},
  transformResponse: data => data
}
