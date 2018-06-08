/**
 * 绘画图纸：坐标纸
 * 时间：2018年5月28日15:04:03
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'coordinate.paper',
    param => {
        //引用的模块
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');//svg操作类

        //变量定义
        let option = {};    //用户配置的参数
        let shot = {};      //简化链式查找
        let chartSize = {}; //图表大小
        let data = {};      //数据容器
        let dataTemp = {};
        let yAxisData = []; //y轴数据
        let xAxisData = []; //x轴数据
        let maxData = 0;    //数据最大值
        let minData = 0;    //数据最小值
        let yAxisMin = 0;   //y轴最小值
        let yAxisMax = 0;   //y轴最大值
        let yStrWidth = 0;  //y轴字符长度
        let yTickWidth = 0; //y轴刻度线长度
        let yAxisSpace = 0; //y方向的空间
        let xStrHeight = 0; //x轴字符高度
        let xTickHeight = 0;//x轴刻度高度
        let xAxisSpace = 0; //x方向轴空间
        let yAxisStart = {};//y轴逻辑起点
        let axisLength = {};//坐标轴长度
        let span = 10;      //y轴分段值
        let spanValue = 0;  //y轴单段值
        let spanHeight = 0; //y轴高度值
        let oIndex = -1;    //原点所在的索引
        let interval = 0;   //实际间隔
        let O = {};         //逻辑原点
        let xSpan = 0;
        let xAxisPoint = [];
        let yAxisPoint = [];
        let sheetMap = new Map();//样式
        let eventMap = new Map();//事件


        //【参数补全机制】
        option = ejs.assignDeep({
            style: {
                //位置
                position: {
                    top: param.theme.fontSize,
                    right: param.theme.fontSize,
                    bottom: param.theme.fontSize,
                    left: param.theme.fontSize
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
            }
        }, param);


        //【简化链式查找】
        shot = {
            //取样
            capacity: option.capacity,

            offsetSize: option.offsetSize,

            //定位
            position: option.style.position,

            //x轴系列
            axisX: option.style.axis.x,
            xLine: option.style.axis.x.line,
            xTick: option.style.axis.x.tick,
            xLabel: option.style.axis.x.label,

            //y轴系列
            axisY: option.style.axis.y,
            yLine: option.style.axis.y.line,
            yTick: option.style.axis.y.tick,
            yLabel: option.style.axis.y.label,


            //坐标原点
            origin: option.style.axis.origin,
            originPoint: option.style.axis.origin.point,
            originLabel: option.style.axis.origin.label,

            //网格线
            grid: option.style.axis.grid,
            xGrid: option.style.axis.grid.x,
            yGrid: option.style.axis.grid.y
        };

        //图表大小
        chartSize = {
            width: shot.offsetSize.width - shot.position.left - shot.position.right,
            height: shot.offsetSize.height - shot.position.top - shot.position.bottom
        };

        //【数据容器】
        //计算取样点
        let capacity = Math.round(option.data.key.length / shot.capacity);
        capacity = capacity ? capacity : 1;
        //过滤数据
        data = {key:[], value:[]};
        option.data.key.forEach((v,i)=>{
            if (!(i % capacity)) {
                data.key.push(option.data.key[i]);
                data.value.push(option.data.value[i]);
            }
        });


        xAxisData = data.key;


        //【最值】
        maxData = ejs.arrMaxMin(data.value, 'max');
        minData = ejs.arrMaxMin(data.value, 'min');
        minData = minData >= 0 ? 0 : minData;

        //【最小最小】
        yAxisMin = Math.floor(minData / 10) * 10;
        yAxisMax = Math.ceil(maxData / 10) * 10;


        //【y轴配置display变化引发的影响合计】
        if (shot.yLabel.display !== 'none') {
            let //y轴最大文本宽度
                yMinStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'min').toString()) * shot.yLabel.fontSize / 3,
                yMaxStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'max').toString()) * shot.yLabel.fontSize / 3;
            yStrWidth = yMinStrWidth > yMaxStrWidth ? yMinStrWidth : yMaxStrWidth
        }
        //坐标刻度线
        yTickWidth = shot.yTick.display !== 'none' ? shot.yTick.width : 0;
        if (shot.axisY.display === 'none')
            yStrWidth = yTickWidth = 0;
        yAxisSpace = yStrWidth + yTickWidth + shot.position.left;


        //【x轴配置display变化引发的影响合计】
        xStrHeight = shot.xLabel.display !== 'none' ? shot.xLabel.lineHeight * 1.25 : 0;
        //坐标刻度线
        xTickHeight = shot.xTick.display !== 'none' ? shot.xTick.height : 0;
        if (shot.axisX.display === 'none')
            xStrHeight = xTickHeight = 0;
        xAxisSpace = xStrHeight + xTickHeight;


        //【逻辑起点】
        yAxisStart = {
            //x位
            x: yAxisSpace,
            //y位
            y: shot.offsetSize.height - shot.position.bottom - xAxisSpace
        };


        //【坐标轴长度】
        axisLength = {
            x: chartSize.width - yAxisSpace,
            y: chartSize.height - xAxisSpace
        };

        //【y轴分段】
        spanValue = (yAxisMax - yAxisMin) / span;
        spanHeight = axisLength.y / spanValue;

        //【段值】
        //寻找0位置的索引，用来确定存在负值时x轴的位置金和原点
        for (let i = 0; true; i += span) {
            let num = yAxisMin + i;
            yAxisData.push(num);
            if (oIndex === -1 && num >= 0) oIndex = i / span;
            if (num >= yAxisMax) break;
        }


        //【间隔】
        interval = yAxisData.length > 10 ? Math.round(yAxisData.length / 10) : 0;

        //【逻辑原点】
        O = {
            //x位
            x: yAxisStart.x,
            //y位
            y: yAxisStart.y - oIndex * spanHeight
        };


        //【刻度点】
        xSpan = axisLength.x / (xAxisData.length + 1);
        for (let i = 1; i < xAxisData.length + 1; ++i)
            xAxisPoint.push(X(xSpan * i));
        for (let i = 0; i < spanValue + 1; ++i) {
            yAxisPoint.push(yAxisStart.y - spanHeight * i);
        }


        //【svg坐标转逻辑正向笛卡尔坐标】
        function X(x) {
            return x + O.x;
        }

        function Y(y) {
            return O.y - y;
        }

        /**
         * 坐标轴生成器
         * @returns {*}
         */
        function drawAxis() {
            let xAxis = null,
                yAxis = null;

            //x轴
            if (shot.xLine.display !== 'none' && shot.axisX.display !== 'none') {
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
                    stroke: shot.xLine.borderColor,
                    strokeWidth: shot.xLine.display !== 'none' ? shot.xLine.borderWidth : 0
                });

                if (shot.xLine.borderStyle === 'solid') {

                } else if (shot.xLine.borderStyle === 'dashed') {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderWidth * 4 + "," + shot.xLine.borderWidth * 4
                } else {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderStyle
                }
            }


            //y轴
            if (shot.yLine.display !== 'none' && shot.axisY.display !== 'none') {
                let yAxisClazz = ejs.simple();
                yAxis = svg.draw('line', {
                    x1: O.x,
                    y1: yAxisStart.y,
                    x2: O.x,
                    y2: shot.position.top
                });

                ejs.addClass(yAxis, yAxisClazz);

                //设置默认样式
                sheetMap.set('.' + yAxisClazz, {
                    stroke: shot.yLine.borderColor,
                    strokeWidth: shot.yLine.display !== 'none' ? shot.yLine.borderWidth : 0,
                });
            }


            //目前将x轴和y轴混合到一块
            return svg.g([xAxis, yAxis]);
        }

        /**
         * 坐标原点
         * @returns {[null,null]}
         */
        function drawOrigin() {
            let circle = null,
                text = null;

            if (shot.origin.display !== 'none') {
                //圆形
                if (shot.originPoint.display !== 'none') {
                    let OClazz = ejs.simple();
                    circle = svg.draw('circle', {
                        cx: O.x,
                        cy: O.y,
                        r: shot.originPoint.width
                    });
                    ejs.addClass(circle, OClazz);
                    sheetMap.set('.' + OClazz, {
                        stroke: shot.originPoint.borderColor,
                        strokeWidth: shot.originPoint.borderWidth,
                        fill: shot.originPoint.background
                    });
                }


                //文本 originLabel.content
                if (shot.originLabel.display !== 'none') {
                    let OTextClazz = ejs.simple();
                    text = svg.create('text', {
                        x: O.x - shot.originPoint.marginTop,
                        y: O.y + shot.originPoint.marginRight,
                    });
                    ejs.addClass(text, OTextClazz);

                    sheetMap.set('.' + OTextClazz, {
                        fill: shot.originLabel.color,
                        fontSize: shot.originLabel.fontSize,
                        lineHeight: shot.originLabel.lineHeight,
                        fontWeight: shot.originLabel.fontWeight,
                        fontFamily: shot.originLabel.fontFamily,
                        textAnchor: shot.originLabel.align === 'left' ? 'end' : shot.originLabel.align === 'right' ? 'start' : 'middle'
                    });

                    text.textContent = shot.originLabel.content;
                }
            }


            return svg.g([circle/*, text*/]);
        }

        /**
         * 刻度线
         * @returns {*|number}
         */
        function drawTick() {
            let xTickG = null,
                yTickG = null;

            //x轴刻度
            if (shot.xTick.display !== 'none' && shot.axisX.display !== 'none') {
                let xTickClazz = ejs.simple();
                let xTickArr = [];

                let xTickNode = svg.draw('line', {
                    /*y1: Y(0),
                    y2: Y(0) + xTickHeight*/
                    y1: yAxisStart.y,
                    y2: yAxisStart.y + xTickHeight
                });

                sheetMap.set('.' + xTickClazz, {
                    stroke: shot.xTick.borderColor,
                    strokeWidth: shot.xTick.borderWidth,
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
            if (shot.yTick.display !== 'none' && shot.axisY.display !== 'none') {
                let yTickClazz = ejs.simple();
                let yTickArr = [];
                let yTickNode = svg.draw('line', {
                    x1: X(0) - yTickWidth,
                    x2: X(0)
                });
                sheetMap.set('.' + yTickClazz, {
                    stroke: shot.yTick.borderColor,
                    strokeWidth: shot.yTick.borderWidth
                });


                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        yTickArr.push(ejs.attr(yTickNode.cloneNode(), {
                            y1: v,
                            y2: v
                        }))
                    }
                });
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

            if (shot.xLabel.display !== 'none' && xAxisSpace) {
                let xAxisLabelArr = [];
                let xAxisLabelClazz = ejs.simple();
                //x轴文本
                let xAxisLabelNode = svg.create('text', {
                    y: yAxisStart.y + xTickHeight + xStrHeight / 1.25,
                    fontSize: shot.xLabel.fontSize
                });

                sheetMap.set('.' + xAxisLabelClazz, {
                    fill: shot.xLabel.color,
                    lineHeight: xStrHeight,
                    fontWeight: shot.xLabel.fontWeight,
                    fontFamily: shot.xLabel.fontFamily,
                    textAnchor: shot.xLabel.align === 'left' ? 'end' : shot.xLabel.align === 'right' ? 'start' : 'middle'
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

            if (shot.yLabel.display !== 'none' && yAxisSpace) {
                let yAxisLabelArr = [];
                let yAxisLabelClazz = ejs.simple();
                let yAxisLabelNode = svg.create('text', {
                    x: X(0) - yTickWidth - yStrWidth / 2,
                    fontSize: shot.yLabel.fontSize
                });
                sheetMap.set('.' + yAxisLabelClazz, {
                    fill: shot.yLabel.color,
                    fontWeight: shot.yLabel.fontWeight,
                    fontFamily: shot.yLabel.fontFamily,
                    textAnchor: shot.yLabel.align === 'left' ? 'end' : shot.yLabel.align === 'right' ? 'start' : 'middle'
                });

                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        let cloneNode = yAxisLabelNode.cloneNode();
                        cloneNode.textContent = yAxisData[i];
                        ejs.attr(cloneNode, {y: v + shot.yLabel.lineHeight / 5});
                        yAxisLabelArr.push(cloneNode);
                    }
                });
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

            if (shot.grid.display !== 'none') {
                //纵向
                if (shot.xGrid.display !== 'none') {
                    let xGridClazz = ejs.simple();
                    let xGridArr = [];
                    let xGridNode = svg.draw('line', {
                        y1: yAxisStart.y,
                        y2: yAxisStart.y - axisLength.y
                    });
                    sheetMap.set('.' + xGridClazz, {
                        stroke: shot.xGrid.borderColor,
                        strokeWidth: shot.xGrid.borderWidth,
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
                if (shot.yGrid.display !== 'none') {
                    let yGridClazz = ejs.simple();
                    let yGridArr = [];
                    let yGridNode = svg.draw('line', {
                        x1: X(0),
                        x2: axisLength.x + O.x
                    });
                    sheetMap.set('.' + yGridClazz, {
                        stroke: shot.yGrid.borderColor,
                        strokeWidth: shot.yGrid.borderWidth,
                    });

                    yAxisPoint.forEach((v, i) => {
                        if (!(i % Math.round(interval / 2))) {
                            yGridArr.push(ejs.attr(yGridNode.cloneNode(), {
                                y1: v,
                                y2: v
                            }))
                        }
                    });
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
            let unit = spanHeight / span;


            //组装数据
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
            xAxisPoint.forEach(v => {
                xPoint.push({x: v, y: Y(0)})

            });
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
                    y: spanHeight
                },
                size: axisLength
            };
        }

        //【组装】
        let chartPartMap = new Map([
            ['axis', drawAxis()],
            ['origin', drawOrigin()],
            ['tick', drawTick()],
            ['axisLabel', drawAxisLabel()],
            ['grid', drawGrid()]
        ]);

        //【公共方法】
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