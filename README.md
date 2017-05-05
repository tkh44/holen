

# Holen
Declarative fetch in React

[![npm version](https://badge.fury.io/js/holen.svg)](https://badge.fury.io/js/holen)
[![Build Status](https://travis-ci.org/tkh44/holen.svg?branch=master)](https://travis-ci.org/tkh44/holen)
[![codecov](https://codecov.io/gh/tkh44/holen/branch/master/graph/badge.svg)](https://codecov.io/gh/tkh44/holen)

-   [Install](#install)
-   [Basic Usage](#basic-usage)

## Install

```bash
npm install -S holen
```

## Basic Usage
```jsx
// Fetch on mount
<Holen url="api.startup.com/users">
  {({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>}
</Holen>

// Lazy fetch
<Holen lazy onResponse={handleResponse} url="api.startup.com/users">
  {({data, fetch}) => (
    <div>
      <button onClick={fetch}>Load Data</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )}
</Holen>
```

## Props

**body** `any`

```jsx
<Holen 
  body={JSON.stringify({ message: 'hello' })}
  method="POST"
  url="api.startup.com/users"
>
  {({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>}
</Holen>
```

*[MDN - Body](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Body)*

**children** `function`

Children is a function that receives an object as its only argument.

The object contains the following keys:

- fetching: `bool`
- response: `object`
- data: `object`
- error: `object`
- fetch: `function`

```jsx
<Holen url="api.startup.com/users">
  {({data}) => <div>{data.name}</div>}
</Holen>
```

**credentials** `string`

*[MDN - Credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Sending_a_request_with_credentials_included)*

**headers** `string`

*[MDN - Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)*


**lazy** `boolean`

If true then the component will **not** perform the fetch on mount. 
You must use the `fetch` named argument in order to initiate the request.

```jsx
<Holen lazy url="api.startup.com/users">
  {({fetching}) => {fetching && <div>Loading</div>}} // renders nothing, fetch was not started
</Holen>
```

**method** `string` - *default `GET`*

*[MDN - Method](https://developer.mozilla.org/en-US/docs/Web/API/Request/method)*


**onResponse** `function`

callback called on the response.

```jsx
const handleResponse = (error, response) => {
  if (error || !response.ok) {
    panic()
  }
  
  cheer()
}

<Holen 
  lazy
  onResponse={handleResponse}
  url="api.startup.com/users">
  {({ data, fetch }) => (
    <div>
      <button onClick={fetch}>Load Data</button>
      <pre>{JSON.stringify(data, null , 2)}</pre>
    </div>
  )}
    
</Holen>
```

**url** `string`

url of the request.
