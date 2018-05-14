'use strict';

CLASS('electron',
    ({
         ipcToken = 'ipc-token'
     } = {}) => {

        const ipcRenderer = require('electron').ipcRenderer;
        const renderEvent = new Map();
        //监听
        ipcRenderer.on(ipcToken, (event, route, data) => {
            renderEvent.get(route)(JSON.parse(data));
        });

        //向主进异步程发送消息
        function send(route, data = {}) {
            ipcRenderer.send(ipcToken, route, JSON.stringify(data));
        }

        //向主进程同步发送消息
        function sendSync(route, data = {}) {
            return ipcRenderer.sendSync(ipcToken, route, JSON.stringify(data));
        }

        //监听主进程的消息
        function listen(route, fn) {
            renderEvent.set(route, fn);
        }

        return {
            send: send,
            sendSync: sendSync,
            listen: listen
        }
    });