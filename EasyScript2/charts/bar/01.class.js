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
                    [23, 15, 3, 9, 61, 81, 21],
                    [2, 45, 13, 19, 5, 28, 8],
                    [22, 35, 43, 59, 45, 38, 18],
                    [32, 45, 53, 79, 65, 58, 48]
                ],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            theme: {
                colors: [
                    "#4AD2EE",
                    "#E61E79",
                    "#6AD8C3",
                    "#1B4667",
                    "#2A7590",
                    "#4C184B"]
            },
            style: {
                background: '#091239',
                title: {
                    y: 50,
                    fontSize: 18,
                    color: '#fff',
                    content: '平铺柱状图'
                },
                legend: {
                    y: 50,
                    fontSize: 16,
                    content: ['蒸发量', '降水量', '温度', '湿度','紫外线','空气密度'],
                },
                position: {
                    top: 90,
                    right: 50,
                    bottom: 20,
                    left: 30
                },
                axis: {
                    x: {
                        line: {
                            borderColor: '#13284F'
                        },
                        tick: {
                            borderColor: '#13284F'
                        },
                        label: {
                            color: '#48CCE9',
                            fontSize: 18,
                            lineHeight: 21
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
                            fontSize: 18
                        }
                    },
                    origin: {
                        display: 'none'
                    },
                    grid: {
                        x: {
                            borderWidth: 2,
                            borderColor: '#1A2246'
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
            svg //svg操作类
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        console.log(option);

        render(figure => {
            //根据数据绘制图像
            let bars = [];//柱子
            let barWidth = figure.axisSpan.x / figure.dataPoints.length / 2;

            //生成图形
            figure.dataPoints.forEach((v, i) => {
                v.forEach((vi) => {
                    let x = vi.x - (figure.dataPoints.length / 2) * (barWidth + barWidth / 2) + (barWidth / 4) + (barWidth + barWidth / 2) * i;
                    let bar = svg.create('rect', {
                        x: x,
                        y: vi.y,
                        width: barWidth,
                        height: figure.O.y - vi.y,
                        fill: option.theme.colors[i],
                        stroke: 'none',
                    });
                    bars.push(bar);
                });
            });

            return [...bars];
        });
        //【向外界抛出你的公共方法】
        return {}
    }
);