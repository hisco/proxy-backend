const {ProxyBackend} = require('../../src/index')

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));
const {MockedClassService} = require('unit-test-class');
const mockService = new MockedClassService(chai.spy);

describe('ProxyBackend' , ()=>{
    const mockFactory = mockService.mock(ProxyBackend)
    describe('#constructor' , ()=>{
        it('Should call #init' , ()=>{
            const options = {};
            const proxyBackend = mockFactory
                            .test('constructor')
                            .create(options).instance;

            expect(proxyBackend.init).to.have.been.called.with(options);
        })
    })
    describe('get require' , ()=>{
        it('Should be require' , ()=>{
            const options = {};
            const proxyBackend = mockFactory
                            .test('require')
                            .create(options).instance;
        })
    });
    describe('#init' , ()=>{
        it('Should call sub functions' , ()=>{
            const options = {};
            const proxyBackend = mockFactory
                            .test('init')
                            .create(options).instance;

            proxyBackend.init(options)

            expect(proxyBackend.createProxy).to.have.been.called.with(options);
            expect(proxyBackend.createStatusMonitor).to.have.been.called.with(options);
            expect(proxyBackend.setWhenToForward).to.have.been.called.with(options);
            expect(proxyBackend.setErrorHandlers).to.have.been.called.with(options);
        })
    });
    describe('#setErrorHandlers' , ()=>{
        let proxyBackendFactory;
        beforeEach(()=>{
            proxyBackendFactory = mockFactory
                            .test('setErrorHandlers');
        })
        it('Should set user requested' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const options = {
                onWebUnavailable : ()=>{},
                onWSUnavailable : ()=>{}
            };
            proxyBackend.setErrorHandlers(options);

            expect(proxyBackend.webUnavailable).eq(options.onWebUnavailable)
            expect(proxyBackend.wsUnavailable).eq(options.onWSUnavailable)
        })
    })
    describe('#setWhenToForward' , ()=>{
        let proxyBackendFactory;
        beforeEach(()=>{
            proxyBackendFactory = mockFactory
                            .test('setWhenToForward');
        })
        it('Should string as async cb' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const options = {
                proxyAtStatus : 'aaaa'
            }
            proxyBackend.statusMonitor = {
                status : 'aaaa'
            }
            proxyBackend.setWhenToForward(options);

            return Promise.all([
                proxyBackend.shouldProxy() 
            ])
                .then((results)=>{
                    expect(results[0]).eq(true)
                })
        })
        it('Should array as async cb' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const options = {
                proxyAtStatus : ['aaaa']
            }
            proxyBackend.statusMonitor = {
                status : 'aaaa'
            }
            proxyBackend.setWhenToForward(options);

            return Promise.all([
                proxyBackend.shouldProxy() 
            ])
                .then((results)=>{
                    expect(results[0]).eq(true)
                })
        })
        it('Should have default' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const options = {
            }
            proxyBackend.statusMonitor = {
                status : 'HEALTHY'
            }
            proxyBackend.setWhenToForward(options);

            return Promise.all([
                proxyBackend.shouldProxy() 
            ])
                .then((results)=>{
                    expect(results[0]).eq(true)
                })
        });
        it('Should set function as is' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const options = {
                proxyAtStatus : (req)=>{
                    return true
                }
            }
            proxyBackend.statusMonitor = {
                status : 'sdfsdf'
            }
            proxyBackend.setWhenToForward(options);

            return Promise.all([
                proxyBackend.shouldProxy() 
            ])
                .then((results)=>{
                    expect(results[0]).eq(true)
                })
        });
    })
    describe('#createProxy' , ()=>{
        let proxyBackendFactory;
        let mockRequire;
        let createProxyServer;
        beforeEach(()=>{
            createProxyServer = chai.spy(options => 9);
            mockRequire = chai.spy(name =>({
                createProxyServer 
            }))
            proxyBackendFactory = mockFactory
                .spies({
                    get require(){
                        return mockRequire;
                    }
                })
                            .test('createProxy');
            
        });
        it('Should set proxy as is' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            proxyBackend.createProxy({
                proxy : 9
            });

            expect(proxyBackend.proxy).eq(9)
        })
        it('Should create proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const proxyOptions = {};
            proxyBackend.createProxy({
                proxyOptions
            });

            expect(proxyBackend.proxy).eq(9)
        })
    })
    describe('#createStatusMonitor' , ()=>{
        let proxyBackendFactory;
        let mockRequire;
        let StatusMonitor;
        beforeEach(()=>{
            class StatusMonitorDummy{

            }
            StatusMonitor = StatusMonitorDummy;
            mockRequire = chai.spy(name =>({
                StatusMonitor 
            }))
            proxyBackendFactory = mockFactory
                .spies({
                    get require(){
                        return mockRequire;
                    }
                })
                            .test('createStatusMonitor');
            
        });
        it('Should set proxy as is' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            proxyBackend.createStatusMonitor({
                statusMonitor : 9
            });

            expect(proxyBackend.statusMonitor).eq(9)
        })
        it('Should create proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            const monitorOptions = {};
            proxyBackend.createStatusMonitor({
                monitorOptions
            });

            expect(proxyBackend.statusMonitor instanceof StatusMonitor).eq(true)
        })
    })
    describe('#web' , ()=>{
        let proxyBackendFactory;
        let shouldProxy;
        let web;
        let req;
        let res;
        let socket;
        let addSpies;
        beforeEach(()=>{
            req = {};
            res = {};
            socket = {};
            shouldProxy = false;
            web = chai.spy();
            proxyBackendFactory = mockFactory
                            .test('web');

            function addSpiesi(backend){
                backend.shouldProxy = chai.spy(()=>{
                    return Promise.resolve(shouldProxy);
                }),
                backend.webUnavailable =  chai.spy(),
                backend.proxy =  {
                        web
                    }
            }
            addSpies = addSpiesi;
            
        });
        it('Should proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            shouldProxy = true;
            addSpies(proxyBackend);

            return proxyBackend.web(req ,res).then(()=>{
                expect(proxyBackend.proxy.web).to.have.been.called.with(req , res)
            });
        })
        it('Shouldn\'t proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            shouldProxy = false;
            addSpies(proxyBackend);

            return proxyBackend.web(req ,res).then(()=>{
                expect(proxyBackend.proxy.web).not.to.have.been.called();
                expect(proxyBackend.webUnavailable).to.have.been.called.with(req , res);
            });
        });
    })
    describe('#ws' , ()=>{
        let proxyBackendFactory;
        let shouldProxy;
        let ws;
        let req;
        let head;
        let socket;
        let addSpies;
        beforeEach(()=>{
            req = {};
            head = {};
            socket = {};
            shouldProxy = false;
            ws = chai.spy();
            proxyBackendFactory = mockFactory
                            .test('ws');

            function addSpiesi(backend){
                backend.shouldProxy = chai.spy(()=>{
                    return Promise.resolve(shouldProxy);
                }),
                backend.wsUnavailable =  chai.spy(),
                backend.proxy =  {
                        ws
                    }
            }
            addSpies = addSpiesi;
            
        });
        it('Should proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            shouldProxy = true;
            addSpies(proxyBackend);

            return proxyBackend.ws(req ,socket , head).then(()=>{
                expect(proxyBackend.proxy.ws).to.have.been.called.with(req ,socket , head)
            });
        })
        it('Shouldn\'t proxy' , ()=>{
            const proxyBackend = proxyBackendFactory.create().instance;
            shouldProxy = false;
            addSpies(proxyBackend);

            return proxyBackend.ws(req ,socket , head).then(()=>{
                expect(proxyBackend.proxy.ws).not.to.have.been.called();
                expect(proxyBackend.wsUnavailable).to.have.been.called.with(req ,socket , head);
            });
        });
    })
    describe('#webUnavailableDefault' , ()=>{
        it('Should start status monitor' , ()=>{
            const req = {};
            const res = {
                writeHead : chai.spy(),
                end : chai.spy()
            };
            const proxyBackend = mockFactory
                            .test('webUnavailableDefault')
                            .create().instance;
                        

            proxyBackend.webUnavailableDefault(req , res);
            
            expect(res.writeHead).to.have.been.called.with(503)
            expect(res.end).to.have.been.called.with('')
        })
    })
    describe('#wsUnavailableDefault' , ()=>{
        it('Should start status monitor' , ()=>{
            const req = {};
            const socket = {
                end : chai.spy()
            };
            const head = {};
            const proxyBackend = mockFactory
                            .test('wsUnavailableDefault')
                            .create().instance;
                        

            proxyBackend.wsUnavailableDefault(req , socket , head);
            
            expect(socket.end).to.have.been.called();
        })
    })

    describe('#start' , ()=>{
        it('Should start status monitor' , ()=>{
            const proxyBackend = mockFactory
                            .test('start')
                            .create().instance;
                        
            proxyBackend.statusMonitor = {start: chai.spy()};

            proxyBackend.start();
            
            expect(proxyBackend.statusMonitor.start ).to.have.been.called()
        })
    })
    describe('#pause' , ()=>{
        it('Should resume status monitor' , ()=>{
            const proxyBackend = mockFactory
                            .test('pause')
                            .create().instance;
                        
            proxyBackend.statusMonitor = {pause: chai.spy()};

            proxyBackend.pause();

            expect(proxyBackend.statusMonitor.pause ).to.have.been.called()
        })
    })
    describe('#resume' , ()=>{
        it('Should resume status monitor' , ()=>{
            const proxyBackend = mockFactory
                            .test('resume')
                            .create().instance;
                        
            proxyBackend.statusMonitor = {resume: chai.spy()};

            proxyBackend.resume();

            expect(proxyBackend.statusMonitor.resume ).to.have.been.called()
        })
    })
})