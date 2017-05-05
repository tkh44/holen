/* eslint-env jest */
const Hapi = require('hapi')
const React = require('react')
const TestUtils = require('react-dom/test-utils')
const Holen = require('../index').default

describe('holen', () => {
  test('can render with no children', () => {
    TestUtils.renderIntoDocument(<Holen lazy url={'test'}/>)
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
          expect(data.message).toBe('hello')
        }
        ++runCount
        return <div />
      }

      TestUtils.renderIntoDocument(
        <Holen
          method={'get'}
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

  test('makes lazy request', done => {
    const server = new Hapi.Server()
    server.connection()

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => {
        return reply({message: 'hello'})
      }
    })

    const doFetch = (fetch) => setTimeout(fetch)

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
          lazy
          method={'get'}
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
})
