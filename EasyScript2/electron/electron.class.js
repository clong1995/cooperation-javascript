'use strict';

CLASS('electron',
    ({
         ipcToken = 'ipc-token'
     } = {}) => {

        const ipcRenderer = require('electron').ipcRenderer;
        const renderEvent = new Map();
        //监听
        ipcRenderer.on(ipcToken, (event, key, data) => {
            renderEvent.get(key)(JSON.parse(data));
        });

        //向主进异步程发送消息
        function send(route, data = {}, callback) {
            //生成令牌 MD5摘要路由和数据
            let key = ejs.md5(route + JSON.stringify(data));

            //保存回调
            if (callback)
                renderEvent.set(key, callback);

            //匹配缓存

            //发送数据
            ipcRenderer.send(ipcToken, route, JSON.stringify(data));
        }

        /*//向主进程同步发送消息
        function sendSync(route, data = {}) {
            return ipcRenderer.sendSync(ipcToken, route, JSON.stringify(data));
        }
        */

        //监听主进程的消息
        function listen(route, fn) {
            renderEvent.set(route, fn);
        }

        return {
            send: send,
            /*sendSync: sendSync,*/
            listen: listen
        }
    });