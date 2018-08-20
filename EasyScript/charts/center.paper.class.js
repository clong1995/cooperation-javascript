/**
 * 绘画图纸：空白纸
 * 时间：2018年6月4日09:41:33
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'center.paper',
    param => {

        //引用的模块
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');//svg操作类

        let option = null;
        let userFn = null;
        let svgDom = null;
        let chartPartMap = null;
        let IteratorNode = null;
        let sheetMap = new Map();//样式
        let eventMap = new Map();//事件
        let shot = null;
        let data = null;
        let dataGroup = [];
        let sum = 0;
        let colorIndex = 0;
        let O = null;

        //【参数补全机制】
        option = ejs.assignDeep({
            style: {
                //位置
                position: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }
        }, param);

        //【简化链式查找】
        shot = {
            //大小
            offsetSize: option.offsetSize,
            //定位
            position: option.style.position
        };

        //【数据容器】
        data = option.data;

        function initChart() {
            data.value.forEach(v => sum += v);
            data.key.forEach((v, i) => {
                dataGroup.push({
                    name: v,
                    value: data.value[i],
                    angle: data.value[i] * 360 / sum,
                    color: option.theme.color[colorIndex]
                });
                colorIndex === option.theme.color.length ? colorIndex = 0 : colorIndex++;
            });

            //【逻辑原点】
            O = {
                //x位
                x: (shot.offsetSize.width + shot.position.left - shot.position.right) / 2,
                //y位
                y: (shot.offsetSize.height + shot.position.top - shot.position.bottom) / 2
            };
        }

        //【svg坐标转逻辑正向笛卡尔坐标】
        function X(x) {
            return x + O.x;
        }

        function Y(y) {
            return O.y - y;
        }

        function figure() {
            return {
                center: {
                    x: X(0),
                    y: Y(0)
                },
                radius: (shot.offsetSize.width - shot.position.left - shot.position.right) / 2,
                dataPoint: dataGroup
            }
        }

        function initPaper(svgNode, fn) {
            //【保存函数句柄】
            userFn = fn;
            //【保存SVG句柄】
            svgDom = svgNode;

            //【内置样式表】
            let sheet = svg.sheet(svgNode);

            //【生成样式表】
            sheetMap.forEach((v, k) => svg.setSheet(sheet, k, v));

            //【1初始化图表】
            initChart();

            //【2生成部件】
            chartPartMap = new Map();
            //【3组装节点】
            IteratorNode = userFn({figure: figure()});
            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, ...IteratorNode]);

            //【4显示svg】
            ejs.css(svgDom, {display: 'block'});
        }


        //【公共方法】
        let publicFn = {
            // option: option,
            // chartPartMap: chartPartMap,
            // sheetMap: new Map(),
            // eventMap: new Map(),
            // figure: figure(),
            // X: X,
            // Y: Y
            initPaper: initPaper
        };

        return publicFn;
    }
);