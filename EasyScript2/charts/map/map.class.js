'use strict';

CLASS('map', //类名
    param => {
        //【图表类型】
        param.type = 'map';

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
            option,     // 配置项
            figure     // 关键点
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);


        //渲染
        render([]);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);