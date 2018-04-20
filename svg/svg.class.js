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
            for (let key in attr) elem.setAttribute(zBase.underscored(key), attr[key]);
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

            zBase.css(svg, {
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
        function g(iteratorNode, attr = {}) {
            let g = create('g', attr);
            zBase.appendBatch(g, iteratorNode);
            return g;
        }

        /**
         * 设置defs
         * @param node
         */
        function defs(id, node) {
            zBase.attr(node, {
                id: id
            });
            defsSet.add(node);
        }

        function initDefs(svg) {
            let defs = create('defs');
            defsSet.forEach(v => zBase.append(defs, v));
            zBase.append(svg, defs)
        }

        function use(id, attr = {}) {
            attr['xlink:href'] = '#' + id;
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
                style = create('style');
                zBase.append(svg, style);
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
                rulesText += zBase.underscored(k) + ':' + rules[k] + ';'
            }
            rulesText += '}';
            sheetNS.insertRule(rulesText, sheetNS.cssRules.length);
        }

        /**
         *
         * @param obj
         * @param str
         */
        function html(obj, str) {
            obj.textContent = str;
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
            zBase.trim(zBase.trim(styleStr.match(/\{([\s\S]*)\}/)[1]), {
                char: ';',
                position: 'right'
            }).split(';').forEach(v => {
                item = v.split(':');
                let k = zBase.trim(item[0]);
                switch (k) {
                    case 'color':
                        k = 'fill';
                        break;
                    case 'border-color':
                        k = 'stroke';
                        break;
                }
                if (type === 'camelize') k = zBase.camelize(k);
                ruleObj[k] = zBase.trim(item[1]);
            });
            return ruleObj;
        }


        /**
         * 无限过点贝塞尔
         * @param point
         * @param a
         * @param b
         */
        function bezier(point, a = 0.2, b = 0.2) {
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
        }

        return {
            create: create,
            g: g,
            createSvg: createSvg,
            defs: defs,
            sheet: sheet,
            setSheet: setSheet,
            html: html,
            use: use,
            styleStr2Obj: styleStr2Obj,
            initDefs: initDefs,
            bezier: bezier
        }
    }
);