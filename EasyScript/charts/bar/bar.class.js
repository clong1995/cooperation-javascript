'use strict';

CLASS('bar', //类名
    param => {
        //【图表类型】
        param.type = 'bar';
        //默认数据
        ejs.assignDeep(param, {
            data: {
                value: [[3, 25, 33, 49, 51, 91, 61]],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        });
        //【基类提供的必要函数】
        const {
            render,//渲染函数
            option,//最终配置
            svg //svg操作类
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //【你的渲染逻辑】
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
                        fill: option.theme.colors[i][0],
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