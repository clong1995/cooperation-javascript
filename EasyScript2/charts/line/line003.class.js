/**
 * 折线图003
 * 作者：成龙哥哥
 * 时间：2018年6月7日18:21:57
 */
'use strict';

CLASS('line003', //类名
    param => {
        //【图表类型】
        param.type =  'line';
        //【默认数据】
        param = ejs.assignDeep({
            data: {
                value: [3, 25, 33, 49, 51, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        }, param);

        //【基类提供的必要函数】
        const {svg, render, X, Y, className, option, figure,load} = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //【根据数据关键点画线】
        let line = svg.draw('lines', {
            d: figure.dataPoints
        }, {
            strokeWidth: 2,
            stroke: '#000'
        });

        //【执行渲染】
        render([line]);

        //【向外界抛出你的公共方法】
        return {
            load:load
        }
    }
);