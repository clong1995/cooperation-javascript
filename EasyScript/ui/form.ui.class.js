'use strict';
/**
 * dock组件
 * 作者：成龙哥哥 微信：clong QQ：2435965705 邮箱：2435965705@qq.com git：
 * 更新时间：2018年4月26日22:18:38
 */
CLASS(
    'form.ui',
    ({
         form = null,//表单
         action = null,//地址
         verify = {}//检验规则
     } = {}) => {

        if (!form || !action) {
            ejs.log('元素或上传地址不存在', 'error');
            return;
        }

        let formData = new FormData(form);

        //检验字段
        let error = {
            name: null,
            msg: null
        };
        let flag = true;
        for (let k in verify) {
            let value = formData.get(k);
            if (k.indexOf('[]') > 0) {
                value = formData.getAll(k).join('');
            }
            flag = verifyFn(k, verify[k], formData.get(k));
            if (flag !== true) break;
        }

        function verifyFn(name, rule, value) {
            let ruleArr = rule.split(' ');
            let mod = ruleArr[0],
                con = ruleArr.length > 1 ? ruleArr[1] : null;
            if (mod === 'notNull') {// 非空
                if (value === '' || value === null) {
                    error.msg = '内容不得为空';
                    flag = false;
                }
            } else if (mod === 'zh') {// 汉字
                if (value.length > con) {
                    error.msg = '内容超长';
                    flag = false;
                } else {
                    let reg = /^[\u4E00-\u9FA5]+$/;
                    if (!reg.test(value)) {
                        //不全是中文;
                        error.msg = '仅允许中文';
                        flag = false;
                    }
                }
            } else if (mod === 'number') {// 数字
                if (value === null || value === '') {
                    error.msg = '内容不得为空';
                    flag = false;
                } else if (value.length > con) {
                    error.msg = '内容超长';
                    flag = false;
                } else {
                    let reg = /^[0-9]+.?[0-9]*$/;
                    if (!reg.test(value)) {
                        error.msg = '仅允许数字';
                        flag = false;
                    }
                }
            } else if (mod === 'date') {// 日期
                let reg = /^(\d{4})-(\d{2})-(\d{2})$/;
                if (!reg.test(value)) {
                    error.msg = '日期格式不正确 应为yyyy-mm-dd';
                    flag = false;
                }
            } else if (mod === 'string') {//任意字符限制长度
                if (value.length > con) {
                    error.msg = '内容超长';
                    flag = false;
                } else if (!value.length) {
                    error.msg = '内容不得为空';
                    flag = false;
                }
            }
            if (!flag) {
                error.name = name;
                return flag;
            }
            return flag;
        }

        if (flag === true) {
            let xhr = new XMLHttpRequest();
            let data = null;
            xhr.onload = () => data = JSON.parse(xhr.responseText);
            xhr.open("POST", action, false);
            xhr.send(formData);
            return data;
        } else {
            return {
                state: 'fail',
                data: error
            }
        }
    }
);