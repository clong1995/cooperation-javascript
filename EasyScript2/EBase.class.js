/**
 * 基类 采用ES6实现
 *  包含
 *      1、实用方法，
 *      2、ajax，
 *      3、事件绑定，
 *      4、数据绑定（未实现数据双向绑定），
 *      5、面向对象风格框架，private、public特性，多例，无new使用
 *      6、模块化，模块缓存，模块调度
 *      7、style和link劫持，
 *      8、svg操作，
 *      9、用户行为采集（未实现），
 *      10、日志监控
 *
 */
'use strict';

class EBase {
    constructor() {
        /**
         * 是否加载完成
         * @type {boolean}
         * @private
         */
        this._isReady = false;

        /**
         * 用于保存加载的的js脚本
         * @type {Set<any>}
         * @private
         */
        this._scriptSet = new Set();

        /**
         * 用于保存模块
         * @type {Map<any, any>}
         * @private
         */
        this._moduleStack = new Map();

        /**
         * 用于obj绑定数据，当节点删除数据自动删除
         * @type {WeakMap<object, any>}
         * @private
         */
        //this._weakDate = new WeakMap();

        /**
         * 用于保存事件
         * @type {WeakMap<object, any>}
         * @private
         */
        this._domEvent = new Map();

        /**
         * 用于记录绑定的事件
         * @type {Set<any>}
         */
        //this._eventSet = new Set();

        /**
         * 用于储存绑定的事件，事件均脱强制使用body代理
         * @type {Map<any, any>}
         */
        this._eventMap = new Map();

        /**
         * 根目录
         * @type {string}
         */
        this.root = this.path();

        /**
         * 加载组件
         * 会在全局范围内记录使用的组件，不会发出重复请求
         * @type {any}
         */
        window.NEW = this._require.bind(this);

        /**
         * 同步加载组件
         * 会在全局范围内记录使用的组件，不会发出重复请求
         * @type {any}
         */
        window.NEW_ASYNC = this._requireAsync.bind(this);

        /**
         * 定义组件
         * @type {any}
         */
        window.CLASS = this._define.bind(this);

        this._sheetArr = document.styleSheets;
        this._head = document.head;
        if (this._sheetArr.length <= 0)
            this.append(this._head, this.createDom('style'));//创建style节点
        this._firstSheet = this._sheetArr[0];
        this._lastSheet = this._sheetArr[this._sheetArr.length - 1];

        this.formatStyle();
        this._animation = new Map();
    }


    /**
     * 添加类名
     * @param dom
     * @param clazz
     */
    addClass(dom, clazz) {
        dom.classList.add(clazz);
        return dom;
    }

    /**
     * 基于fetch(基于Promise)的ajax，仅支持异步，同步请求被主流浏览器判为不友好交互
     * @param url :必填参数
     * @param method :GET(默认),POST
     * @param headers :自己查http协议去
     * @param mode :same-origin,cors(默认),cors-with-forced-preflight,no-cors
     * @param cache :default,no-store,no-cache(默认),reload,force-cache,only-if-cached
     * @param credentials :同源策略
     * @param data :{}
     * @param success
     * @param error
     */
    ajax(url, {
        method = 'GET',
        headers = {
            //TODO 需要完善 可以参考jQuery的ajax请求头
            "Content-type": "application/x-www-form-urlencoded"
        },
        mode = 'cros',
        cache = 'no-cache',
        credentials = 'same-origin',
        data = {},
        success = null,
        error = null
    } = {}) {

        let req = {
            method: method,
            headers: headers,
            mode: mode,
            credentials: credentials,
            cache: cache
        };
        if (method !== 'GET') {
            let body = '';
            Object.keys(data).forEach(value => body += value + '=' + data[value] + '&');
            req['body'] = this.trim(body, '&', 'right');
        }
        fetch(url, req)
            .then(response => {
                if (response.status === 200) return response;
            })
            .then(data => {
                return data.json()
            })
            .then(json => {
                if (typeof success === 'function') success(json)
            })
            .catch(err => {
                if (typeof error === 'function') error(err)
            });
    }


    /**
     * 在父元素的指定位置插入元素
     * @param obj
     * @param child
     * @param index -1则在最后插入
     */
    append(obj, child, index = -1) {
        if (child) {
            let children = obj.children;
            (index < 0 || index > children.length) ? obj.appendChild(child) : obj.insertBefore(child, children[index]);
        }
        return obj;
    }

