'use strict';

CLASS('pie', //类名
    param => {
        //【图表类型】
        param.type = 'pie';

        //【默认数据】
        ejs.assignDeep(param, {
            data: {
                value: [13, 25, 33, 49, 51, 91, 61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        });

        //【基类提供的必要函数】
        const {
            svg,        // svg工具类
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            className,  // 类名生成器
            option,     // 配置项
            figure,     // 关键点
            sheetStyle
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);


        //画饼
        let sectors = [];
        let rotate = 0;
        figure.dataPoint.forEach(v => {
            sectors.push(svg.draw('sector', {
                cx: figure.center.x,//圆心x
                cy: figure.center.y,//圆心y
                r: figure.radius,//半径
                angle: v.angle,//角度
                rotate: rotate//旋转
            },{
                fill:v.color
            }));
            rotate += v.angle;
        });

        //渲染
        render(sectors);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);