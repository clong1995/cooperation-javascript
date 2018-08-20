/**
 * 绘画图纸：空白纸
 * 时间：2018年6月4日09:41:33
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'map.paper',
    param => {
        //【svg操作类】
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');

        let option = null;
        let userFn = null;
        let IteratorNode = null;
        let svgDom = null;
        let sheetMap = new Map();//样式
        let eventMap = new Map();//事件
        let O = null;
        let offset = null;
        //组件容器
        let chartPartMap = new Map();
        let shot = null;
        let useMap = null;

        //【参数补全机制】
        option = ejs.assignDeep({
            map: '中国/中国/中国',
            center:null,
            zoom: 1.5,
            style: {
                //位置
                position: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                border:{
                    width:1,
                    color:'#000',
                    style:'solid'
                }
            }
        }, param);


        //【简化链式查找】
        shot = {
            map : option.map,
            center:option.center,
            offsetSize : option.offsetSize,
            zoom : option.zoom,
            border : option.style.border,
            position : option.style.position
        };

        //TODO 这个函数太耗时且不优雅，要优化
        useMap = getMap(shot.map);

        function initChart(){

            let mapName = shot.map.split('/').pop();

            //【逻辑原点】
            O = {
                //x位
                x: (shot.offsetSize.width + shot.position.left - shot.position.right) / 2,
                //y位
                y: (shot.offsetSize.height + shot.position.top - shot.position.bottom) / 2
            };

            //没有设置中心
            if(!shot.center){
                //shot.center = useMap.addition[mapName].geometricCenter;
                let properties = useMap.map.features[0].properties;
                shot.center = [properties.X,properties.Y];
            }

            offset = {
                x: O.x / shot.center[0],
                y: O.y / shot.center[1]
            };

            //画出轮廓线
            let stroke = {
                stroke: shot.border.color,
                strokeWidth: shot.border.width
            };
            useMap.map.features.forEach(v => {
                let geometry = v.geometry;
                let g = svg.g();
                if (geometry.type === 'MultiPolygon') {
                    geometry.coordinates.forEach(vcs => {
                        let gi = svg.g();
                        vcs.forEach(vcsi => {
                            let d = [];
                            vcsi.forEach(vcsii => {
                                d.push(gpsToSvg(vcsii));
                            });
                            ejs.append(gi, svg.draw('lines', {
                                d: d
                            }, stroke));
                        });
                        ejs.append(g, gi);
                    })
                }

                if (geometry.type === 'Polygon') {
                    geometry.coordinates.forEach(vcs => {
                        let gi = svg.g();
                        let d = [];
                        vcs.forEach(vcsi => {
                            d.push(gpsToSvg(vcsi));
                        });
                        ejs.append(gi, svg.draw('lines', {
                            d: d
                        }, stroke));
                        ejs.append(g, gi);
                    })
                }
                chartPartMap.set(v.properties.name, g);
            });
        }

        function X(x) {
            return x + (1 - shot.zoom) * O.x;
        }

        function Y(y) {
            return O.y * 2 - y + (shot.zoom - 1) * O.y;
        }


        /*//中心点
        let centerPoint = gpsToSvg(shot.center);
        chartPartMap.set('centerPoint', svg.draw('circle', {
            cx: centerPoint.x,
            cy: centerPoint.y,
        }));*/

        //GPS转svg坐标
        function gpsToSvg(gps) {
            return {
                x: X(gps[0] * offset.x * shot.zoom),
                y: Y(gps[1] * offset.y * shot.zoom),
            }
        }


        function figure() {
            return {}
        }

        //获取地图
        function getMap(map) {
            //TODO 这里做法不太优雅。。。以后优化
            let res = {};
            res['map'] = decode(ejs.loadFileAsync(ejs.root + 'charts/map/maps/' + map + '.json'));

            if (!res['map']) ejs.log('地图文件加载失败', 'error');
            return res;
        }

        /**
         * 解码geojson
         * {
         *  UTF8Encoding        //
         *  features            //
         *    geometry          //
         *      coordinates     //
         *      encodeOffsets   //
         *      type            //
         *    properties        //
         *    childNum          //
         *    cp                //
         *    name              //
         *    type              //
         * }
         * @param json
         * @returns {*}
         */
        function decode(json) {
            if (!json.UTF8Encoding) return json;
            json.features.forEach(v => {
                let coordinates = v.geometry.coordinates;
                let encodeOffsets = v.geometry.encodeOffsets;
                for (let c = 0; c < coordinates.length; c++) {
                    let coordinate = coordinates[c];
                    if (v.geometry.type === 'Polygon') {
                        coordinates[c] = decodePolygon(coordinate, encodeOffsets[c]);
                    } else if (v.geometry.type === 'MultiPolygon') {
                        for (let c2 = 0; c2 < coordinate.length; c2++) {
                            let polygon = coordinate[c2];
                            coordinate[c2] = decodePolygon(polygon, encodeOffsets[c][c2]);
                        }
                    }
                }
            });
            json.UTF8Encoding = false;
            return json;
        }

        function decodePolygon(coordinate, encodeOffsets) {
            let result = [];
            let prevX = encodeOffsets[0],
                prevY = encodeOffsets[1];
            for (let i = 0; i < coordinate.length; i += 2) {
                let x = coordinate.charCodeAt(i) - 64,
                    y = coordinate.charCodeAt(i + 1) - 64;

                x = x >> 1 ^ -(x & 1);
                y = y >> 1 ^ -(y & 1);
                x += prevX;
                y += prevY;
                prevX = x;
                prevY = y;
                result.push([
                    x / 1024,
                    y / 1024
                ]);
            }
            return result;
        }
        
        function initPaper(svgNode, fn) {
            //【保存函数句柄】
            userFn = fn;
            //【保存SVG句柄】
            svgDom = svgNode;

            //【内置样式表】
            let sheet = svg.sheet(svgNode);

            //【生成样式表】
            sheetMap.forEach((v, k) => svg.setSheet(sheet, k, v));

            //【1初始化图表】
            initChart();

            //【2生成部件】
            chartPartMap = new Map(chartPartMap);

            //【3组装节点】
            IteratorNode = userFn({figure: figure()});
            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, ...IteratorNode]);

            //【4显示svg】
            ejs.css(svgDom, {display: 'block'});
        }

        //【公共方法】
        let publicFn = {
            //option: option,
            //chartPartMap: chartPartMap,
            //sheetMap: sheetMap,
            //eventMap: eventMap,
            //figure: figure(),
            //X: X,
            //Y: Y,
            initPaper: initPaper
        };

        return publicFn;
    }
);