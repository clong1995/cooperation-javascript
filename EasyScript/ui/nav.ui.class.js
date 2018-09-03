'use strict';

CLASS('ui', param => {

    console.log(ejs.root + 'ui/' + uiName + '.ui');

    function use(uiName, param) {
        NEW(ejs.root + 'ui/' + uiName + '.ui', param,fn=>{
            console.log(fn)
        });
    }
    return {
        use: use
    }
});