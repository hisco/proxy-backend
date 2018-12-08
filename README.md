# Proxy backend

[![Greenkeeper badge](https://badges.greenkeeper.io/hisco/proxy-backend.svg)](https://greenkeeper.io/)

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

`proxy-backend` wrapps `node-http-proxy` while monitoring the backend 
status with `status-monitor`.

## Features
  * Status checks / health checks , full features at [status-monitor](https://www.npmjs.com/package/status-monitor) .
  * Proxy http/websockets , full features at [node-http-proxy (http-proxy)](https://www.npmjs.com/package/http-proxy) .
  * Proxy traffic based on backend status.

`node-http-proxy` is by far the best library to proxy http traffic.
It was just missing some healthchecks(`status-monitor`) to the destination it's forwarding to.

## Simple usage
The following example is an express website that proxy to a remote server only when it's valid
```js
const {ProxyBackend} = require('proxy-backend');
const proxyBackend = new ProxyBackend({
    proxyOptions : {
        target : 'http://example.com'
    },
    monitorOptions : {
        requestOptions : {
            url : 'http://example.com'
        }
    },
    onWebUnavailable(req , res){
        res.status(503).send(`example.com is down =( `)
    }
});
proxyBackend.proxy.on('proxyRes' , (proxyRes, req, res)=>{
    delete proxyRes.headers['cache-control']
    delete proxyRes.headers['etag']
})
proxyBackend.start();
proxyBackend.statusMonitor.on('testResult',(testResult)=>{
    console.log(`Just finished a test it was ${testResult.status}`)
})
proxyBackend.statusMonitor.on('statusChange',(status)=>{
    console.log(`Ok now I'm sure that server is ${status}`)
})
 
 //express....
const express = require('express')
const app = express()

app.disable('etag')
app.get('/', (req, res) => {
    req.headers.host = 'example.com';
    proxyBackend.web(req , res);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))


```
## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/proxy-backend.svg
[npm-url]: https://npmjs.org/package/proxy-backend
[travis-image]: https://img.shields.io/travis/hisco/proxy-backend/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/proxy-backend
[coveralls-image]: https://coveralls.io/repos/github/hisco/proxy-backend/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/hisco/proxy-backend?branch=master





