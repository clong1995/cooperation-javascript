'use strict';

CLASS('bar', //类名
    param => {
        //默认数据
        ejs.assignDeep({
            data: {
                value: [3, 25, 33, 49, 51, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        },param);

        //基类提供的必要函数
        const {
            svg,        // svg工具类
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            className,  // 类名生成器
            option,     // 配置项
            figure     // 关键点
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);


        //你的逻辑
        let point = [];
        figure.dataPoints.forEach(v => {
            point.push(svg.draw('circle', {
                cx: v.x,
                cy: v.y,
                r: 5
            }));
        });


        //执行渲染
        render([
            ...point,//折点
        ]);

        //向外界抛出你的公共方法
        return {

        }
    }
);