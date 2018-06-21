/**
 * 折线图003
 * 作者：成龙哥哥
 * 时间：2018年6月7日18:21:57
 */
'use strict';

CLASS('line004', //类名
    param => {
        //【图表类型】
        param.type = 'line';
        //【默认样式和数据】
        param = ejs.assignDeep({
            capacity: true,//启动自动摘要
            data: {
                value: [
                    [3, 25, 33, 49, 51, 91, -61]
                ],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        }, param);

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