    /**
     *
     * @param obj
     * @param children
     */
    appendBatch(obj, children = []) {
        children.forEach(v => this.append(obj, v));
        return obj;
    }

    /**
     * 获取数组最大最小值
     * @param arr 数字数组
     * @param type 默认max min
     * @param index 时是否返回索引
     * @returns {number}
     */
    arrMaxMin(arr, type = 'max', index = false) {
        try {
            let value = type === 'max'
                ? Math.max(...arr)
                : Math.min(...arr);

            if (index) {
                let index = type === 'max'
                    ? arr.indexOf(Math.max.apply(Math, arr))
                    : arr.indexOf(Math.min.apply(Math, arr));
                return {value: value, index: index}
            } else {
                return value;
            }
        } catch (err) {
            ejs.log('数组太长，超过了最大调用堆栈大小，建议后端处理。此处递归对个数组进行了分段分层处理这，但将有损速度和性能', 'warn');
            let tempArr = [],
                i = 0;
            do tempArr.push(this.arrMaxMin(arr.slice(i, i += 10000), type, index));
            while (i < arr.length);
            return this.arrMaxMin(tempArr, type, index);
        }
    }

    /**
     * 深度合并和拷贝对象，建议obj2为少的一方
     * @param obj
     * @param obj2
     * @returns {*}
     */
    assignDeep(obj, obj2) {
        for (let k in obj2)
            typeof obj2[k] === 'object'
                ? obj[k] === undefined
                ? obj[k] = obj2[k]
                : this.assignDeep(obj[k], obj2[k])
                : obj[k] = obj2[k];
        return obj;
    }

    /**
     * 设置和获取属性
     * @param obj 对象
     * @param attr 属性键值对
     */
    attr(obj, attr = null) {
        if (!obj)
            return obj;
        if (attr === null) {
            let attrObj = {};
            Array.from(obj.attributes).forEach(v => v.name === 'style' ? null : attrObj[v.name] = v.value);
            return attrObj;
        }
        if (typeof(attr) === 'string') {
            return obj.getAttribute(attr);
        }
        for (let k in attr) {
            if ((k === 'class' && !attr[k].indexOf('.')) || (k === 'id' && !attr[k].indexOf('#')))
                attr[k] = attr[k].substr(1);
            obj.setAttribute(k, attr[k]);
        }
        return obj;
    }


    /**
     * 批量设置style
     * @param cssText
     * @private
     */
    _batchSetSheet(sheetItem, cssText) {
        this.trim(cssText, {
            char: '}',
            position: 'right'
        }).split('}').forEach(value => sheetItem.insertRule(value + '}', sheetItem.cssRules.length));
    }

    /**
     * 转驼峰写法
     * @param str
     * @returns {*}
     */
    camelize(str) {
        return (!str.includes('-') && !str.includes('_'))
            ? str
            : str.replace(
                /[-_][^-_]/g,
                match => match.charAt(1).toUpperCase()
            )
    }


