# adapter-boilerplate

A React Entanglement Adapter is the glue that actually connects the `<Scatter>` and `<Materialize>` React components. By themselves, the components only provide a normalized interface to communicate React lifecycle and handler events to the Adapter, which is where the magic happens. Adapters can provide very different channels of communication, such as [`WebStorage`](https://github.com/react-entanglement/web-storage-adapter), `postMessage` or more.

Adapters need, consequently, to conform to that interface. This repo provides a working implementation of a very simple adapter along with a flowtype definition of an adapter type and a unit test skeleton for writing one. Just fork this repo, run `npm install` and hack away.

To see the provided live example, run `npm start` and go to `http://localhost:3000/example`

## Breakdown of an adapter

An adapter object has the properties `scatter` and `materialize`.

The `scatter` object has three methods to deal with the setup of the `<Scatter>` component. Correspondingly, the `materialize` object is to be used by `<Materialize>`. The decision was made to bundle them together even if one is going to be used in each side because it makes the user facing API simpler.

> This breakdown guide references the [src/example](src/example) several times. You can read the source code to follow along with it.

### `scatter.unmount`

Signature: `(componentName: string) => void`

Unmount is called whenever React tells the Scatter component to unmount (`componentWillUnmount`). It receives the component name (such as `Dialog` for example). The purpose of the unmount function in the adapter is to send the message (in whatever form it might be) to the other side that the corresponding component should be unmounted.

The `unmount` function is not expected to return anything.

### `scatter.render`

Signature: `(componentName: string, dataProps: { [key: string]: any }, handlerNames: Array<String>) => void`

The Scatter component calls the `render` method of the adapter whenever React says that the component was mounted or updated (`componentDidMount`, `componentDidUpdate`).

The arguments represent:

1. `componentName`: The name of the component, `Dialog` in the example
2. `dataProps`: The props to be sent to the component, but only the ones
 that have serializable values, not functions. In the example it would be `{ items: ['one', 'two', 'three'] }`
3. `handlerNames`: An array with the name of the handlers, that is, props that have functions as values, such as `onClick`.

`render` is not expected to return anything.

#### `scatter.addHandlerListener`

Signature: `(componentName: string, handlerName: string, callback: (args: Array<any>)) => () => void`

Whenever React tells the Scatter that it will update or mount, the Scatter components calls `addHandlerListener` for each of the handlers that it finds in the props (handlers being props with function as values).

`addHandlerListener` is used to setup listeners for each of those handlers to be called when the handler is executed in the remote materialized component. So, following the example with the Dialog example, when the Scatter component is told to mount, it will find the handler `onClick` and call `addHandlerListener` with the component name, the handler name, and a callback function which is a wrapper around the actual function passed as prop to Scatter.

It is up to you to store that callback in a place that can be called whenever the `Materialize` component `onClick` is called (which will in turn trigger `handle` in the adapter). For example, the callback can be setup to run when a postMessage event is received, with the data parsed from postMessage.

`addHandlerListener` should return a function that, when called, will remove the listener. That is so that the Scatter component can clean up all listeners from memory when React tells it to unmount. That function is not expected to return anything.

### `materialize.setupUnmountListener`

Signature: `(componentName: string, callback: () => void) => () => void`

`setupUnmountListener` is called immediately when the `Materialize` component is mounted. It is called the component name and a callback as arguments, and it is expected to setup a listener somewhere that is triggered whenever the Scatter sends an `unmount` command. That command could be received via `postMessage`, `WebStorage`, etc.

The return value of the `setupUnmountListener` function should be a function that, when called, removes the listener. This way the `Materialize` component can remove all listeners from memory before it unmounts.


## Flowtype signature of an adapter

```javascript
// @flow
type DataProps = {
  [key: string]: any // actually, only JSON serializable values
}

type Adapter = {
  unmount: (componentName: string) => void,

  render: (
    componentName: string,
    dataProps: DataProps,
    handlerNames: Array<String>
  ) => void,

  addHandlerListener: (
    componentName: string,
    handlerName: string,
    callback: (args: Array<any>) => void
  ) => () => void,

  setupUnmountListener: (
    componentName: string,
    callback: () => void
  ) => () => void,

  onRender: (
    componentName: string,
    callback: (
      dataProps: DataProps,
      handlerNames: Array<String>
    ) => void
  ) => () => void,

  handle: (
    componentName: string,
    handler: string,
    args: Array<any>
  ) => void
}
```
