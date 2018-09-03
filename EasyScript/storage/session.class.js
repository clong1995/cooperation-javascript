'use strict';
CLASS('session',
    ({
         sign = 'EasyScript'
     } = {}) => {

        //初始化

        let existsError = 'The key in session already exists',
            notExistsError = 'The key in session doesn\'t exist';

        //添加
        function set(key, value) {
            if (!has(key)) {
                sessionStorage.setItem(key, value);
            } else {
                ejs.log(existsError, 'error');
            }
        }

        //删除
        function del(key) {
            if (has(key)) {
                sessionStorage.removeItem(key);
            } else {
                ejs.log(notExistsError, 'error');
            }
        }

        //改
        function update(key, value) {
            if (has(key)) {
                sessionStorage.setItem(key, value);
            } else {
                ejs.log(notExistsError, 'error');
            }
        }


        function replace(key, value) {
            sessionStorage.setItem(key, value);
        }

        //查询
        function get(key) {
            if (has(key)) {
                return sessionStorage.getItem(key);
            } else {
                ejs.log(notExistsError, 'error');
            }
        }

        //是否有
        function has(key) {
            let item = sessionStorage.getItem(key);
            return !(item === 'undefined' || item === null || item === '');
        }

        //销毁
        function destroy() {
            console.warn('all sessions are destroyed!');
            sessionStorage.clear();
        }

        return {
            set: set,
            del: del,
            update: update,
            get: get,
            has: has,
            destroy: destroy,
            replace: replace
        }
    }
);