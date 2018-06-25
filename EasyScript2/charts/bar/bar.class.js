'use strict';

CLASS('bar', //类名
    param => {
        //【图表类型】
        param.type = 'bar';

        //默认数据
        ejs.assignDeep(param, {
            data: {
                value: [
                    [3, 25, 33, 49, 51, 91, 61]
                ],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        });

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        //【基类提供的必要函数】
        const {render} = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //【你的渲染逻辑】
        render(basic => {
            let part = [];
            const {figure} = basic;

            figure.dataPoints[0].forEach(v => {
                let width = figure.axisSpan.x / 2;
                let bar = svg.create('rect', {
                    x: v.x - width / 2,
                    y: v.y,
                    width: width,
                    height: figure.O.y - v.y,
                    strokeWidth: 1,
                    strokeLocation: 'inside',
                    stroke: '#06495a',
                });
                part.push(bar);
            });

            return part;
        });
        //【向外界抛出你的公共方法】
        return {}
    }
);