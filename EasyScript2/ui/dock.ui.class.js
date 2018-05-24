'use strict';
/**
 * dock组件
 * 作者：成龙哥哥 微信：clong QQ：2435965705 邮箱：2435965705@qq.com git：
 * 更新时间：2018年4月26日22:18:38
 */
CLASS(
    'dock.ui',
    ({
         background = 'linear-gradient(rgba(235, 235, 235, 0.7),rgba(215, 215, 215, 0.8),rgba(190, 190, 190, 0.9),rgb(170, 170, 170))',
         borderRadius = '5px 5px 0 0',
         data = [
             [
                 {name: '应用', key: 'store', icon: '/store/icon.gif', url: '/store', width: 400, height: 300},
                 {name: '文件', key: 'file', icon: '/file/icon.gif', url: '/file', width: 400, height: 300}
             ],
             [
                 {name: '签到', key: 'check', icon: '/check/icon.gif', url: '/check', width: 400, height: 300}
             ],

         ],
     } = {}) => {

        // TODO background 判断是颜色还是图片地址


        //dock容器
        let dockClass = ejs.simple(),
            dock = ejs.createDom('div', {class: dockClass});
        ejs.setSheet('.' + dockClass, {
            width: '100%',
            height: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            textAlign: 'center'
        });

        //分组
        let dockGroupClass = dockClass + '>div',
            dockGroupArr = [];
        ejs.setSheet('.' + dockGroupClass, {
            display: 'inline-block',
            background: background,
            borderRadius: borderRadius,
            borderBottom: '2px solid #ccc',
            position: 'relative',
            top: '-70px',
            height: '45px',
            padding: '0 20px',
            margin: '0 5px'
        });

        //App
        let appClass = ejs.simple(),
            appAnimation = ejs.simple(),
            appArr = null;
        ejs.setSheet('.' + appClass, {
            width: '50px',
            height: '60px',
            margin: '0 8px',
            float: 'left',
            position: 'relative',
            top: '-18px'
        });
        let jump = ejs.keyframes({
            '0%': {transform: 'translateY(0)'},
            '25%': {transform: 'translateY(-10px)'},
            '50%': {transform: 'translateY(-20px)'},
            '75%': {transform: 'translateY(-10px)scale(1.2,0.9)'},
            '100%': {transform: 'translateY(0)'}
        });
        ejs.setSheet('.' + appClass + ':hover', {
            fontWeight: 'bold',
            animation: jump + ' .6s linear .1s infinite'
        });

        //弹窗
        ejs.click(dock, e => {
            let data = ejs.getData(e);
            NEW(ejs.root + 'ui/window.ui', {
                width: data.width,
                height: data.height,
                title: data.name,
                scrolling: 'no',
                content: data.url
            }, fn => {
            });
        }, '.' + appClass);

        //app图标
        let appIconClass = ejs.simple();
        ejs.setSheet('.' + appIconClass, {
            backgroundRepeat: 'no-repeat',
            width: '40px',
            height: '40px',
            margin: '0 5px',
            position: 'absolute',
            top: '0'
        });

        //app名字
        let appNameClass = ejs.simple();
        ejs.setSheet('.' + appNameClass, {
            lineHeight: '18px',
            fontSize: '12px',
            height: '18px',
            textAlign: 'center',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%'
        });

        let app = null;
        data.forEach(v => {
            //app
            appArr = [];
            v.forEach(v1 => {
                app = ejs.createDom('div', {class: appClass});
                ejs.onData(app, v1);
                appArr.push(ejs.appendBatch(
                    app,
                    [
                        ejs.createDom('div', {
                            class: appIconClass,
                            style: "background: url('" + v1.icon + "') no-repeat center center"
                        }),
                        ejs.append(ejs.createDom('div', {class: appNameClass}), ejs.textNode(v1.name))
                    ])
                );
            });
            //分组集合
            dockGroupArr.push(
                ejs.appendBatch(
                    ejs.createDom(),
                    appArr
                )
            );
        });

        //组装
        ejs.append(
            ejs.body,
            ejs.appendBatch(dock, dockGroupArr)
        );
        return {}
    }
);