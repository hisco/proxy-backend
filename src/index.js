const {EventEmitter} = require('events');

class ProxyBackend extends EventEmitter{
    constructor(options){
        super();
        this.init(options)
    }
    get require(){
        return require;
    }
    init(options){
        this.createProxy(options);
        this.createStatusMonitor(options);
        this.setWhenToForward(options);
        this.setErrorHandlers(options);
    }
    setErrorHandlers(options){
        this.webUnavailable = options.onWebUnavailable || this.webUnavailableDefault;
        this.wsUnavailable = options.onWSUnavailable || this.wsUnavailableDefault;
    }
    setWhenToForward(options){
        
        let proxyAtStatus = options.proxyAtStatus;
        if (typeof proxyAtStatus == 'string')
            proxyAtStatus = [proxyAtStatus];
        else if(!proxyAtStatus)
            proxyAtStatus = ['HEALTHY' , 'STARTING' ];
            
        if (typeof proxyAtStatus == 'function')
            this.shouldProxy = function shouldProxyAsync(req){
                return Promise.resolve()
                    .then(function shouldProxyWrapper(){
                        return proxyAtStatus(req);
                    })
            };
        else{
            const proxyBackend = this;
            this.shouldProxy = function shouldProxy(){
                return Promise.resolve(proxyAtStatus.indexOf(this.statusMonitor.status) != -1)
            }
        }
    }
    createProxy(options){
        if (options.proxy)
            this.proxy = options.proxy;
        else{
            const httpProxy = this.require('http-proxy');
            this.proxy = httpProxy.createProxyServer(options.proxyOptions);
        }
    }
    createStatusMonitor(options){
        if (options.statusMonitor)
            this.statusMonitor = options.statusMonitor;
        else{
            const {StatusMonitor} = this.require('status-monitor');
            this.statusMonitor = new StatusMonitor(options.monitorOptions);
        }
    }
    web(req , res){
        return this.shouldProxy(req)
            .then(function proxyWeb(shouldProxy){
                if (shouldProxy){
                    this.proxy.web(req , res)
                }
                else {
                    this.webUnavailable(req , res);
                }
            }.bind(this))
    }
    ws(req, socket, head){
        return this.shouldProxy(req)
            .then(function proxyWeb(shouldProxy){
                if (shouldProxy){
                    this.proxy.ws(req, socket, head)
                }
                else {
                    this.wsUnavailable(req, socket, head);
                }
            }.bind(this));
    }
    webUnavailableDefault(req , res){
        res.writeHead(503, {'Content-Type': 'text/plain'});
        res.end('');
    } 
    wsUnavailableDefault(req, socket, head){
        socket.end();
    }

    start(){
        this.statusMonitor.start();
        return this;
    }
    pause(){
        this.statusMonitor.pause();
        return this;
    }
    resume(){
        this.statusMonitor.resume();
        return this;
    }
}

module.exports = {
    ProxyBackend
}



// const proxyBackend = new ProxyBackend({
//     proxyOptions : {
//         target : 'http://example.com'
//     },
//     monitorOptions : {
//         requestOptions : {
//             url : 'http://example.com'
//         }
//     }
// });
// proxyBackend.start();
 
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {
//     req.headers.host = 'example.com';
//     proxyBackend.web(req , res);
// })

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
