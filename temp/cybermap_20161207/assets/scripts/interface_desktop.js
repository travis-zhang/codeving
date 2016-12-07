// The javascript that makes the interface do its magic
// In this file you can find:
// - Loading showing and hiding (and animating) pages
// - Language switching
// - The sidebar controls
// - The footer sharing menu
// - Statistics page functions (will put this in seperate file some time soon)
// - ...

// functions for controls
var controlLabelOver = (function(event) {
    var targetElem = $(event.target).parent().parent();
    var label = $('.label', targetElem).length ? $('.label', targetElem) : $("<div>").addClass("label");
    var myText = targetElem.attr('data-label-en');
    var labelText = $('.label_text', targetElem).length ? $('.label_text', targetElem).text(myText) : $("<div>").addClass("label_text").text(myText);
    var labelArrow = $('.label_arrow', targetElem).length ? $('.label_arrow', targetElem) : $("<div>").addClass("label_arrow").hide();
    targetElem.append(labelArrow);
    label.append(labelText);
    targetElem.append(label);
    labelArrow.fadeIn(250);
    label.stop(true,true);
    labelArrow.stop(true,true);
    label.animate({
        width: parseInt(labelText.innerWidth())+"px",
        left: (-1*parseInt(labelText.innerWidth()))+"px"
    },
    {duration: 250});
});

var controlLabelOut = (function(event) {
    var targetElem = $(event.target).parent().parent();
    $('.label', targetElem).animate({
        width: "0px",
        left: "0px"
    },
    {
        //complete: function () { $('.label', targetElem).remove(); }
    });
    $('.label_arrow', targetElem).fadeOut(250, function() {
        //$('.label_arrow', targetElem).remove();
    });
});

var addControlLabels = (function() {
    $('div#controls ul#control_btns li[data-label-en] a').each(function(key, val) {
        $(val).on('mouseenter', controlLabelOver);
        $(val).on('mouseleave', controlLabelOut);
    });
});

var footerSocialMenuIsOpen = false;
var openFooterSocialMenu = (function(event) {
    footerSocialMenuIsOpen = true;
    $('.footer_social_menu_btn').addClass('active');
    var newHeight = "280px";
    if(window.lang.lang() == "ru") {
        newHeight = "336px";
    }
    //$('.footer_social'+activeLangClass).css({height: "0px", width: (parseInt($(activeLangClass+" ul.footer_menu_btns li a.footer_social_menu_btn").outerWidth())+"px")}).show().animate({height: newHeight}, {complete: function() { $('.footer_social'+activeLangClass).css({zIndex:25}); }});
    $('.footer_social'+activeLangClass).stop(true, true).css({height: "0px", width: (parseInt($(activeLangClass+" ul.footer_menu_btns li a.footer_social_menu_btn").outerWidth())+"px")}).show().animate(
        {height: newHeight}, {
            complete: function() {
                $('.footer_social'+activeLangClass).css({zIndex:30});
            }
        }
    );
});
var closeFooterSocialMenu = (function(event) {
    footerSocialMenuIsOpen = false;
    //$('.footer_social').css({zIndex: 20}).animate({height: "0px"}, {complete: function() { 
    $('.footer_social').stop(true, true).css({zIndex: 20}).animate({height: "0px"}, {complete: function() { 
        $('.footer_social'+activeLangClass).hide();
        $('.footer_social_menu_btn').removeClass('active');
    }});
});
var addFooterSocialMenuEvents = (function() {
    $('.footer_social_menu_btn').on('mouseenter', openFooterSocialMenu);
    //$('.footer_social').on('mouseleave', closeFooterSocialMenu);
    $('.footer_social_menu_btn').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });
    $(document).on("mousemove", function(event) {
        if(footerSocialMenuIsOpen) {
            var mouseX = event.pageX;
            var mouseY = event.pageY;
            var pageWidth = $( document ).width();
            var pageHeight = $( document ).height();
            if((mouseX < (pageWidth-150)) || (mouseY < (pageHeight-400))) {
                closeFooterSocialMenu(null);
            }
        }
    });
    /*
    $(document).mouseleave(function() {
        if(footerSocialMenuIsOpen) {
            closeFooterSocialMenu(null);
        }
    });
    */
});

var addLanguageBtnEvents = (function() {
    $('ul.lang_select a[data-lang]').on('click', langBtnClick);
});

var switchMapModusToPlane = (function(event) {
    if(MAP.get_demo()) { MAP.set_demo(false); }
    $('.controls ul.control_btns .map_type_globe').hide();
    $('.controls ul.control_btns .map_type_plane').show();
    MAP.set_view('flat');
    localStorage.setItem("view", "plane");
    mapModus = 1;
    ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_PLANE_VIEW")+window.lang.name});
    return false;
});
var switchMapModusToGlobe = (function(event) {
    if(MAP.get_demo()) { MAP.set_demo(false); }
    $('.controls ul.control_btns .map_type_globe').show();
    $('.controls ul.control_btns .map_type_plane').hide();
    MAP.set_view('globe');
    localStorage.setItem("view", "globe");
    mapModus = 0;
    ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_GLOBE_VIEW")+window.lang.name});
   
    return false;
});
var addMapModusBtnEvents = (function() {
    $('.controls ul.control_btns .map_type_globe').on('click', switchMapModusToPlane);
    $('.controls ul.control_btns .map_type_plane').on('click', switchMapModusToGlobe);
});

