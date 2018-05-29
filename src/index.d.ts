import {EventEmitter} from 'events';
import { StatusMonitor } from 'status-monitor';

declare module ProxyBackend{
    interface ProxyBackendOptions{
        proxy?:any;
        proxyOptions?:{[key:string]:any};
        statusMonitor?:StatusMonitor|any;
        monitorOptions?:{[key:string]:any};
        onWebUnavailable?(req : any , res : any):void
        onWSUnavailable?(req : any , socket: any , head: any ):void
    }
    class ProxyBackend extends EventEmitter{
        constructor(options : ProxyBackendOptions);
        public web(req : any , res : any):Promise<void>;
        public ws(req : any , socket: any , head: any ):Promise<void>;
        public start():ProxyBackend
        public pause():ProxyBackend
        public resume():ProxyBackend
    }
}