/* eslint-env jest */
import Holen from '../index'
const Hapi = require('hapi')
const React = require('react')
const TestUtils = require('react-dom/test-utils')

describe('holen', () => {
  test('can render with no children', () => {
    TestUtils.renderIntoDocument(<Holen lazy url={'test'} />)
  })

  test('makes request on mount', done => {
    const server = new Hapi.Server()
    server.connection()

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => {
        return reply({message: 'hello'})
      }
    })

    server.start(err => {
      expect(err).toBeUndefined()
      let runCount = 0

      const renderCb = ({data, fetching, fetch, error}) => {
        expect(error).toBeUndefined()
        expect(fetch).toBeInstanceOf(Function)
        expect(fetching).toBe(runCount < 2)

        if (data) {
          expect(data.message).toBe('hello1')
        }
        ++runCount
        return <div />
      }

      TestUtils.renderIntoDocument(
        <Holen
          method={'get'}
          onResponse={(err, res) => {
            expect(err).toBeUndefined()
            expect(res.data.message).toBe('hello1')
            expect(res.ok).toBe(true)
            server.stop(done)
          }}
          transformResponse={(data) => {
            data.message += '1'
            return data
          }}
          url={'http://localhost:' + server.connections[0].info.port}
        >
          {renderCb}
        </Holen>
      )
    })
  })

  test('makes lazy request', done => {
    const server = new Hapi.Server()
    server.connection()

    server.route({
      method: 'POST',
      path: '/',
      handler: (request, reply) => {
        expect(request.headers).toHaveProperty(
          'test-header',
          'yes this is a test'
        )
        return reply(request.payload)
      }
    })

    server.start(err => {
      expect(err).toBeUndefined()
      let runCount = 0

      const renderCb = ({data, fetching, fetch, error}) => {
        expect(error).toBeUndefined()
        expect(fetching).toBe(runCount === 1)

        if (data) {
          expect(data.message).toBe('hello')
        }
        if (runCount === 0) {
          setTimeout(() => {
            fetch()
          })
        }

        ++runCount
        return <div />
      }

      TestUtils.renderIntoDocument(
        <Holen
          body={JSON.stringify({message: 'hello'})}
          headers={{
            'test-header': 'yes this is a test'
          }}
          lazy
          method={'post'}
          onResponse={(err, res) => {
            expect(err).toBeUndefined()
            expect(res.data.message).toBe('hello')
            expect(res.ok).toBe(true)
            server.stop(done)
          }}
          url={'http://localhost:' + server.connections[0].info.port}
        >
          {renderCb}
        </Holen>
      )
    })
  })

  test('handles request error', done => {
    const server = new Hapi.Server()
    server.connection()

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => {
        return reply('something')
      }
    })

    server.start(err => {
      expect(err).toBeUndefined()
      let runCount = 0

      const renderCb = ({data, fetching, fetch, error}) => {
        if (runCount === 2) {
          expect(error).toBeDefined()
        }

        ++runCount
        return <div />
      }

      TestUtils.renderIntoDocument(
        <Holen
          onResponse={err => {
            expect(err).toBeDefined()
            server.stop(done)
          }}
          url={'http://localaaaaaahost'}
        >
          {renderCb}
        </Holen>
      )
    })
  })

  test('handles json parse error', done => {
    const server = new Hapi.Server()
    server.connection()

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => {
        return reply('something')
      }
    })

    server.start(err => {
      expect(err).toBeUndefined()
      let runCount = 0

      const renderCb = ({data, fetching, fetch, error}) => {
        if (runCount === 2) {
          expect(error).toBeDefined()
        }

        ++runCount
        return <div />
      }

      TestUtils.renderIntoDocument(
        <Holen
          onResponse={() => {
            server.stop(done)
          }}
          url={'http://localhost:' + server.connections[0].info.port}
        >
          {renderCb}
        </Holen>
      )
    })
  })
})
