import adapter from './index'
import { deepEqual, equal, ok } from 'assert'

describe('React Entaglement Adapter boilerplate', () => {
  describe('for <Scatter>', () => {
    describe('unmount (componentName)', () => {
      it('sends a message to remove the component from the remote')
    })

    describe('render (componentName, dataProps, handlerNames)', () => {
      it('sends a message with the data props and handlerNames for the component')
    })

    describe('addHandlerListener', () => {
      it('sets up a listener for some kind of event that represents a call to a handler')

      it('returns a function to unset the listener')

      describe('listener', () => {
        it('runs the callback with the args from the event data', () => {
          const listener = windowStub.addEventListener['storage']

          listener({
            key: 'app:handle:component:onTouch',
            newValue: JSON.stringify({
              args: { the: 'args' }
            })
          })

          deepEqual(handler.args, { the: 'args' })
        })
        })
      })
    })
  })

  describe('for <Materialize>', () => {
    describe('setupUnmountListener', () => {
      const storageStub = getStorageStub()
      const windowStub = getWindowStub()
      const theAdapter = adapter('app', storageStub, windowStub)
      const handler = function self () { self.called = true }

      const deListener = theAdapter.setupUnmountListener('component', handler)

      it('sets up a listener', () => {
        ok(typeof windowStub.addEventListener['storage'] === 'function')
      })

      it('returns a function to unset the listener', () => {
        equal(windowStub.removeEventListener['storage'], undefined)

        deListener()

        equal(
          windowStub.removeEventListener['storage'],
          windowStub.addEventListener['storage']
        )
      })

      describe('listener', () => {
        describe('if key matches component render and there is no value in storage for it', () => {
          it('runs the callback', () => {
            const listener = windowStub.addEventListener['storage']

            listener({
              key: 'app:render:component',
              newValue: null
            })

            ok(handler.called)
          })
        })
      })
    })

    describe('onRender', () => {
      const storageStub = getStorageStub()
      const windowStub = getWindowStub()
      const theAdapter = adapter('app', storageStub, windowStub)
      const handler = function self (data, handlerNames) {
        self.data = data
        self.handlerNames = handlerNames
      }

      const deListener = theAdapter.onRender('component', handler)

      it('sets up a listener', () => {
        ok(typeof windowStub.addEventListener['storage'] === 'function')
      })

      it('returns a function to unset the listener', () => {
        equal(windowStub.removeEventListener['storage'], undefined)

        deListener()

        equal(
          windowStub.removeEventListener['storage'],
          windowStub.addEventListener['storage']
        )
      })

      describe('if there is a record for rendering this component in storage', () => {
        const storageStub = getStorageStub({
          'app:render:component': JSON.stringify({
            data: { the: 'data' },
            handlerNames: { the: 'handlerNames' }
          })
        })
        const windowStub = getWindowStub()
        const theAdapter = adapter('app', storageStub, windowStub)
        const handler = function self (data, handlerNames) {
          self.data = data
          self.handlerNames = handlerNames
        }

        theAdapter.onRender('component', handler)

        it('runs the callback with data and handlerNames from storage', () => {
          deepEqual(handler.data, { the: 'data' })
          deepEqual(handler.handlerNames, { the: 'handlerNames' })
        })
      })

      describe('listener', () => {
        describe('if key matches component render and there is data in the event for it', () => {
          it('runs the callback with data and handlerNames from the event', () => {
            const listener = windowStub.addEventListener['storage']

            listener({
              key: 'app:render:component',
              newValue: JSON.stringify({
                data: { the: 'data' },
                handlerNames: { the: 'handlerNames' }
              })
            })

            deepEqual(handler.data, { the: 'data' })
            deepEqual(handler.handlerNames, { the: 'handlerNames' })
          })
        })
      })
    })

    describe('handle', () => {
      const storageStub = getStorageStub()
      const windowStub = getWindowStub()
      const theAdapter = adapter('other-app', storageStub, windowStub)

      it('sets the storage for the component with handle and the handlerName as key and the args and current timestamp as values', () => {
        const args = { the: 'args' }
        const timestamp = (new Date()).getTime()
        theAdapter.handle('new-component', 'onTouch', args)

        const parsedData = JSON.parse(storageStub.setItem['other-app:handle:new-component:onTouch'])

        deepEqual(parsedData.args, args)
        ok(parsedData.time > timestamp - 5 && parsedData.time < timestamp + 5)
      })
    })
  })
})
