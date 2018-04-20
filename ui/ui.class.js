'use strict';

CLASS('ui', param => {
    return {
        //异步
        use: (uiName, param={}, callback = () => {}) => NEW(ejs.root + 'ui/' + uiName + '.ui', param, fn => {
            callback(fn)
        }),
        //同步
        useAsync: (uiName, param={}) => NEW_ASYNC(ejs.root + 'ui/' + uiName + '.ui', param),
    }
});