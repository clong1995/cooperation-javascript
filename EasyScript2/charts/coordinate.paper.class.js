/**
 * 绘画图纸：坐标纸
 * 时间：2018年5月28日15:04:03
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'coordinate.paper',
    param => {
        //【参数补全机制】
        let option = ejs.assignDeep({
                style: {
                    //标题
                    title: {
                        content: '这是一个标题',
                        fontSize: 14,
                        lineHeight: 64,
                        color: 'rgba(0,0,0,1)',
                        fontWeight: 'normal',
                        fontFamily: '\'Microsoft YaHei\',sans-serif',
                        align: 'center',
                        display: param.theme.display,
                        marginLeft: 0,
                        marginRight: 0
                    },
                    //原点
                    origin: {
                        point: {
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            width: 5,
                            background: 'rgba(255,255,255,1)',
                            marginTop: 20,
                            marginRight: 20,
                            display: param.theme.display
                        },
                        //文本
                        label: {
                            content: 'O',
                            fontSize: 14,
                            lineHeight: 20,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center',
                            display: param.theme.display
                        }
                    },
                    //坐标轴
                    axis: {
                        //y轴
                        x: {
                            //标题
                            title: {
                                /*css rule*/
                                display: param.theme.display
                            },
                            //轴线
                            line: {
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 2,
                                display: param.theme.display
                            },
                            //坐标刻度线
                            tick: {
                                height: 10,
                                borderWidth: 2,
                                borderColor: 'rgba(0,0,0,1)',
                                marginTop: 0,
                                marginBottom: 0,
                                display: param.theme.display
                            },
                            //文本
                            label: {
                                fontSize: 14,
                                lineHeight: 20,
                                color: 'rgba(0,0,0,1)',
                                fontWeight: 'normal',
                                fontFamily: '\'Microsoft YaHei\',sans-serif',
                                align: 'center',
                                display: param.theme.display
                            },
                            endpoint: {
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 2,
                                width: 5,
                                background: 'rgba(255,255,255,1)',
                                display: param.theme.display
                            }
                        },
                        //x轴
                        y: {
                            //标题
                            title: {
                                /*css rule*/
                                display: param.theme.display
                            },
                            //轴线
                            line: {
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 2,
                                display: param.theme.display
                            },
                            //坐标刻度线
                            tick: {
                                width: 10,
                                borderWidth: 2,
                                borderColor: 'rgba(0,0,0,1)',
                                marginRight: 0,
                                marginLeft: 0,
                                display: param.theme.display
                            },
                            //文本
                            label: {
                                fontSize: 14,
                                lineHeight: 20,
                                color: 'rgba(0,0,0,1)',
                                fontWeight: 'normal',
                                fontFamily: '\'Microsoft YaHei\',sans-serif',
                                align: 'center',
                                display: param.theme.display
                            },
                            endpoint: {
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 2,
                                width: 5,
                                background: 'rgba(255,255,255,1)',
                                display: param.theme.display
                            }
                        },
                        //网格线
                        grid: {
                            x: {
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.2)',
                                display: param.theme.display
                            },
                            y: {
                                borderWidth: 1,
                                borderColor: 'rgba(0,0,0,0.1)',
                                display: param.theme.display
                            }
                        },
                        //辅助
                        guild: {
                            //指示器
                            pointer: {},
                            //悬浮窗
                            tooltip: {
                                //线
                                line: {
                                    /*css rule*/
                                },
                                //
                                box: {}
                            },
                        }
                    },
                    //图例
                    legend: {
                        //标题
                        title: {
                            /*css rule*/
                        },
                        //图例项
                        item: {
                            //标志
                            marker: {
                                /*css rule*/
                            },
                            //文本
                            label: {
                                /*css rule*/
                            }
                        }
                    }
                },
                series: {}
            },
            param
        );


        //【简化链式查找】
        let
            svg = option.svg,
            offsetSize = option.offsetSize,
            style = option.style,

            //标题
            opt_title = style.title,

            //坐标原点
            originPoint = style.origin.point,
            originLabel = style.origin.label,

            //x轴系列
            axisX = style.axis.x,
            xTitle = axisX.title,
            xLine = axisX.line,
            xTick = axisX.tick,
            xLabel = axisX.label,
            opt_xEndpoint = axisX.endpoint,

            //y轴系列
            axisY = style.axis.y,
            yTitle = axisY.title,
            yLine = axisY.line,
            yTick = axisY.tick,
            yLabel = axisY.label,
            opt_yEndpoint = axisY.endpoint,

            //网格线
            xGrid = style.axis.grid.x,
            yGrid = style.axis.grid.y;


        //【数据容器】
        let data = option.data,
            yAxisData = [],
            xAxisData = data.key;

        //【y轴分段】
        let spanCount = 10;
        //逻辑最值，降级取整
        let
            maxData = ejs.arrMaxMin(data.value, 'max'),
            minData = ejs.arrMaxMin(data.value, 'min'),
            yAxisMaxRank = Math.pow(10, Math.abs(maxData) < 100 ? 1 : Math.abs(maxData).toString().length - 2),
            yAxisMinRank = Math.pow(10, Math.abs(minData) < 100 ? 1 : Math.abs(minData).toString().length - 2),
            yAxisMax = Math.ceil(maxData / yAxisMaxRank) * yAxisMaxRank,
            yAxisMin = Math.ceil(minData / yAxisMinRank) * yAxisMinRank;

        let spanValue = 0,//每一段的单位长度
            oIndex = 0;//寻找0位置的索引，用来确定存在负值时x轴的位置金和原点

        if (minData > 0) {
            spanValue = yAxisMax / spanCount;
            yAxisMin = spanValue;
        } else {
            spanValue = ejs.gcd(yAxisMax, Math.abs(yAxisMin));
        }

        //段值
        for (let i = 0; i < spanCount; i++) {
            let num = spanValue * i + yAxisMin;
            yAxisData.push(num);
            if (!num && minData < 0) oIndex = i + 1;
        }

        //y轴最大文本宽度
        let
            yMinStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'min').toString()) * yLabel.fontSize,
            yMaxStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'max').toString()) * yLabel.fontSize,
            yStrWidth = yMinStrWidth > yMaxStrWidth ? yMinStrWidth : yMaxStrWidth;


        //逻辑起点
        let yAxisStart = {
            //x位
            x: yLine.borderWidth +
            yTick.width +
            yTick.marginRight +
            yTick.marginLeft +
            yStrWidth,
            //y位
            y: offsetSize.height - (
                xLine.borderWidth +
                xTick.height +
                xTick.marginTop +
                xTick.marginBottom +
                xLabel.lineHeight
            )
        };


        //【坐标轴长度】
        let axisLength = {
            x: offsetSize.width - yAxisStart.x,
            y: yAxisStart.y - opt_title.lineHeight
        };

        //【逻辑原点】
        let O = {
            //x位
            x: yAxisStart.x,
            //y位
            y: yAxisStart.y - oIndex * (axisLength.y / (spanCount + 1))
        };


        //【svg坐标转逻辑正向笛卡尔坐标】
        let X = x => x + O.x,
            Y = y => O.y - y;


        //刻度点
        let {xAxisPoint, yAxisPoint, xSpan, ySpan} = ((xd, yd) => {
            let point = {
                xAxisPoint: [],
                yAxisPoint: [],
                xSpan: axisLength.x / (xd.length + 1),
                ySpan: axisLength.y / (yd.length + 1)
            };

            for (let i = 1; i < xd.length + 1; ++i)
                point.xAxisPoint.push(X(point.xSpan * i));

            for (let i = 1; i < yd.length + 1; ++i) {
                point.yAxisPoint.push(yAxisStart.y - point.ySpan * i);
            }
            return point;
        })(xAxisData, yAxisData);


        let sheetMap = new Map();

        //【事件管理】
        let eventMap = new Map();

        /**
         * 标题
         * @returns {[null]}
         */
        function title() {
            if (opt_title.display === 'none') {
                return false;
            }
            let clazz = ejs.simple();

            //x轴文本
            let text = svg.create('text', {
                y: opt_title.lineHeight / 2,
            });

            let titleLen = ejs.strLength(opt_title.content);

            //属性
            opt_title.align === 'left' ? ejs.attr(text, {
                x: opt_title.marginLeft
            }) : opt_title.align === 'right' ? ejs.attr(text, {
                x: O.x + axisLength.x - titleLen * opt_title.fontSize - opt_title.marginRight
            }) : ejs.attr(text, {
                x: (O.x + axisLength.x - titleLen * opt_title.fontSize) / 2
            });
            //节点内容
            svg.addText(text, opt_title.content);

            let g = svg.g([text]);
            ejs.addClass(g, clazz);

            //设置默认样式
            sheetMap.set('.' + clazz, {
                fontSize: opt_title.fontSize,
                lineHeight: opt_title.lineHeight,
                fill: opt_title.color,
                fontWeight: opt_title.fontWeight,
                fontFamily: opt_title.fontFamily
            });

            return g;
        }

        /**
         * 坐标轴端点
         * @returns {[null]}
         */
        function endpoint() {

            return [];
        }

        /**
         * 坐标轴生成器
         * @param option
         * @returns {{xAxis: *}}
         */
        let axis = () => {
            let xAxis = null,
                yAxis = null;

            //x轴
            if (xLine.display !== 'none') {
                let xAxisClazz = ejs.simple();
                xAxis = svg.draw('line', {
                    x1: O.x,
                    y1: O.y,
                    x2: axisLength.x + O.x,
                    y2: O.y
                });

                ejs.addClass(xAxis, xAxisClazz);

                //设置默认样式
                sheetMap.set('.' + xAxisClazz, {
                    stroke: xLine.borderColor,
                    strokeWidth: xLine.borderWidth,
                });
            }


            //y轴
            if (yLine.display !== 'none') {
                let yAxisClazz = ejs.simple();
                yAxis = svg.draw('line', {
                    x1: O.x,
                    y1: yAxisStart.y,
                    x2: O.x,
                    y2: yAxisStart.y - axisLength.y
                });

                ejs.addClass(yAxis, yAxisClazz);

                //设置默认样式
                sheetMap.set('.' + yAxisClazz, {
                    stroke: yLine.borderColor,
                    strokeWidth: yLine.borderWidth,
                });
            }


            //目前将x轴和y轴混合到一块
            let g = svg.g([xAxis, yAxis]);
            return g;
        };

        /**
         * 坐标原点
         * @returns {[null,null]}
         */
        let origin = () => {
            let circle = null,
                text = null;

            //圆形
            if (originPoint.display !== 'none') {
                let OClazz = ejs.simple();
                circle = svg.draw('circle', {
                    cx: O.x,
                    cy: O.y,
                    r: originPoint.width
                });
                ejs.addClass(circle, OClazz);
                sheetMap.set('.' + OClazz, {
                    stroke: originPoint.borderColor,
                    strokeWidth: originPoint.borderWidth,
                    fill: originPoint.background
                });
            }


            //文本 originLabel.content
            if (originLabel.display !== 'none') {
                let OTextClazz = ejs.simple();
                text = svg.create('text', {
                    x: O.x - originPoint.marginTop,
                    y: O.y + originPoint.marginRight,
                });
                ejs.addClass(text, OTextClazz);

                sheetMap.set('.' + OTextClazz, {
                    fill: originLabel.color,
                    fontSize: originLabel.fontSize,
                    lineHeight: originLabel.lineHeight,
                    fontWeight: originLabel.fontWeight,
                    fontFamily: originLabel.fontFamily,
                    textAnchor: originLabel.align === 'left' ? 'end' : originLabel.align === 'right' ? 'start' : 'middle'
                });

                text.textContent = originLabel.content;
            }

            return svg.g([circle, text]);
        };

        /**
         * 刻度线
         * @returns {*|number}
         */
        let tick = () => {

            let xTickG = null,
                yTickG = null;

            //x轴刻度
            if (xTick.display !== 'none') {
                let xTickClazz = ejs.simple();
                let xTickArr = [];

                let xTickNode = svg.draw('line', {
                    y1: Y(0),
                    y2: Y(0) + xTick.height
                });

                sheetMap.set('.' + xTickClazz, {
                    stroke: xTick.borderColor,
                    strokeWidth: xTick.borderWidth,
                });

                xAxisPoint.forEach(v =>
                    xTickArr.push(ejs.attr(xTickNode.cloneNode(), {
                        x1: v,
                        x2: v
                    }))
                );
                xTickG = svg.g(xTickArr);
                ejs.addClass(xTickG, xTickClazz);
            }

            //y轴刻度
            if (yTick.display !== 'none') {
                let yTickClazz = ejs.simple();
                let yTickArr = [];
                let yTickNode = svg.draw('line', {
                    x1: X(0) - yTick.width,
                    x2: X(0)
                });
                sheetMap.set('.' + yTickClazz, {
                    stroke: yTick.borderColor,
                    strokeWidth: yTick.borderWidth
                });
                yAxisPoint.forEach(v =>
                    yTickArr.push(ejs.attr(yTickNode.cloneNode(), {
                        y1: v,
                        y2: v
                    }))
                );
                yTickG = svg.g(yTickArr);
                ejs.addClass(yTickG, yTickClazz);
            }

            //x刻度和y刻度,目前混合到一块处理
            return [xTickG, yTickG];
        };


        /**
         * 坐标文本
         * @returns {*|number}
         */
        let axisLabel = () => {
            let xAxisLabelG = null,
                yAxisLabelG = null;

            if (xLabel.display !== 'none') {
                let xAxisLabelArr = [];
                let xAxisLabelClazz = ejs.simple();
                //x轴文本
                let xAxisLabelNode = svg.create('text', {
                    y: Y(0) + xTick.height + xLabel.lineHeight
                });
                sheetMap.set('.' + xAxisLabelClazz, {
                    fill: xLabel.color,
                    fontSize: xLabel.fontSize,
                    lineHeight: xLabel.lineHeight,
                    fontWeight: xLabel.fontWeight,
                    fontFamily: xLabel.fontFamily,
                    textAnchor: xLabel.align === 'left' ? 'end' : xLabel.align === 'right' ? 'start' : 'middle'
                });

                xAxisPoint.forEach((v, i) => {
                        let cloneNode = xAxisLabelNode.cloneNode();
                        cloneNode.textContent = xAxisData[i];
                        ejs.attr(cloneNode, {x: v});
                        xAxisLabelArr.push(cloneNode);
                    }
                );
                xAxisLabelG = svg.g(xAxisLabelArr);
                ejs.addClass(xAxisLabelG, xAxisLabelClazz);
            }

            if (yLabel.display !== 'none') {
                let yAxisLabelArr = [];
                let yAxisLabelClazz = ejs.simple();
                let yAxisLabelNode = svg.create('text', {
                    x: X(0) - yTick.width - yStrWidth / 2
                });
                sheetMap.set('.' + yAxisLabelClazz, {
                    fill: yLabel.color,
                    fontSize: yLabel.fontSize,
                    //lineHeight: yLabel.lineHeight,
                    fontWeight: yLabel.fontWeight,
                    fontFamily: yLabel.fontFamily,
                    textAnchor: yLabel.align === 'left' ? 'end' : yLabel.align === 'right' ? 'start' : 'middle'
                });

                yAxisPoint.forEach((v, i) => {
                        let cloneNode = yAxisLabelNode.cloneNode();
                        cloneNode.textContent = yAxisData[i];
                        ejs.attr(cloneNode, {y: v + yLabel.lineHeight / 5});
                        yAxisLabelArr.push(cloneNode);
                    }
                );
                yAxisLabelG = svg.g(yAxisLabelArr);
                ejs.addClass(yAxisLabelG, yAxisLabelClazz);
            }

            return [xAxisLabelG, yAxisLabelG];
        };

        /**
         * 网格线
         * @returns {*|number}
         */
        let grid = () => {

            let xGridG = null, yGridG = null;

            //纵向
            if (xGrid.display !== 'none') {
                let xGridClazz = ejs.simple();
                let xGridArr = [];
                let xGridNode = svg.draw('line', {
                    y1: yAxisStart.y,
                    y2: yAxisStart.y - axisLength.y
                });
                sheetMap.set('.' + xGridClazz, {
                    stroke: xGrid.borderColor,
                    strokeWidth: xGrid.borderWidth,
                });

                xAxisPoint.forEach(v =>
                    xGridArr.push(ejs.attr(xGridNode.cloneNode(), {
                        x1: v,
                        x2: v
                    }))
                );
                xGridG = svg.g(xGridArr);
                ejs.addClass(xGridG, xGridClazz);
            }

            //横向
            if (yGrid.display !== 'none') {
                let yGridClazz = ejs.simple();
                let yGridArr = [];
                let yGridNode = svg.draw('line', {
                    x1: X(0),
                    x2: axisLength.x + O.x
                });
                sheetMap.set('.' + yGridClazz, {
                    stroke: yGrid.borderColor,
                    strokeWidth: yGrid.borderWidth,
                });

                yAxisPoint.forEach(v =>
                    yGridArr.push(ejs.attr(yGridNode.cloneNode(), {
                        y1: v,
                        y2: v
                    }))
                );
                yGridG = svg.g(yGridArr);
                ejs.addClass(yGridG, yGridClazz);
            }

            //x刻度和y刻度,目前混合到一块处理
            return [xGridG, yGridG];
        };


        /**
         * 计算关键点
         */
        let figure = () => {
            //数据关键点
            let datas = [];
            let unit = ySpan / spanValue;
            data.value.forEach((v, i) => {
                datas.push({
                    value: v,
                    x: xAxisPoint[i],
                    y: Y(0) - v * unit
                });
            });


            //坐标关键点
            let xPoint = [],
                yPoint = [];
            xAxisPoint.forEach(v => xPoint.push({x: v, y: Y(0)}));
            yAxisPoint.forEach(v => yPoint.push({x: X(0), y: v}));

            return {
                //数据关键点
                dataPoints: datas,
                maxMinData: {
                    max: maxData,
                    min: minData
                },
                axisStartEnd: {
                    xAxis: {
                        start: O,
                        end: {
                            x: axisLength.x + O.x,
                            y: O.y
                        }
                    },
                    yAxis: {
                        start: {
                            x: O.x,
                            y: yAxisStart.y
                        },
                        end: {
                            x: O.x,
                            y: yAxisStart.y - axisLength.y
                        }
                    },
                },
                //坐标轴关键点
                axisPoints: {
                    x: xPoint,
                    y: yPoint
                },
                //坐标轴间隔
                axisSpan: {
                    x: xSpan,
                    y: ySpan
                },
                size: axisLength
            };
        };


        let chartParts = [
            //title(),
            //endpoint(),
            axis(),
            origin(),
            ...tick(),
            ...axisLabel(),
            ...grid()
        ];


        /*/!**
         * 渲染方法
         * @param IteratorNode 部署了Iterator接口的结构
         * @returns {*}
         *!/
        let render = (IteratorNode) => {



            /!*!//组装标题
            ejs.append(svgNode, title());
            //组装坐标轴上的端点
            ejs.appendBatch(svgNode, endpoint());
            //轴
            ejs.append(svgNode, axis());
            //组装原点
            ejs.append(svgNode, origin());
            //组装刻度线
            ejs.appendBatch(svgNode, tick());
            //组装刻度文本
            ejs.appendBatch(svgNode, axisLabel());
            //组装网格线
            ejs.appendBatch(svgNode, grid());*!/



            //创建样式表










            //释放样式存储
            //sheetMap = null;
            //释放事件
            //eventMap = null;
            //return svgNode;
        };*/



        let publicFn = {
            option: option,
            chartParts: chartParts,
            sheetMap: sheetMap,
            eventMap: eventMap,
            figure: figure(),
            X: X,
            Y: Y
        };

        //危险属性屏蔽
        Object.defineProperty(publicFn, 'chartParts', {enumerable: false});
        Object.defineProperty(publicFn, 'sheetMap', {enumerable: false});
        Object.defineProperty(publicFn, 'eventMap', {enumerable: false});

        return publicFn;
    }
);



// { b: 'c' }