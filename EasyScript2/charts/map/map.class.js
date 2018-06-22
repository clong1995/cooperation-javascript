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

        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        //【基类提供的必要函数】
        const {render} = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //渲染
        render(basic=>{
            return []
        });

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);