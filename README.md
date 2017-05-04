

# Holen
<p align="center" style="font-size: 1.2rem;">Declarative fetch in React</p>

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
import Holen from 'holen'

<Holen url="api.startup.com/users" method="GET">
  {({ data, fetch }) => <pre>{JSON.stringify(data, null, 2)}</pre>}
</Holen> 
```
