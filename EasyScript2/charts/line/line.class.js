'use strict';

CLASS('line', //类名
    param => {
        //【图表类型】
        param.type = 'line';

        //【默认数据】
        ejs.assignDeep(param, {
            data: {
                value: [
                    [22, 121, 0, 28, 115, -64, 131],
                    [55, 69, 22, 75, -15, 56, 25],
                    [65, -29, 52, -65, 25, 36, 61]
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

            //【根据数据关键点画线】
            figure.dataPoints.forEach(v=>{
                let line = svg.draw('lines', {
                    d: v
                }, {
                    strokeWidth: 2,
                    stroke: '#000'
                });
                part.push(line);
            });

            return part;
        });
        //【向外界抛出你的公共方法】
        return {}
    }
);