var switchDemoOn = (function(event) {
    MAP.set_demo(true);
    setUIDemoState(true);
    ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("DEMO_ON")+window.lang.name});
    return false;
});
var switchDemoOff = (function(event) {
    MAP.set_demo(false);
    setUIDemoState(false);
    ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("DEMO_OFF")+window.lang.name});
    return false;
});
var addDemoBtnEvents = (function() {
    $('.controls ul.control_btns .demo_on_btn').on('click', switchDemoOn);
    $('.controls ul.control_btns .demo_off_btn').on('click', switchDemoOff);
});

var switchMapToColor1 = (function(event) {
    $('.controls ul.control_btns .map_color_1').show();
    $('.controls ul.control_btns .map_color_2').hide();
    MAP.set_palette('dark');
    localStorage.setItem("color", "dark");
    mapColor = 0;
   ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_SWITCH_TO_DARK_COLOR")+window.lang.name});
    return false;
});
var switchMapToColor2 = (function(event) {
    $('.controls ul.control_btns .map_color_1').hide();
    $('.controls ul.control_btns .map_color_2').show();
    MAP.set_palette('light');
    localStorage.setItem("color", "light");
    mapColor = 1;
   ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_SWITCH_TO_LIGHT_COLOR")+window.lang.name});
    return false;
});
var addMapColorBtnEvents = (function() {
    $('.controls ul.control_btns .map_color_1').on('click', switchMapToColor2);
    $('.controls ul.control_btns .map_color_2').on('click', switchMapToColor1);
});

var zoomInClicked = (function(event) {
    if(MAP.get_demo()) { MAP.set_demo(false); }
    MAP.zoom_in();
    ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_ZOOM_IN")+window.lang.name});
    return false;
});
var zoomOutClicked = (function(event) {
    if(MAP.get_demo()) { MAP.set_demo(false); }
    MAP.zoom_out();
      ga('send', 'event', { eventCategory: 'Map Type', eventAction: 'Button Click', eventLabel: window.lang.getText("CONTROL_ZOOM_OUT")+window.lang.name});
    return false;
});
var addZoomBtnEvents = (function() {
    $('.controls ul.control_btns .map_zoom_in').on('click', zoomInClicked);
    $('.controls ul.control_btns .map_zoom_out').on('click', zoomOutClicked);
});

var initControls = (function() {
    addControlLabels();
    addFooterSocialMenuEvents();
    addLanguageBtnEvents();
    addMapModusBtnEvents();
    addDemoBtnEvents();
    addMapColorBtnEvents();
    addZoomBtnEvents();
});

var openPageViaMainMenuClick = (function(event) {
    var pageId = parseInt($(event.target).attr('data-subpage'));
    var locationTitle = $(event.target).text();
    var locationHash = $(event.target).attr('href').substring(1);
    History.pushState({page_id:pageId}, locationTitle, langUrlPrefix+"/"+locationHash+"/");
    return false;
});

