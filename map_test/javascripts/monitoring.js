var Util = {
    /**
     * 设置Map容器的高度
     */
    setMapHeight: function() {
        var mapBoxHeight = $(window).height()  - $('#pageHeader').height() - $('#pageMiddle').height() - 38;
        $('#mainBox').css({height: mainBoxHeight + 'px'});
    }

}

// $(document).ready(function(){
//     Util.setMapHeight();
// });


// 百度地图API功能
var map = new BMap.Map("mapbox");            // 创建Map实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);                     // 初始化地图,设置中心点坐标和地图级别。
map.enableScrollWheelZoom();                            //启用滚轮放大缩小
map.addControl(new BMap.NavigationControl());               // 添加平移缩放控件
map.addControl(new BMap.ScaleControl());                    // 添加比例尺控件         
map.addControl(new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT})); //添加缩略地图控件
map.addControl(new BMap.MapTypeControl());          //添加地图类型控件
