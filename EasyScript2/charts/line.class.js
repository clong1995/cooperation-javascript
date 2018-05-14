'use strict';

CLASS('line', //类名
    param => {
        param['chart'] = param.className;
        const {svg, render, X, Y, className, option, figure} = NEW_ASYNC(zBase.root + 'chart/chartBase', param);

        //=== 你的绘制逻辑 ===\\
        let opt_line = option.series;

        //贝塞尔关键点
        //let bezier = svg.bezier(figure);


        let bezier = svg.getControlPoints(figure);

        console.log(bezier);

        //渐变范围开始 ============
        let gradient = null;
        if (opt_line.range.background !== 'none') {
            let d = 'M' + bezier.start.x + ' ' + bezier.start.y;
            bezier.crlAndEnd.forEach(v =>
                d += ' C' +
                    v.crl1.x + ' ' + v.crl1.y + ',' +
                    v.crl2.x + ' ' + v.crl2.y + ',' +
                    v.end.x + ' ' + v.end.y
            );
            gradient = svg.create('path', {
                d: d + ' V' + Y(0) + ' H' + figure[0].x,
                fill: 'red'//opt_line.line.background,
                //stroke: opt_line.line.borderColor
            });
        }

        //渐变范围结束 =================

        //分段线
        /*let line = svg.create('path', {
            d: d,
            fill:opt_line.line.background,
            stroke:opt_line.line.borderColor
        });

        let d = 'M' + bezier.start.x + ' ' + bezier.start.y;*/

        /*bezier.crlAndEnd.forEach(v =>
            d += ' C' +
                v.crl1.x + ' ' + v.crl1.y + ',' +
                v.crl2.x + ' ' + v.crl2.y + ',' +
                v.end.x + ' ' + v.end.y
        );*/

        /*let line = svg.create('path', {
            d: d,
            fill:opt_line.line.background,
            stroke:opt_line.line.borderColor
        });*/


        /*let points = figure[0].x + ',' + Y(0) + ' ';
        figure.forEach(v => points += v.x + ',' + v.y + ' ');
        let line = svg.create('polyline', {
            points: points + figure[figure.length - 1].x + ',' + Y(0)
        });
        zBase.css(line, {
            fill: opt_line.line.background,
            stroke: opt_line.line.borderColor,
            strokeWidth: opt_line.line.borderWidth
        });*/

        //=== 渲染到html上 ===\\
        //render([lineG]);
        render([gradient]);

        //===向外界抛出你的公共方法 ===\\
        return {}
    }
);