/*
 * `componentListeners` is our storage for the functions that will work
 * as handler for the three callbacks. This is going to change completely in
 * your implementation: in the Web Storage adapter, this information is
 * stored as callbacks to window.onstorage.
 *
 * In this implementation I took the approach of structuring the listeners
 * in a simple tree. For example, if all the listeners for the Dialog would be
 * setup, the `componentListeners` object would look like:
 *
 * {
 *   Dialog: {
 *     setupUnmountListener: () => { ... },
 *     onRender: () => { ... },
 *     handlers: {
 *       onClick: () => { ... }
 *     }
 *   }
 * }
 */
const componentListeners = {}

export default {

  scatter: {
    unmount: (componentName) =>
    componentListeners[componentName].setupUnmountListener(),

    render: (componentName, dataProps, handlerNames) =>
    componentListeners[componentName].onRender(dataProps, handlerNames),

    addHandlerListener: (componentName, handlerName, callback) => {
      componentListeners[componentName] = componentListeners[componentName] || {
        handlers: {}
      }

      componentListeners[componentName].handlers[handlerName] = (...args) =>
      callback(...args)

      return () =>
      componentListeners[componentName].handlers[handlerName] = undefined
    },
  },

  materialize: {
    setupUnmountListener: (componentName, callback) => {
      componentListeners[componentName] = componentListeners[componentName] || {
        handlers: {}
      }

      componentListeners[componentName].onRender = (dataProps, handlerNames) =>
      callback(dataProps, handlerNames)

      return () =>
      componentListeners[componentName].handlers[handlerName] = undefined
    },

    setupRenderListener: (componentName, callback) => {
      
    }
  }
}
