/**
 * Created by zuogc on 2015-09-02.
 */
var settings = {
		
    //是否开启demo模式
    DEMO : false,
    
    // 应该转化为数字的属性
    numberProps : ["dport", "latitude", "longitude", "latitude2", "longitude2"],
    
    // 攻击源统计状态更新时闪烁的颜色
    triggerColor : "red",
    
    // 文字最低透明度
    minTextOpacity : 0.35,
   
    // 超过这个数，开始减少攻击数，也就是说最少保留这些攻击数
    maxAttacks : 100,

    tableBarWidth : d3.scale.log()
        .domain([1, 500])
        .range([1, 130]),

    //背景星空图，图像的分辨率要求为2048*1024
    //backgroundimg:"img/backstar3.png",
	bg_3d : "url(img/3d_img.jpg)",
	bg_2d : "radial-gradient(ellipse at center, #1c474e 0%, #0e1d20 100%) no-repeat",
	
    //地图颜色，分别是，球面填充，球面边界，球面填充透明度，球面边界透明度，平面填充，平面边界，平面填充透明度，平面边界透明度
    SphereFill:d3.rgb(0,0,0),
    SphereStroke:d3.rgb(100,100,100),
    SphereFillOpacity:0.6,
    SphereStrokeOpacity:0.5,
    FlatFill:d3.rgb(50,50,61),
    FlatStroke:d3.rgb(100,100,100),
    FlatFillOpacity:0.3,
    FlatStrokeOpacity:1,

    // 统计表行数，分别是攻击源，端口，实时攻击列表
    topTableRows : 10,
    portTableRows : 8,
    consoleTableRows : 20,

    pruneInterval : 3600,
    dataPruneInterval : 60,

    // Websocket设置
    wsHost : "ws://121.40.207.223:3000/",
    psk : "18c989796c61724d4661b019f2779848dd69ae62",
    wsTimeout : 30000,

    //一次循环中球面的时间和平面的时间,单位为分钟
    sphereTime : 1,
    flatTime : 1,
    
    //无动作多长时间后恢复页面循环
    idleTime : 9999,

    //地球旋转速度
    speed:2,

    //显示元素开关
    
    //圆环
    pings:true,
    
    //连接线
    greatArcs:true,
    
    //攻击点
    origins:true,
    
    //目标点
    targets:true,

    //攻击来源数据接口
    originsInfoUrl:"../../earth.php?do=srcinfo",
    
    //资产统计信息数据接口
    propertyInfoUrl:"../../earth.php?do=destinfo",
    
    //攻击线脱离地面高度系数，大于1
    skyHeight : 1.2
};