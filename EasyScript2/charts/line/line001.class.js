'use strict';
/**
 *  程序：成龙哥哥
 */
CLASS(
    //类名
    'line001',
    //构造器
    param => {
        //【图表类型】
        param.type = 'line';

        //【默认数据】
        ejs.assignDeep({
            data: {
                value: [3, 25, 33, 49, 51, 91, -61],
                key: ['周一', '周二', '周三', '周四', '周五', '周六', '周七']
            }
        }, param);

        //【基类提供的必要函数】
        const {
            svg,        // svg工具类
            render,     // 渲染器
            X,          // 坐标转换器
            Y,          // 坐标转换器
            className,  // 类名生成器
            option,     // 配置项
            figure,     // 关键点
            setSheet,   // 样式表
            addEvent    // 注册事件
        } = NEW_ASYNC(ejs.root + 'charts/chartBase', param);

        //【你的绘制逻辑】

        //【defs】
        let defs = svg.initDefs();
        //渐变
        let pointRadial = svg.radialGradient(defs);

        let
            pointsG = svg.g(),//折点组
            linesG = svg.g(),//折线组
            pointItemClass = ejs.simple();

        let lineAnim = 2000;

        //动画
        let pointsShow = ejs.keyframes({
            to: {opacity: 1}
        });

        setSheet('.' + pointItemClass, {
            opacity: 0,
            animation: pointsShow + ' 1s linear forwards'
        });


        let dataPointDelayStep = lineAnim / figure.dataPoints.length;
        figure.dataPoints.forEach((v, i) => {
            //组装点
            let pointItem = ejs.appendBatch(svg.g(), [
                //根据数据关键点画点
                svg.draw('circle', {
                    cx: v.x,
                    cy: v.y,
                    strokeWidth: 0,
                    r: 4
                }),
                //环
                svg.draw('circle', {
                    cx: v.x,
                    cy: v.y,
                    r: 25
                }, {
                    strokeWidth: 3,
                    fill: 'url(' + pointRadial + ')',
                })]
            );
            ejs.addClass(pointItem, pointItemClass);
            ejs.css(pointItem, {
                animationDelay: i * dataPointDelayStep + 'ms'
            });

            ejs.append(pointsG, pointItem);
        });
        //设置颜色
        let pointsGClass = ejs.simple();
        setSheet('.' + pointsGClass, {
            fill: '#0eabd4',
            stroke: '#0eabd4'
        });
        ejs.addClass(pointsG, pointsGClass);


        //折线组
        let line = svg.draw('lines', {
                d: figure.dataPoints
            }),
            lineLength = line.getTotalLength();

        ejs.appendBatch(linesG, [line]);
        let lineGo = ejs.keyframes({
            to: {strokeDashoffset: 0}
        });

        //
        let linerGClass = ejs.simple();
        setSheet('.' + linerGClass, {
            strokeWidth: 2,
            stroke: '#0eabd4',
            strokeDasharray: lineLength,
            strokeDashoffset: lineLength,
            animation: lineGo + ' ' + lineAnim + 'ms linear forwards'
        });
        ejs.addClass(linesG, linerGClass);


        addEvent('click', '.' + pointItemClass, e => {
            console.log(e);
        });


        //执行渲染
        render([
            defs,
            pointsG,//折点
            linesG//折线
        ]);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);