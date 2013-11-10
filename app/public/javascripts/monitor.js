var Util = {
    setMapHeight: function() {
//        var mainBoxHeight = $(window).height()  - $('#navbar').height() - 140;
        mainBoxHeight = 700;
        $('#map_canvas').css({height: mainBoxHeight + 'px'});
    }
}

var map;
var users;

$(document).ready(function(){
    Util.setMapHeight();
    // 百度地图初始化
    map = new BMap.Map("map_canvas");//创建Map实例
    map.centerAndZoom(new BMap.Point(114.332, 30.566),12);//初始化地图,设置中心点坐标和地图级别。
    map.enableScrollWheelZoom();                            //启用滚轮放大缩小
    map.addControl(new BMap.NavigationControl());               // 添加平移缩放控件
    map.addControl(new BMap.ScaleControl());                    // 添加比例尺控件
    map.addControl(new BMap.OverviewMapControl({isOpen:true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT})); //添加缩略地图控件
    map.addControl(new BMap.MapTypeControl());          //添加地图类型控件

    //list staffs
    $.ajax({
        type:'POST',
        url:'/json',
        dataType:'json',
        data:{cmd:'staffs'},
        success:function(staffs){
            console.log(staffs);
            if(staffs.length) {
                $.each(staffs, function(index,term) {

                })
            }
        }
    });
    refreshDots();
    setInterval("refreshDots()", 10000);//定时调用全局中的函数refreshDots
});

function refreshDots() {
    map.clearOverlays();
    $.ajax({
        type: "GET",
        url: "http://api.map.baidu.com/geodata/v2/poi/list",
        dataType: "jsonp",
        data: {
            ak: 'DD1580bc446609f4dcfb2d20728b681a',
            geotable_id: 36466
        },
        success: function(data){
            $(data.pois).each(function() {
                //console.log(this['title']);
                var point = new BMap.Point(this['location'][0], this['location'][1]);
                var marker = new BMap.Marker(point);
                map.addOverlay(marker);
            })
        }
    });
}

$('#history').bind('click', function(){
    loadXMLDoc("/", function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            document.getElementById("history").innerHTML = "查询";
        }
    });
});


$(function(){
//取得div层
//    var $search = $('#search');
//取得输入框JQuery对象
    var $searchInput = $('#search-text')
//关闭浏览器提供给输入框的自动完成
    $searchInput.attr('autocomplete','off');
//创建自动完成的下拉列表，用于显示服务器返回的数据,插入在搜索按钮的后面，等显示的时候再调整位置
    var $autocomplete = $('<div class="autocomplete"></div>')
        .hide()
        .insertAfter($searchInput);
//清空下拉列表的内容并且隐藏下拉列表区
    var clear = function(){
        $autocomplete.empty().hide();
    };
//注册事件，当输入框失去焦点的时候清空下拉列表并隐藏
    $searchInput.blur(function(){
        setTimeout(clear,500);
    });
//下拉列表中高亮的项目的索引，当显示下拉列表项的时候，移动鼠标或者键盘的上下键就会移动高亮的项目，想百度搜索那样
    var selectedItem = null;
//timeout的ID
    var timeoutid = null;
//设置下拉项的高亮背景
    var setSelectedItem = function(item){
//更新索引变量
        selectedItem = item ;
//按上下键是循环显示的，小于0就置成最大的值，大于最大值就置成0
        if(selectedItem < 0){
            selectedItem = $autocomplete.find('li').length - 1;
        }
        else if(selectedItem > $autocomplete.find('li').length-1 ) {
            selectedItem = 0;
        }
//首先移除其他列表项的高亮背景，然后再高亮当前索引的背景
        $autocomplete.find('li').removeClass('highlight')
            .eq(selectedItem).addClass('highlight');
    };
    var ajax_request = function(){
//ajax服务端通信
        $.ajax({
            'url':'/json', //服务器的地址
            'data':{cmd:'searchStaff'}, //参数
            'dataType':'json', //返回数据类型
            'type':'POST', //请求类型
            'success':function(data){
                console.log(data);
                if(data.length) {
//遍历data，添加到自动完成区
                    $.each(data, function(index,term) {
//创建li标签,添加到下拉列表中
                        $('<li></li>').text(term).appendTo($autocomplete)
                            .addClass('clickable')
                            .hover(function(){
//下拉列表每一项的事件，鼠标移进去的操作
                                $(this).siblings().removeClass('highlight');
                                $(this).addClass('highlight');
                                selectedItem = index;
                            },function(){
//下拉列表每一项的事件，鼠标离开的操作
                                $(this).removeClass('highlight');
//当鼠标离开时索引置-1，当作标记
                                selectedItem = -1;
                            })
                            .click(function(){
//鼠标单击下拉列表的这一项的话，就将这一项的值添加到输入框中
                                $searchInput.val(term);
//清空并隐藏下拉列表
                                $autocomplete.empty().hide();
                            });
                    });//事件注册完毕
//设置下拉列表的位置，然后显示下拉列表
                    var ypos = $searchInput.position().top + $searchInput.outerHeight();
                    var xpos = $searchInput.position().left + parseInt($searchInput.css('margin-left'));
                    $autocomplete.css('width',$searchInput.css('width'));
                    $autocomplete.css({'position':'absolutive','left':xpos + "px",'top':ypos +"px"});
                    setSelectedItem(0);
//显示下拉列表
                    $autocomplete.show();
                }
            }
        });
    };
//对输入框进行事件注册
    $searchInput
        .keyup(function(event) {
//字母数字，退格，空格
            if(event.keyCode > 40 || event.keyCode == 8 || event.keyCode ==32) {
//首先删除下拉列表中的信息
                $autocomplete.empty().hide();
                clearTimeout(timeoutid);
                timeoutid = setTimeout(ajax_request,100);
            }
            else if(event.keyCode == 38){
//上
//selectedItem = -1 代表鼠标离开
                if(selectedItem == -1){
                    setSelectedItem($autocomplete.find('li').length-1);
                }
                else {
//索引减1
                    setSelectedItem(selectedItem - 1);
                }
                event.preventDefault();
            }
            else if(event.keyCode == 40) {
//下
//selectedItem = -1 代表鼠标离开
                if(selectedItem == -1){
                    setSelectedItem(0);
                }
                else {
//索引加1
                    setSelectedItem(selectedItem + 1);
                }
                event.preventDefault();
            }
        })
        .keypress(function(event){
//enter键
            if(event.keyCode == 13) {
//列表为空或者鼠标离开导致当前没有索引值
                if($autocomplete.find('li').length == 0 || selectedItem == -1) {
                    return;
                }
                $searchInput.val($autocomplete.find('li').eq(selectedItem).text());
                $autocomplete.empty().hide();
                event.preventDefault();
            }
        })
        .keydown(function(event){
//esc键
            if(event.keyCode == 27 ) {
                $autocomplete.empty().hide();
                event.preventDefault();
            }
        });
//注册窗口大小改变的事件，重新调整下拉列表的位置
    $(window).resize(function() {
        var ypos = $searchInput.position().top + $searchInput.outerHeight();
        var xpos = $searchInput.position().left + parseInt($searchInput.css('margin-left'));
        $autocomplete.css('width',$searchInput.css('width'));
        $autocomplete.css({'position':'absolutive','left':xpos + "px",'top':ypos +"px"});
    });
});