    /**
     * 首字母大写
     * @param str
     * @returns {string}
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    click(dom, target = '', callback, useCapture = true) {

        console.log(dom);
        console.log(target);
        console.log(callback);

        dom.addEventListener()

        /*dom.addEventListener('click', e => {
            if (!target)
                callback(e);
            else {
                let fn = domLen => {
                    if (!target.indexOf('.')) //class
                        [...e.path[domLen].classList].some(v => {
                            if ('.' + v === target) {
                                callback(e.path[domLen]);
                                return true;
                            }
                        });
                    else if (target.indexOf('#')) {//id
                        if ('#' + e.path[domLen].id === target)
                            callback(e.path[domLen]);
                    } else {//标签名
                        if (e.path[domLen].nodeName === target)
                            callback(e.path[domLen]);
                    }
                };
                let domLen = e.path.length - 4 - 1;//排除body,html,document,window

                //冒泡
                if (useCapture)
                    for (; domLen + 1; --domLen)
                        fn(domLen);
                else //捕获
                    e.path.some((v, i) => {
                        fn(i);
                        return i === domLen;
                    })
            }
        })*/
    }

    /**
     * TODO 不能局限于克隆数组
     * @param arr
     * @returns {*[]}
     */
    cloneArr(arr) {
        return [...arr];
    }

    /**
     * 创建dom节点
     * @param tagName
     * @param attr
     * @returns {HTMLDivElement}
     */
    createDom(tagName = 'div', attr = {}) {
        let elem = document.createElement(tagName);
        for (let key in attr) elem.setAttribute(this.underscored(key), attr[key]);
        return elem;
    }

    /**
     * 设置和获取样式
     * @param obj
     * @param css
     * @returns {{}}
     */
    css(obj, css) {
        if (css == null)
            return this.styleStr2Obj('{' + obj.style.cssText + '}');
        for (let k in css) obj.style[k] = css[k];
    }


    /**
     * 定义模块
     * @param modName
     * @param fn
     * @private
     */
    _define(modName, fn) {
        this._moduleStack.set(modName, fn);
    }

    //删除css
    deleteSheet(selectorText) {
        let flag = false;
        [...this._lastSheet.cssRules].some((v, i) => {
            flag = v.selectorText === selectorText;
            if (flag)
                this._lastSheet.deleteRule(i);
            return flag;
        });
    }

    //批量删除
    batchDeleteSheet(selectorTextArr) {
        selectorTextArr.forEach(v => this.deleteSheet(v))
    }

    //时间日期
    /**
     * 将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
     * 可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * "yyyy-MM-dd hh:mm:ss.S" ==> 1995-09-19 08:09:04.423
     * "yyyy-MM-dd E HH:mm:ss" ==> 1995-09-19 二 20:09:04
     * "yyyy-MM-dd EE hh:mm:ss" ==> 1995-09-19 周二 08:09:04
     * "yyyy-MM-dd EEE hh:mm:ss" ==> 1995-09-19 星期二 08:09:04
     * "yyyy-M-d h:m:s.S" ==> 1995-9-19 8:9:4.18
     */
    date(fmt = 'yyyy-MM-dd HH:mm:ss', date = new Date()) {
        let o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
            "H+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        let week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    // 差集
    difference(arr1, arr2) {
        return [...new Set([...arr1].filter(x => !arr2.has(x)))];
    }

    /**
     * 数组去重
     * @param arr
     * @returns {*[]}
     */
    distinct(arr) {
        return [...new Set(arr)]
    }


    /**
     * 下载日志
     * @param logApi 下载日志的后台服务 没有此项参数，默认下载本次会话的日志
     */
    downLog(logApi = '') {

    }

    /**
     * 清空指定元素
     * @param dom 目标对象
     * @param rep 不写默认清空，是节点或者是字符串则填充
     */
    empty(dom, rep = '') {
        dom.innerHTML = '';
        if (typeof rep === 'object')
            dom.appendChild(rep);
        else if (rep)
            dom.innerHTML = rep
    }

    /**
     * html转实体
     * @param str
     * @returns {string}
     */
    escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /**
     * 格式化css
     */
    formatStyle() {
        this.trim(`
            blockquote, body, button, dd, dl, dt, fieldset, form, h1, h2, h3, h4, h5, h6, hr, input, legend, li, ol, p, pre, td, textarea, th, ul {
                margin: 0;
                padding: 0
            }
            
            html,body{
                background:#fafafa;
                width:100%;
                height:100%;
                cursor:auto;
                user-select:auto
            }
            
            body, button, input, select, textarea, a, li {
                font: 16px/1.5 Hiragino Sans GB,Microsoft YaHei,tahoma,arial,sans-serif;
            }
            
            input,textarea,select,button{
                outline:none
            }
            
            h1, h2, h3, h4, h5, h6, button, input, select, textarea {
                font-size: 100%
            }
            
            input[type=button] {
                cursor: pointer
            }
            
            address, cite, dfn, em, var {
                font-style: normal
            }
            
            code, kbd, pre, samp {
                font-family: courier new, courier, monospace
            }
            
            small {
                font-size: 12px
            }
            
            ol, ul {
                list-style: none;
                font-size: 0
            }
            
            a {
                text-decoration: none;
                color: #555
            }
            
            sup {
                vertical-align: text-top
            }
            
            sub {
                vertical-align: text-bottom
            }
            
            img {
                border: 0
            }
            
            label{
                cursor:pointer;
            }
            
            table {
                border-collapse: collapse;
                border-spacing: 0
            `, {
            char: '}',
            position: 'right'
        }).split('}').forEach((value, i) => this._firstSheet.insertRule(value + '}', i));
    }


    /**
     * 傻瓜屏蔽脚本
     */
    fool() {
        //删除script
        this.removeAll(document.querySelectorAll('script'));
        //无菜单
        document.oncontextmenu = () => false;
        //禁止复制粘贴剪切选中
        document.onpaste = () => false;
        document.oncopy = () => false;
        document.oncut = () => false;
        document.onselectstart = () => false;
        //屏蔽危险按键
        document.onkeydown = () => {
            let keyCode = window.event.keyCode;
            if (keyCode === 16 || keyCode === 17 || keyCode === 18 || keyCode === 123 || keyCode === 116)
                return false;
        }
    }

    /**
     * 获取样式表样式
     * @param selector
     * @returns {Set<any>}
     */
    getStyleSheet(selector = '') {
        let cssRule = new Set();
        //用 Array.from(this._sheetArr) 替换了 [...this._sheetArr]，有些浏览器在styleSheets上没有部署Iterator
        Array.from(this._sheetArr).forEach((v, i) =>
            Array.from(v.cssRules).forEach((v2, i2) => {
                if (selector !== '') {
                    if (v2.selectorText && v2.selectorText.startsWith(selector))
                        cssRule.add({
                            sheetIndex: i,
                            ruleIndex: i2,
                            rule: v2.cssText
                        })
                } else
                    cssRule.add({
                        sheetIndex: i,
                        ruleIndex: i2,
                        rule: v2.cssText
                    })
            })
        );
        return cssRule;
    }

    /**
     * GUID
     * @returns {string}
     */
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 是否包含class
     * @param dom
     * @param clazz
     * @returns {*}
     */
    hasClass(dom, clazz) {
        return [...dom.classList].some(v => v === clazz)
    }


    /**
     * 添加文本
     * @param dom
     * @param str
     * @param plus
     */
    html(dom, str, plus = true) {
        let textNode = this.textNode(str);
        plus ? dom.innerHTML = '' : null;
        this.append(dom, textNode);
        return dom;
    }

    /**
     * iconFont
     * @param ttfUrl
     * @param fontSize
     */
    iconFont({
                 ttfUrl = this.path() + 'iconfont/iconfont.ttf',
                 fontSize = 16
             } = {}) {

        this._batchSetSheet(this._firstSheet,
            `@font-face {
                font-family: "iconfont";
                src:url('${ttfUrl}') format('truetype')
            }
            .iconfont {
                font-family: "iconfont" !important;
                font-size: ${fontSize}px;
                font-style: normal;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale
            }`
        );
    }

    //动画
    keyframes(rules) {
        let name = this.simple();
        let rulesText = '@keyframes ' + name + '{';
        for (let r in rules) {
            rulesText += r + '{';
            for (let ir in rules[r]) {
                rulesText += this.underscored(ir) + ':' + rules[r][ir] + ';';
            }
            rulesText += '}';
        }
        this._lastSheet.insertRule(rulesText + '}', this._lastSheet.cssRules.length);
        return name;
    }

    animationSheet(keyframes, {
        duration = .5,
        timing = 'ease',
        iteration = 1,
        fill = 'forwards',
        delay = 0
    } = {}) {
        let name = keyframes + duration + timing + iteration + fill + delay;
        name = name.replace(/\./g, "d");
        if (!this.getStyleSheet('.' + name).size) //执行不存在
            this.setSheet('.' + name, {
                animationName: keyframes,
                animationDuration: duration + 's',
                animationTimingFunction: timing,
                animationIterationCount: iteration,
                animationFillMode: fill,
                animationDelay: delay + 's'
            });
        return name;
    }

    hide(dom, {
        duration = .5,
        timing = 'ease',
        iteration = 1,
        fill = 'forwards',
        delay = 0,
        end = null
    } = {}) {
        let hide = this._animation.get('hide');
        if (!hide) {//动画已不存在
            this._animation.set('hide', this.keyframes({
                from: {
                    opacity: 1
                },
                to: {
                    opacity: 0
                }
            }));
            this._animation.set('none', this.setSheet('.' + this.simple(), {
                display: 'none !important',
                opacity: 0,
                visibility: 'hidden'
            }).substr(1));
            hide = this._animation.get('hide');
        }

        let hideClass = this.animationSheet(hide, {
            duration: duration,
            timing: duration,
            iteration: iteration,
            fill: fill,
            delay: delay
        });
        this.removeClass(dom, this._animation.get('block'));
        this.addClass(dom, hideClass);
        setTimeout(() => {
            if (typeof(end) === 'function') {
                end(hideClass);
            }
            this.addClass(dom, this._animation.get('none'));
            this.removeClass(dom, hideClass);
        }, duration * 1000);
        return dom;
    }

    show(dom, {
        duration = .5,
        timing = 'ease',
        iteration = 1,
        fill = 'forwards',
        delay = 0,
        end = null
    } = {}) {
        let show = this._animation.get('show');
        if (!show) {//动画已不存在
            this._animation.set('show', this.keyframes({
                from: {
                    opacity: 0
                },
                to: {
                    opacity: 1
                }
            }));
            this._animation.set('block', this.setSheet('.' + this.simple(), {
                display: 'block !important',
                opacity: 1,
                visibility: 'visible'
            }).substr(1));
            show = this._animation.get('show');
        }

        let showClass = this.animationSheet(show, {
            duration: duration,
            timing: duration,
            iteration: iteration,
            fill: fill,
            delay: delay
        });
        this.removeClass(dom, this._animation.get('none'));
        this.addClass(dom, showClass);
        setTimeout(() => {
            if (typeof(end) === 'function') {
                end(showClass);
            }
            this.addClass(dom, this._animation.get('block'));
            this.removeClass(dom, showClass);
        }, duration * 1000);
        return dom;
    }

    // 交集
    intersect(arr1, arr2) {
        new [...Set([...arr1].filter(x => arr2.has(x)))];
    }

    /**
     * 打开连接
     * @param url
     * @param target
     */
    link(url, target = 'self') {
        window.location.href = url;
    }

    /**
     * 加载js
     * @param path
     * @param callback
     */
    loadScript(path, callback) {
        if (this._scriptSet.has(path)) callback();
        else {
            let oScript = this.createDom("script");
            oScript.setAttribute('src', path);
            this.append(this._head, oScript);
            this.remove(oScript);
            oScript.onload = () => {
                this._scriptSet.add(path);
                callback();
            }
        }
    }

    /**
     * 同步加载文件
     * @param path
     */
    loadFileAsync(path) {
        let xhr = new XMLHttpRequest(),
            res = null;
        xhr.onload = () => res = JSON.parse(xhr.responseText);
        xhr.open("GET", path, false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(null);
        return res;
    }

    /**
     * 同步加载js
     * @param path
     */
    loadScriptAsync(path) {
        if (!this._scriptSet.has(path)) {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.responseText) {
                    let oScript = this.createDom("script", {
                        language: "javascript",
                        type: "text/javascript"
                    });
                    oScript.text = xhr.responseText;
                    this.append(this._head, oScript);
                    this._scriptSet.add(path);
                    this.remove(oScript);
                }else{
                    ejs.log('加载js失败！','error');
                    return null;
                }
            };
            xhr.open('GET', path, false);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(null);
        }
    }


    /**
     * 输出日志
     * @param str 日志内容
     * @param type 日志类型
     * @param logApi 接收前端日志的后台服务
     */
    log(str, type = 'log', logApi = '') {
        let name = this.date() + ' EasyScript';
        switch (type) {
            case 'log':
                console.log('[' + name + ' LOG] ', str);
                break;
            case 'warn':
                console.warn('[' + name + ' WARN] ', str);
                break;
            case 'error':
                console.error('[' + name + ' ERROR]', str);
                break;
        }
    }

    /**
     * 监视器，用于收集用户信息，鼠标点击，悬停，轨迹，ip，浏览器信息，系统信息，设备信息，浏览时长等
     * @param api 接收前端监控的后台服务
     * @param immediately 默认false 页面卸载时发送给服务端，time 即时发送给服务端的毫秒时间间隔（慎重考虑服务端性能）
     */
    monitor(api, immediately = false) {

    }

    md5(string) {
        let utftext = "",
            cca = null;
        for (let n = 0; n < string.length; n++) {
            cca = string.charCodeAt(n);
            if (cca < 128) {
                utftext += String.fromCharCode(cca);
            } else if ((cca > 127) && (cca < 2048)) {
                utftext += String.fromCharCode((cca >> 6) | 192);
                utftext += String.fromCharCode((cca & 63) | 128);
            } else {
                utftext += String.fromCharCode((cca >> 12) | 224);
                utftext += String.fromCharCode(((cca >> 6) & 63) | 128);
                utftext += String.fromCharCode((cca & 63) | 128);
            }
        }

        let lWordCount,
            lMessageLength = utftext.length,
            lNumberOfWords_temp1 = lMessageLength + 8,
            lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
            lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16,
            x = Array(lNumberOfWords - 1),
            lBytePosition = 0,
            lByteCount = 0;

        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            x[lWordCount] = (x[lWordCount] | (utftext.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        x[lWordCount] = x[lWordCount] | (0x80 << lBytePosition);
        x[lNumberOfWords - 2] = lMessageLength << 3;
        x[lNumberOfWords - 1] = lMessageLength >>> 29;

        const
            S11 = 7, S12 = 12, S13 = 17, S14 = 22,
            S21 = 5, S22 = 9, S23 = 14, S24 = 20,
            S31 = 4, S32 = 11, S33 = 16, S34 = 23,
            S41 = 6, S42 = 10, S43 = 15, S44 = 21;

        let k, AA, BB, CC, DD, a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;


        let RotateLeft = (lValue, iShiftBits) => {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        };

        let AddUnsigned = (lX, lY) => {
            let lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4)
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);

            if (lX4 | lY4) {
                if (lResult & 0x40000000)
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                else
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            } else
                return (lResult ^ lX8 ^ lY8);
        };

        let FF = (a, b, c, d, x, s, ac) => {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(/*F(b, c, d)*/(b & c) | ((~b) & d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        let GG = (a, b, c, d, x, s, ac) => {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned((b & d) | (c & (~d))/*G(b, c, d)*/, x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        let HH = (a, b, c, d, x, s, ac) => {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned((b ^ c ^ d)/*H(b, c, d)*/, x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        let II = (a, b, c, d, x, s, ac) => {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned((c ^ (b | (~d)))/*I(b, c, d)*/, x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };

        let ConvertToWordArray = string => {
            let lWordCount,
                lMessageLength = string.length,
                lNumberOfWords_temp1 = lMessageLength + 8,
                lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
                lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16,
                lWordArray = Array(lNumberOfWords - 1),
                lBytePosition = 0,
                lByteCount = 0;

            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };

        let WordToHex = lValue => {
            let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
        };


        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }
        return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toUpperCase();
    }

    /**
     * 绑定数据，引用消失会自动被垃圾回收清除
     * @param key 必须是obj
     * @param value
     */
    /*onData(key, value) {
        if (typeof key === "object") this._weakDate.set(key, value);
    }

    getData(key) {
        return this._weakDate.get(key);
    }*/

    //最大公约数
    gcd(a, b) {
        if (!b) {
            return a;
        }
        return this.gcd(b, a % b);
    }

    //最小公倍数
    scm(a, b) {
        return (a * b) / this.gcd(a, b);
    }

    /**
     * 解除事件
     * @param selecter
     * @param evt
     */
    off(selecter, evt) {
        !evt
            ? this._eventMap.delete(selecter)
            : this._eventMap.get(selecter).delete(evt)
    }

    /**
     * 绑定事件
     * @param selecter
     * @param params
     */
    on(selecter, ...params) {
        let target = this.body;
        let evt = 'click';
        let callback = params.pop();
        //两个参数：selecter,evt,callback
        if (params.length === 1) evt = params[0];
        //三个参数：selecter,target,evt,callback
        if (params.length === 2) {
            target = params[0];
            evt = params[1];
        }

        //增加父元素列表
        if (!this._domEvent.has(target)) this._domEvent.set(target, new Map());

        if (!this._eventMap.get(target)) this._eventMap.set(target, new Set());
        if (!this._eventMap.get(target).has(evt)) {
            this._eventMap.get(target).add(evt);
            target.addEventListener(evt, e => {
                //查找所有元素是否有事件
                let domLen = e.path.length - 4 - 1;//排除body,html,document,window
                //冒泡
                for (; domLen + 1; --domLen) {
                    this._onFunction(e.path[domLen], target, e.type);
                }
            })
        }

        //增加事件元素
        if (!this._domEvent.get(target).has(selecter)) this._domEvent.get(target).set(selecter, new Map());
        //增加事件列表
        if (!this._domEvent.get(target).get(selecter).get(evt)) this._domEvent.get(target).get(selecter).set(evt, new Set());
        //保存事件
        this._domEvent.get(target).get(selecter).get(evt).add(callback);


    }

    /**
     * 执行on方法
     * @param node
     * @param target
     * @param event
     * @private
     */
    _onFunction(node, target, event) {
        let keyArr = [node.nodeName];
        if (node.id) keyArr.push('#' + node.id);
        node.classList.forEach(v => keyArr.push('.' + v));

        //遍历方法树
        keyArr.forEach(key => (this._domEvent.get(target).get(key) && this._domEvent.get(target).get(key).has(event))
            ? this._domEvent.get(target).get(key).get(event).forEach(v => v(node))
            : null
        )
    }

    /**
     * 向数组的尾部拼接数组
     * @param tagArr 目标数组
     * @param endArr 尾部数组
     * @returns {*|number}
     */
    pushEnd(tagArr, endArr) {
        return tagArr.push(...endArr);
    }


    query(select, target = document, all = false) {
        if (all) {
            return target.querySelectorAll(select);
        } else {
            return target.querySelector(select);
        }
    }

    /**
     * 随机字母
     * @param len
     * @returns {string}
     */
    randomChar(len = 4, type = 'upper') {
        let rc = '';
        for (let i = 0; i < len; ++i)
            rc += String.fromCharCode(65 + Math.ceil(Math.random() * 25));
        return type === 'upper' ? rc : rc.toLowerCase();
    }


    /**
     * 随机数
     * @param minNum
     * @param maxNum
     * @returns {number}
     */
    randomNum(minNum = 0, maxNum = 1000) {
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    }

    /**
     * read方法
     * @param callback
     */
    ready(callback, rename = false, wait = true) {
        wait ? this._isReady
            ? this.log('page has already been built', 'warn')
            : document.addEventListener('DOMContentLoaded', () => {
                this._isReady = true;
                this.body = document.body;
                rename ? callback(this) : callback();
            })
            : rename ? callback(this) : callback();
    }

    /**
     * 删除节点
     * @param dom
     */
    remove(dom) {
        dom.parentNode.removeChild(dom);
    }

    /**
     * 批量删除
     * @param doms 实现了Iterator接口的结构
     */
    removeAll(doms) {
        doms.forEach(dom => this.remove(dom))
    }

    /**
     * 删除类名
     * @param dom
     * @param clazz
     */
    removeClass(dom, clazz) {
        dom.classList.remove(clazz)
    }

    /**
     * 替换
     * @param str 原字符串
     * @param findRep{'目标字符':'替换后字符'}
     * @returns {*}
     */
    replaceAll(str, findRep) {
        for (let f in findRep) str = str.replace(new RegExp(f, 'g'), findRep[f])
        return str;
    }


    /**
     * 加载模块
     * @param path
     * @param option
     * @param callback
     * @private
     */
    _require(path, option = {}, callback = () => {
    }, className = path.split('/').pop()) {
        //option.className = className;
        option.call ? option.call.push(className) : option.call = [className];
        this.loadScript(path + '.class.js', () => callback(this._moduleStack.get(className)(option)))
    }

    /**
     * 同步加载模块
     * @param path
     * @param option
     * @returns {*}
     * @private
     */
    _requireAsync(path, option = {}, className = path.split('/').pop()) {
        this.loadScriptAsync(path + '.class.js');
        //option.className = className;
        option.call ? option.call.push(className) : option.call = [className];
        return this._moduleStack.get(className)(option);
    }


    /**
     * 将完整的html页面的文本形式当做页面打开，并且无法查看源码，没法使用查看元素没法另存为无法刷新没有网址
     * @param html
     */
    runCode(html) {
        let winname = window.open('', "_blank", '');
        winname.document.open('text/html', 'replace');
        winname.opener = null;
        winname.document.write(html);
        winname.document.close();
    }

    /**
     * 设置css
     * @param selector
     * @param rules
     *
     * sheet.insertRule("body { background-color: silver }", 0);  //DOM方法
     * sheet.addRule("body", "background-color: silver", 0);  //仅对IE有效
     *
     */
    setSheet(selector, rules) {
        let rulesText = selector + '{';
        for (let k in rules)
            rulesText += this.underscored(k) + ':' + rules[k] + ';';

        this._lastSheet.insertRule(rulesText + '}', this._lastSheet.cssRules.length);
        return selector;
    }

    /**
     * 简单的名字
     * @param len 边界数量为 26^len
     * @returns {*}
     */
    simple(len = 4) {
        let simpleSelecterName = this.randomChar(len);
        if (document.querySelector(simpleSelecterName))
            this.simple();
        else if (!this.getStyleSheet(simpleSelecterName).size)
            return simpleSelecterName;
        else
            this.simple();
    }


    /**
     * 获取文本的长度，兼容各种码点的长度
     * @param str
     * @returns {number}
     */
    strLength(str) {
        let size = 0;
        for (let i of str) ++size;
        return size;
    }

    /**
     * css字符串转对象
     * @param styleStr
     * @param type
     * @returns {{}}
     */
    styleStr2Obj(styleStr, type = 'camelize') {


        let ruleObj = {},
            item = [];
        this.trim(this.trim(styleStr.match(/\{([\s\S]*)\}/)[1]), {
            char: ';',
            position: 'right'
        }).split(';').forEach(v => {
            item = v.split(':');
            let k = this.trim(item[0]);
            if (type === 'camelize') k = this.camelize(k);
            ruleObj[k] = this.trim(item[1]);
        });
        return ruleObj;
    }

    /**
     * 移除html标记
     * @param str
     * @returns {string}
     */
    stripTages(str) {
        return str.replace(/<script[^>]*>([\S\s]*?)<\/script>/img, '').replace(/<[^>]+>/g, '');
    }

    /**
     * 文本节点，或将html标记输出为文本
     * @param str
     * @returns {Text}
     */
    textNode(str = '') {
        return document.createTextNode(str);
    }

    /**
     * 替换类名
     * @param dom
     * @param oldClass
     * @param newClass
     */
    toggleClass(dom, oldClass, newClass) {
        if (this.hasClass(dom, oldClass)) {
            this.removeClass(dom, oldClass);
            this.addClass(dom, newClass)
        }
        return dom;
    }


    /**
     *  去除空白和指定字符串，无参默认去除左右空白
     * @param str
     * @param char 指定字符 默认：''
     * @param position  left right 默认：''
     * @returns {string}
     */
    trim(str, {
        char = '',
        position = ''
    } = {}) {
        let newStr = '';
        if (char) {
            if (position === 'left')
                newStr = str.replace(new RegExp('^\\' + char + '+', 'g'), '');
            if (position === 'right')
                newStr = str.replace(new RegExp('\\' + char + '+$', 'g'), '');
            if (position === '')
                newStr = str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
        } else
            newStr = str.trim();
        return newStr;
    }

    /**
     * 字符的截断处理
     * @param str
     * @param length
     * @param truncation
     * @returns {string}
     */
    truncate(str, length = 30, truncation = '...') {
        return str.length > length
            ? str.slice(0, length - truncation.length) + truncation
            : str
    }

    /**
     * 修改css
     * @param selector
     * @param rules
     */
    updateSheet(selector, rules) {
        let style = this.getStyleSheet(selector);
        if (style) {
            console.log(this.styleStr2Obj(style.rule));
        }
    }

    /**
     * 转划线写法
     * @param str
     * @returns {string}
     */
    underscored(str, type = '-') {
        return str.replace(/([a-z\d])([A-Z])/g, '$1' + type + '$2').replace(/\-/g, type).toLowerCase();
    }

    /**
     * 实体转html
     * @param str
     * @returns {string}
     */
    unescapeHTML(str) {
        return str.replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, "&") //处理转义的中文和实体字符
            .replace(
                /&#([\d]+);/g,
                ($0, $1) => String.fromCharCode(parseInt($1, 10))
            );
    }

    /**
     * 并集
     * @param arr1
     * @param arr2
     * @returns {*[]}
     */
    union(arr1, arr2) {
        return [...new Set([...arr1, ...arr2])]
    }


    /**
     * 当前库路径
     * @returns {string}
     */
    path() {
        let arr = document.currentScript.src.split('/');
        let root = '/';
        for (let i = 3; i < arr.length - 1; ++i)
            root += arr[i] + '/';
        return root;
    }

    verify(type, value) {
        let res = false;
        let reg = null;
    }

    /**
     * 获取窗口大小
     * @returns {{ww: number, wh: number}}
     */
    windowSize() {
        return {
            ww: this.body.offsetWidth,
            wh: this.body.offsetHeight
        }
    }

    wrap(target, wrap) {
        let index = 0;
        [...target.parentNode.childNodes].some(v => {
            if (v.nodeName !== '#text') {
                ++index;
                return v === target
            }
        });
        this.append(target.parentNode, wrap, index);
        this.append(wrap, target);
    }
}

const ejs = new EBase();
!window.$ ? window.$ = ejs : ejs.log('$ is not ejs!', 'warn');