// ===================
var mapDetectionTypesScrollSize = 5;
var mapDetectionTypesScrollInterval;
var fixMapDetectionTypesScrollAfterResize = (function() { 
    var barElem = $(".site .detection_types_container .detection_types .type-icons");
    var containerElem = $(".site .detection_types_container .detection_types");  
    if(parseInt(barElem.css('marginLeft')) > 0) {
        barElem.css({'marginLeft': "0px"});
    }
    if(barElem.width() > containerElem.width()) {
        if(parseInt(barElem.css('marginLeft')) < -1*(barElem.width() - containerElem.width())) {
            barElem.css({'marginLeft': (-1*(barElem.width() - containerElem.width()))+"px"});
        }
    } else {
        barElem.css({'marginLeft': "0px"});
    }
});
var mapDetectionTypesScroll = (function(direction) {
    var barElem = $(".site .detection_types_container .detection_types .type-icons");
    var containerElem = $(".site .detection_types_container .detection_types");
    if(direction == 0) {
        if((parseInt(barElem.css('marginLeft'))+mapDetectionTypesScrollSize) < 0) {
            barElem.css({'marginLeft': (parseInt(barElem.css('marginLeft'))+mapDetectionTypesScrollSize)+"px"});
        } else {
            barElem.css({'marginLeft': "0px"});
        }
    } else {
        if((parseInt(barElem.css('marginLeft'))-mapDetectionTypesScrollSize) > -1*(barElem.width() - containerElem.width())) {
            barElem.css({'marginLeft': (parseInt(barElem.css('marginLeft'))-mapDetectionTypesScrollSize)+"px"});
        } else {
            barElem.css({'marginLeft': (-1*(barElem.width() - containerElem.width()))+"px"});
        }
    }
    if(mapDetectionTypesScrollSize < 15) {
        mapDetectionTypesScrollSize += 0.25;
    }
});
var mapDetectionTypesScrollLeftStart = (function(event) {
    if(platformDetection.isMobile) {
        $('body').on('touchend', mapDetectionTypesScrollStop);
    } else {
        $('body').on('mouseup', mapDetectionTypesScrollStop);
    }
    mapDetectionTypesScrollInterval = setInterval(function(){ mapDetectionTypesScroll(0); }, 25);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var mapDetectionTypesScrollRightStart = (function(event) {
    if(platformDetection.isMobile) {
        $('body').on('touchend', mapDetectionTypesScrollStop);
    } else {
        $('body').on('mouseup', mapDetectionTypesScrollStop);
    }
    mapDetectionTypesScrollInterval = setInterval(function(){ mapDetectionTypesScroll(1); }, 25);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var mapDetectionTypesScrollStop = (function(event) {
    clearInterval(mapDetectionTypesScrollInterval);
    if(platformDetection.isMobile) {
        $('body').off('touchend', mapDetectionTypesScrollStop);
    } else {
        $('body').off('mouseup', mapDetectionTypesScrollStop);
    }
    mapDetectionTypesScrollSize = 1;
    event.preventDefault();
    event.stopPropagation();
    return false;
});
// ===================
var addBasicDetectionTypeEvents = (function() {
    $('.detection_types ul.type-icons li[data-detectiontype]').on('click', detectionTypeClick);
    if(platformDetection.isMobile) {
        $(".site .detection_types_container .detection_types_left").on('touchstart', mapDetectionTypesScrollLeftStart);
        $(".site .detection_types_container .detection_types_right").on('touchstart', mapDetectionTypesScrollRightStart);
    } else {
        $(".site .detection_types_container .detection_types_left").on('mousedown', mapDetectionTypesScrollLeftStart);
        $(".site .detection_types_container .detection_types_right").on('mousedown', mapDetectionTypesScrollRightStart);
    }
});
var closeTosOnEscape = (function(event) {
    var keyCode = (typeof event.which == "number") ? event.which : event.keyCode;
    if((currPageId == 6) && (keyCode == 27)) {
        History.pushState({page_id:1}, "", langUrlPrefix+"/");
        $('.footer_links a.tos').css({'color':''});
    }
});
var addMainMenuEvents = (function() {
    $('.menu li a[data-subpage]').on('click', openPageViaMainMenuClick);
    $('a.tos').on('click', function(event) {
        if(currPageId != 6) {
            History.pushState({page_id:6}, "", langUrlPrefix+"/tos/");
            $('.footer_links a.tos').css({'color':'#629c7f'});
        } else {
            History.pushState({page_id:1}, "", langUrlPrefix+"/");
            $('.footer_links a.tos').css({'color':''});
        }
        return false;
    });
    $( document ).on("keyup", closeTosOnEscape);
});

var addContentScrollListener = (function() {
    $('.content').scroll(function(event) {
        var currScrollDir = 0; // 1 = down | 2 = up
        var currScrollTop = $('.content').scrollTop();
        if(currScrollTop == 0) {
            currScrollDir = 2;
        } else if(currScrollTop > lastScrollTop) {
            currScrollDir = 1;
        } else if((currScrollTop < lastScrollTop) && ((($('.content').prop("scrollHeight")-$(window).height())-$('.content').scrollTop()) > 0)) {
            currScrollDir = 2;
        }
        if(currScrollDir != lastScrollDir) {
            if(currScrollDir == 1) {
                if($('.content').get(0).scrollHeight > $('.content').height()+103) {
                    $('.content').animate({marginTop:'0px'});
                    $('.header').animate({top:'-103px'});
                }
            } else if(currScrollDir == 2) {
                $('.content').animate({marginTop:'103px'});
                $('.header').animate({top:'0px'});
            }
        }
        lastScrollDir = currScrollDir;
        lastScrollTop = currScrollTop;
    });
});

// document ready event
$( document ).ready(function() {
    // loadCountries();
    getDocumentSize();
    initControls();
    // addMainMenuEvents();
    addHeaderSharingActions();
    addBasicDetectionTypeEvents();
    // loadPage(3); // load subsystems page, so we get to use its content for the systempop
    addContentScrollListener();
    // $('.infected_btn').on('click', infectedBtnClick);
    //addCountryPopEvents();

    // addHistoryJsSupport();
});

$( window ).resize(function() {
    getDocumentSize();
    updateStatisticsGraphSize();
    fixHeaderPosition();
    setTimeout(function() {
        fixStatisticsDetectionTypesScrollAfterResize();
        fixMapDetectionTypesScrollAfterResize();
    }, 50);
});









