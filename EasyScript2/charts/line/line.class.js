'use strict';

CLASS('line', //类名
    param => {
        //【图表类型】
        param.type = 'line';
        
        //【默认数据】
        ejs.assignDeep(param,{
            data: {
                value: [22, 121, 0, 28, 115, -64, 131],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
                /*value: [12503, 11208, 13800, 11502, 12705, 11900, -11707,-11001,12501,12808],
                key: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7','x8','x9','x10']*/
            }
        });

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        //【基类提供的必要函数】
        const {
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            className,  // 类名生成器
            option,     // 配置项
            figure,     // 关键点
            sheetStyle
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //【你的绘制逻辑】
        console.log('用于二次开发的关键数据', figure);


        //【根据数据关键点画线】
        let line = svg.draw('lines', {
            d: figure.dataPoints
        }, {
            strokeWidth: 2,
            stroke: '#000'
        });


        //【执行渲染】
        render([
            line,//折线
        ]);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);