'use strict';
/**
 * 窗口组件
 * 作者：成龙哥哥 微信：clong QQ：2435965705 邮箱：2435965705@qq.com git：
 * 更新时间：2018年4月26日22:18:38
 */
CLASS(
    'window.ui',
    ({
         width = 400,
         height = 300,
         title = '弹窗标题',
         headHeight = 25,
         headColor = '#353535',
         borderRadius = 3,
         headBackground = 'linear-gradient(rgba(200, 200, 200,0.9),rgba(200, 200, 200, 0.8),rgba(215, 215, 215, 0.7),rgba(235, 235, 235, 0.7))',
         headBorderBottomColor = '#ccc',
         closeColor = 'red',
         content = ejs.createDom(),
         contentColor = '#ffffff',
         contentBackground = '#eeeeee',
         contentPadding = 0,
         scrolling = 'auto'//专门给content是连接的iframe用的
     } = {}) => {
        let {ww, wh} = ejs.windowSize();
        //容器
        let wrapClass = ejs.simple(),
            wrap = ejs.createDom('div', {class: wrapClass});

        let wrapSelector = ejs.setSheet('.' + wrapClass, {
            width: width + 'px',
            height: height + 'px',
            position: 'absolute',
            left: (ww - width) / 2 + 'px',
            top: (wh - height) / 2 + 'px',
            borderRadius:borderRadius+'px',
            overflow:'hidden',
            boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.6)'
        });

        //头部
        let headClass = ejs.simple(),
            head = ejs.createDom('div', {class: headClass});
        let headSelector = ejs.setSheet('.' + headClass, {
            width: '100%',
            height: headHeight + 'px',
            lineHeight: headHeight + 'px',
            fontSize: '12px',
            padding: '0 10px',
            color: headColor,
            boxSizing: 'border-box',
            borderBottom: '1px solid ' + headBorderBottomColor,
            cursor: 'move',
            background: headBackground
        });

        ejs.html(head, title);

        //关闭
        let
            closeBtnClass = ejs.simple(),
            closeBtn = ejs.createDom('i', {
                class: 'iconfont ' + closeBtnClass
            });
        let closeBtnSelector = ejs.setSheet('.' + closeBtnClass, {
            float: 'right',
            fontSize: '12px',
            color: closeColor
        });
        let closeHoverBtnSelector = ejs.setSheet('.' + closeBtnClass + ':hover', {
            cursor: 'pointer'
        });
        closeBtn.innerHTML = '&#xe606;';
        closeBtn.onclick = close;

        //鼠标按下
        head.onmousedown = h => {
            if (!h.button)
                ejs.body.onmousemove = b => ejs.css(wrap, {
                    top: (b.clientY - h.layerY) + 'px',
                    left: (b.clientX - h.layerX) + 'px'
                })
        };
        //鼠标抬起
        head.onmouseup = e => ejs.body.onmousemove = null;

        //内容
        let contentClass = ejs.simple();

        if (typeof(content) === 'string') {
            let src = content;
            content = ejs.createDom('iframe', {
                src: src,
                frameborder: 0,
                scrolling: scrolling
            })
        }

        ejs.addClass(content, contentClass);
        let contentSelector = ejs.setSheet('.' + contentClass, {
            width: '100%',
            padding: contentPadding+'px',
            boxSizing: 'border-box',
            color: contentColor,
            height: 'calc(100% - ' + headHeight + 'px)',
            background: contentBackground
        });

        //组装
        ejs.append(ejs.body, ejs.appendBatch(wrap, [
            ejs.append(head, closeBtn),
            content
        ]));

        //关闭
        function close() {
            head.onmousedown = null;
            head.onmouseup = null;
            closeBtn.onclick = null;
            ejs.deleteSheetBatch([wrapSelector, headSelector, closeBtnSelector, closeHoverBtnSelector, contentSelector]);
            ejs.remove(wrap);
        }

        return {
            close: close
        }
    }
);