'use strict';
/**
 * dock组件
 * 作者：成龙哥哥 微信：clong QQ：2435965705 邮箱：2435965705@qq.com git：
 * 更新时间：2018年4月26日22:18:38
 */
CLASS(
    'upload.ui',
    ({
         size = 1024,//文件最大
         multiple = false,//开启多选
         accept = [],//文件类型参见MIME表
         content = null,//本地预览，只有图片可以本地预览
         dom = null,//点击触发上传的元素
         action = null,//远端的地址
         name = 'fileUpload',//提交的名字
         callback = null//完成后的回调函数
     } = {}) => {
        if (!dom || !action) {
            ejs.log('元素或上传地址不存在', 'error');
            return;
        }
        //关联的label
        let labelId = ejs.simple();

        //创建input
        let input = ejs.createDom('input', {
            type: 'file',
            id: labelId
        });
        ejs.css(input, {//使用position 0 display none width 0 height 0会导致页面不渲染，弹出选择框后页面布局造成挤压
            width: '1px',
            height: '1px',
            display: 'block',
            opacity:0
        });
        //限制类型
        if (accept.length) {
            ejs.attr(input, {
                accept: accept.join(',')
            });
        }
        //开启多选
        if (multiple) {
            ejs.attr(input, {
                multiple: 'multiple'
            });
        }
        //创建label
        let label = ejs.createDom('label', {
            for: labelId
        });

        //添加到dom
        ejs.append(dom.parentNode, input);
        ejs.wrap(dom, label);

        let imgClass = ejs.simple();

        //监听input
        input.onchange = () => {
            // 实例化一个表单数据对象
            let formData = new FormData();
            let files = input.files;
            if (files.length) {
                [...files].some((v, i) => {
                    if (v.size / 1000 > size) {
                        callback({
                            state: false,
                            data: '第' + (i + 1) + '图片超大'
                        });
                        formData = null;
                        return true;
                    }
                    if (accept.length && accept.indexOf(v.type) < 0) {
                        callback({
                            state: false,
                            data: '第' + (i + 1) + '类型不合法'
                        });
                        formData = null;
                        return true;
                    }
                    formData.set(name, v);
                });
                //提交
                if (formData) {
                    // 实例化一个AJAX对象
                    let xhr = new XMLHttpRequest();
                    xhr.onload = () => {
                        callback(JSON.parse(xhr.responseText));
                        if (content) {
                            ejs.query('.' + imgClass, content, true).forEach(v => ejs.remove(v));
                            [...files].forEach(v => {
                                let reader = new FileReader();
                                reader.readAsDataURL(v);
                                reader.onload = e => {
                                    let img = new Image();
                                    img.src = e.target.result;
                                    ejs.addClass(img, imgClass);
                                    ejs.append(content, img);
                                }
                            })
                        }
                    };
                    xhr.open("POST", action, true);
                    // 发送表单数据
                    xhr.send(formData);
                }
            } else {
                callback({
                    state: false,
                    data: '未发现文件'
                });
            }
        };

        return {}
    }
);