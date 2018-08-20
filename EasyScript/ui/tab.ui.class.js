'use strict';
/**
 * tab组件
 * 作者：成龙哥哥 微信：clong QQ：2435965705 邮箱：2435965705@qq.com git：
 * 更新时间：2018年4月26日22:18:38
 */
CLASS(
    'tab.ui',
    ({
         width = 1024,
         height = 768,
         container = ejs.createDom(),
         orientation = 'vertical',//默认垂直 可选horizontal水平
         headHeight = 35,
         headWidth = 100,
         headBackground = '#fff',
         headItemBackground = '#f9f9f9',
         selectedBackground = '#f0f0f0',
         fontSize = 14,

         data = [
             {name: '标签一', key: 'teb1', content: ejs.createDom()},
             {name: '标签二', key: 'teb2', content: ejs.createDom()}
         ],
     } = {}) => {
        //容器
        let tabClass = ejs.simple(),
            tab = ejs.addClass(container, tabClass),
            cWidth = width + 'px',
            cHeight = height + 'px';
        if (width === 'auto')
            cWidth = '100%';
        if (height === 'auto')
            cHeight = '100%';
        ejs.setSheet('.' + tabClass, {
            width: cWidth,
            height: cHeight,
            background: selectedBackground
        });

        //头部
        let headClass = ejs.simple(),
            head = ejs.createDom('div', {class: headClass});
        let headClassStyle = {
            background: headBackground,
            float: 'left'
        };
        if (orientation === 'vertical') {
            headClassStyle['width'] = headWidth + 'px';
            headClassStyle['height'] = '100%';
            headClassStyle['borderRight'] = '1px solid #ccc';
        } else {
            headClassStyle['width'] = '100%';
            headClassStyle['height'] = headHeight + 'px';
        }
        ejs.setSheet('.' + headClass, headClassStyle);

        //item
        let tep = null,
            tepClass = ejs.simple();
        let tepClassStyle = {
            height: headHeight + 'px',
            lineHeight: headHeight + 'px',
            borderBottom: '1px solid #ccc',
            background: headItemBackground,
            textIndent: '5%',
            fontSize: fontSize + 'px',
            cursor: 'pointer'
        };
        if (orientation === 'vertical') {
            tepClassStyle['width'] = '100%';
        } else {

        }
        ejs.setSheet('.' + tepClass, tepClassStyle);
        let selectedClass = ejs.simple();
        ejs.setSheet('.' + selectedClass, {
            paddingLeft: '1px',
            textIndent: '10%',
            fontWeight: 'bold',
            background: selectedBackground
        });
        let tepArr = [];
        data.forEach(v => {
            tep = ejs.html(ejs.createDom('div', {class: tepClass}), v.name);
            tepArr.push(tep);
            ejs.onData(tep, v)
        });
        ejs.addClass(tepArr[0], selectedClass);

        //页面
        let bodyClass = ejs.simple(),
            body = ejs.createDom('div', {
                class: bodyClass
            });
        ejs.setSheet('.' + bodyClass, {
            width: 'calc(100% - ' + (headWidth + 1) + 'px)',
            height: '100%',
            position: 'relative',
            float: 'right'
        });

        //切换
        let iframeClass = ejs.simple();
        ejs.setSheet('.' + iframeClass, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent'
        });
        ejs.click(head, e => {
            tepArr.forEach(v => ejs.removeClass(v, selectedClass));
            ejs.addClass(e, selectedClass);
            let data = ejs.getData(e);
            let child = body.childNodes;
            ejs.removeAll(child);
            if (typeof(data.content) === 'string') {
                ejs.append(body, ifrDom(data.content));
            } else {

            }
        }, '.' + tepClass);

        //打开第一个
        if (typeof(data[0].content) === 'string') {
            ejs.append(body, ifrDom(data[0].content));
        }

        function ifrDom(src) {
            let content = ejs.createDom('iframe', {
                src: src,
                allowTransparency: 'true',
                class: iframeClass,
                frameborder: 0
            });
            content.onload = function () {
                let ifrDoc = content.contentWindow.document;
                ejs.css(ifrDoc.body, {
                    background: 'transparent'
                });
                ejs.css(ifrDoc.getElementsByTagName('html')[0], {
                    background: 'transparent'
                });
            };
            return content;
        }


        //组装
        ejs.appendBatch(head, tepArr);
        ejs.appendBatch(tab, [head, body]);
        ejs.append(ejs.body, tab);
        return {}
    }
);