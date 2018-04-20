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
        this._weakDate = new WeakMap();

        /**
         * 用于记录绑定的事件
         * @type {Set<any>}
         */
        this._eventSet = new Set();

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
        if (this._sheetArr.length <= 0)//创建style节点
            this.append(this._head, this.createDom('style'));
        this._firstSheet = this._sheetArr[0];
        this._lastSheet = this._sheetArr[this._sheetArr.length - 1];

        this.formatStyle();
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
     * @param data :{}
     * @param success
     * @param error
     */
    ajax(url, {
        method = 'GET',
        headers = {
            "Content-type": "application/x-www-form-urlencoded"
        },
        mode = 'cros',
        cache = 'no-cache',
        data = {},
        success = null,
        error = null
    } = {}) {
        let body = '';
        Object.keys(data).forEach(value => {
            body += value + '=' + data[value] + '&'
        });
        body = this.trim(body, '&', 'right');
        fetch(url, {
            method: method,
            headers: headers,
            mode: mode,
            cache: cache,
            body: body
        })
            .then(response => {
                if (response.status === 200) return response;
            })
            .then(data => {
                return data.text()
            })
            .then(text => {
                if (typeof success === 'function') success(text)
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
        let children = obj.children;
        (index < 0 || index > children.length) ? obj.appendChild(child) : obj.insertBefore(child, children[index]);
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
     * @returns {number}
     */
    arrMaxMin(arr, type = 'max') {
        return type === 'max' ? Math.max(...arr) : Math.min(...arr);
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
    attr(obj, attr) {
        if (attr === null) {
            let attrObj = {};
            Array.from(obj.attributes).forEach(v => v.name === 'style' ? null : attrObj[v.name] = v.value);
            return attrObj;
        }
        for (let k in attr) obj.setAttribute(k, attr[k]);
        return obj;
    }


    /**
     * 批量设置style
     * @param cssText
     * @private
     */
    _batchSetStyle(sheetItem, cssText) {
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
    deleteStyle(selector) {

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
        this._batchSetStyle(this._firstSheet,
            `
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
            
            table {
                border-collapse: collapse;
                border-spacing: 0
            }
            ::-webkit-scrollbar{
                width:8px;
                height:8px
            }
            ::-webkit-scrollbar-track-piece{
                border-radius: 0;
                background:#4e4e5a
            }
            ::-webkit-scrollbar-thumb{
                border-radius:0;
                background:#c0c9cd
            }
            ::-webkit-scrollbar-thumb:hover{
                background:#d4d8da
            }`
        );
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
        return Array.from(dom.classList).some(v => v === clazz)
    }


    /**
     * 添加文本
     * @param dom
     * @param str
     * @param plus
     */
    html(dom, str, plus = true) {
        let textNode = this.textNode(str);
        plus ? dom.innerHTML = '' : '';
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
        this._batchSetStyle(
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

    // 交集
    intersect(arr1, arr2) {
        new [...Set([...arr1].filter(x => arr2.has(x)))];
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
            oScript.setAttribute('src', path + '.js');
            this.append(this._head, oScript);
            this.remove(oScript);
            oScript.onload = () => {
                this._scriptSet.add(path);
                callback();
            }
        }
    }

    /**
     * 同步加载js
     * @param path
     */
    loadScriptAsync(path) {
        if (!this._scriptSet.has(path)) {
            let oXmlHttp = new XMLHttpRequest();
            oXmlHttp.onreadystatechange = () => {
                if (oXmlHttp.readyState === 4 && (oXmlHttp.status === 200 || oXmlHttp.status === 304)) {
                    if (!oXmlHttp.responseText) return;
                    let oScript = this.createDom("script", {
                        language: "javascript",
                        type: "text/javascript"
                    });
                    oScript.text = oXmlHttp.responseText;
                    this.append(this._head, oScript);
                    this.remove(oScript);
                    this._scriptSet.add(path);
                }
            };
            oXmlHttp.open('GET', path + '.js', false);
            oXmlHttp.send(null);
        }
    }


    /**
     * 输出日志
     * @param str 日志内容
     * @param type 日志类型
     * @param logApi 接收前端日志的后台服务
     */
    log(str, type = 'log', logApi = '') {
        switch (type) {
            case 'log':
                console.log('[zoolonJS LOG] ' + str);
                break;
            case 'warn':
                console.warn('[zoolonJS WARN] ' + str);
                break;
            case 'error':
                console.error('[zoolonJS ERROR] ' + str);
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

    /**
     * 绑定数据，引用消失会自动被垃圾回收清除
     * @param key 必须是obj
     * @param value
     */
    onData(key, value) {
        if (typeof key === "object") this._weakDate.set(key, value);
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
     * @param evt
     * @param callback
     */
    on(selecter, evt, callback) {
        //新增事件
        if (!this._eventSet.has(evt)) {
            this._eventSet.add(evt);
            //注册事件
            this.body.addEventListener(evt, e => {
                //id
                if (e.target.id) this._onFunction('#' + e.target.id, e);
                //class
                e.target.classList.forEach(v => this._onFunction('.' + v, e));
                //nodeName
                this._onFunction(e.target.nodeName, e);
            }, true)
        }
        //增加事件响应函数
        this._eventMap.has(selecter)
            ? this._eventMap.get(selecter).set(evt, callback)
            : this._eventMap.set(selecter, new Map([[evt, callback]]));
    };

    /**
     * 执行on方法
     * @param key
     * @param event
     * @private
     */
    _onFunction(key, event) {
        this._eventMap.has(key) && this._eventMap.get(key).has(event.type)
            ? this._eventMap.get(key).get(event.type)(event)
            : null
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
    ready(callback, rename = false) {
        this._isReady
            ? this.log('page has already been built', 'warn')
            : document.addEventListener('DOMContentLoaded', () => {
                this._isReady = true;
                this.body = document.body;
                //this._head = document.head;
                //this._sheetArr = document.styleSheets;

                //sheet
                /*if (this._sheetArr.length <= 0)//创建style节点
                    this.append(this._head, this.createDom('style'));*/
                /*this._firstSheet = this._sheetArr[0];
                this._lastSheet = this._sheetArr[this._sheetArr.length - 1];*/
                rename ? callback(this) : callback();
            })
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
        option.className = className;
        this.loadScript(path + '.class', () => callback(this._moduleStack.get(className)(option)))
    };

    /**
     * 同步加载模块
     * @param path
     * @param option
     * @returns {*}
     * @private
     */
    _requireAsync(path, option = {}, className = path.split('/').pop()) {
        this.loadScriptAsync(path + '.class');
        option.className = className;
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
     */
    setSheet(selector, rules) {
        let rulesText = selector + '{';
        for (let k in rules)
            rulesText += this.underscored(k) + ':' + rules[k] + ';';
        this._lastSheet.insertRule(rulesText + '}', this._lastSheet.cssRules.length);
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
     * @param clazz
     */
    toggleClass(dom, clazz) {
        dom.classList.toggle(clazz)
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
}

const ejs = new EBase();
!window.$ ? window.$ = ejs : ejs.log('$ is not ejs!', 'warn');