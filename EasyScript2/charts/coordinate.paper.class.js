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
                //位置
                position: {
                    top: param.theme.fontSize,
                    right: param.theme.fontSize,
                    bottom: param.theme.fontSize,
                    left: param.theme.fontSize
                },
                //标题
                title: {
                    content: '这是一个标题',
                    fontSize: param.theme.fontSize,
                    lineHeight: param.theme.fontSize,
                    color: 'rgba(0,0,0,1)',
                    fontWeight: 'normal',
                    fontFamily: '\'Microsoft YaHei\',sans-serif',
                    align: 'center',
                    display: param.theme.display,
                    marginLeft: 0,
                    marginRight: 0
                },

                //坐标轴
                axis: {
                    //x轴
                    x: {
                        display: param.theme.display,
                        //轴线
                        line: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            borderStyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: param.theme.display,
                            height: 10,
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,1)'
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            fontSize: param.theme.fontSize,
                            lineHeight: param.theme.fontSize,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //y轴
                    y: {
                        display: param.theme.display,
                        //轴线
                        line: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            borderSyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: param.theme.display,
                            width: 10,
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,1)'
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            fontSize: param.theme.fontSize,
                            lineHeight: param.theme.fontSize,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //原点
                    origin: {
                        display: param.theme.display,
                        point: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            width: 5,
                            background: 'rgba(255,255,255,1)',
                            marginTop: 20,
                            marginRight: 20
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            content: 'O',
                            fontSize: param.theme.fontSize,
                            lineHeight: 20,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //网格线
                    grid: {
                        display: param.theme.display,
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
        }, param);

        //【简化链式查找】
        let
            svg = option.svg,
            offsetSize = option.offsetSize,

            //定位
            position = option.style.position,

            //x轴系列
            axisX = option.style.axis.x,
            xTitle = axisX.title,
            xLine = axisX.line,
            xTick = axisX.tick,
            xLabel = axisX.label,

            //y轴系列
            axisY = option.style.axis.y,
            yTitle = axisY.title,
            yLine = axisY.line,
            yTick = axisY.tick,
            yLabel = axisY.label,


            //坐标原点
            origin = option.style.axis.origin,
            originPoint = origin.point,
            originLabel = origin.label,

            //网格线
            grid = option.style.axis.grid,
            xGrid = grid.x,
            yGrid = grid.y;


        //【数据容器】
        let data = option.data,
            yAxisData = [],
            xAxisData = data.key;

        //【y轴分段】
        let spanCount = 10;

        // 【最值】
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

        //【段值】
        for (let i = 0; i < spanCount; i++) {
            let num = spanValue * i + yAxisMin;
            yAxisData.push(num);
            if (!num && minData < 0) oIndex = i + 1;
        }

        //【y轴配置display变化引发的影响合计】
        //y轴轴线宽度
        let yLineWidth = yLine.display !== 'none' ? yLine.borderWidth : 0;
        //y轴文本
        let yStrWidth = 0;
        if (yLabel.display !== 'none') {
            let //y轴最大文本宽度
                yMinStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'min').toString()) * yLabel.fontSize,
                yMaxStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'max').toString()) * yLabel.fontSize;
            yStrWidth = yMinStrWidth > yMaxStrWidth ? yMinStrWidth : yMaxStrWidth
        }
        //坐标刻度线
        let yTickWidth = yTick.display !== 'none' ? yTick.width : 0;
        if (axisY.display === 'none') {
            yLineWidth = yStrWidth = yTickWidth = 0;
        }
        let yAxisSpace = yLineWidth + yStrWidth + yTickWidth;


        //【x轴配置display变化引发的影响合计】
        //x轴轴线宽度
        let xLineWidth = xLine.display !== 'none' ? xLine.borderWidth : 0;
        //x轴文本
        let xStrHeight = xLabel.display !== 'none' ? xLabel.lineHeight : 0;
        //坐标刻度线
        let xTickHeight = xTick.display !== 'none' ? xTick.height : 0;
        if (axisX.display === 'none') {
            xLineWidth = xStrHeight = xTickHeight = 0;
        }
        let xAxisSpace = xLineWidth + xStrHeight + xTickHeight;


        //【逻辑起点】
        let yAxisStart = {
            //x位
            x: yAxisSpace + position.left,
            //y位
            y: offsetSize.height - xAxisSpace - position.bottom
        };


        //【坐标轴长度】
        let axisLength = {
            x: offsetSize.width - yAxisStart.x - position.right,
            y: yAxisStart.y - position.top
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


        //【刻度点】
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

        //【样式】
        let sheetMap = new Map();

        //【事件】
        let eventMap = new Map();


        /**
         * 坐标轴生成器
         * @returns {*}
         */
        function drawAxis() {
            let xAxis = null,
                yAxis = null;

            //x轴
            if (xLine.display !== 'none' && axisX.display !== 'none') {
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
                    strokeWidth: xLineWidth
                });

                if (xLine.borderStyle === 'solid') {

                } else if (xLine.borderStyle === 'dashed') {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = xLine.borderWidth * 4 + "," + xLine.borderWidth * 4
                } else {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = xLine.borderStyle
                }
            }


            //y轴
            if (yLine.display !== 'none' && axisY.display !== 'none') {
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
                    strokeWidth: yLineWidth,
                });
            }


            //目前将x轴和y轴混合到一块
            let g = svg.g([xAxis, yAxis]);
            return g;
        }

        /**
         * 坐标原点
         * @returns {[null,null]}
         */
        function drawOrigin() {
            let circle = null,
                text = null;

            if (origin.display !== 'none') {
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
            }


            return svg.g([circle, text]);
        }

        /**
         * 刻度线
         * @returns {*|number}
         */
        function drawTick() {

            let xTickG = null,
                yTickG = null;

            //x轴刻度
            if (xTick.display !== 'none' && axisX.display !== 'none') {
                let xTickClazz = ejs.simple();
                let xTickArr = [];

                let xTickNode = svg.draw('line', {
                    /*y1: Y(0),
                    y2: Y(0) + xTickHeight*/
                    y1: yAxisStart.y,
                    y2: yAxisStart.y + xTickHeight
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
            if (yTick.display !== 'none' && axisY.display !== 'none') {
                let yTickClazz = ejs.simple();
                let yTickArr = [];
                let yTickNode = svg.draw('line', {
                    x1: X(0) - yTickWidth,
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
            return svg.g([xTickG, yTickG]);
        }


        /**
         * 坐标文本
         * @returns {*|number}
         */
        function drawAxisLabel() {
            let xAxisLabelG = null,
                yAxisLabelG = null;

            if (xLabel.display !== 'none' && xAxisSpace) {
                let xAxisLabelArr = [];
                let xAxisLabelClazz = ejs.simple();
                //x轴文本
                let xAxisLabelNode = svg.create('text', {
                    //y: Y(0) + xTickHeight + xStrHeight,
                    y: yAxisStart.y + xTickHeight + xStrHeight,
                    fontSize: xLabel.fontSize
                });

                sheetMap.set('.' + xAxisLabelClazz, {
                    fill: xLabel.color,
                    lineHeight: xStrHeight,
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

            if (yLabel.display !== 'none' && yAxisSpace) {
                let yAxisLabelArr = [];
                let yAxisLabelClazz = ejs.simple();
                let yAxisLabelNode = svg.create('text', {
                    x: X(0) - yTickWidth - yStrWidth / 2,
                    fontSize: yLabel.fontSize
                });
                sheetMap.set('.' + yAxisLabelClazz, {
                    fill: yLabel.color,
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

            return svg.g([xAxisLabelG, yAxisLabelG]);
        }

        /**
         * 网格线
         * @returns {*|number}
         */
        function drawGrid() {
            let xGridG = null, yGridG = null;

            if (grid.display !== 'none') {
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
            }


            //x刻度和y刻度,目前混合到一块处理
            return svg.g([xGridG, yGridG]);
        }


        /**
         * 计算关键点
         * */
        function figure() {
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
                O: O,
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
        }


        let chartPartMap = new Map([
            ['axis', drawAxis()],
            ['origin', drawOrigin()],
            ['tick', drawTick()],
            ['axisLabel', drawAxisLabel()],
            ['grid', drawGrid()]
        ]);


        let publicFn = {
            option: option,
            chartPartMap: chartPartMap,
            sheetMap: sheetMap,
            eventMap: eventMap,
            figure: figure(),
            X: X,
            Y: Y
        };

        //危险属性屏蔽
        Object.defineProperty(publicFn, 'chartPartMap', {enumerable: false});
        Object.defineProperty(publicFn, 'sheetMap', {enumerable: false});
        Object.defineProperty(publicFn, 'eventMap', {enumerable: false});

        return publicFn;
    }
);


// { b: 'c' }