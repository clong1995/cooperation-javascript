'use strict';
CLASS('websocket',
    ({
         port = 8001,
         url = '127.0.0.1',
         openData = null,//打开连接的时候发送的数据
         autoConnInterval = 5000,//自动重连时间间隔，毫秒
         autoConnTimes = 10//自动重连次数
     } = {}) => {
        //建立新连接
        let ws = new WebSocket('ws://' + url + ':' + port);
        let times = 0;
        let listenBack = null;
        let isOpen = false;
        let isClose = false;
        (function init(wsHandle) {
            //打开连接
            wsHandle.onopen = () => {
                ejs.log("connection Successful");
                isOpen = true;
                times = autoConnTimes;
                openData && send(openData);
            };

            //断开连接
            wsHandle.onclose = () => {
                ejs.log("connection close");
                isOpen = false;
                isClose = true;
            };

            //连接错误
            wsHandle.onerror = () => {
                ejs.log("connection error");
                isOpen = false;
                if (autoConnInterval) {
                    setTimeout(() => {
                        ++times;
                        ejs.log('try reconnect ' + times);
                        if (autoConnTimes > times) {
                            ws = new WebSocket('ws://' + url + ':' + port);
                            init(ws);
                        } else {
                            ejs.log("reconnection failure", 'error');
                        }
                    }, autoConnInterval)
                }
            };
            
            //接受消息
            wsHandle.onmessage = e => {
                ejs.log('接收消息====>');
                ejs.log(e.data);
                listenBack && listenBack(JSON.parse(e.data));
            }
        })(ws);


        //监听消息
        function listen(cb) {
            listenBack = cb;
        }

        //发送消息
        function send(data) {
            if (isOpen && !isClose) {
                ejs.log('发送消息====>');
                ejs.log(data);
                ws.send(JSON.stringify(data));
            } else {
                let siv = setInterval(() => {
                    if (isClose)
                        clearInterval(siv);
                    else if (isOpen) {
                        clearInterval(siv);
                        ws.send(JSON.stringify(data));
                    }
                }, 1000)
            }
        }

        //绑定
        function bind(id) {
            send({bind: id});
        }

        //主动断开连接
        function close() {
            ws.close();
        }

        return {
            listen: listen,
            send: send,
            close: close
        }
    }
);