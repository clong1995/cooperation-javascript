/**
 * 图表的基类
 * 非必要不得修改该文件，如必须修改，请明确该文件涉及到的公共方法和兼容问题
 * 修改后将影响全部的图标组件
 * 大体流程 CPU运算->结果存于内存->调用渲染函数->GPU渲染->内存结果放到页面->CPU释放，GPU释放，一直占据内存和GPU缓存。目的是降低chrome频繁改动dom树的机会，防止绘制期间反复调用CPU和GPU
 * 请一定保证对于dom的操作仅存在svg加入到elem，尽量减少回流和重绘（SVG相当庞大！）
 */
'use strict';

CLASS(
    'chartBase',
    param => {
        //【容器判断】
        if (!param.element) param.element = 'body';
        if (param.element[0] !== '#' && param.element !== 'body') {
            ejs.log('容器必须是唯一id或者body，当前的容器是: ' + param.element, 'error');
            return;
        }

        //【获取容器】
        let elem = ejs.query(param.element);
        if (!elem) {
            ejs.log(param.element + '容器不存在', 'error');
            return;
        }

        //【图纸支持判断】
        let currPaper = {
            'line': 'coordinate.paper',
            'bar': 'coordinate.paper',
            'pie': 'center.paper',
            'map': 'map.paper'
        }[param.type];
        if (!currPaper) {
            ejs.log('当前的图标表类型为[' + param.type + ']，此类型暂不支持，详情参阅www.xxxxxx.com/api/xxx', 'error');
            return;
        }

        //【获取容器大小】
        ejs.css(elem, {padding: 0, position: 'relative'});
        let offsetSize = {width: elem.offsetWidth, height: elem.offsetHeight};

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        //【追加信息】
        ejs.assignDeep(param, {
            // 【大小】
            offsetSize: offsetSize,
            //【默认样式】
            theme: {
                display: 'block',
                color: ['#333', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
                fontSize: 14,
                fontWeight: 'normal',
                fontFamily: '\'Microsoft YaHei\',sans-serif',
                borderWidth: 2
            }
        });

        //【使用图纸】
        const {initPaper} = NEW_ASYNC(ejs.root + 'charts/' + currPaper, param);

        //【设置样式表】
        /*function setSheet(select, rule) {
            paper.sheetMap.set(select, rule);
        }*/

        //【添加事件】
        /*function addEvent(type, target, callback) {
            let event = {
                click: null,
                hover: null
            };
            if (event[type] === undefined) {
                ejs.log('不允许的事件:' + type, 'error');
                return;
            }
            if (!paper.eventMap.has(target)) {
                paper.eventMap.set(target, event)
            }
            paper.eventMap.get(target)[type] = callback;
        }*/

        //【获取图纸组件】
        /*function getPaper(p = null) {
            let part = paper.chartPartMap;
            if (p) part = part.get(p);
            return part;
        }*/

        //【渲染】
        function render(fn) {
            //【创建svg元素】
            let svgNode = svg.createSvg();
            ejs.attr(svgNode, {
                viewBox: "0 0 " + offsetSize.width + " " + offsetSize.height,
                //preserveAspectRatio:"none"//无比例填充
            });
            ejs.append(elem, svgNode);



            //生成图纸
            initPaper(svgNode,fn);
        }

        //加载
        function load(data) {
            //删除旧的
            ejs.empty(ejs.query(param.element));
            //重绘新的
            param.data = data;
            NEW(ejs.root + 'charts/' + param.type + '/' + param.call[0], param, fn => {
            })
        }


        //【公共属性】
        return {
            render: render,
            //addEvent: addEvent,
            //setSheet: setSheet,
            //getPaper: getPaper,
            //load: load
        };
    }
);