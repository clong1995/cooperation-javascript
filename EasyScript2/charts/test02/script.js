zBase.ready(Z => {
    NEW(
        //组件
        Z.root+'chart/line',
        {
            element:'#box',
            //useStyleSheet:true
            data : [1, 10, 6, 2, 10, 13, 15],
            xAxisData : ['周444', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        fn => {
            /*获取组件抛出的公共方法*/
        })
});