'use strict';

CLASS('01', //类名
    param => {
        //【图表类型】
        param.type = 'bar';
        //【默认数据】
        param = ejs.assignDeep({
            data: {
                value: [[3, 25, 33, 49, 51, 91, 61]],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            },
            style: {
                background: '#091239',
                title:{
                    y:50,
                    fontSize:18
                },
                position:{
                    top:90,
                    right:50,
                    bottom:20,
                    left:30
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
                            fontSize:18,
                            lineHeight:21
                        }
                    },
                    y: {
                        show:'even',
                        line: {
                            display: 'none',
                        },
                        tick: {
                            display: 'none',
                        },
                        label: {
                            color: '#48CCE9',
                            fontSize:18
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

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');
        //【基类提供的必要函数】
        const {render} = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        render(basic => {
            //关键数据
            const {figure} = basic;

            //根据数据绘制图像
            let bars = [];//柱子
            figure.dataPoints[0].forEach(v => {
                let width = figure.axisSpan.x / 5;
                let bar = svg.create('rect', {
                    x: v.x - width / 2,
                    y: v.y,
                    width: width,
                    height: figure.O.y - v.y,
                    strokeWidth: 1,
                    strokeLocation: 'inside',
                    fill:'#56BAD4',
                    stroke: 'none',
                });
                bars.push(bar);
            });

            return [...bars];
        });
        //【向外界抛出你的公共方法】
        return {}
    }
);