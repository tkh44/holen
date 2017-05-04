/* eslint-env jest */
const Hapi = require('hapi')
const React = require('react')
const TestUtils = require('react-dom/test-utils')
const Holen = require('../index').default

describe('holen', () => {
  describe('Request', () => {
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

    //   test('makes request on on demand (lazy)', done => {
    //     const server = new Hapi.Server()
    //     server.connection()
    //
    //     server.register({register: Nes, options: {auth: false}}, err => {
    //       expect(err).toNotExist()
    //       expect(server).toExist()
    //
    //       server.route({
    //         method: 'GET',
    //         path: '/',
    //         handler: (request, reply) => reply('hello')
    //       })
    //
    //       server.start(err => {
    //         expect(err).toNotExist()
    //
    //         const client = new Nes.Client(
    //           'http://localhost:' + server.connections[0].info.port
    //         )
    //         let runCount = 0
    //
    //         const connectRenderCb = ({connecting, connected, error}) => {
    //           if (!connected) return null
    //
    //           return h(
    //             Request,
    //             {
    //               lazy: true,
    //               path: '/',
    //               method: 'GET',
    //               onResponse: (err, payload, statusCode, headers) => {
    //                 expect(err).toNotExist()
    //                 expect(payload).toBe('hello')
    //                 expect(statusCode).toBe(200)
    //                 expect(headers).toNotExist()
    //                 client.disconnect()
    //                 server.stop(done)
    //               }
    //             },
    //             ({
    //               fetching,
    //               payload,
    //               error,
    //               statusCode,
    //               headers,
    //               request
    //             }) => {
    //               expect(error).toNotExist()
    //               expect(request).toBeA('function')
    //               expect(fetching).toBe(runCount === 1)
    //
    //               if (payload) {
    //                 expect(runCount).toBe(2)
    //                 expect(payload).toBe('hello')
    //                 expect(statusCode).toBe(200)
    //               }
    //
    //               if (runCount === 0) {
    //                 setTimeout(() => {
    //                   request()
    //                 })
    //               }
    //               ++runCount
    //               return h(Child)
    //             }
    //           )
    //         }
    //
    //         TestUtils.renderIntoDocument(
    //           h(ClientProvider, {client}, h(Connect, {}, connectRenderCb))
    //         )
    //       })
    //     })
    //   })
    //
    //   test('makes new request when props change', done => {
    //     const server = new Hapi.Server()
    //     server.connection()
    //
    //     server.register({register: Nes, options: {auth: false}}, err => {
    //       expect(err).toNotExist()
    //       expect(server).toExist()
    //
    //       server.route({
    //         method: 'GET',
    //         path: '/',
    //         handler: (request, reply) => reply('hello')
    //       })
    //
    //       server.route({
    //         method: 'GET',
    //         path: '/1',
    //         handler: (request, reply) => reply('goodbye')
    //       })
    //
    //       server.start(err => {
    //         expect(err).toNotExist()
    //
    //         const client = new Nes.Client(
    //           'http://localhost:' + server.connections[0].info.port
    //         )
    //
    //         class Parent extends Component {
    //           constructor (props) {
    //             super(props)
    //             this.state = {path: '/'}
    //           }
    //
    //           componentDidMount () {
    //             setTimeout(
    //               () => {
    //                 this.setState({path: '/1'})
    //               },
    //               50
    //             )
    //           }
    //
    //           render () {
    //             if (!this.props.connected) {
    //               return null
    //             }
    //
    //             return h(
    //               Request,
    //               {
    //                 lazy: false,
    //                 path: this.state.path,
    //                 method: 'GET',
    //                 onResponse: (err, payload, statusCode, headers) => {
    //                   expect(err).toNotExist()
    //                   expect(statusCode).toBe(200)
    //
    //                   if (payload === 'goodbye') {
    //                     client.disconnect()
    //                     server.stop(done)
    //                   }
    //                 }
    //               },
    //               ({
    //                 fetching,
    //                 payload,
    //                 error,
    //                 statusCode,
    //                 headers,
    //                 request
    //               }) => {
    //                 expect(error).toNotExist()
    //                 expect(request).toBeA('function')
    //                 expect(fetching).toBe(runCount === 1 || runCount === 4)
    //
    //                 if (runCount === 2) {
    //                   expect(payload).toBe('hello')
    //                   expect(statusCode).toBe(200)
    //                 }
    //
    //                 if (runCount === 5) {
    //                   expect(payload).toBe('goodbye')
    //                   expect(statusCode).toBe(200)
    //                 }
    //
    //                 ++runCount
    //                 return h(Child)
    //               }
    //             )
    //           }
    //         }
    //
    //         let runCount = 0
    //
    //         const connectRenderCb = ({connecting, connected, error}) => {
    //           if (!connected) return null
    //
    //           return h(Parent, {connected})
    //         }
    //
    //         TestUtils.renderIntoDocument(
    //           h(ClientProvider, {client}, h(Connect, {}, connectRenderCb))
    //         )
    //       })
    //     })
    //   })
  })
})
