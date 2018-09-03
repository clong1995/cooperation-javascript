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
        let chartPartMap = new Map();
        let detailG = null;
        let stickLeft = null;
        let stickRight = null;
        let svgDom = null;
        let thumWidth = 0;
        let userFn = null;
        let IteratorNode = null;
        let detailHeight = 0;//底部细节轴

        //【主题】 TODO 后面要删除掉 theme call className offsetSize type 等危险属性给二次开发
        let theme = param.theme;

        //【参数补全机制】
        option = ejs.assignDeep({
            style: {
                background: '#fff',
                title: {
                    x: 'default',
                    y: 'default',
                    display: theme.display,
                    fontSize: theme.fontSize,
                    content: 'EasyScrip图表标题！',
                    color: theme.color,
                    fontWeight: theme.fontWeight,
                    fontFamily: theme.fontFamily,
                },
                //位置
                position: {
                    top: theme.fontSize * 4,
                    right: theme.fontSize,
                    bottom: theme.fontSize,
                    left: theme.fontSize
                },
                //坐标轴
                axis: {
                    //x轴
                    x: {
                        display: theme.display,
                        //轴线
                        line: {
                            display: theme.display,
                            borderColor: theme.color,
                            borderWidth: 2,
                            borderStyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: theme.display,
                            height: 10,
                            borderWidth: 2,
                            borderColor: theme.color,
                            dx: 0,
                            dy: 0
                        },
                        //文本
                        label: {
                            display: theme.display,
                            fontSize: theme.fontSize,
                            color: theme.color,
                            fontWeight: theme.fontWeight,
                            fontFamily: theme.fontFamily,
                            align: 'center'
                        },
                        //单位
                        unit: {
                            display: theme.display,
                            content: 'x轴单位',
                            color: theme.color,
                            fontSize: theme.fontSize,
                            fontWeight: theme.fontWeight,
                            fontFamily: theme.fontFamily,
                            dx: 0,
                            dy: 0,
                            x: 'default',
                            y: 'default'
                        }
                    },
                    //y轴
                    y: {
                        display: theme.display,
                        show: 'all',//odd表示奇数行，even表示偶数行;
                        //轴线
                        line: {
                            display: theme.display,
                            borderColor: theme.color,
                            borderWidth: 2,
                            borderSyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: theme.display,
                            width: 10,
                            borderWidth: 2,
                            borderColor: theme.color,
                            dx: 0,
                            dy: 0
                        },
                        //文本
                        label: {
                            display: theme.display,
                            fontSize: theme.fontSize,
                            color: theme.color,
                            fontWeight: theme.fontWeight,
                            fontFamily: theme.fontFamily,
                            align: 'center',
                            dx: 0,
                            dy: 0
                        },
                        //单位
                        unit: {
                            display: theme.display,
                            content: 'y轴单位',
                            color: theme.color,
                            fontSize: theme.fontSize,
                            fontWeight: theme.fontWeight,
                            fontFamily: theme.fontFamily,
                            dx: 0,
                            dy: 0,
                            x: 'default',
                            y: 'default'
                        }
                    },
                    //原点
                    origin: {
                        display: theme.display,
                        point: {
                            display: theme.display,
                            borderColor: theme.color,
                            borderWidth: 2,
                            width: 5,
                            background: 'rgba(255,255,255,1)',
                            marginTop: 20,
                            marginRight: 20
                        },
                        //文本
                        label: {
                            display: theme.display,
                            content: 'O',
                            fontSize: theme.fontSize,
                            color: theme.color,
                            fontWeight: theme.fontWeight,
                            fontFamily: theme.fontFamily,
                            align: 'center'
                        }
                    },
                    //网格线
                    grid: {
                        display: theme.display,
                        x: {
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.2)',
                            display: theme.display
                        },
                        y: {
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.1)',
                            display: theme.display
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
                    display: theme.display,
                    x: 'default',
                    y: 'default',
                    col: 1,
                    content: [],
                    //图例项
                    marker: [],
                    fontSize: theme.fontSize,
                    fontWeight: theme.fontWeight,
                    fontFamily: theme.fontFamily,
                }
            }
        }, param);

        //【简化链式查找】
        shot = {
            //标题
            title: option.style.title,

            //图例
            legend: option.style.legend,

            //取样
            capacity: option.capacity,

            //细节
            detail: option.detail,

            offsetSize: option.offsetSize,

            //定位
            position: option.style.position,

            //x轴系列
            axisX: option.style.axis.x,
            xLine: option.style.axis.x.line,
            xTick: option.style.axis.x.tick,
            xLabel: option.style.axis.x.label,
            xUnit: option.style.axis.x.unit,

            //y轴系列
            axisY: option.style.axis.y,
            yLine: option.style.axis.y.line,
            yTick: option.style.axis.y.tick,
            yLabel: option.style.axis.y.label,
            yUnit: option.style.axis.y.unit,


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
        //拷贝原始数据
        data = {
            key: [...option.data.key],
            value: []
        };
        option.data.value.forEach(v => data.value.push(v));

        if (shot.capacity) {
            //小视区
            thumWidth = chartSize.width / 10;
            let p = Math.ceil(thumWidth / (chartSize.width - yAxisSpace) * 100) / 100;//slice
            let length = Math.ceil(data.key.length * p);

            data.key = data.key.slice(0, length);
            data.value.forEach((v, i) => data.value[i] = v.slice(0, length));

            data = capacity(data);
            detailHeight = 30;
        }


        //【x轴配置display变化引发的影响合计】
        xStrHeight = shot.xLabel.display !== 'none' ? shot.xLabel.fontSize * 1.25 : 0;
        //坐标刻度线
        xTickHeight = shot.xTick.display !== 'none' ? shot.xTick.height : 0;
        if (shot.axisX.display === 'none')
            xStrHeight = xTickHeight = 0;
        xAxisSpace = xStrHeight + xTickHeight + detailHeight;


        //【y轴配置display变化引发的影响合计】
        if (shot.yLabel.display !== 'none') {

            let minMax = getMaxMinValue(option.data.value);


            let //y轴最大文本宽度
                yMinStrWidth = ejs.strLength(Math.round(minMax.min).toString()),
                yMaxStrWidth = ejs.strLength(Math.round(minMax.max).toString());

            yStrWidth = yMinStrWidth > yMaxStrWidth ? yMinStrWidth : yMaxStrWidth;
            yStrWidth *= shot.yLabel.fontSize / 1.25
        }
        //坐标刻度线
        yTickWidth = shot.yTick.display !== 'none' ? shot.yTick.width : 0;
        if (shot.axisY.display === 'none')
            yStrWidth = yTickWidth = 0;

        yAxisSpace = yStrWidth + yTickWidth - (yStrWidth * shot.yLabel.dx);


        // 【defs】
        let defs = svg.initDefs();


        /**
         * 提取最大最小数据
         * @param dataArr
         * @returns {{min: number, max: number}}
         */
        function getMaxMinValue(dataArr) {
            let min = [],
                max = [];
            dataArr.forEach(v => {
                min.push(ejs.arrMaxMin(v, 'min'));
                max.push(ejs.arrMaxMin(v, 'max'));
            });
            return {
                min: ejs.arrMaxMin(min, 'min'),
                max: ejs.arrMaxMin(max, 'max')
            }
        }


        /**
         * 初始化图表
         */
        function initChart() {
            //重置
            oIndex = -1;
            xAxisPoint = [];
            yAxisPoint = [];
            yAxisData = [];


            let minMax = getMaxMinValue(data.value);

            //【最值】
            maxData = minMax.max <= 0 ? 0 : minMax.max;
            minData = minMax.min >= 0 ? 0 : minMax.min;

            //【最大最小】
            yAxisMin = Math.floor(minData / 10) * 10;
            yAxisMax = Math.ceil(maxData / 10) * 10;

            //寻找0位置的索引，用来确定存在负值时x轴的位置金和原点
            for (let i = 0; true; i += span) {
                let num = yAxisMin + i;
                yAxisData.push(num);
                if (oIndex === -1 && num >= 0) oIndex = i / span;
                if (num >= yAxisMax) break;
            }

            //【逻辑起点】
            yAxisStart = {
                //x位
                x: yAxisSpace + shot.position.left,
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
            xAxisData = data.key;
            xSpan = axisLength.x / (xAxisData.length + 1);
            for (let i = 1; i < xAxisData.length + 1; ++i)
                xAxisPoint.push(X(xSpan * i));
            for (let i = 0; i < spanValue + 1; ++i) {
                yAxisPoint.push(yAxisStart.y - spanHeight * i);
            }

        }

        /**
         * 数据取样
         * 取样算法：根据图表实际大小和指定的像素密度换算取数据段和数据段的取样个数。
         *          找出每段样本间隔中的最大值和最小值和x轴对应的y标值（特征值），根据图表的实际大小取出一批值丰富折线的平缓度（细节值）。
         *          这样可以保证数据精度，保留并且累积原始数据的变化率
         */
        function capacity(datas) {
            let px = 10,//像素间隔的数据
                //图表被分为了多少段
                pxCount = Math.ceil(chartSize.width / px);

            //数据也同样分capacity多段，在本段数据中进行取样
            let capacity = Math.floor(datas.key.length / pxCount);//一段对应的数据数据量
            //取样点超过两个才有取样的意义，因为每单位数据都要保留至少两个值，最大值和最小值
            //过滤数据
            if (capacity > 2) {
                data = {key: [], value: []};
                for (let i = 0; i < datas.value.length; ++i) data.value.push([]);
                //分段取值
                for (let index = 0; index < datas.key.length + capacity; index += capacity) {
                    //取样数据段的key段，这个要和value段对应上并保证顺序不变
                    let keySpan = datas.key.slice(index, index + capacity);

                    //取样数据段的value段
                    let valueSpan = [];
                    datas.value.forEach((v, i) => valueSpan[i] = v.slice(index, index + capacity));

                    //保序数组，用来保证每单位数据段顺序的数组，每段数据保证则全部数据就可以保证顺序
                    let length = keySpan.length;

                    let orderValueArr = [],
                        orderKeyArr = new Array(length);
                    for (let i = 0; i < valueSpan.length; ++i) orderValueArr.push(new Array(length))

                    //用来丰富细节
                    let orderValueSpan = Math.ceil(keySpan.length / 2);
                    for (let i = 0; i < length; i += orderValueSpan) {
                        for (let j = 0; j < valueSpan.length; ++j) {
                            orderValueArr[j][i] = valueSpan[j][i]
                        }
                        orderKeyArr[i] = keySpan[i];
                    }

                    //段内取最值
                    let valueArr = [],
                        keyArr = null;
                    for (let i = 0; i < valueSpan.length; ++i) {
                        //最值
                        let max = ejs.arrMaxMin(valueSpan[i], 'max', 'index'),
                            min = ejs.arrMaxMin(valueSpan[i], 'min', 'index');

                        //当前i次的最值
                        let maxIndex = max.index,
                            minIndex = min.index;

                        //传播到所有
                        for (let j = 0; j < valueSpan.length; ++j) {
                            //最大值
                            orderValueArr[j][maxIndex] = valueSpan[j][maxIndex];
                            //最小值
                            orderValueArr[j][minIndex] = valueSpan[j][minIndex];
                        }

                        orderKeyArr[maxIndex] = keySpan[maxIndex];
                        orderKeyArr[minIndex] = keySpan[minIndex];

                        for (let j = 0; j < valueSpan.length; ++j) {
                            valueArr[j] = orderValueArr[j].filter(val => val !== undefined);
                            if (j === valueSpan.length - 1) {
                                keyArr = orderKeyArr.filter(val => val !== undefined);
                            }
                        }
                    }

                    for (let j = 0; j < valueSpan.length; ++j) {
                        data.value[j].push(...valueArr[j]);
                        if (j === valueSpan.length - 1) {
                            data.key.push(...keyArr);
                        }
                    }

                }
            } else {
                data = datas;
            }

            //x轴不用全部画出来
            let tickSpan = Math.floor(5 * px * data.key.length / chartSize.width) + 1;
            for (let i = 0; i < data.key.length; ++i) {
                if (i % tickSpan) data.key[i] = '';
            }
            return data;
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
                xAxis = svg.draw('line', {
                    x1: O.x,
                    y1: O.y,
                    x2: axisLength.x + O.x,
                    y2: O.y
                });

                ejs.css(xAxis, {
                    stroke: shot.xLine.borderColor,
                    strokeWidth: shot.xLine.display !== 'none' ? shot.xLine.borderWidth : 0
                });

                if (shot.xLine.borderStyle === 'solid') {

                } else if (shot.xLine.borderStyle === 'dashed') {
                    //sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderWidth * 4 + "," + shot.xLine.borderWidth * 4
                } else {
                    //sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderStyle
                }
            }


            //y轴
            if (shot.yLine.display !== 'none' && shot.axisY.display !== 'none') {
                yAxis = svg.draw('line', {
                    x1: O.x,
                    y1: yAxisStart.y,
                    x2: O.x,
                    y2: shot.position.top
                });

                ejs.css(yAxis, {
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
                        fontWeight: shot.originLabel.fontWeight,
                        fontFamily: shot.originLabel.fontFamily,
                        textAnchor: shot.originLabel.align === 'left' ? 'end' : shot.originLabel.align === 'right' ? 'start' : 'middle'
                    });

                    text.textContent = shot.originLabel.content;
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
            if (shot.xTick.display !== 'none' && shot.axisX.display !== 'none') {
                let xTickArr = [];
                let xTickNode = svg.draw('line', {
                    y1: yAxisStart.y + (shot.xTick.height * shot.xTick.dy),
                    y2: yAxisStart.y + xTickHeight + (shot.xTick.height * shot.xTick.dy)
                });
                xAxisPoint.forEach((v, i) => {
                    if (xAxisData[i]) {
                        xTickArr.push(ejs.attr(xTickNode.cloneNode(), {
                            x1: v + (xSpan * shot.xTick.dx),
                            x2: v + (xSpan * shot.xTick.dx)
                        }))
                    }
                });
                xTickG = svg.g(xTickArr);
                ejs.css(xTickG, {
                    stroke: shot.xTick.borderColor,
                    strokeWidth: shot.xTick.borderWidth,
                });
            }

            //y轴刻度
            if (shot.yTick.display !== 'none' && shot.axisY.display !== 'none') {
                let yTickArr = [];
                let yTickNode = svg.draw('line', {
                    x1: X(0) - yTickWidth,
                    x2: X(0)
                });

                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        if (oddEven(i)) {
                            yTickArr.push(ejs.attr(yTickNode.cloneNode(), {
                                y1: v,
                                y2: v
                            }))
                        }

                    }
                });
                yTickG = svg.g(yTickArr);
                ejs.css(yTickG, {
                    stroke: shot.yTick.borderColor,
                    strokeWidth: shot.yTick.borderWidth
                });
            }
            //x刻度和y刻度,目前混合到一块处理
            return svg.g([xTickG, yTickG]);
        }


        function oddEven(index) {
            let flag = true;
            if (shot.axisY.show !== 'all') {
                flag = !(index % 2);
                if (shot.axisY.show !== 'even')//偶数
                    flag = !flag;
            }
            return flag;
        }


        /**
         * 坐标文本
         * @returns {*|number}
         */
        function drawAxisLabel() {
            let xAxisLabelG = null,
                yAxisLabelG = null;

            if (shot.xLabel.display !== 'none') {
                let xAxisLabelArr = [];
                //x轴文本
                let xAxisLabelNode = svg.create('text', {
                    y: yAxisStart.y + xTickHeight + xStrHeight / 1.25
                });

                xAxisPoint.forEach((v, i) => {
                    let cloneNode = xAxisLabelNode.cloneNode();
                    if (xAxisData[i]) {
                        cloneNode.textContent = xAxisData[i];
                        ejs.attr(cloneNode, {x: v});
                        xAxisLabelArr.push(cloneNode);
                    }
                });
                xAxisLabelG = svg.g(xAxisLabelArr);
                ejs.css(xAxisLabelG, {
                    fontSize: shot.xLabel.fontSize,
                    fill: shot.xLabel.color,
                    fontWeight: shot.xLabel.fontWeight,
                    fontFamily: shot.xLabel.fontFamily,
                    textAnchor: shot.xLabel.align === 'left' ? 'end' : shot.xLabel.align === 'right' ? 'start' : 'middle'
                });
            }

            if (shot.yLabel.display !== 'none') {
                let yAxisLabelArr = [];
                let yAxisLabelNode = svg.create('text', {
                    x: X(0) - yTickWidth - yStrWidth / 2 + (shot.yLabel.dx * yStrWidth)
                });
                ejs.css(yAxisLabelNode, {fontSize: shot.xLabel.fontSize});

                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        if (oddEven(i)) {
                            let cloneNode = yAxisLabelNode.cloneNode();
                            cloneNode.textContent = yAxisData[i];
                            ejs.attr(cloneNode, {y: v + shot.yLabel.fontSize / 3 + (shot.yLabel.fontSize / 3) * shot.yLabel.dy});
                            yAxisLabelArr.push(cloneNode);
                        }
                    }
                });
                yAxisLabelG = svg.g(yAxisLabelArr);
                ejs.css(yAxisLabelG, {
                    fill: shot.yLabel.color,
                    fontWeight: shot.yLabel.fontWeight,
                    fontFamily: shot.yLabel.fontFamily,
                    textAnchor: shot.yLabel.align === 'left' ? 'end' : shot.yLabel.align === 'right' ? 'start' : 'middle'
                });
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
                if (shot.yGrid.display !== 'none') {
                    let yGridArr = [];
                    let yGridNode = svg.draw('line', {
                        y1: yAxisStart.y,
                        y2: yAxisStart.y - axisLength.y
                    });

                    xAxisPoint.forEach((v, i) => {
                        if (xAxisData[i]) {
                            yGridArr.push(ejs.attr(yGridNode.cloneNode(), {
                                x1: v,
                                x2: v
                            }))
                        }
                    });
                    yGridG = svg.g(yGridArr);
                    ejs.css(yGridG, {
                        stroke: shot.yGrid.borderColor,
                        strokeWidth: shot.yGrid.borderWidth,
                    });
                }

                //横向
                if (shot.xGrid.display !== 'none') {
                    let xGridArr = [];
                    let xGridNode = svg.draw('line', {
                        x1: X(0),
                        x2: axisLength.x + O.x
                    });

                    yAxisPoint.forEach((v, i) => {
                        if (!(i % Math.round(interval / 2))) {
                            if (oddEven(i)) {
                                xGridArr.push(ejs.attr(xGridNode.cloneNode(), {
                                    y1: v,
                                    y2: v
                                }))
                            }
                        }
                    });
                    xGridG = svg.g(xGridArr);
                    ejs.css(xGridG, {
                        stroke: shot.xGrid.borderColor,
                        strokeWidth: shot.xGrid.borderWidth
                    });
                }
            }


            //x刻度和y刻度,目前混合到一块处理
            return svg.g([xGridG, yGridG]);
        }

        /**
         * 重新摘要数据并产生图纸
         */
        function reloadData() {
            let
                start = Math.floor(
                    (
                        (

                            parseFloat(ejs.attr(stickLeft, 'x')) - (shot.position.left + yAxisSpace)

                        ) / (chartSize.width - yAxisSpace)
                    ) * 100
                ) / 100,
                end = Math.ceil(((ejs.attr(stickRight, 'x') - (shot.position.left + yAxisSpace)) / (chartSize.width - yAxisSpace)) * 100) / 100;

            let startIndex = Math.floor(option.data.key.length * start),
                endIndex = Math.ceil(option.data.key.length * end);


            let dataValue = [];
            for (let i = 0; i < option.data.value.length; ++i) {
                dataValue.push(option.data.value[i].slice(startIndex, endIndex));
            }
            data = capacity({
                value: dataValue,
                key: option.data.key.slice(startIndex, endIndex)
            });

            //清除图纸图形
            chartPartMap.forEach((v, i) => {
                if (i !== 'detail') {
                    ejs.remove(v);
                    chartPartMap.delete(i);
                }
            });
            //清除用户图形
            IteratorNode.forEach(v => ejs.remove(v));

            //【重新绘制】
            initChart();
            IteratorNode = userFn({figure: figure()});

            chartPartMap = new Map([
                ['axis', drawAxis()],
                ['origin', drawOrigin()],
                ['tick', drawTick()],
                ['axisLabel', drawAxisLabel()],
                ['grid', drawGrid()]
            ]);

            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, ...IteratorNode]);
        }

        /**
         * 细节展示
         */
        function drawDetail() {
            if (shot.capacity) {
                //边框
                let strokeWidth = 1,
                    marginTop = shot.axisX.tick.height / 2;

                let minMax = getMaxMinValue(option.data.value);

                //【最值】
                maxData = minMax.max <= 0 ? 0 : minMax.max;
                minData = minMax.min >= 0 ? 0 : minMax.min;

                //【最大最小】
                yAxisMin = Math.floor(minData / 10) * 10;
                yAxisMax = Math.ceil(maxData / 10) * 10;


                //寻找0位置的索引，用来确定存在负值时x轴的位置和原点
                let oIndex = -1;
                for (let i = 0; true; i += span) {
                    let num = yAxisMin + i;
                    if (oIndex === -1 && num >= 0) oIndex = i / span;
                    if (num >= yAxisMax) break;
                }

                //【y轴分段】
                let spanValue = (yAxisMax - yAxisMin) / span,
                    spanHeight = axisLength.y / spanValue;

                //数据关键点
                let linePoint = [];
                let xSpan = axisLength.x / (option.data.key.length);
                option.data.value.forEach(v => {
                    let lineItem = [];
                    v.forEach((vi, ii) => lineItem.push({
                        x: xSpan * ii + O.x,
                        y: O.y - vi * (spanHeight / span)
                    }));
                    linePoint.push(lineItem);
                });

                //【根据数据关键点画线】
                let part = [];
                linePoint.forEach(v => {
                    let line = svg.draw('lines', {
                        d: v
                    }, {
                        strokeWidth: 1,
                        stroke: '#000'
                    });
                    ejs.attr(line, {
                        transform:
                        'translate(0, ' + (shot.offsetSize.height - shot.position.bottom - (detailHeight - 2) / 1.3) + ') ' +// + shot.position.top + chartSize.height + shot.position.top
                        'scale(1,' + ((detailHeight / 2) / (axisLength.y)) + ')',
                    });
                    part.push(line);
                });


                //框框
                detailG = svg.g();

                let border = svg.create('rect', {
                    x: shot.position.left + yAxisSpace,
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: chartSize.width - yAxisSpace,
                    height: detailHeight - marginTop,
                    strokeLocation: 'inside',
                    strokeWidth: strokeWidth,
                    stroke: '#000',
                    fill: 'none'
                });


                //中间
                let thumX = shot.position.left + yAxisSpace;
                let thum = svg.create('rect', {
                    x: thumX,
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: thumWidth,
                    height: detailHeight - marginTop,
                    fill: 'rgba(0,0,0,.2)',
                    cursor: 'move'
                });

                //左右扩大选区
                let stickWidth = 10;
                let stick = svg.create('rect', {
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: stickWidth,
                    height: detailHeight - marginTop,
                    fill: 'rgba(0,0,0,.5)'
                });
                stickLeft = stick.cloneNode();
                stickRight = stick.cloneNode();
                ejs.attr(stickLeft, {
                    x: thumX,
                    cursor: 'w-resize'
                });
                ejs.attr(stickRight, {
                    x: thumX + thumWidth - stickWidth,
                    cursor: 'e-resize'
                });

                //TODO 有内存泄漏隐患
                //拉动整体
                thum.onmousedown = v => {
                    let s = v.clientX;
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    let _thumX = parseFloat(ejs.attr(thum, 'x')),
                        _stickLeftX = parseFloat(ejs.attr(stickLeft, 'x')),
                        _stickRightX = parseFloat(ejs.attr(stickRight, 'x'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;

                        //回到到起点
                        if (_thumX + move < thumX) {
                            ejs.attr(thum, {x: thumX});
                            //两边
                            ejs.attr(stickLeft, {x: thumX});
                            ejs.attr(stickRight, {x: thumX + thumWidth - stickWidth});
                            return;
                        }
                        //回到到终点
                        if (_thumX + move > axisLength.x + O.x - thumWidth) {
                            ejs.attr(thum, {x: axisLength.x + O.x - thumWidth});
                            //两边
                            ejs.attr(stickLeft, {x: axisLength.x + O.x - thumWidth});
                            ejs.attr(stickRight, {x: axisLength.x + O.x - stickWidth});
                            return;
                        }

                        //没有到达端尽头
                        //中间
                        ejs.attr(thum, {x: _thumX + move});
                        //两边
                        ejs.attr(stickLeft, {x: _stickLeftX + move});
                        ejs.attr(stickRight, {x: _stickRightX + move});
                        //重新摘要全部数据
                        reloadData();
                    }
                };

                //左箭头被拉动
                stickLeft.onmousedown = v => {
                    let s = v.clientX;
                    let x = parseFloat(ejs.attr(stickLeft, 'x'));
                    let _thumX = parseFloat(ejs.attr(thum, 'x'));
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;
                        //回到起点
                        if (_thumX + move < thumX) {
                            ejs.attr(thum, {width: parseFloat(ejs.attr(stickRight, 'x')) - thumX});//长度
                            ejs.attr(thum, {x: thumX});//位置
                            ejs.attr(stickLeft, {x: thumX});
                            return;
                        }
                        //回到终点
                        if (x + move >= parseFloat(ejs.attr(stickRight, 'x'))) {
                            ejs.attr(thum, {width: 0});
                            ejs.attr(stickLeft, {x: parseFloat(ejs.attr(stickRight, 'x'))});
                            return;
                        }
                        ejs.attr(thum, {width: thumWidth - move});//长度
                        ejs.attr(thum, {x: _thumX + move});//位置
                        ejs.attr(stickLeft, {x: move + x});
                        //重新摘要全部数据
                        reloadData();
                    }
                };

                //右箭头被拉动
                stickRight.onmousedown = v => {
                    let s = v.clientX;
                    let x = parseFloat(ejs.attr(stickRight, 'x'));
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;
                        //回到到终点
                        if (move + x > axisLength.x + O.x - stickWidth) {
                            ejs.attr(thum, {width: axisLength.x + O.x - parseFloat(ejs.attr(stickLeft, 'x'))});
                            ejs.attr(stickRight, {x: axisLength.x + O.x - stickWidth});
                            return;
                        }
                        //回到起点
                        if (x + move <= parseFloat(ejs.attr(stickLeft, 'x'))) {
                            ejs.attr(thum, {width: 0});
                            ejs.attr(stickRight, {x: parseFloat(ejs.attr(stickLeft, 'x'))});
                            return;
                        }
                        ejs.attr(thum, {width: thumWidth + move});
                        ejs.attr(stickRight, {x: move + x});


                        //重新摘要全部数据
                        reloadData();
                    }
                };


                //鼠标抬起
                ejs.body.onmouseup = () => ejs.body.onmousemove = null;

                return ejs.appendBatch(detailG, [
                    border,
                    ...part,
                    svg.g([thum, stickLeft, stickRight])
                ]);
            }
        }

        //标题
        function drawTitle() {
            let title = null;
            if (shot.title.display !== 'none') {
                let x = O.x,
                    y = shot.title.fontSize * 2;
                if (shot.title.x !== 'default') {
                    x = shot.title.x;
                }
                if (shot.title.y !== 'default') {
                    y = shot.title.y;
                }

                title = svg.draw('text', {
                    x: x,
                    y: y,
                    text: shot.title.content
                }, {
                    fill: shot.title.color,
                    fontSize: shot.title.fontSize
                });
            }

            return svg.g([title]);
        }

        /**
         * 计算关键点
         * */
        function figure() {
            //数据关键点
            let linePoint = [];
            data.value.forEach(v => {
                let lineItem = [];
                v.forEach((vi, ii) => {
                    lineItem.push({
                        value: vi,
                        x: xAxisPoint[ii],
                        y: Y(0) - vi * (spanHeight / span)
                    });
                });
                linePoint.push(lineItem);
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
                dataPoints: linePoint,
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


        function drawLegend() {
            let legend = [];
            if (shot.legend.display !== 'none') {
                if (shot.legend.content.length === 0) {
                    for (let i = 1; i <= data.value.length; i++) shot.legend.content.push('类目' + i);
                }
            }


            //方块
            let iconWidth = shot.legend.fontSize/1.25,
                iconHeight = shot.legend.fontSize/1.25;

            let x = chartSize.width
                - (JSON.stringify(shot.legend.content).length
                    - 2//[]
                    - shot.legend.content.length * 2 //"
                    - shot.legend.content.length//,
                ) * shot.legend.fontSize * 1.25
                - iconWidth * shot.legend.content.length
                - shot.position.right,
                y = shot.legend.fontSize * 2;

            if (shot.legend.x !== 'default') {
                x = shot.legend.x;
            }
            if (shot.legend.y !== 'default') {
                y = shot.legend.y;
            }

            shot.legend.content.forEach((v, i) => {
                //icon
                let icon = svg.create('rect', {
                    x: x,
                    y: y - iconHeight,
                    width: iconWidth,
                    height: iconHeight,
                    fill: theme.colors[i][0],
                    stroke: 'none',
                });

                //文本
                let text = svg.draw('text', {
                    x: x + iconWidth + shot.legend.fontSize / 2,
                    y: y,
                    text: v
                }, {
                    fill: theme.colors[i][0],
                    fontSize: shot.legend.fontSize
                });

                x += iconWidth + shot.legend.fontSize * (v.length + 1);

                legend.push(icon, text);
            });

            return svg.g(legend);
        }

        function drawUnit() {
            let unit = [];
            if (shot.xUnit.display !== 'none') {
                let x = axisLength.x + O.x - shot.yUnit.content.length * shot.yUnit.fontSize,
                    y = shot.offsetSize.height - shot.position.bottom - (shot.xLabel.fontSize) / 4;
                if (shot.yUnit.x !== 'default') {
                    x = shot.yUnit.x;
                }
                if (shot.yUnit.y !== 'default') {
                    y = shot.yUnit.y;
                }

                unit.push(svg.draw('text', {
                    x: x,
                    y: y,
                    text: shot.xUnit.content
                }, {
                    fill: shot.xUnit.color,
                    fontSize: shot.xUnit.fontSize
                }));
            }
            if (shot.yUnit.display !== 'none') {
                let x = O.x + shot.xUnit.fontSize / 2,
                    y = yAxisStart.y - axisLength.y + shot.yLabel.fontSize / 4;

                if (shot.xUnit.x !== 'default') {
                    x = shot.xUnit.x;
                }
                if (shot.xUnit.y !== 'default') {
                    y = shot.xUnit.y;
                }

                unit.push(svg.draw('text', {
                    x: x + shot.yUnit.content.length * shot.yUnit.fontSize / 2 * shot.yUnit.dx,
                    y: y + shot.yLabel.fontSize/4 * shot.yUnit.dy,
                    text: shot.yUnit.content
                }, {
                    fill: shot.yUnit.color,
                    fontSize: shot.yUnit.fontSize
                }));
            }
            return svg.g(unit);
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

            /*console.log(defs);
            console.log(title());*/

            //【2生成部件】
            chartPartMap = new Map([
                ['defs', defs],
                ['title', drawTitle()],
                ['axis', drawAxis()],
                ['origin', drawOrigin()],
                ['tick', drawTick()],
                ['axisLabel', drawAxisLabel()],
                ['grid', drawGrid()],
                ['legend', drawLegend()],
                ['unit', drawUnit()],
                ['detail', drawDetail()]
            ]);

            //【3组装节点】
            IteratorNode = svg.g(userFn(figure()));
            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, IteratorNode]);

            //【4显示svg】
            ejs.css(svgDom, {display: 'block'});
        }


        //【公共方法】
        let publicFn = {
            option: option,
            defs: defs,
            chartPartMap: chartPartMap,
            //sheetMap: sheetMap,
            //eventMap: eventMap,
            //figure: figure(),
            //X: X,
            //Y: Y,
            initPaper: initPaper
        };

        //危险属性屏蔽
        //Object.defineProperty(publicFn, 'chartPartMap', {enumerable: false});
        //Object.defineProperty(publicFn, 'sheetMap', {enumerable: false});
        //Object.defineProperty(publicFn, 'eventMap', {enumerable: false});

        return publicFn;
    }
);