/**
 * 垫片库
 * 用于实现某些浏览器对于es6没有实现的函数。
 * 具体实现是用的es6的兼容方法。
 * 本垫片不致力于让古董浏览器实现全部es6的方法，仅针对当下es6发展情况下的某些函数的临时替代
 */
'use strict';

//import函数的垫片
window.$$import = function (path) {
    if (window.$$importSet == undefined)
        window.$$importSet = new Set();
    if (window.$$importSet.has(path)) return;
    let oXmlHttp = new XMLHttpRequest();
    oXmlHttp.onreadystatechange = function () {
        if (oXmlHttp.readyState == 4 && (oXmlHttp.status == 200 || oXmlHttp.status == 304)) {
            if (!oXmlHttp.responseText) return;
            let oScript = document.createElement("script");
            oScript.language = "javascript";
            oScript.type = "text/javascript";
            oScript.text = oXmlHttp.responseText.replace(/export \{[^\}]+\}/g, "");
            document.getElementsByTagName('HEAD').item(0).appendChild(oScript);
            window.$$importSet.add(path);
            oScript.parentNode.removeChild(oScript);
        }
        /* else
                    console.log('XML request error: ' + oXmlHttp.statusText + ' (' + oXmlHttp.status + ')');*/
    };
    oXmlHttp.open('GET', path, false);
    oXmlHttp.send(null);
};