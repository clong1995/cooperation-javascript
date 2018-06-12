'use strict';

CLASS(
    'svg',
    param => {

        /**
         *  用于svg协议和规范
         */
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const XLINK_NS = 'http://www.w3.org/1999/xlink';

        let defsSet = new Set();


        /**
         * 创建svg节点
         * @param tagName
         * @param attr
         * @returns {HTMLElement | SVGAElement | SVGCircleElement | SVGClipPathElement | SVGComponentTransferFunctionElement | SVGDefsElement | *}
         */
        function create(tagName, attr = {}) {
            let elem = document.createElementNS(SVG_NS, tagName);
            //修复svg元素的历史bug
            if (attr.strokeLocation && attr.strokeWidth) {
                if (tagName === 'rect') {
                    if (attr.strokeLocation === 'inside') {
                        attr.x += attr.strokeWidth / 2;
                        attr.y += attr.strokeWidth / 2;
                        attr.width -= attr.strokeWidth;
                        attr.height -= attr.strokeWidth;
                    }
                }
                if (tagName === 'circle') {
                    if (attr.strokeLocation === 'inside') {
                        attr.r -= attr.strokeWidth / 2;
                    }
                }
            }
            delete attr.strokeLocation;
            for (let key in attr) {
                if (attr[key] !== null)
                    elem.setAttribute(ejs.underscored(key), attr[key]);
            }
            return elem;
        }

        /**
         * 创建SVG
         * @param version 版本 默认值：1.2
         * @param width 宽度 默认：100%
         * @param height 高度 默认：100%
         * @returns {*}
         */
        function createSvg({
                               version = '1.2',
                               width = '100%',
                               height = '100%',
                               xmlns = SVG_NS,
                               xlink = XLINK_NS
                           } = {}) {
            let svg = create('svg', {
                version: version,
                width: width,
                height: height,
                xmlns: xmlns,
                'xmlns:xlink': xlink
            });

            ejs.css(svg, {
                position: 'absolute',
                userSelect: 'none',
                display: 'none'
            });

            return svg;
        }


        /**
         * g组
         * @param iteratorNode
         * @param attr
         * @returns {HTMLElement|SVGAElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGDefsElement|*}
         */
        function g(iteratorNode = [], attr = {}) {
            let g = create('g', attr);
            ejs.appendBatch(g, iteratorNode);
            return g;
        }

        /**
         * 设置defs
         * @param node
         */
        function def(defs, def) {
            /*ejs.attr(def, {
                id: ejs.simple()
            });*/
            ejs.append(defs, def);
            return def;
        }


        function linearGradient(defs, {
            x1 = 0,
            y1 = 0,
            x2 = "100%",
            y2 = 0,
            offset = {
                "0%": {
                    color: 'rgb(14,171,212)',
                    opacity: .1
                },
                "50%": {
                    color: 'rgb(14,171,212)',
                    opacity: .3
                },
                "100%": {
                    color: 'rgb(14,171,212)',
                    opacity: .1
                }
            }
        } = {}) {
            let id = ejs.simple();
            let radial = create('linearGradient', {
                id: id,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            });

            for (let o in offset) {
                let stop = create('stop', {offset: o});
                ejs.css(stop, {
                    stopColor: offset[o].color,
                    stopOpacity: offset[o].opacity
                });
                ejs.append(radial, stop);
            }
            ejs.append(defs, radial);
            return "#" + id;
        }

        function radialGradient(defs, {
            cx = "50%",
            cy = "50%",
            r = "50%",
            fx = "50%",
            fy = "50%",
            offset = {
                "0%": {
                    color: 'rgb(255,255,255)',
                    opacity: 0
                },
                "100%": {
                    color: 'rgb(14,171,212)',
                    opacity: 1
                }
            }
        } = {}) {
            let id = ejs.simple();
            let radial = create('radialGradient', {
                id: id,
                cx: cx,
                cy: cy,
                r: r,
                fx: fx,
                fy: fy
            });

            for (let o in offset) {
                let stop = create('stop', {offset: o});
                ejs.css(stop, {
                    stopColor: offset[o].color,
                    stopOpacity: offset[o].opacity
                });
                ejs.append(radial, stop);
            }
            ejs.append(defs, radial);
            return "#" + id;
        }

        function initDefs(defArr = []) {
            let defs = create('defs');
            defArr.forEach(v => ejs.append(defs, v));
            return defs;
        }

        function use(id, attr = {}) {
            attr['href'] = '#' + id;
            return create('use', attr);
        }

        /**
         *
         * @param svg
         * @returns {sheet}
         */
        function sheet(svg) {
            //创建和返回sheet
            let style = null;
            if (!svg.querySelector('style')) {
                //style = create('style');//ie不兼容
                style = ejs.createDom('style');
                ejs.append(svg, style);
            }
            return style.sheet;
        }

        /**
         * 设置css
         * @param selector
         * @param rules
         */
        function setSheet(sheetNS, selector, rules) {
            let rulesText = selector + '{';
            for (let k in rules) {
                rulesText += ejs.underscored(k) + ':' + rules[k] + ';'
            }
            rulesText += '}';
            sheetNS.insertRule(rulesText, sheetNS.cssRules.length);
        }

        /**
         *
         * @param obj
         * @param str
         */
        function addText(obj, str) {
            obj.textContent = str;
            return obj;
        }


        /**
         * css字符串转对象
         * @param styleStr
         * @param type
         * @returns {{}}
         */
        function styleStr2Obj(styleStr, type = 'camelize') {
            let ruleObj = {},
                item = [];
            ejs.trim(ejs.trim(styleStr.match(/\{([\s\S]*)\}/)[1]), {
                char: ';',
                position: 'right'
            }).split(';').forEach(v => {
                item = v.split(':');
                let k = ejs.trim(item[0]);
                switch (k) {
                    case 'color':
                        k = 'fill';
                        break;
                    case 'border-color':
                        k = 'stroke';
                        break;
                }
                if (type === 'camelize') k = ejs.camelize(k);
                ruleObj[k] = ejs.trim(item[1]);
            });
            return ruleObj;
        }


        /**
         * 获取控制点坐标
         * @param  {Array} arr 4个点坐标数组
         * @param  {Float} smooth_value [0, 1] 平滑度
         *   p1 上一个点
         *   p2 左端点
         *   P3 右端点
         *   p4 下一个点
         * @return {Array}     2个点坐标数组
         */
        /*function getControlPoints(arr, smooth_value = 1) {
            //坐标
            var x0 = arr[0].x,
                y0 = arr[0].y;
            var x1 = arr[1].x,
                y1 = arr[1].y;
            var x2 = arr[2].x,
                y2 = arr[2].y;
            var x3 = arr[3].x,
                y3 = arr[3].y;

            // Assume we need to calculate the control
            // points between (x1,y1) and (x2,y2).
            // Then x0,y0 - the previous vertex,
            //      x3,y3 - the next one.
            // 1.假设控制点在(x1,y1)和(x2,y2)之间，第一个点和最后一个点分别是曲线路径上的上一个点和下一个点

            // 2.求中点
            var xc1 = (x0 + x1) / 2.0;
            var yc1 = (y0 + y1) / 2.0;

            var xc2 = (x1 + x2) / 2.0;
            var yc2 = (y1 + y2) / 2.0;

            var xc3 = (x2 + x3) / 2.0;
            var yc3 = (y2 + y3) / 2.0;

            // 3.求各中点连线长度
            var len1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            var len2 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            var len3 = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2));

            // 4.求中点连线长度比例（用来确定平移前p2, p3的位置）
            var k1 = len1 / (len1 + len2);
            var k2 = len2 / (len2 + len3);

            // 5.平移p2
            var xm1 = xc1 + (xc2 - xc1) * k1;
            var ym1 = yc1 + (yc2 - yc1) * k1;

            // 6.平移p3
            var xm2 = xc2 + (xc3 - xc2) * k2;
            var ym2 = yc2 + (yc3 - yc2) * k2;

            // Resulting control points. Here smooth_value is mentioned
            // above coefficient K whose value should be in range [0...1].
            // 7.微调控制点与顶点之间的距离，越大曲线越平直
            var ctrl1_x = xm1 + (xc2 - xm1) * smooth_value + x1 - xm1;
            var ctrl1_y = ym1 + (yc2 - ym1) * smooth_value + y1 - ym1;

            var ctrl2_x = xm2 + (xc2 - xm2) * smooth_value + x2 - xm2;
            var ctrl2_y = ym2 + (yc2 - ym2) * smooth_value + y2 - ym2;

            return [{x: ctrl1_x, y: ctrl1_y}, {x: ctrl2_x, y: ctrl2_y}];
        }*/


        /**
         * 无限过点贝塞尔
         * @param point
         * @param a
         * @param b
         */

        /*function bezier(point, a = 0.2, b = 0.2) {


            //起点
            //let d = 'M' + point[0].x + ' ' + point[0].y;

            let
                start = {
                    x: point[0].x,
                    y: point[0].y
                },
                crlAndEnd = [];

            //输出控制点
            for (let i = 1; i < point.length; i++) {
                //控制组
                let pAx, pAy, pBx, pBy;

                if (i < 2) {
                    pAx = point[0].x + (point[1].x - point[0].x) * a;
                    pAy = point[0].y + (point[1].y - point[0].y) * a;
                } else {
                    pAx = point[i - 1].x + (point[i].x - point[i - 2].x) * a;
                    pAy = point[i - 1].y + (point[i].y - point[i - 2].y) * a;
                }

                if (i > point.length - 2) {
                    let last = point.length - 1;
                    pBx = point[last].x - (point[last].x - point[last - 1].x) * b;
                    pBy = point[last].y - (point[last].y - point[last - 1].y) * b;
                } else {
                    pBx = point[i].x - (point[i + 1].x - point[i - 1].x) * b;
                    pBy = point[i].y - (point[i + 1].y - point[i - 1].y) * b;
                }
                //d += ' C' + pAx + ' ' + pAy + ',' + pBx + ' ' + pBy + ',' + point[i].x + ' ' + point[i].y;

                crlAndEnd.push({
                    crl1: {x: pAx, y: pAy,},
                    crl2: {x: pBx, y: pBy},
                    end: {x: point[i].x, y: point[i].y}
                })
            }

            return {
                start: start,
                crlAndEnd: crlAndEnd,
            };
        }*/

        //画线
        function line({
                          x1 = 0,
                          y1 = 0,
                          x2 = 10,
                          y2 = 10
                      } = {}, style = null) {
            let figure = create('line', {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            });
            if (style) ejs.css(figure, style);
            return figure;
        }


        function lines({
                           type = 'line',//arc（弧线）
                           d = [{x: 10, y: 10}, {x: 20, y: 20}]
                       } = {}, style = null) {
            let dStr = '';
            d.forEach((v, i) => {
                !i ?
                    dStr += 'M' + v.x + ',' + v.y :
                    dStr += 'L' + v.x + ',' + v.y;
            });
            let figure = create('path', {
                d: dStr,
                fill: 'none'
            });
            if (style) ejs.css(figure, style);
            return figure;
        }

        //画圆
        function circle({
                            cx = 10,
                            cy = 10,
                            r = 5,
                            strokeLocation = null,
                            strokeWidth = null
                        } = {}, style = null) {

            let figure = create('circle', {
                cx: cx,
                cy: cy,
                r: r,
                strokeLocation: strokeLocation,
                strokeWidth: strokeWidth
            });

            if (style) ejs.css(figure, style);
            return figure;
        }

        //多边形
        function polygon({
                             border = 4,
                             borderWidth = 10,
                             cx = borderWidth * 2,
                             cy = borderWidth * 2
                         } = {}, style = null) {

            if (border < 3) {
                ejs.log('二维多边形边数最少为3条', 'error');
                return;
            }
            let figure = null;
            if (border === 4) {
                figure = create('rect', {
                    x: "10",
                    y: "10",
                    height: borderWidth,
                    width: borderWidth
                });
                ejs.css(figure, style);
            }
            return figure;
        }

        /**
         * 扇形
         * 简化复杂的绘图指令并转为更加体验友好的直观图形和角度弧度制，减轻开发压力
         * @param cx 圆心x
         * @param cy 圆心y
         * @param r 半径
         * @param angle 圆弧角度
         * @param rotate 圆弧相对于y轴的偏转
         * @param style 样式
         * @returns {*}
         */
        function sector({
                            cx = 30,//圆心x
                            cy = 30,//圆心y
                            r = 30,//半径
                            angle = 45,//角度
                            rotate = 0//旋转
                        } = {}, style = null) {
            let figure = null;

            if (angle >= 360) {
                figure = circle({
                    cx: cx,
                    cy: cy,
                    r: r,
                });
            } else {
                //转成直观角度
                angle -= (90 - rotate);
                rotate -= 90;
                //弧度
                let radian = Math.PI / 180,
                    rr = rotate * radian,
                    ar = angle * radian;
                //圆上对应的点
                let xs = cx + r * Math.cos(rr),
                    ys = cy + r * Math.sin(rr),
                    xe = cx + r * Math.cos(ar),
                    ye = cy + r * Math.sin(ar);
                //转成直观图形
                let largeArcFlag = 0,
                    sweepFlag = 1;
                if (angle < -90) sweepFlag = 0;
                if (angle >= 90) largeArcFlag = 1;
                if (rotate >= 0 && angle >= 90) largeArcFlag = 0;

                //生成指令
                let d = 'M' + cx + ',' + cy + 'L' + xs + ',' + ys + 'A' + r + ' ' + r + ' 0 ' + largeArcFlag + ' ' + sweepFlag + ' ' + xe + ',' + ye + 'Z';
                figure = create('path', {d: d});
            }
            if (style) ejs.css(figure, style);
            return figure;
        }

        function draw(type, option, style) {
            let figure = null;
            switch (type) {
                case 'line':
                    figure = line(option, style);
                    break;
                case 'lines':
                    figure = lines(option, style);
                    break;
                case 'circle':
                    figure = circle(option, style);
                    break;
                case 'rect':
                    figure = rect(option, style);
                    break;
                case 'polygon':
                    figure = polygon(option, style);
                    break;
                case 'sector':
                    figure = sector(option, style);
                    break;
                default:
                    ejs.log('未能识别的图形类型！', 'error');
            }
            return figure;
        }

        function symbol(iteratorNode = []) {
            let symbol = create('symbol');
            ejs.appendBatch(symbol, iteratorNode);
            return symbol;
        }

        return {
            create: create,
            g: g,
            symbol: symbol,
            createSvg: createSvg,
            def: def,
            sheet: sheet,
            setSheet: setSheet,
            addText: addText,
            use: use,
            styleStr2Obj: styleStr2Obj,
            initDefs: initDefs,
            draw: draw,
            radialGradient: radialGradient,
            linearGradient: linearGradient
            /*bezier: bezier,
            getControlPoints:getControlPoints*/
        }
    }
);