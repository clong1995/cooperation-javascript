'use strict';

CLASS('imgMap', ({
                     mapImgSrc = '',
                     mapDom = this.body,
                     rank = .1,
                     minRank = .1,
                     maxRank = 1,
                     control = true,
                     controlStep = 10
                 } = {}) => {

    let
        imgMapSize, //图片大小
        originalImgMapSize,//图片初始大小
        containerSize,//容器大小
        topDistance, //上距离
        topMax,//上极限
        leftDistance, //左距离
        leftMax,//左极限
        realMinRank,//最小缩放等级
        move = false,//是否移动
        sbx,//起始x
        sby, //起始y
        ebx, //结束x
        eby,//结束y
        img,//图片
        mapClass,//图片类
        mapImgClass,//图片样式
        handle = null,
        handleClass = null,
        handleMove = false;

    //规范容器
    ejs.css(mapDom, {
        padding: 0,
        border: 'none',
        overflow: 'hidden',
        position: 'relative'
    });

    mapClass = ejs.simple();
    ejs.addClass(mapDom, mapClass);

    //缩放控件
    if (control) {
        let controlDomClass = ejs.simple(),
            controlDom = ejs.createDom('div', {class: controlDomClass});
        ejs.setSheet('.' + controlDomClass, {
            width: '100px',
            height: '300px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2
        });

        //方向
        let directionClass = ejs.simple();
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass, {
            width: '100px',
            height: '100px',
            background: 'yellow',
            position: 'relative'
        });
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass + '>div', {
            width: '20px',
            height: '20px',
            background: 'green',
            lineHeight: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'absolute'
        });
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass + '>div.up', {
            top: 0,
            left: '40px'
        });
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass + '>div.down', {
            bottom: 0,
            left: '40px'
        });
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass + '>div.left', {
            top: '40px',
            left: 0
        });
        ejs.setSheet('.' + controlDomClass + '>.' + directionClass + '>div.right', {
            top: '40px',
            right: 0
        });

        let content = `<div class="${directionClass}">
                        <div class="up"></div>
                        <div class="down"></div>
                        <div class="left"></div>
                        <div class="right"></div>
                        </div>`;
        ejs.append(mapDom, controlDom);
        ejs.html(controlDom, content);

        //大小
        let zoomClass = ejs.simple(),
            zoomControl = ejs.createDom('div', {class: zoomClass});
        ejs.setSheet('.' + zoomClass, {
            width: '30px',
            height: '200px',
            margin: '0 auto',
            background: 'orange',
            position: 'relative'
        });
        ejs.append(controlDom, zoomControl);
        ejs.setSheet('.' + zoomClass + '>div', {
            width: '30px',
            height: '10px',
            background: 'blue',
            position: 'absolute',
            cursor: 'pointer',
            bottom: 0
        });

        //缩放拉杆
        handleClass = ejs.simple();
        handle = ejs.createDom('div', {class: handleClass});
        ejs.append(zoomControl, handle);

        //方向按键事件
        controlDom.onclick = e => moveMap(e.target.className);

        //拉动缩放轴
        let shy, top;
        handle.onmousedown = e => {
            //移动限制在拉杆上
            if (!ejs.hasClass(e.target, handleClass)) return;
            //开启移动
            handleMove = true;
            shy = e.pageY;//起点
            top = parseInt(handle.style.top);
        };

        document.body.onmousemove = e => {
            if (!handleMove) return;
            let handleTop = top + e.pageY - shy;
            if (handleTop < 0) handleTop = 0;
            if (handleTop > 200) handleTop = 200;

            //算出地图的缩放比例
            let zoomRank = (1 - handleTop / 200) * (maxRank - realMinRank) + realMinRank;
            ejs.css(handle, {
                top: handleTop + 'px'
            });

            zoom(zoomRank, true);
        }
    }

    //加载图片
    ejs.loadImg(mapImgSrc, t => {

        //添加一个图层
        mapImgClass = ejs.simple();
        img = ejs.createDom('div', {class: mapImgClass});
        ejs.setSheet('.' + mapImgClass, {
            position: 'absolute',
            pointerEvents: 'none'
        });



        ejs.append(mapDom, img);
        ejs.append(img, t);



        //================ 测试缩放========================
        let testDom = ejs.createDom();
        ejs.css(testDom, {
            top: '60%',
            left: '45%',
            width: '10%',
            height: '10%',
            background:'red',
            position:'absolute'
        });
        ejs.append(img, testDom);
        //========================================









        //大小
        originalImgMapSize = {
            width: t.width,
            height: t.height,
        };

        //异步指定地图大小
        ejs.css(img, {
            width: t.width + 'px',
            height: t.height + 'px'
        });

        imgMapSize = ejs.domSize(img);

        //重置图片
        ejs.css(t, {
            width: '100%',
            height: '100%'
        });

        containerSize = ejs.domSize(mapDom);


        //激活移动
        mapDom.onmousedown = e => {
            //移动限制在地图上
            if (!ejs.hasClass(e.target, mapClass)) return;
            //开启移动
            move = true;
            //起点
            sbx = e.pageX;
            sby = e.pageY;
            //终点
            eby = parseInt(img.style.top || 0);
            ebx = parseInt(img.style.left || 0);
        };
        //关闭移动
        document.body.onmouseup = () => {
            //关闭地图移动
            move = false;
            //关不缩放移动
            handleMove = false;
        };
        //执行移动
        mapDom.onmousemove = e => {
            if (!move) return;
            //移动距离
            let sx = e.pageX - sbx,
                sy = e.pageY - sby;
            //上下
            topDistance = eby + sy;
            topMax = containerSize.height - imgMapSize.height;
            img.style.top = (topDistance <= topMax ? topMax : topDistance) + 'px';
            img.style.top = topDistance >= 0 && 0;
            //左右
            leftDistance = ebx + sx;
            leftMax = containerSize.width - imgMapSize.width;
            img.style.left = (leftDistance <= leftMax ? leftMax : leftDistance) + 'px';
            img.style.left = leftDistance >= 0 && 0;
        };

        //窗口变化
        window.onresize = () => {
            //重置
            containerSize = ejs.domSize(mapDom);

            //窗口变化临界
            //处在临界下边
            if (parseInt(img.style.top || 0) <= topMax) {
                topMax = containerSize.height - imgMapSize.height;
                img.style.top = topMax + 'px';
            }

            //处在临界右边
            if (parseInt(img.style.left || 0) <= leftMax) {
                leftMax = containerSize.width - imgMapSize.width;
                img.style.left = leftMax + 'px';
            }
            zoom(rank);
        };

        //缩放操作
        mapDom.onmousewheel = e => {
            e.deltaY < 0 ? rank += .1 : rank -= .1;
            //执行缩放
            zoom(rank);
        };

        //初始化的缩放等级
        zoom(rank);
    });

    //地图缩放
    function zoom(r, isHandle = false) {
        //检测最小缩放比例
        let r1 = containerSize.width / originalImgMapSize.width;
        let r2 = containerSize.height / originalImgMapSize.height;
        realMinRank = r1 > r2 ? r1 : r2;

        //系统内最小
        rank = r < realMinRank ? realMinRank : r;
        //开发者指定最小
        rank = rank > minRank ? rank : minRank;

        //系统内最大，无限大
        //开发者指定最大
        rank = rank < maxRank ? rank : maxRank;


        let width = originalImgMapSize.width * rank,
            height = originalImgMapSize.height * rank;
        ejs.css(img, {
            width: width + 'px',
            height: height + 'px',
            top: -((height - containerSize.height) / 2) + 'px',
            left: -((width - containerSize.width) / 2) + 'px'
        });

        //缩放临界
        topMax = containerSize.height - height;
        if (topMax > 0) {
            topMax = 0
        }

        leftMax = containerSize.width - width;
        if (leftMax > 0) {
            leftMax = 0
        }

        if (parseInt(img.style.top || 0) <= topMax) img.style.top = topMax + 'px';
        if (parseInt(img.style.left || 0) <= leftMax) img.style.left = leftMax + 'px';

        //重置图片
        imgMapSize = ejs.domSize(img);

        /**
         * 处理拉杆
         * 地图缩放等级逆向推到算出拉杆移动位置的算法:
         *        拉杆位置 = 拉杆最大移动距离 * ( 1- (缩放等级 - 最小等级) * (1 / (最大等级 - 最小等级)))
         * 通过简单数学归纳得到如下,我天...原来就这样啊...脑子笨,饶了一圈,初中数学白学了...
         */
        if (!isHandle) {
            let handleRank = (rank - realMinRank) / (maxRank - realMinRank);
            ejs.css(handle, {
                top: (200 * (1 - handleRank)) + 'px'
            });
        }
    }

    //地图移动
    function moveMap(type) {
        let prev = {
            top: parseInt(img.style.top || 0),
            left: parseInt(img.style.left || 0)
        };
        let horizontal, vertical;
        switch (type) {
            case 'up':
                vertical = prev.top - controlStep;
                if (vertical > topMax) img.style.top = vertical + 'px';
                break;
            case 'down':
                vertical = prev.top + controlStep;
                if (vertical < 0) img.style.top = vertical + 'px';
                break;
            case 'left':
                horizontal = prev.left - controlStep;
                if (horizontal > leftMax) img.style.left = horizontal + 'px';
                break;
            case 'right':
                horizontal = prev.left + controlStep;
                if (horizontal < 0) img.style.left = horizontal + 'px';
                break;
        }
    }

    return {}
});