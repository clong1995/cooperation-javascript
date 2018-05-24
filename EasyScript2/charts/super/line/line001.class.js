'use strict';
/**
 *  视觉设计：秦蒙蒙
 *  程序：成龙哥哥
 */
CLASS(
    //类名
    'line001',
    //构造器
    param => {
        //默认数据
        ejs.assignDeep({
            data: {
                value: [3, 25, 33, 49, 51, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        }, param);

        //基类提供的必要函数
        const {
            svg,        // svg工具类
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            className,  // 类名生成器
            option,     // 配置项
            figure      // 关键点
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);


        //你的绘制逻辑




        let
            pointsG = svg.g(),//折点组
            linesG = svg.g();//折线组

        figure.dataPoints.forEach(v => {
            //组装点
            ejs.append(pointsG, ejs.appendBatch(svg.g(), [
                //根据数据关键点画点
                svg.draw('circle', {
                    cx: v.x,
                    cy: v.y,
                    strokeWidth: 0,
                    r: 6
                }),
                //环
                svg.draw('circle', {
                    cx: v.x,
                    cy: v.y,
                    r: 25
                }, {
                    strokeWidth: 3,
                    fill: 'none',

                })]
            ));
        });
        //设置颜色
        ejs.attr(pointsG, {
            class: ejs.setSheet('.' + ejs.simple(), {
                fill: '#0eabd4',
                stroke: '#0eabd4'
            })
        });

        //折线组
        let line = svg.draw('lines', {
                d: figure.dataPoints
            }),
            lineLength = line.getTotalLength();

        ejs.appendBatch(linesG, [line]);
        let lineGo = ejs.keyframes({
            to: {strokeDashoffset: 0}
        });
        ejs.attr(linesG, {
            class: ejs.setSheet('.' + ejs.simple(), {
                strokeWidth: 2,
                stroke: '#0eabd4',
                strokeDasharray: lineLength,
                strokeDashoffset: lineLength,
                animation: lineGo + ' 2s linear forwards'
            })
        });

        //执行渲染
        render([
            pointsG,//折点
            linesG,//折线
        ]);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);