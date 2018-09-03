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

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        //【获取容器大小】
        ejs.css(elem, {
            padding: 0,
            position: 'relative'
        });
        let offsetSize = {width: elem.offsetWidth, height: elem.offsetHeight};

        //【追加信息】
        param['offsetSize'] = offsetSize;
        param = ejs.assignDeep({
            //【默认样式】
            theme: {
                display: 'block',
                colors: [
                    ['#61a0a8','#3f777f'],
                    ['#2f4554','#203241'],
                    ['#c23531','#712521'],
                    ['#91c7ae','#4a6951'],
                    ['#749f83','#2b4f35'],
                    ['#ca8622','#855421'],
                    ['#bda29a','#634a48'],
                    ['#6e7074','#313337'],
                    ['#546570','#323a45'],
                    ['#c4ccd3','#656d74']
                ],
                color: '#333',
                fontSize: 14,
                fontWeight: 'normal',
                fontFamily: 'Microsoft YaHei,sans-serif',
                borderWidth: 2
            }
        }, param);

        //【使用图纸】
        const {option, initPaper, defs,chartPartMap} = NEW_ASYNC(ejs.root + 'charts/' + currPaper, param);

        //渐变
        function gradient(type = 'linear', opt={}) {
            let gradient = null;
            if (type === 'linear') {
                gradient = svg.linearGradient(defs,opt);
            }else{
                gradient  = svg.radialGradient(defs,opt);
            }
            return 'url(' + gradient + ')';
        }

        //模糊
        function blur(width,height,opt={}) {
            return 'url(' + svg.blur(defs,width,height,opt) + ')';
        }


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
            //创建svg元素
            let svgNode = svg.createSvg();
            ejs.attr(svgNode, {
                viewBox: "0 0 " + offsetSize.width + " " + offsetSize.height,
                //preserveAspectRatio:"none"//无比例填充
            });
            ejs.css(elem, {background: option.style.background});
            //生成图纸
            initPaper(svgNode, fn);
            //添加到页面
            ejs.append(elem, svgNode);
        }

        //加载
        /*function load(data) {
            //删除旧的
            ejs.empty(ejs.query(param.element));
            //重绘新的
            param.data = data;
            NEW(ejs.root + 'charts/' + param.type + '/' + param.call[0], param, fn => {
            })
        }*/


        //【公共属性】
        return {
            render: render,
            option: option,
            svg: svg,
            gradient:gradient,
            blur:blur,
            chartPartMap:chartPartMap
            //addEvent: addEvent,
            //setSheet: setSheet,
            //getPaper: getPaper,
            //load: load
        };
    }
);