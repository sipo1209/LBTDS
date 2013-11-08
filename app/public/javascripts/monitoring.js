// 百度地图API功能
var map = new BMap.Map("map_canvas");            // 创建Map实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);                     // 初始化地图,设置中心点坐标和地图级别。
map.enableScrollWheelZoom();                            //启用滚轮放大缩小
map.addControl(new BMap.NavigationControl());               // 添加平移缩放控件
map.addControl(new BMap.ScaleControl());                    // 添加比例尺控件         
map.addControl(new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT})); //添加缩略地图控件
map.addControl(new BMap.MapTypeControl());          //添加地图类型控件

var Util = {
    /**
     * 设置Map容器的高度
     */
    setMapHeight: function() {
        var mainBoxHeight = $(window).height()  - $('#pageHeader').height() - $('#pageMiddle').height() - 38;
        $('#mainBox').css({height: mainBoxHeight + 'px'});
    }

}

$(document).ready(function(){
    //Util.setMapHeight();
});

$('#history').bind('click', function(){
    map.clearOverlays();
    $.ajax({
        type: "GET",
        url: "http://api.map.baidu.com/geodata/v2/poi/list?ak=DD1580bc446609f4dcfb2d20728b681a&geotable_id=36466",
        dataType: "jsonp",
        success: function(data){
            $(data.pois).each(function() {
                console.log(this['title']);
                var point = new BMap.Point(this['location'][0], this['location'][1]);
                var marker = new BMap.Marker(point);
                map.addOverlay(marker);
            })
        }
    });
});