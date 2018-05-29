'use strict';
/**
 *  程序：成龙哥哥
 */
CLASS(
    //类名
    'line002',
    //构造器
    param => {
        //【图表类型】
        param.type = 'line';
        //【默认数据】
        ejs.assignDeep({
            data: {
                value: [3, 25, 33, 49, 51, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        }, param);

        //【基类提供的必要函数】
        const {
            svg,        // svg工具类
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            option,     // 配置项
            figure,     // 关键点
            setSheet,   // 样式表
            addEvent    // 事件
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        // 【defs】
        let defs = svg.initDefs();

        let
            pointsG = svg.g(),//折点组
            linesG = svg.g(),//折线组
            pointItemClass = ejs.simple();

        let lineAnim = 2000;

        //动画
        let pointsShow = ejs.keyframes({
            to: {opacity: 1}
        });

        setSheet('.' + pointItemClass, {
            opacity: 0,
            animation: pointsShow + ' 1s linear forwards'
        });

        //柱状背景
        let itemBgG = svg.g(),
            itemDataBg = ejs.attr(svg.symbol(), {id: ejs.simple(), y: figure.axisStartEnd.yAxis.end.y}),
            itemDataBgStart = X(0) + figure.axisSpan.x / 2,
            itemDataBgWidth = .8;

        svg.def(defs, ejs.appendBatch(itemDataBg, [
            svg.create('rect', {
                x: 0,
                y: 0,
                width: figure.axisSpan.x * itemDataBgWidth,
                height: figure.size.y,
                strokeWidth: 2,
                strokeLocation: 'inside',
                stroke: '#06495a',
                fill: 'none'
            }),
            svg.draw('line', {
                x1: figure.axisSpan.x * itemDataBgWidth/2,
                y1: 0,
                x2: figure.axisSpan.x * itemDataBgWidth/2,
                y2: figure.size.y
            },{
                strokeWidth: 2,
                stroke: '#06495a',
                strokeDasharray:"5,5"
            }),
        ]));


        let dataPointDelayStep = lineAnim / figure.dataPoints.length;
        figure.dataPoints.forEach((v, i) => {
            //组装点
            let pointItem = ejs.appendBatch(svg.g(), [
                    //根据数据关键点画点
                    svg.draw('circle', {
                        cx: v.x,
                        cy: v.y,
                        r: 4,
                    }, {
                        strokeWidth: 0,
                    }),
                    //环
                    svg.draw('circle', {
                        cx: v.x,
                        cy: v.y,
                        r: 25
                    }, {
                        strokeWidth: 2,
                        fill: 'none',
                    })]
                //中线

            );

            ejs.addClass(pointItem, pointItemClass);
            //点动画
            ejs.css(pointItem, {
                animationDelay: i * dataPointDelayStep + 'ms'
            });

            //柱子背景
            let useItemBg = svg.use(itemDataBg.id, {
                x: itemDataBgStart + figure.axisSpan.x * (1 - itemDataBgWidth) / 2,
                y: 0
            });

            itemDataBgStart += figure.axisSpan.x;

            //组装背景
            ejs.append(itemBgG, useItemBg);
            //组装点
            ejs.append(pointsG, pointItem);
        });
        //设置颜色
        let pointsGClass = ejs.simple();
        setSheet('.' + pointsGClass, {
            fill: '#0eabd4',
            stroke: '#0eabd4'
        });
        ejs.addClass(pointsG, pointsGClass);


        //折线组
        let line = svg.draw('lines', {
                d: figure.dataPoints
            }),
            lineLength = line.getTotalLength();

        ejs.appendBatch(linesG, [line]);
        let lineGo = ejs.keyframes({
            to: {strokeDashoffset: 0}
        });

        //线动画
        let linerGClass = ejs.simple();
        setSheet('.' + linerGClass, {
            strokeWidth: 2,
            stroke: '#0eabd4',
            strokeDasharray: lineLength,
            strokeDashoffset: lineLength,
            animation: lineGo + ' ' + lineAnim + 'ms linear forwards'
        });
        ejs.addClass(linesG, linerGClass);

        //背景


        addEvent('click', '.' + pointItemClass, e => {
            console.log(e);
        });


        //执行渲染
        render([
            defs,
            itemBgG,//背景
            linesG,//折线
            pointsG//折点
        ]);

        //===向外界抛出你的公共方法 ===\\
        return {


        }
    }
);