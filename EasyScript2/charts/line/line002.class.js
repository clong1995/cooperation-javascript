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

        //【默认值】
        param = ejs.assignDeep({
            data: {
                value: [10, 82, -33, 49, 31, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            },
            style: {
                position: {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 20
                },
                axis: {
                    x: {
                        line: {
                            borderColor: 'rgb(115,200,195)',
                            borderStyle: 'dashed'
                        },
                        tick: {
                            display: 'none'
                        },
                        label: {
                            color: 'rgb(115,200,195)',
                            lineHeight: 30,
                            fontSize: 12
                        }
                    },
                    y: {
                        line: {
                            display: 'none',
                            color: 'rgb(115,200,195)',
                        },
                        label: {
                            color: 'rgb(115,200,195)',
                            lineHeight: 30,
                            fontSize: 12
                        },
                        tick: {
                            borderColor: 'rgb(115,200,195)'
                        }
                    },
                    origin: {
                        display: 'none'
                    },
                    grid: {
                        display: 'none'
                    }
                }
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
            addEvent,   // 事件
            getPaper,    // 坐标纸组件
            load
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

        //【柱状背景】
        let itemBgG = svg.g(),
            itemDataBg = ejs.attr(svg.symbol(), {id: ejs.simple(), y: figure.axisStartEnd.yAxis.end.y}),
            itemDataBgStart = X(0) + figure.axisSpan.x / 2,
            itemDataBgWidth = .8;
        //柱状背景渐变
        let bgLinear = svg.linearGradient(defs);
        svg.def(defs, ejs.appendBatch(itemDataBg, [
            svg.create('rect', {
                x: 0,
                y: 0,
                width: figure.axisSpan.x * itemDataBgWidth,
                height: figure.size.y,
                strokeWidth: 2,
                strokeLocation: 'inside',
                stroke: '#06495a',
                fill: 'url(' + bgLinear + ')',
            }),
            svg.draw('line', {
                x1: figure.axisSpan.x * itemDataBgWidth / 2,
                y1: 0,
                x2: figure.axisSpan.x * itemDataBgWidth / 2,
                y2: figure.size.y
            }, {
                strokeWidth: 2,
                stroke: '#0eabd4',
                strokeDasharray: "5,5"
            }),
        ]));


        //【x轴文字的背景】
        let xTxtBgG = svg.g(),
            xTxtBg = ejs.attr(svg.symbol(), {
                id: ejs.simple(),
                //y: Y(0) + option.style.axis.x.label.lineHeight / 4
                y: figure.axisStartEnd.yAxis.start.y + option.style.axis.x.label.lineHeight / 4
            }),
            xTxtBgStart = X(0) + figure.axisSpan.x / 2,
            xTxtBgWidth = .8;
        //【文字背景渐变】
        let txtRadial = svg.radialGradient(defs, {
            cx: "50%",
            cy: "85%",
            r: "75%",
            fx: "50%",
            fy: "90%",
            offset: {
                "0%": {
                    color: 'rgb(14,171,212)',
                    opacity: .7
                },
                "50%": {
                    color: 'rgb(14,171,212)',
                    opacity: .4
                },
                "75%": {
                    color: 'rgb(14,171,212)',
                    opacity: .25
                },
                "100%": {
                    color: 'rgb(14,171,212)',
                    opacity: .1
                }
            }
        });
        svg.def(defs, ejs.append(xTxtBg,
            svg.create('rect', {
                x: 0,
                y: 0,
                width: figure.axisSpan.x * xTxtBgWidth,
                height: option.style.axis.x.label.lineHeight,
                strokeWidth: 2,
                strokeLocation: 'inside',
                stroke: '#06495a',
                fill: 'url(' + txtRadial + ')',
            })
        ));

        //【x轴样式】
        if (figure.maxMinData.min >= 0) {
            getPaper().delete('axis');
        }


        //【设置点颜色】
        let pointsGClass = ejs.simple();
        setSheet('.' + pointsGClass, {
            fill: '#0eabd4',
            stroke: '#0eabd4'
        });
        ejs.addClass(pointsG, pointsGClass);

        let dataPointDelayStep = lineAnim / figure.dataPoints.length;
        figure.dataPoints.forEach((v, i) => {

            let size = Math.abs(v.value / figure.maxMinData.max) * 25;

            //组装点
            let pointItem = ejs.appendBatch(svg.g(), [
                    //根据数据关键点画点
                    svg.draw('circle', {
                        cx: v.x,
                        cy: v.y,
                        r: size / 4,
                    }, {
                        strokeWidth: 0,
                    }),
                    //环
                    svg.draw('circle', {
                        cx: v.x,
                        cy: v.y,
                        r: size
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
            });
            itemDataBgStart += figure.axisSpan.x;

            //x轴文字背景
            let useXTxtBg = svg.use(xTxtBg.id, {
                x: xTxtBgStart + figure.axisSpan.x * (1 - itemDataBgWidth) / 2
            });
            xTxtBgStart += figure.axisSpan.x;


            //组装背景
            ejs.append(itemBgG, useItemBg);
            //组装x轴背景
            ejs.append(xTxtBgG, useXTxtBg);
            //组装点
            ejs.append(pointsG, pointItem);
        });


        //【折线组】
        let line = svg.draw('lines', {
                d: figure.dataPoints
            }),
            lineLength = line.getTotalLength();

        ejs.appendBatch(linesG, [line]);
        let lineGo = ejs.keyframes({
            to: {strokeDashoffset: 0}
        });

        //【线动画】
        let linerGClass = ejs.simple();
        setSheet('.' + linerGClass, {
            strokeWidth: 2,
            stroke: '#0eabd4',
            strokeDasharray: lineLength,
            strokeDashoffset: lineLength,
            animation: lineGo + ' ' + lineAnim + 'ms linear forwards'
        });
        ejs.addClass(linesG, linerGClass);


        addEvent('click', '.' + pointItemClass, e => {
            console.log(e);
        });

        //执行渲染
        render([
            defs,
            xTxtBgG,//x轴文字背景
            itemBgG,//背景
            linesG,//折线
            pointsG//折点
        ]);

        //===向外界抛出你的公共方法 ===\\
        return {
            load:load
        }
    }
);