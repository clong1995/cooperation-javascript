/**
 * 绘画图纸：空白纸
 * 时间：2018年6月4日09:41:33
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'center.paper',
    param => {
        //【参数补全机制】
        let option = ejs.assignDeep({
            style: {
                //位置
                position: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }
        }, param);


        //【简化链式查找】
        let
            //大小
            offsetSize = option.offsetSize,
            //定位
            position = option.style.position;

        //【数据容器】
        let data = option.data;

        let dataGroup = [];
        let sum = 0;
        data.value.forEach(v => {
            sum += v;
        });
        let colorIndex = 0;
        data.key.forEach((v, i) => {
            dataGroup.push({
                name: v,
                value: data.value[i],
                angle: data.value[i] * 360 / sum,
                color: option.theme.color[colorIndex]
            });
            colorIndex === option.theme.color.length ? colorIndex = 0 : colorIndex++;
        });
        //【逻辑原点】
        let O = {
            //x位
            x: (offsetSize.width + position.left - position.right) / 2,
            //y位
            y: (offsetSize.height + position.top - position.bottom) / 2
        };

        //【svg坐标转逻辑正向笛卡尔坐标】
        let X = x => x + O.x,
            Y = y => O.y - y;


        let chartPartMap = new Map();

        function figure() {
            return {
                center: {
                    x: X(0),
                    y: Y(0)
                },
                radius: (offsetSize.width - position.left - position.right) / 2,
                dataPoint: dataGroup
            }
        }

        return {
            option: option,
            chartPartMap: chartPartMap,
            sheetMap: new Map(),
            eventMap: new Map(),
            figure: figure(),
            X: X,
            Y: Y
        };
    }
);