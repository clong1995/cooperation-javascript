'use strict';

CLASS('01', //类名
    param => {
        //【图表类型】
        param.type = 'bar';
        //【默认数据】
        param = ejs.assignDeep({
            data: {
                value: [
                    [3, 25, 33, 91, 51, 21, 61],
                    [13, 5, 23, 39, 21, 41, 51],
                    [23, 15, 3, 9, 61, 81, 21]/*,
                    [2, 45, 13, 19, 5, 28, 8],
                    [22, 35, 43, 59, 45, 38, 18],
                    [32, 45, 53, 79, 65, 58, 48]*/
                ],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            theme: {
                colors: [
                    ["#4AD2EE", "#1C4264"],
                    ["#E61E79", "#4A174A"],
                    ["#6AD8C3", "#26445C"],
                    ["#1B4667", "#0D1E43"],
                    ["#2A7590", "#10284C"],
                    ["#4C184B", "#230742"]
                ]
            },
            style: {
                background: '#091239',
                title: {
                    y: 30,
                    fontSize: 19,
                    color: '#fff',
                    content: '平铺柱状图'
                },
                legend: {
                    y: 30,
                    fontSize: 19,
                    content: ['蒸发量', '降水量', '温度'/*, '湿度','紫外线','空气密度'*/],
                },
                position: {
                    top: 90,
                    right: 50,
                    bottom: 20,
                    left: 40
                },
                axis: {
                    x: {
                        line: {
                            borderColor: '#183158'
                        },
                        tick: {
                            borderColor: '#183158',
                            dx: 0.5,
                            dy: -1
                        },
                        label: {
                            color: '#48CCE9',
                            fontSize: 18
                        },
                        unit: {
                            fontSize: 18,
                            color: '#48CCE9',
                            content: '/天'
                        }
                    },
                    y: {
                        show: 'even',
                        line: {
                            display: 'none',
                        },
                        tick: {
                            display: 'none',
                        },
                        label: {
                            color: '#48CCE9',
                            fontSize: 18,
                            dx: 1,
                            dy: -3
                        },
                        unit: {
                            fontSize: 18,
                            dx: 1,
                            dy: -4,
                            color: '#48CCE9',
                            content: '/单位'
                        }
                    },
                    origin: {
                        display: 'none'
                    },
                    grid: {
                        x: {
                            borderWidth: 1.5,
                            borderColor: '#183158'
                        },
                        y: {
                            display: 'none'
                        }
                    }
                }

            },
        }, param);
        //【基类提供的必要函数】
        const {
            render,//渲染函数
            option,//最终配置
            svg, //svg操作类
            gradient, //渐变
            chartPartMap,//图纸的各个部分
            blur
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        render(figure => {


            //根据数据绘制图像
            let bars = [];//柱子
            let barWidth = figure.axisSpan.x / figure.dataPoints.length / 3;
            //生成图形
            figure.dataPoints.forEach((v, i) => {
                //定义渐变
                let linear = gradient('linear', {
                    offset: {
                        "0%": {color: option.theme.colors[i][0], opacity: 1},
                        "90%": {color: option.theme.colors[i][1], opacity: 1}
                    }
                });

                //定义模糊
                let blurOut = blur(barWidth, barWidth, {
                    inset: 'out'
                });

                //生成每个柱子 和 柱子顶端的帽子
                let setp = (figure.dataPoints.length / 2) * (barWidth + barWidth) - (barWidth / 2) - (barWidth + barWidth) * i;
                v.forEach((vi) => {
                    let x = vi.x - setp;

                    //帽子
                    let hat = svg.create('rect', {
                        x: x,
                        y: vi.y - barWidth * 1.3,
                        width: barWidth,
                        height: barWidth,
                        fill: '#fff',
                        filter: blurOut,
                        stroke: 'none',
                    });

                    //柱子
                    let bar = svg.create('rect', {
                        x: x,
                        y: vi.y,
                        width: barWidth,
                        height: figure.O.y - vi.y,
                        fill: linear,
                        stroke: 'none',
                    });
                    bars.push(hat, bar);
                });
            });

            return [...bars];
        });
        //【向外界抛出你的公共方法】
        return {}
    }
);