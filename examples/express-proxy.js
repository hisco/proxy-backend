const {ProxyBackend} = require('../src');
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
 
const express = require('express')
const app = express()

app.disable('etag')
app.get('/', (req, res) => {
    req.headers.host = 'example.com';
    proxyBackend.web(req , res);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
