'use strict';

CLASS(
    'window.ui',
    ({
         width = 400,
         height = 300,
         title = '弹窗标题',
         headHeight = 25,
         headColor = '#ffffff',
         headBackground = 'green',
         headBorderBottomColor = 'red',
         contentColor = '#ffffff',
         contentBackground = 'blue',
         closeColor = '#cdcdcd',
         content = $.createDom()
     } = {}) => {


        let {ww, wh} = $.windowSize();

        //容器
        let wrapClass = $.simple(),
            wrap = $.createDom('div', {class: wrapClass});
        $.setStyle('.' + wrapClass, {
            width: width + 'px',
            height: height + 'px',
            position: 'absolute',
            left: (ww - width) / 2 + 'px',
            top: (wh - height) / 2 + 'px',
            boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.6)'
        });

        //头部
        let headClass = $.simple(),
            head = $.createDom('div', {class: headClass});
        $.setStyle('.' + headClass, {
            width: '100%',
            height: headHeight + 'px',
            lineHeight: headHeight + 'px',
            fontSize: '12px',
            padding: '0 10px',
            color: headColor,
            boxSizing: 'border-box',
            borderBottom: '2px solid ' + headBorderBottomColor,
            cursor: 'move',
            background: headBackground
        });

        $.html(head, title);


        //关闭
        let
            closeBtnClass = $.simple(),
            closeBtn = $.createDom('i', {
                class: 'iconfont ' + closeBtnClass
            });
        $.setStyle('.' + closeBtnClass, {
            float: 'right',
            fontSize: '12px',
            color:closeColor
        });
        $.setStyle('.' + closeBtnClass + ':hover', {
            cursor: 'pointer'
        });
        closeBtn.innerHTML = '&#xe606;';
        closeBtn.onclick = close;

        //鼠标按下
        head.onmousedown = h => {
            if (!h.button)
                $.body.onmousemove = b => $.css(wrap, {
                    top: (b.clientY - h.layerY) + 'px',
                    left: (b.clientX - h.layerX) + 'px'
                })
        };
        //鼠标抬起
        head.onmouseup = e => $.body.onmousemove = null;

        //内容
        let contentClass = $.simple();
        $.addClass(content,contentClass);
        $.setStyle('.' + contentClass, {
            width: '100%',
            padding: '15px',
            boxSizing: 'border-box',
            color:contentColor,
            height: 'calc(100% - ' + headHeight + 'px)',
            background: contentBackground
        });

        //组装
        $.append($.body, $.appendBatch(wrap, [
            $.append(head, closeBtn),
            content
        ]));

        //关闭
        function close() {
            head.onmousedown = null;
            head.onmouseup = null;
            closeBtn.onclick = null;
            $.remove(wrap);
        }

        return {
            close: close
        }
    }
);