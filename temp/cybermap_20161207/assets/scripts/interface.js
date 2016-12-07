// flags to determine build status
// var CYBERMAP_IS_DEVELOPMENT = !location.host.match(/cybermap.kaspersky.com/);
var CYBERMAP_IS_DEVELOPMENT = false;
var CYBERMAP_IS_PRODUCTION = !CYBERMAP_IS_DEVELOPMENT;
//console.log('build:', CYBERMAP_IS_PRODUCTION ? 'production' : 'development');

var detectedCountryId = -1;

// Variables
var logToConsole = false;
// Language
var activeLangClass = ".english";
var langUrlPrefix = "";

// Webgl related
var mapModus = 0; // 0 = globe | 1 = plane
var demoModeActive = 0; // 0 = false | 1 = true
var mapColor = 0; // 0 = map color 1 | 1 = map color 2
// Page related
var siteOpen = 0; // 0 = false | 1 = true
var currPageId = 1; // 1 = map | 2 = stats | 3 = subsystems | 4 = buzz | 5 = widget-setup | 6 = terms and conditions | 7 = bad/ddos

// scroll related (to hide header)
var lastScrollTop = 0;
var lastScrollDir = 0;
var lastWorldTaskId = 0;
var lastCountryTaskId = 0;

// Statistics page related 
var currWorldStatisticsTimePeriod = 0; // 0 = week | 1 = month
var currWorldStatisticsDetectionType = "oas"; // 0 = oas | 1 = wav | 2 = ids | 3 = vul | 4 = kas | 5 = mav | 6 = ods
var currWorldStatisticsContentPane = "stats_content_two";
var nextWorldStatisticsContentPane = "stats_content_one";
var worldStatsTaskList = [];
var worldStatsTaskListRunning = false;

var currCountryStatisticsTimePeriod = 0; // 0 = week | 1 = month
var currCountryStatisticsDetectionType = "oas"; // 0 = oas | 1 = wav | 2 = ids | 3 = vul | 4 = kas | 5 = mav | 6 = ods
var currCountryStatisticsContentPane = "stats_content_two";
var nextCountryStatisticsContentPane = "stats_content_one";
var countryStatsTaskList = [];
var countryStatsTaskListRunning = false;
var currCountryStatisticsCountry = 1;
var lastCountryStatisticsCountry = 1;
var statisticsCountryDropdownOpen = false;

var documentWidth = "0px";
var documentHeight = "0px";
var statisticsGraphCanvas;
var statisticsGraphContext;

var webgl_countries_data = [];
var countries = countries || [] ;
var countriesObjs = countriesObjs || [];
var countriesDict = countriesDict || {};
var waitingForAllCountryData;
var lastTop5Data;

var googleShareSettingsBase = {
    contenturl: 'https://cybermap.kaspersky.com/',
    contentdeeplinkid: '',
    clientid: '1032749335403-ag40okd8fnis6d5jdpos33mjaaefsij1.apps.googleusercontent.com',
    cookiepolicy: 'single_host_origin',
    prefilltext: "Cyberthreath map",
    calltoactionlabel: 'OPEN',
    calltoactionurl: 'https://cybermap.kaspersky.com/',
    calltoactiondeeplinkid: '',
    requestvisibleactions: 'http://schemas.google.com/AddActivity'
};

// this function will check if theres no scroll ability and show the header if there isn't any, but the header is hidden
var fixHeaderPosition = (function() {
    // if theres no scroll
    if($('.content').get(0).scrollHeight <= $('.content').height()) {
        if(parseInt($('.content').css('marginTop')) < 103) { // if content has to small of a marginTop
            $('.content').animate({marginTop:'103px'});
            $('.header').animate({top:'0px'});
        }
    }
});
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
}
function niceUrlQueryParamsFix() {
    var returnStr = "";
    var queryParams = getQueryParams(document.location.search);
    $.each(queryParams, function( index, value ) {
        if((index != "") && (index != "_suid")) {
            if(returnStr == "") { returnStr += "?"; } else { returnStr += "&"; }
            returnStr += encodeURIComponent(index)+"="+encodeURIComponent(value);
        }
    });
    return returnStr;
}

// this object defines the detection types for the statistics dropdown menus
var detectionTypes = [
    {
        id: "oas",
        name: window.lang.getText("STATISTICS_LOCAL_INFECTIONS"),
        active: 1
    },
    {
        id: "wav",
        name: window.lang.getText("STATISTICS_WEB_THREATS"),
        active: 1
    },
    {
        id: "ids",
        name: window.lang.getText("STATISTICS_NETWORK_ATTACKS"),
        active: 1
    },
    {
        id: "vul",
        name: window.lang.getText("STATISTICS_VULNERABILITIES"),
        active: 1
    },
    {
        id: "kas",
        name: window.lang.getText("STATISTICS_SPAM"),
        active: 1
    },
    {
        id: "mav",
        name: window.lang.getText("STATISTICS_INFECTED_MAIL"),
        active: 1
    },
    {
        id: "ods",
        name: window.lang.getText("STATISTICS_ON_DEMAND_SCAN"),
        active: 1
    },
    {
        id: "bad",
        name: window.lang.getText("STATISTICS_BOTNET_ACTIVITY"),
        active: 1
    }
];

// this object defines continents and what country id's belong to that continent
// (pulled from securelist javascript files) far from perfect, but it'll have to do? for now?
var continents = [
    {
        name: window.lang.getText("CONTINENT_NORTH_AMERICA"),
        countries: [109,70,111,167,136,90,193,108,161,118,142,82,12,173,38,178,72]
    },
    {
        name: window.lang.getText("CONTINENT_SOUTH_AMERICA"),
        countries: [149,100,112,117,124,148,160,184,215,222,227,35,4,56,6]
    },
    {
        name: window.lang.getText("CONTINENT_ASIA"),
        countries: [159,10,105,122,123,13,131,34,137,140,144,147,150,152,154,159,179,182,185,186,192,197,199,202,206,213,219,226,229,23,237,240,241,33,34,37,39,42,45,50,52,55,58,60,67,92]
    },
    {
        name: window.lang.getText("CONTINENT_EUROPE"),
        countries: [1,103,113,117,120,125,146,15,166,17,171,187,19,194,197,203,207,211,218,221,223,233,235,253,26,27,28,29,46,48,49,59,66,69,75,81,86,91]
    },
    {
        name: window.lang.getText("CONTINENT_AFRIKA"),
        countries: [209,104,107,110,114,115,121,129,138,141,143,151,155,156,157,163,170,172,175,180,183,188,190,191,195,198,20,200,208,21,210,220,224,234,24,243,248,3,31,36,43,5,51,61,74,84,87,99]
    },
    {
        name: window.lang.getText("CONTINENT_OCEANIA"),
        countries: [30,62,22,83,16,176,127]
    }
];

// fixing IE
if (!Date.now) { Date.now = function() { return new Date().getTime(); }}
var timeStamp = (function() {
    return Math.floor(Date.now());
});

var shareData = {
    url:  window.lang.getText("SOCIAL_LINK"),
    title:  window.lang.getText("SUBTITLE"),
    description: window.lang.getText("SOCIAL_TEXT"),
    hashtags: window.lang.getText("SHARE_HASH_TAGS")
};
var encodedShareData = (function(share_data_type) {
    return encodeURIComponent(shareData[share_data_type]);
});


// todo - убрат непосредственно в верстку
var addHeaderSharingActions = (function() {
    //$('ul.social_links .facebook').attr('href', "https://www.facebook.com/sharer/sharer.php?u="+encodedShareData("url"));
    $('ul.social_links .facebook').attr('href', "https://www.facebook.com/dialog/feed?app_id=634328833377154&display=popup&caption="+encodedShareData("title")+"&name="+encodedShareData("title")+"&link=https%3A%2F%2Fcybermap.kaspersky.com%2F&description="+encodedShareData("description")+" "+encodedShareData("hashtags")+"&picture=https%3A%2F%2Fcybermap.kaspersky.com%2Fassets%2Fimages%2Fsocial_share.jpg" );
    $('ul.social_links .twitter').attr('href', "http://twitter.com/share?text="+encodedShareData("description")+" "+encodedShareData("hashtags")+"&url=https%3A%2F%2Fkas.pr%2Fmap");
    $('ul.social_links .gplus').attr('href', "http://plus.google.com/share?url="+encodedShareData("url"));
    $('ul.social_links .vk').attr('href', "http://vk.com/share.php?url="+encodedShareData("url")+"&title="+encodedShareData("title")+"&description="+encodedShareData("description")+" "+encodedShareData("hashtags"));
});

// wrapper to fetch data from server, either via php script or static files
// returns parsed JSON in callback
var dataLoader = (function(options, callback) {
    var url;
    var is_bad = (options.detection_type == 'bad');

    if (is_bad || CYBERMAP_IS_PRODUCTION) {
        // for production environment, turn php query into a json filename
        if (options.list_countries) {
            url = 'assets/data/countries.json';
        } else {
            var filename = (
                options.data_type + '_' + options.detection_type + '_' + options.time_period +
                ((options.data_type == 'country') ? '' : '_' + options.country_id) +
                '.json');
            url = 'assets/data/securelist/' + filename;
        }
    } else {
        // just use the php script for development
        url = '/assets/lib/data_loader.php?' + $.param(options);
    }
/*
    // somehow this doesnt return error json..?!
    var cb = function(data) {
        //console.log('dataLoader:', url, data);
        callback(data);
    };
    $.getJSON(url, cb);
*/
    $.getJSON( url, function( data ) {
        callback(data);
    });
});

var loadCountriesHelper = (function(data) {
    return
    if(!$.isEmptyObject(webgl_countries_data)) {
        clearInterval(waitingForAllCountryData);

        $.each(data, function( index, value ) {
            if(isSet(webgl_countries_data[value['key']])) {
                countries[value['key']] = window.lang.getText(value['name']);
                countriesObjs.push(
                    {
                        id: value['key'],
                        value: window.lang.getText(value['name'])
                    }
                    );
                countriesDict[value['key']] = window.lang.getText(value['name']);
            }
        });
    }
});

var loadCountries = (function() {
    dataLoader({ list_countries: 1 }, function(data) {
        waitingForAllCountryData = setInterval(function() { loadCountriesHelper(data); }, 100);
    });
});

var buildStatisticsGraph2 = (function(statsData, statsView, callBack, callBackArgs) {
    var statsBlockElem = $("<div>").addClass("stats_block wide");
    var timePeriodNameEN = "";
    var detectionTypeNameEN = "";
    if(statsView == "world") {
        timePeriodNameEN = (currWorldStatisticsTimePeriod == 0) ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH");
        $.each(detectionTypes, function( dt_index, dt_value ) {
            if(dt_value.id == currWorldStatisticsDetectionType) {
                detectionTypeNameEN = dt_value.name;
            }
        });
    } else {
        timePeriodNameEN = (currCountryStatisticsTimePeriod == 0) ? window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH");
        $.each(detectionTypes, function( dt_index, dt_value ) {
            if(dt_value.id == currCountryStatisticsDetectionType) {
                detectionTypeNameEN = dt_value.name;
            }
        });
    }
    
    var statsBlockTitleEnglish = $("<h2>").addClass("english").html(window.lang.getText("STATISTICS_TOP")+" - "+detectionTypeNameEN+" "+window.lang.getText("STATISTICS_IN_THE_LAST")+" "+timePeriodNameEN);
    var canvasHolderElem = $("<div>").addClass("canvas_holder");
    var innerCanvasHolderElem = $("<div>").addClass("inner_canvas_holder");
    var canvasTag = $("<canvas>").addClass("statistics_canvas_2"); //.css({maxHeight:'500px'}).attr('max-height','500px');
    
    statsBlockElem.append(statsBlockTitleEnglish);
    innerCanvasHolderElem.append(canvasTag);
    canvasHolderElem.append(innerCanvasHolderElem);
    statsBlockElem.append(canvasHolderElem);
    
    if(statsView == "world") {
        if (currWorldStatisticsDetectionType == 'bad') {
            // client wants BAD graph block to be centered
            statsBlockElem.css({
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                clear: 'both'
            });
        }

        $('.stats_overview.one .stats_content .'+nextWorldStatisticsContentPane).append(statsBlockElem);
    } else {
        $('.stats_overview.two .stats_content .'+nextCountryStatisticsContentPane).append(statsBlockElem);
    }
    
    var hasData = false;
    var labels = [];
    var values = [];
    if(!isSet(statsData.data_loader_error)) {
        hasData = true;
        $.each(statsData, function( stats_index, stats_data ) {
            var currLabel = stats_data.date;
            if(stats_index == statsData.length-1) {
                callBack.apply(this, callBackArgs);
            }
            if((statsData.length-1 > 7) && platformDetection.isMobile) {
                if((stats_index > 0) && (stats_index < 5)) { currLabel = ""; }
                if((stats_index > 5) && (stats_index < 10)) { currLabel = ""; }
                if((stats_index > 10) && (stats_index < 15)) { currLabel = ""; }
                if((stats_index > 15) && (stats_index < 20)) { currLabel = ""; }
                if((stats_index > 20) && (stats_index < 25)) { currLabel = ""; }
                if((stats_index > 25) && (stats_index < statsData.length-1)) { currLabel = ""; }
            }
            labels.push(currLabel);
            values.push(stats_data.count);
        });
    } else {
        var noDataTextEN = $('<span>').addClass("english").css({position: 'absolute', left: '0px', top: '49%', textAlign: 'center', width: '100%', color: '#000000', zIndex: 5}).text(window.lang.getText("STATISTICS_NO_DATA"));
        canvasHolderElem.append(noDataTextEN);

        //console.log("graph data non existant!!");
        if(((statsView == "world") && (currWorldStatisticsTimePeriod == 1)) || ((statsView != "world") && (currCountryStatisticsTimePeriod == 1))) {
            labels = ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""];
            values = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        } else {
            labels = ["","","","","","",""];
            values = [0,0,0,0,0,0,0];
        }
        callBack.apply(this, callBackArgs);        
    }
    
    var data = {
        labels: labels,
        datasets: [
            {
                label: "",
                fillColor: "rgba(213,43,30,0.two)",
                strokeColor: "rgba(213,43,30,1)",
                pointColor: "rgba(213,43,30,1)",
                pointStrokeColor: "#d52b1e",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(213,43,30,1)",
                data: values
            }
        ]
    };
    var options = {
        animation: true, // Boolean - Whether to animate the chart
        animationSteps: 60, // Number - Number of animation steps
        animationEasing: "easeOutQuart", // String - Animation easing effect
        scaleShowGridLines : true, //Boolean - Whether grid lines are shown across the chart
        scaleGridLineColor : "rgba(0,0,0,.05)", //String - Colour of the grid lines
        scaleGridLineWidth : 1, //Number - Width of the grid lines
        scaleShowHorizontalLines: true, //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowVerticalLines: false, //Boolean - Whether to show vertical lines (except Y axis)
        bezierCurve : true, //Boolean - Whether the line is curved between points
        bezierCurveTension : 0.4, //Number - Tension of the bezier curve between points
        pointDot : true, //Boolean - Whether to show a dot for each point
        pointDotRadius : 5, //Number - Radius of each point dot in pixels
        pointDotStrokeWidth : 1, //Number - Pixel width of point dot stroke
        pointHitDetectionRadius : 5, //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        datasetStroke : true, //Boolean - Whether to show a stroke for datasets
        datasetStrokeWidth : 1, //Number - Pixel width of dataset stroke
        datasetFill : false, //Boolean - Whether to fill the dataset with a colour
        //String - A legend template
        responsive: true, // Boolean - whether or not the chart should be responsive and resize when the browser does.
        maintainAspectRatio: false, // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        showTooltips: hasData, // Boolean - Determines whether to draw tooltips on the canvas or not
        customTooltips: false, // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
        tooltipEvents: ["mousemove", "touchstart", "touchmove"], // Array - Array of string names to attach tooltip events       
        tooltipFillColor: "#006d55", // String - Tooltip background colour
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", // String - Tooltip label font declaration for the scale label
        tooltipFontSize: 14, // Number - Tooltip label font size in pixels
        tooltipFontStyle: "normal", // String - Tooltip font weight style
        tooltipFontColor: "#fff", // String - Tooltip label font colour
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", // String - Tooltip title font declaration for the scale label
        tooltipTitleFontSize: 14, // Number - Tooltip title font size in pixels
        tooltipTitleFontStyle: "bold", // String - Tooltip title font weight style
        tooltipTitleFontColor: "#fff", // String - Tooltip title font colour
        tooltipYPadding: 15, // Number - pixel width of padding around tooltip text
        tooltipXPadding: 10, // Number - pixel width of padding around tooltip text
        tooltipCaretSize: 6, // Number - Size of the caret on the tooltip
        tooltipCornerRadius: 0, // Number - Pixel radius of the tooltip border
        tooltipXOffset: 10, // Number - Pixel offset from point x to tooltip edge
        tooltipTemplate: "<%= value %>", //"<%if (label){%><%=label%>: <%}%><%= value %>", // String - Template string for single tooltips
        multiTooltipTemplate: "<%= value %>", // String - Template string for multiple tooltips
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
        onAnimationProgress: function(){}, // Function - Will fire on animation progression.
        onAnimationComplete: function(){} // Function - Will fire on animation completion.
    };
    var myLineChart = new Chart(canvasTag[0].getContext('2d')).Line(data, options);
});

var clickCountry = (function(event) {
    closeDropdowns(0);
    currCountryStatisticsCountry = $(event.target).closest("a").attr('data-country-id');
    $('.stats_overview.two .stats_overview_controls .location .label.english').html(countries[currCountryStatisticsCountry]);
    //$('.stats_overview.two .stats_overview_controls .location .label').html($('span.name', $(event.target).closest("a")).html());
    loadStatisticsCountryData(false,true);
    event.stopPropagation();
    return false;
});
var buildStatisticLists = (function(listsObject,statsView,extraClasses,callBack,callBackArgs) {
    var columnsContainer;
    if(statsView == "world") {
        columnsContainer = $('.stats_overview.one .stats_content .'+nextWorldStatisticsContentPane);
    } else {
        columnsContainer = $('.stats_overview.two .stats_content .'+nextCountryStatisticsContentPane);
    }
    // prepare elements to build the lists
    var statsBlockElem = $("<div>").addClass("stats_block "+extraClasses);
    var statsBlockTitle = $("<h2>");
    var statsBlockList = $("<ul>").addClass("list");
    var statsBlockListItem = $("<li>");
    var statsBlockListItemLink = $("<a>");
    var statsBlockListItemLinkSpan = $("<span>");
    
    $.each(listsObject, function( list_index, list_data ) {
        var myStatsBlockElem = statsBlockElem.clone();
        var statsBlockTitleEnglish = statsBlockTitle.clone().addClass("english").html(list_data.name);
        var myStatsBlockList = statsBlockList.clone();
        if(isSet(list_data.items)) {
            $.each(list_data.items, function( list_item_index, list_item_data ) {
                var value_text = list_item_data.value;
                if (currWorldStatisticsDetectionType !== 'bad') {
                    // non-BAD stats are percentages
                    value_text += ' %';
                }

                var myStatsBlockListItem = statsBlockListItem.clone();
                var myStatsBlockListItemLink = statsBlockListItemLink.clone();
                var statsBlockListItemLinkNum = statsBlockListItemLinkSpan.clone().addClass("num").text((list_item_index+1)+".");
                var statsBlockListItemLinkName = statsBlockListItemLinkSpan.clone().addClass("name");
                var statsBlockListItemLinkNameEnglish = statsBlockListItemLinkSpan.clone().addClass("english").html(list_item_data.name);
                var statsBlockListItemLinkPercentage = statsBlockListItemLinkSpan.clone().addClass("percentage").html(value_text);
                var statsBlockListItemLinkInfo = statsBlockListItemLinkSpan.clone().addClass("info");
                var statsBlockListItemLinkInfoEnglish = statsBlockListItemLinkSpan.clone().addClass("english").html(window.lang.getText("STATISTICS_COUNTRY_SEE_DATA"));

                statsBlockListItemLinkName.append(statsBlockListItemLinkNameEnglish);

                if(isSet(list_item_data.country_id) && currWorldStatisticsDetectionType !== 'bad') {
                    myStatsBlockListItemLink.attr('data-country-id', list_item_data.country_id).on('click', clickCountry);
                    statsBlockListItemLinkInfo.append(statsBlockListItemLinkInfoEnglish);
                } else if (currWorldStatisticsDetectionType !== 'bad') {
                    statsBlockListItemLinkInfo.html(value_text);
                    myStatsBlockListItemLink.attr('href',window.lang.getText("THREATS_URL")+list_item_data.name +'/').attr('target', '_blank');
                } else {
                    myStatsBlockListItemLink.attr('href','').on('click', function(event){ event.stopPropagation(); event.preventDefault(); return false; });
                    statsBlockListItemLinkInfo.html(value_text);
                }

                
                myStatsBlockListItemLink.append(statsBlockListItemLinkNum);
                myStatsBlockListItemLink.append(statsBlockListItemLinkName);
                myStatsBlockListItemLink.append(statsBlockListItemLinkPercentage);
                myStatsBlockListItemLink.append(statsBlockListItemLinkInfo);
                myStatsBlockListItem.append(myStatsBlockListItemLink);
                
                myStatsBlockList.append(myStatsBlockListItem);
            });
        } else {
            //console.log("empty list!");
            var noDataDiv = $('<div>').addClass("nodata_list");
            var noDataTextEN = $('<span>').addClass("english").css({position: 'absolute', left: '0px', top: '49%', textAlign: 'center', width: '100%', color: '#000000'}).text("NO DATA");
            noDataDiv.append(noDataTextEN);
            myStatsBlockList.append(noDataDiv);
        }
        myStatsBlockElem.append(statsBlockTitleEnglish);
        myStatsBlockElem.append(myStatsBlockList);
        $(columnsContainer).append(myStatsBlockElem);
        if(list_index == listsObject.length-1) {
            callBack.apply(this, callBackArgs);
        }
    });
});
var secureListDataLoaded = (function(mySettings, secureListData, statsView, callBack, callBackArgs) {
    switch(mySettings.data_type) {
        case "country":
            var allListsObj = [];
            var allCountries = [];
            $.each(continents, function( continent_index, continent_value ) {
                var listObj = {};
                listObj.name = continent_value.name;
                var myCountries = [];
                $.each(continent_value.countries, function( country_index, country_value ) {
                    if(isSet(countries[country_value]) && isSet(secureListData[country_value])) {
                        var myData = {
                            country_id: country_value,
                            name:countries[country_value],
                            value:secureListData[country_value]};
                        allCountries.push(myData);
                        myCountries.push(myData);
                    }
                });
                myCountries.sort(function(a, b){
                    if (a.value == b.value) { return 0; }
                    return (a.value > b.value) ? -1 : 1;
                });
                listObj.items = myCountries.slice(0, 5);
                allListsObj.push(listObj);
            });
            var worldList = {};
            worldList.name = window.lang.getText("CONTINENT_WORLD");
            allCountries.sort(function(a, b){
                if (a.value == b.value) { return 0; }
                return (a.value > b.value) ? -1 : 1;
            });
            worldList.items = allCountries.slice(0, 15);
            allListsObj.unshift(worldList);
            
            buildStatisticLists(allListsObj,statsView,"",callBack,callBackArgs);
            break;
        case "graph":
            buildStatisticsGraph2(secureListData,statsView,callBack,callBackArgs);
            break;
        case "top10":
            var allListsObj = [];
            var listObj = {};
            var timePeriodNameEN = "";
            var detectionTypeNameEN = "";
            if(statsView == "world") {
                timePeriodNameEN = (currWorldStatisticsTimePeriod == 0) ?  window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH");
                $.each(detectionTypes, function( dt_index, dt_value ) {
                    if(dt_value.id == currWorldStatisticsDetectionType) {
                        detectionTypeNameEN = dt_value.name;
                    }
                });
                listObj.name = window.lang.getText("STATISTICS_TOP")+" - "+detectionTypeNameEN+" "+window.lang.getText("STATISTICS_IN_THE_LAST")+" "+timePeriodNameEN;
            } else {
                timePeriodNameEN = (currCountryStatisticsTimePeriod == 0) ?  window.lang.getText("STATISTICS_WEEK") : window.lang.getText("STATISTICS_MONTH");
                $.each(detectionTypes, function( dt_index, dt_value ) {
                    if(dt_value.id == currCountryStatisticsDetectionType) {
                        detectionTypeNameEN = dt_value.name;
                    }
                });
                listObj.name = listObj.name = window.lang.getText("STATISTICS_TOP")+" - "+detectionTypeNameEN+" "+window.lang.getText("STATISTICS_IN_THE_LAST")+" "+timePeriodNameEN;
            }
            if(!isSet(secureListData.data_loader_error)) {
                var myItems = [];
                $.each(secureListData, function( top10_index, top10_value ) {
                    var myData = {name:top10_value.name, value:top10_value.percent};
                    myItems.push(myData);
                });
            }
            listObj.items = myItems;
            allListsObj.push(listObj);
            if(statsView == "world") {
                buildStatisticLists(allListsObj,statsView,"wide",callBack,callBackArgs);
            } else {
                buildStatisticLists(allListsObj,statsView,"wide",callBack,callBackArgs);
            }
            break;
    }
});
var loadSecureListData = (function(settings, statsView, callBack, callBackArgs) {
    if (logToConsole) console.log("loading securelist data");
    if (callBack === undefined) callBack = (function() { if (logToConsole) console.log("no callback!"); });
    if (callBackArgs === undefined) callBackArgs = [];
    var defaults = {
        securelist_data: 1,
        country_id: 0,
        data_type: "country",
        detection_type: "oas",
        time_period: "d"
    };
    var secureListData = [];
    var mySettings = $.extend({},defaults,settings);

    dataLoader(mySettings, function(data) {
        $.each(data, function( index, value ) {
            secureListData[index] = value;
        });
        secureListDataLoaded(mySettings, secureListData, statsView, callBack, callBackArgs);
    });
});

var googleSharePostCount = 0;
var updateCountryPopLinks = (function() {
    $('#countrypop_sharing_icons .facebook a').attr('href', shareCurrCountryPopup("facebook"));
    $('#countrypop_sharing_icons .twitter a').attr('href', shareCurrCountryPopup("twitter"));
    $('#countrypop_sharing_icons .gplus a').attr('href', "http://plus.google.com/share?url="+encodedShareData("url"));
    $('#countrypop_sharing_icons .vk a').attr('href', shareCurrCountryPopup("vk"));
});




var MAP_functions = {
    show_country_popup: function(name) {
        $("#countrypop_title").html(name);
        if ($("#countrypop").hasClass('hidden')) {
            $("#countrypop").show();
            $("#countrypop").removeClass('hidden');
/*            if(platformDetection.isMobile) {
                $('.detection_types').removeClass('open');
                $(".countrypop div.blocks").getNiceScroll().show();
                $(".countrypop div.blocks").getNiceScroll().resize();
            }*/
            setTimeout(updateCountryPopLinks, 100);
        } else {
            $("#countrypop").addClass('pulse');
            setTimeout(function() {
                $("#countrypop").removeClass('pulse');
            }, 1000);
        }

        if (window.nesaShowData){
            fillNesapop(name, false);
        }
    },
    show_country_name: function(iso3) {
        if(iso3 != null)
        {
            $("#selected-country-name").text(window.lang.getText("MAP_COUNTRY_"+iso3));
            $("canvas").focus();
        }
        else
        {
            $("#selected-country-name").text("");
            $("canvas").focus();
        }
    },
    hide_country_popup: function() {
        // hide the country popup
/*        if(platformDetection.isMobile) {
            $(".countrypop div.blocks").getNiceScroll().hide();
        }*/
        $("#countrypop").addClass('hidden');
        setTimeout(function() {
            if($("#countrypop").hasClass('hidden')) {
                $("#countrypop").hide();
            }
        }, 1000);

        if (window.nesaShowData) {
            fillNesapop('', false);
        }
    },
    set_demo_state: function(state) {
        // set the state of the demo toggle button
        // (the simulation can go into demo mode by itself)
        if (logToConsole) console.log('MAP demo state:', state);
        setUIDemoState(state);
    },
    set_view_state: function(state) {
        // set the state of the view toggle button
        if (logToConsole) console.log('MAP view state:', state);
        setUIViewState(state);
    },
    got_country_data: function(countries_data) {
        webgl_countries_data = countries_data;
        MAP.set_language(window.lang.lang());
    },
    stats_top5: function(top5) { // called whenever top5 changes
        if($("div[data-subpage='2']").length) { // do we have a statistics page?
            lastTop5Data = top5;
            updateTop5Names(top5);

            for(var i = 0; i < 5; i++) {
                $($('.most_infected_links a')[i]).attr('data-country-id', top5[i].key);
                $('.name .english', $($('.most_infected_links a')[i])).html(top5[i].name);
            }
        } else {
        lastTop5Data = top5;
        }
    },
    got_geoip_data: function(country_key) {
        // if (key < 0) then geoip failed
        // otherwise key is user's detected country
        if (logToConsole) console.log('got_geoip_data:', country_key);
        if($("div[data-subpage='2']").length) { // do we have a statistics page?
            if(isSet(countries[currCountryStatisticsCountry])) {
                // closeDropdowns(0);
                currCountryStatisticsCountry = country_key;
                $('.stats_overview.two .stats_overview_controls .location .label.english').html(countries[currCountryStatisticsCountry]);
                loadStatisticsCountryData(true, false);
            }
            detectedCountryId = country_key;
        } else {
            detectedCountryId = country_key;
        }
    }
};

// define helper functions
var isSet = (function(something) {
    if(typeof(something) != "undefined" && something !== null) {
        return true;
    }
    return false;
});

var getDocumentSize = (function() {
    documentWidth = $(document).width()+"px";
    documentHeight = $(document).height()+"px";
});

var setUIDemoState = (function(state) {
    if(state) {
        $('.controls ul.control_btns .demo_on_btn').hide();
        $('.controls ul.control_btns .demo_off_btn').show();
        demoModeActive = 1;
    } else {
        $('.controls ul.control_btns .demo_on_btn').show();
        $('.controls ul.control_btns .demo_off_btn').hide();
        demoModeActive = 0;
    }
});

var setUIViewState = (function(state) {
    $('.controls ul.control_btns .map_type_globe').toggle(state == 'globe');
    $('.controls ul.control_btns .map_type_plane').toggle(state != 'globe');
});

var langBtnClick = (function(event) {
    var newLang = $(event.target).attr('data-lang');
    if(newLang == "en") {
        ga('send', 'event', { eventCategory: 'Language button', eventAction: 'Button Click', eventLabel: 'SELECT EN'});
    } else {
        ga('send', 'event', { eventCategory: 'Language button', eventAction: 'Button Click', eventLabel: 'SELECT RU'});
    }    
    return false;
});

// helper function to switch language on newly loaded pages
var applyLanguage = (function(subpage_id) {    
    $(".content .subpage[data-subpage='"+subpage_id+"'] .english").addClass("visible").show();
});

var detectionTypeClick = (function(event) {
    var detectionType = $(event.target).closest("li").attr('data-detectiontype');
    var gaEventLabel = detectionType.toUpperCase();
    $.each(detectionTypes, function( dt_index, dt_value ) {
        if(dt_value.id == detectionType) {
            if(dt_value.active == 1) { dt_value.active = 0; } else { dt_value.active = 1; }
            localStorage.setItem(detectionType, dt_value.active);
        }
    });
    
    $("ul.type-icons li[data-detectiontype='"+detectionType+"']").toggleClass("disabled");
    MAP.toggle_map(detectionType);
    MAP.toggle_graph(detectionType);
    ga('send', 'event', { eventCategory: 'Data detectiontype', eventAction: 'Button Click', eventLabel: gaEventLabel});
});

var infectedBtnClick = (function(event) {
    /*
    if(activeLang == 0) { // english
        ga('send', 'event', { eventCategory: 'Am I infected?', eventAction: 'Button Click', eventLabel: 'AM I INFECTED?'});
        window.open('http://free.kaspersky.com/?redef=1&THRU&reseller=cybermap_sm');
    } else { // russian
        ga('send', 'event', { eventCategory: 'Am I infected?', eventAction: 'Button Click', eventLabel: 'AM I INFECTED? (RU)'});
        window.open('http://www.kaspersky.ru/free-antiviruses?campaign=kl_free_SM_sm&THRU&referer1=kl_free&referer2=kl_free_SM_sm');
    }

    // facebook tracker
    window._fbq.push(['track', '6028306443538',{'value':'0.00','currency':'GBP'}]);

    return false;
    */
});

var openSite = (function() {
    $("html, body").addClass("site_open");
    $('.wrapper .site .content').css({top:documentHeight}).show().animate({top:"0%"},{duration:250,complete:function(){
        $("html, body").removeClass("noscroll");
        //MAP.pause();
    }});
    siteOpen = 1;
});
var closeSite = (function() {
    $("html, body").addClass("noscroll");
    
    $('.header').animate({top:'0px'});
    $('.subheader').animate({top:'61px'});
    
    MAP.resume();
    $('.wrapper .site .content').animate({top:documentHeight},{duration:250,complete:function(){
        $('.wrapper .site .content').hide();
        $("html, body").removeClass("site_open");
    }});
    siteOpen = 0;
});


var toggleStatisticsDropdown1 = (function(event) {
    if(!$('.stats_overview.one .stats_overview_controls .type').hasClass("open")) {
        $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').show();
        var targetHeight = $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').height();
        
        if(platformDetection.isMobile) {
            var scrollToHere = $(".stats_overview.one").position().top;
            scrollToHere += $(".stats_overview.one .stats_overview_controls").position().top;
            scrollToHere += $(".stats_overview.one .stats_overview_controls .type").position().top;
            scrollToHere += $(".content").scrollTop();
            $(".content").animate({ scrollTop: scrollToHere });
        }
        
        $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').css({height: '0px'}).animate({height:targetHeight+'px'}, 500, function() {
            $(document).on('click', toggleStatisticsDropdown1);            
            closeDropdowns(1);
            $('.stats_overview.one .stats_overview_controls .type').addClass("open");
            $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').addClass("open");
        });
    } else {
        $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsDropdown1);
            
            $('.stats_overview.one .stats_overview_controls .type').removeClass("open");
            $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });
    }
    event.stopPropagation();
    return false;
});
var toggleStatisticsDropdown2 = (function(event) {
    if(!$('.stats_overview.two .stats_overview_controls .type').hasClass("open")) {
        $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').show();
        var targetHeight = $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').height();
        
        if(platformDetection.isMobile) {
            var scrollToHere = $(".stats_overview.two").position().top;
            scrollToHere += $(".stats_overview.two .stats_overview_controls").position().top;
            //scrollToHere += $(".stats_overview.two .stats_overview_controls .type").position().top;
            scrollToHere += 55; // whatever
            scrollToHere += $(".content").scrollTop();
            $(".content").animate({ scrollTop: scrollToHere });
        }
        
        $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').css({height: '0px'}).animate({height:targetHeight+'px'}, 500, function() {
            $(document).on('click', toggleStatisticsDropdown2);
            closeDropdowns(2);
            $('.stats_overview.two .stats_overview_controls .type').addClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').addClass("open");
        });
    } else {
        $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsDropdown2);
            
            $('.stats_overview.two .stats_overview_controls .type').removeClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });
    }
    event.stopPropagation();
    return false;
});
var toggleStatisticsCountryDropdown = (function(event) {
    if(!$('.stats_overview.two .stats_overview_controls .location').hasClass("open")) {
        $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').show();
        var targetHeight = $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').height();
        
        if(platformDetection.isMobile) {
            var scrollToHere = $(".stats_overview.two").position().top;
            scrollToHere += $(".stats_overview.two .stats_overview_controls").position().top;
            scrollToHere += $(".stats_overview.two .stats_overview_controls .location").position().top;
            scrollToHere += $(".content").scrollTop();
            $(".content").animate({ scrollTop: scrollToHere });
        }
        
        $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').css({height: '0px'}).animate({height:targetHeight+'px'}, 500, function() {
            statisticsCountryDropdownOpen = true;
            $(document).on('click', toggleStatisticsCountryDropdown);
            closeDropdowns(3);
            $('.stats_overview.two .stats_overview_controls .location').addClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').addClass("open");
        });
    } else {
        statisticsCountryDropdownOpen = false;
        $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsCountryDropdown);
            
            $('.stats_overview.two .stats_overview_controls .location').removeClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });        
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
});

var closeDropdowns = (function(lastOpened) {
    if(lastOpened != 1) {
        $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsDropdown1);
            
            $('.stats_overview.one .stats_overview_controls .type').removeClass("open");
            $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });
    }
    if(lastOpened != 2) {
        $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsDropdown2);
            
            $('.stats_overview.two .stats_overview_controls .type').removeClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });
    }
    if(lastOpened != 3) {
        $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').animate({height:'0px'}, 500, function() {
            $(document).off('click', toggleStatisticsCountryDropdown);
            statisticsCountryDropdownOpen = false;
            $('.stats_overview.two .stats_overview_controls .location').removeClass("open");
            $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').css({height: ''}).hide().removeClass("open");
        });
    }
});

var toggleTimePeriod1 = (function(event) {
    $('.stats_overview.one .stats_overview_controls .time_period ul.time_options li[data-time-period]').removeClass("active");
    if(currWorldStatisticsTimePeriod) {
        $(".stats_overview.one .stats_overview_controls .time_period ul.time_options li[data-time-period='0']").addClass("active");
        currWorldStatisticsTimePeriod = 0;
    } else {
        $(".stats_overview.one .stats_overview_controls .time_period ul.time_options li[data-time-period='1']").addClass("active");
        currWorldStatisticsTimePeriod = 1;
    }
    loadStatisticsWorldData(false);
    closeDropdowns(0);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var toggleTimePeriod2 = (function(event) {
    $('.stats_overview.two .stats_overview_controls .time_period ul.time_options li[data-time-period]').removeClass("active");
    if(currCountryStatisticsTimePeriod) {
        $(".stats_overview.two .stats_overview_controls .time_period ul.time_options li[data-time-period='0']").addClass("active");
        currCountryStatisticsTimePeriod = 0;
    } else {
        $(".stats_overview.two .stats_overview_controls .time_period ul.time_options li[data-time-period='1']").addClass("active");
        currCountryStatisticsTimePeriod = 1;
    }
    loadStatisticsCountryData(false,false);
    closeDropdowns(0);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var changedDetectionType1 = (function(event) {
    $('.stats_overview.one .stats_overview_controls .type').removeClass("open");
    $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu').removeClass("open");
    $(document).off('click', toggleStatisticsDropdown1);
        
    currWorldStatisticsDetectionType = $(event.target).attr('data-detection-type');
    $('.stats_overview.one .stats_overview_controls .type .label.english').html($('.english', $(event.target).parent()).html());
    loadStatisticsWorldData(false);
    
    closeDropdowns(0);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var changedDetectionType2 = (function(event) {
    $('.stats_overview.two .stats_overview_controls .type').removeClass("open");
    $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu').removeClass("open");
    $(document).off('click', toggleStatisticsDropdown2);
    
    currCountryStatisticsDetectionType = $(event.target).attr('data-detection-type');
    $('.stats_overview.two .stats_overview_controls .type .label.english').html($('.english', $(event.target).parent()).html());
    loadStatisticsCountryData(false,false);
    
    closeDropdowns(0);
    event.preventDefault();
    event.stopPropagation();
    return false;
});

var changedDetectionCountry = (function(event) {
    closeDropdowns(0);
    $('.stats_overview.two .stats_overview_controls .location').removeClass("open");
    $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu').removeClass("open");
    statisticsCountryDropdownOpen = false;
    $(document).off('click', toggleStatisticsCountryDropdown);
        
    currCountryStatisticsCountry = $(event.target).closest("a").attr('data-country-id');
    $('.stats_overview.two .stats_overview_controls .location .label.english').html($('ul.english li a[data-country-id="'+currCountryStatisticsCountry+'"]').html());
    loadStatisticsCountryData(false,false);
    event.preventDefault();
    event.stopPropagation();
    return false;
});

var statisticsCountryDropDownKeyUpEvent = (function(event) {
    if(statisticsCountryDropdownOpen) {
        var keyCode = (typeof event.which == "number") ? event.which : event.keyCode;
        var targetHelper = "";
        targetHelper = "data-first-char";
        var pressedChar = String.fromCharCode(keyCode);
        var targetElem = $($(".stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu ul li a["+targetHelper+"='"+pressedChar+"']")[0]);
        var containerElem = $(".stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu");
        if(isSet(targetElem) && (targetElem.length > 0) && isSet(containerElem) && (containerElem.length > 0)) {
            containerElem.animate({ scrollTop: (targetElem.position().top+containerElem.scrollTop())});
        }
    }
});


var statisticsScrollSize = 2.5;
var statisticsScrollInterval;
var isDraggingStatisticsDetectionTypes = false;
var lastStatisticsDetectionTypesTouchPos = {};
var currStatisticsDetectionTypesLeftPos = 0;

var fixStatisticsDetectionTypesScrollAfterResize = (function() { 
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    var containerElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types");  
    if(parseInt(barElem.css('marginLeft')) > 0) {
        barElem.css({'marginLeft': "0px"});
        currStatisticsDetectionTypesLeftPos = 0;
    }
    if(barElem.width() > containerElem.width()) {
        if(parseInt(barElem.css('marginLeft')) < -1*(barElem.width() - containerElem.width())) {
            barElem.css({'marginLeft': (-1*(barElem.width() - containerElem.width()))+"px"});
            currStatisticsDetectionTypesLeftPos = -1*(barElem.width() - containerElem.width());
        }
    } else {
        barElem.css({'marginLeft': "0px"});
    }
});
var statisticsDetectionTypesScroll = (function(direction) {
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    var containerElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types");
    if(direction == 0) {
        if((parseInt(barElem.css('marginLeft'))+statisticsScrollSize) < 0) {
            barElem.css({'marginLeft': (parseInt(barElem.css('marginLeft'))+statisticsScrollSize)+"px"});
            currStatisticsDetectionTypesLeftPos = parseInt(barElem.css('marginLeft'))+statisticsScrollSize;
        } else {
            barElem.css({'marginLeft': "0px"});
            currStatisticsDetectionTypesLeftPos = 0;
        }
    } else {
        if((parseInt(barElem.css('marginLeft'))-statisticsScrollSize) > -1*(barElem.width() - containerElem.width())) {
            barElem.css({'marginLeft': (parseInt(barElem.css('marginLeft'))-statisticsScrollSize)+"px"});
        } else {
            barElem.css({'marginLeft': (-1*(barElem.width() - containerElem.width()))+"px"});
        }
    }
    
    var checkPos = parseInt(barElem.css('marginLeft'));
    if(checkPos < 0) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "0.5");
    }
    if(checkPos > (-1*(barElem.width() - containerElem.width()))) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "0.5");
    }
    if(statisticsScrollSize < 15) {
        statisticsScrollSize += 0.25;
    }
});
var statisticsDetectionTypesScrollLeftStart = (function(event) {
    if(platformDetection.isMobile) {
        $('body').on('touchend', statisticsDetectionTypesScrollStop);
    } else {
        $('body').on('mouseup', statisticsDetectionTypesScrollStop);
    }
    statisticsScrollInterval = setInterval(function(){ statisticsDetectionTypesScroll(0); }, 25);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var statisticsDetectionTypesScrollRightStart = (function(event) {
    if(platformDetection.isMobile) {
        $('body').on('touchend', statisticsDetectionTypesScrollStop);
    } else {
        $('body').on('mouseup', statisticsDetectionTypesScrollStop);
    }
    statisticsScrollInterval = setInterval(function(){ statisticsDetectionTypesScroll(1); }, 25);
    event.preventDefault();
    event.stopPropagation();
    return false;
});
var statisticsDetectionTypesScrollStop = (function(event) {
    clearInterval(statisticsScrollInterval);
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    if(platformDetection.isMobile) {
        $('body').off('touchend', statisticsDetectionTypesScrollStop);
    } else {
        $('body').off('mouseup', statisticsDetectionTypesScrollStop);
    }
    currStatisticsDetectionTypesLeftPos = parseInt(barElem.css('marginLeft'));
    statisticsScrollSize = 1;
    event.preventDefault();
    event.stopPropagation();
    return false;
});

var beginStatisticsDetectionTypesDragScroll = (function(event) {
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    var containerElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types");
	if(!isDraggingStatisticsDetectionTypes) {
		isDraggingStatisticsDetectionTypes = true;
		lastStatisticsDetectionTypesTouchPos = {
            x: event.originalEvent.touches[0].pageX,
            y: event.originalEvent.touches[0].pageY
        };
		currStatisticsDetectionTypesLeftPos = parseInt(barElem.css('marginLeft'));
	}
    var checkPos = parseInt(barElem.css('marginLeft'));
    if(checkPos < 0) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "0.5");
    }
    if(checkPos > (-1*(barElem.width() - containerElem.width()))) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "0.5");
    }
});
var endStatisticsDetectionTypesDragScroll = (function(event) {
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    var containerElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types");
	if(isDraggingStatisticsDetectionTypes) {
		if(parseInt(barElem.css("marginLeft")) > 0) {
			barElem.css({'marginLeft': "0px"});
		}
		if(parseInt(barElem.css("marginLeft")) < (-1*(parseInt(barElem.css("width")) - parseInt(containerElem.css("width"))))) {
			barElem.css({'marginLeft': (-1*(parseInt(barElem.css("width")) - parseInt(containerElem.css("width"))))+"px"});
		}
		isDraggingStatisticsDetectionTypes = false;
	}
    var checkPos = parseInt(barElem.css('marginLeft'));
    if(checkPos < 0) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "0.5");
    }
    if(checkPos > (-1*(barElem.width() - containerElem.width()))) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "0.5");
    }
});
var moveStatisticsDetectionTypesDragScroll = (function(event) {
    var barElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types .type-icons");
    var containerElem = $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types");
	if(isDraggingStatisticsDetectionTypes) {
		if(parseInt(barElem.css("width")) > parseInt(containerElem.css("width"))) {
			var newLeft = 0;
			if(isSet(event.originalEvent.touches)) {
				newLeft = (lastStatisticsDetectionTypesTouchPos.x-event.originalEvent.touches[0].pageX);
			} else {
				newLeft = (lastStatisticsDetectionTypesTouchPos.x-event.pageX);
			}
			newLeft = currStatisticsDetectionTypesLeftPos-newLeft;			
			if(newLeft > 0) { newLeft = 0; }
			if(newLeft < (-1*(parseInt(barElem.css("width")) - parseInt(containerElem.css("width"))))) {
				newLeft = (-1*(parseInt(barElem.css("width")) - parseInt(containerElem.css("width"))));
			}
			barElem.css({'marginLeft': newLeft+"px"});
		}
	}
    var checkPos = parseInt(barElem.css('marginLeft'));
    if(checkPos < 0) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "0.5");
    }
    if(checkPos > (-1*(barElem.width() - containerElem.width()))) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "1");
    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").css("opacity", "0.5");
    }
});

var addStatisticsEvents = (function() {
    $('.stats_overview.one .stats_overview_controls .type').on('click', toggleStatisticsDropdown1);
    $('.stats_overview.one .stats_overview_controls .time_period').on('click', toggleTimePeriod1);
    $('.stats_overview.one .stats_overview_controls .statistics_dropdown_menu a[data-detection-type]').on('click', changedDetectionType1);

    $('.stats_overview.two .stats_overview_controls .location').on('click', toggleStatisticsCountryDropdown);
    $('.stats_overview.two .stats_overview_controls .statistics_country_dropdown_menu a[data-country-id]').on('click', changedDetectionCountry);

    $( document ).on("keyup", statisticsCountryDropDownKeyUpEvent);

    $('.stats_overview.two .stats_overview_controls .type').on('click', toggleStatisticsDropdown2);
    $('.stats_overview.two .stats_overview_controls .time_period').on('click', toggleTimePeriod2);
    $('.stats_overview.two .stats_overview_controls .statistics_dropdown_menu a[data-detection-type]').on('click', changedDetectionType2);

    $('.most_infected_links li a').on('click', clickCountry);

    if(platformDetection.isMobile) {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").on('touchstart', statisticsDetectionTypesScrollLeftStart);
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").on('touchstart', statisticsDetectionTypesScrollRightStart);


		$("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types").on('touchstart', beginStatisticsDetectionTypesDragScroll);
		$('body').on('touchend', endStatisticsDetectionTypesDragScroll);
		$('body').on('touchmove', moveStatisticsDetectionTypesDragScroll);

    } else {
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").on('mousedown', statisticsDetectionTypesScrollLeftStart);
        $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_right").on('mousedown', statisticsDetectionTypesScrollRightStart);
    }
    $("div.subpage[data-subpage='2'] .statistics_detection_types_container .statistics_detection_types_left").css("opacity", "0.5");
});
var buildDetectionTypeDropdowns = (function() {
    var dropdownMenu = $("<div>").addClass('statistics_dropdown_menu');
    var dropdownMenuList = $("<ul>");
    var dropdownMenuListItem = $("<li>");
    var dropdownMenuListItemLink = $("<a>");
    
    var dropDownMenuWorld = dropdownMenu.clone();
    var dropDownMenuCountry = dropdownMenu.clone().css({left:"33%"});
    var dropdownMenuListWorld = dropdownMenuList.clone();
    var dropdownMenuListCountry = dropdownMenuList.clone();
    
    $.each(detectionTypes, function( dt_index, dt_value ) {
        var dropdownMenuListItemWorld = dropdownMenuListItem.clone();
        var dropdownMenuListItemCountry = dropdownMenuListItem.clone();
        var dropdownMenuListItemLinkWorld = dropdownMenuListItemLink.clone().attr('data-detection-type', dt_value.id);
        var dropdownMenuListItemLinkCountry = dropdownMenuListItemLink.clone().attr('data-detection-type', dt_value.id);
        var dropdownMenuListItemLinkWorldEnglish = $("<span>").addClass("english").html(dt_value.name).attr('data-detection-type', dt_value.id);
        var dropdownMenuListItemLinkCountryEnglish = $("<span>").addClass("english").html(dt_value.name).attr('data-detection-type', dt_value.id);

        dropdownMenuListItemLinkWorld.append(dropdownMenuListItemLinkWorldEnglish);
        dropdownMenuListItemWorld.append(dropdownMenuListItemLinkWorld);
        dropdownMenuListWorld.append(dropdownMenuListItemWorld);
                
        if (dt_value.id !== 'bad') {
            // no BAD option for country
            dropdownMenuListItemLinkCountry.append(dropdownMenuListItemLinkCountryEnglish);
            dropdownMenuListItemCountry.append(dropdownMenuListItemLinkCountry);
            dropdownMenuListCountry.append(dropdownMenuListItemCountry);
        }
    });
    
    dropDownMenuWorld.append(dropdownMenuListWorld);
    dropDownMenuCountry.append(dropdownMenuListCountry);
    
    $('.stats_overview.one .stats_overview_controls').append(dropDownMenuWorld);
    $('.stats_overview.two .stats_overview_controls').append(dropDownMenuCountry);
});
var buildStatisticsCountryDropdown = (function() {    
    var dropdownMenu = $("<div>").addClass('statistics_country_dropdown_menu');
    var dropdownMenuList_English = $("<ul>").addClass("english");
    var dropdownMenuListItem = $("<li>");
    var dropdownMenuListItemLink = $("<a>");
    
    countriesObjs.sort(function(a, b){
        if (a.value == b.value) { return 0; }
        return (a.value < b.value) ? -1 : 1;
    });
    
    $.each(countriesObjs, function( country_index, country_obj ) {
        var country_id = country_obj.id;
        var country_value_en = country_obj.value;
        if((country_id > 0) && isSet(country_value_en)) {
            var myDropdownMenuListItem = dropdownMenuListItem.clone();
            var myDropdownMenuListItemLink = dropdownMenuListItemLink.clone().attr('data-country-id', country_id);
            myDropdownMenuListItemLink.attr('data-first-char', country_value_en.charAt(0).toUpperCase());
            var myDropdownMenuListItemLinkEnglish = $("<span>").addClass("english").html(country_value_en);

            myDropdownMenuListItemLink.append(myDropdownMenuListItemLinkEnglish);
            myDropdownMenuListItem.append(myDropdownMenuListItemLink);
            dropdownMenuList_English.append(myDropdownMenuListItem);
        }
    });
    
    dropdownMenu.append(dropdownMenuList_English);
    $('.stats_overview.two .stats_overview_controls').append(dropdownMenu);
    
    if(detectedCountryId == -1) {
        var firstCountry = countriesObjs[0];

        if(isSet(firstCountry.id)) {
            lastCountryStatisticsCountry = currCountryStatisticsCountry = firstCountry.id;
        } else {
            lastCountryStatisticsCountry = currCountryStatisticsCountry = 1;
        }
        $('.stats_overview.two .stats_overview_controls .location .label.english').html(firstCountry.value);
    } else {
        lastCountryStatisticsCountry = currCountryStatisticsCountry = detectedCountryId;
        $('.stats_overview.two .stats_overview_controls .location .label.english').html(countries[detectedCountryId]);
    }
});

var addStatisticsDetectionTypeEvents = (function() {
    $('.statistics_detection_types ul.type-icons li[data-detectiontype]').on('click', detectionTypeClick);
});

// =======================================================
var worldStatsTaskListComplete = (function() {
    if (logToConsole) console.log("WorldStatsTaskList done!");
    $('.stats_overview.one .stats_content .'+nextWorldStatisticsContentPane).append($("<div>").css('clear', 'both'));
    $('.stats_overview.one .stats_content .'+currWorldStatisticsContentPane).animate({left: '-100%'});
    $('.stats_overview.one .stats_content .'+nextWorldStatisticsContentPane).animate({left: '0%'}, {duration: 500, complete: (function() {
        $('.stats_overview.one .stats_content .'+currWorldStatisticsContentPane).css('left', '100%').empty();
        $('.stats_overview.one .stats_content').css({
            height: '',
            overflow: ''
        });
        $('.stats_overview.one .stats_content .stats_content_one').css({position:'',paddingTop:''});
        $('.stats_overview.one .stats_content .stats_content_two').css({position:'',paddingTop:''});
        $(".stats_overview.one .loader").fadeOut();
        
        currWorldStatisticsContentPane = nextWorldStatisticsContentPane;
    })});
    
    setTimeout(function() { applyLanguage(2); }, 50);
    
    worldStatsTaskListRunning = false;
});
var addTooWorldStatsTaskList = (function(functionName, functionArgs) {
    var taskId = lastWorldTaskId+1;
    if (logToConsole) console.log("addTooWorldStatsTaskList called");
    functionArgs.push(runNextInWorldStatsTaskList);
    functionArgs.push([]); //taskId
    worldStatsTaskList.push([taskId, functionName, functionArgs]);
    if (logToConsole) console.log(" -> added task: "+taskId);
    lastWorldTaskId = taskId;
});
var runNextInWorldStatsTaskList = (function() {
    if(worldStatsTaskList.length > 0) {
        worldStatsTaskListRunning = true;
        var currTask = worldStatsTaskList[0];
        var currFunc = window[currTask[1]];
        var currFuncArgs = currTask[2];
        if(typeof currFunc === 'function') {
            if (logToConsole) console.log(" -> calling task: "+currTask[0]);
            if (logToConsole) console.log(" -> function name: "+currTask[1]);
            if (logToConsole) console.log(" -> function args: ",currFuncArgs);
            currFunc.apply(this, currFuncArgs);
            worldStatsTaskList.shift();
        }
    } else {
        if(worldStatsTaskListRunning) {
            setTimeout(worldStatsTaskListComplete, 500);
        }
    }
});
var removeFromWorldStatsTaskList = (function(taskId) {
    if(worldStatsTaskList.length > 0) {
        var matchedTaskIndex = -1;
        $.each(worldStatsTaskList, function( wstl_index, wstl_value ) {
            if (logToConsole) console.log("comparing task ids: ", taskId, wstl_value[0]);
            if(wstl_value[0] == taskId) {
                matchedTaskIndex = wstl_index;
            }
            if(wstl_index == worldStatsTaskList.length-1) {
                if(matchedTaskIndex > -1) {
                    worldStatsTaskList.splice(matchedTaskIndex, 1);
                } else {
                    if (logToConsole) console.log("couldnt remove task?!");
                    worldStatsTaskList.splice(matchedTaskIndex, 1);
                }                
                if (logToConsole) console.log("removeFromWorldStatsTaskList called");      
                if (logToConsole) console.log(" -> task: "+taskId);
                if(worldStatsTaskList.length > 0) {
                    if (logToConsole) console.log(" -> running another task");
                    runNextInWorldStatsTaskList();
                } else {
                    if (logToConsole) console.log(" -> task list complete")
                }
            }
        });        
    }
});
// =======================================================
var countryStatsTaskListComplete = (function() {
    if (logToConsole) console.log("CountryStatsTaskList done!");
    $('.stats_overview.two .stats_content .'+nextCountryStatisticsContentPane).append($("<div>").css('clear', 'both'));
    $('.stats_overview.two .stats_content .'+currCountryStatisticsContentPane).animate({left: '-100%'});
    $('.stats_overview.two .stats_content .'+nextCountryStatisticsContentPane).animate({left: '0%'}, {duration: 500, complete: (function() {
        $('.stats_overview.two .stats_content .'+currCountryStatisticsContentPane).css('left', '100%').empty();
        $('.stats_overview.two .stats_content').css({
            height: '',
            overflow: ''
        });
        $('.stats_overview.two .stats_content .stats_content_one').css({position:'',paddingTop:''});
        $('.stats_overview.two .stats_content .stats_content_two').css({position:'',paddingTop:''});
        $(".stats_overview.two .loader").fadeOut();
        
        currCountryStatisticsContentPane = nextCountryStatisticsContentPane;
    })});
    
    setTimeout(function() { applyLanguage(2); }, 50);
    
    countryStatsTaskListRunning = false;
});
var addTooCountryStatsTaskList = (function(functionName, functionArgs) {
    var taskId = lastCountryTaskId+1;
    if (logToConsole) console.log("addTooCountryStatsTaskList called");
    functionArgs.push(runNextInCountryStatsTaskList);
    functionArgs.push([]); //taskId
    countryStatsTaskList.push([taskId, functionName, functionArgs]);
    if (logToConsole) console.log(" -> added task: "+taskId);
    lastCountryTaskId = taskId;
});
var runNextInCountryStatsTaskList = (function() {
    if(countryStatsTaskList.length > 0) {
        countryStatsTaskListRunning = true;
        var currTask = countryStatsTaskList[0];
        var currFunc = window[currTask[1]];
        var currFuncArgs = currTask[2];
        if(typeof currFunc === 'function') {
            if (logToConsole) console.log(" -> calling task: "+currTask[0]);
            if (logToConsole) console.log(" -> function name: "+currTask[1]);
            if (logToConsole) console.log(" -> function args: ",currFuncArgs);
            currFunc.apply(this, currFuncArgs);
            countryStatsTaskList.shift();
        }
    } else {
        if(countryStatsTaskListRunning) {
            setTimeout(countryStatsTaskListComplete, 500);
        }
    }
});
var removeFromCountryStatsTaskList = (function(taskId) {
    if(countryStatsTaskList.length > 0) {
        var matchedTaskIndex = -1;
        $.each(countryStatsTaskList, function( wstl_index, wstl_value ) {
            if (logToConsole) console.log("comparing task ids: ", taskId, wstl_value[0]);
            if(wstl_value[0] == taskId) {
                matchedTaskIndex = wstl_index;
            }
            if(wstl_index == countryStatsTaskList.length-1) {
                if(matchedTaskIndex > -1) {
                    countryStatsTaskList.splice(matchedTaskIndex, 1);
                } else {
                    if (logToConsole) console.log("couldnt remove task?!");
                    countryStatsTaskList.splice(matchedTaskIndex, 1);
                }                
                if (logToConsole) console.log("removeFromCountryStatsTaskList called");      
                if (logToConsole) console.log(" -> task: "+taskId);
                if(countryStatsTaskList.length > 0) {
                    if (logToConsole) console.log(" -> running another task");
                    runNextInCountryStatsTaskList();
                } else {
                    if (logToConsole) console.log(" -> task list complete")
                }
            }
        });        
    }
});
// =======================================================


var shareCurrCountryPopup = (function(shareToPlatform) {
    var url = "https://cybermap.kaspersky.com/?lang=" + window.lang.lang();
    var url_short = "https://kas.pr/map";
    var redirect_url = "https://cybermap.kaspersky.com/fb_share_finish.html";
    var title = $('.header h1').html().replace(/<(?:.|\n)*?>/gm, '');
    var image = "https://cybermap.kaspersky.com/assets/images/social_share.jpg";
    var return_url = "";
    
    var country_name = $('#countrypop_title').html();
    var country_rank = $('#countrypop_ranking').text();
    country_rank = "#"+country_rank+" " + window.lang.getText("MOST_ATTACKED_COUNTRY");

    var hastags = window.lang.getText("SOCIAL_HASH_TAGS");

    
    url = encodeURIComponent(url);
    url_short = encodeURIComponent(url_short);
    redirect_url = encodeURIComponent(redirect_url);
    title = encodeURIComponent(title);
    image = encodeURIComponent(image);
    country_name = encodeURIComponent(country_name);
    country_rank = encodeURIComponent(country_rank);
    hastags = encodeURIComponent(hastags);

    var devider = encodeURIComponent(" | ");
    var text = country_name+devider+country_rank+devider + hastags;
    
    switch(shareToPlatform) {
        case "facebook":
            return_url = 'https://www.facebook.com/dialog/feed?app_id=634328833377154&display=popup&caption='+title+'%20-%20'+country_name+'&name='+title+'&link='+url+'&description='+text+'&picture=https%3A%2F%2Fcybermap.kaspersky.com%2Fassets%2Fimages%2Fsocial_share.jpg';
            break;
        case "twitter":
            return_url = 'http://twitter.com/share?text='+text+'&url='+url_short;
            break;
        case "gplus":
            return_url = text;
            break;
        case "vk":
            return_url = 'http://vkontakte.ru/share.php?url='+url+'&title='+title+'&description='+text+'&image='+image+'&noparse=true';
            break;
        default:
            if (logToConsole) console.log("Cant share countrypop, dont know "+shareToPlatform);
    }
    return return_url;
});

var loadStatisticsWorldData = (function(firstRun) {
    if(!firstRun) {
        $(".stats_overview.one .loader").fadeIn();
        //$(".content").animate({ scrollTop: ($(".stats_overview.one").position().top+$(".content").scrollTop()) });
        nextWorldStatisticsContentPane = (currWorldStatisticsContentPane == "stats_content_one") ? "stats_content_two" : "stats_content_one";
        
        var currStatsContentHeight = $('.stats_overview.one .stats_content').innerHeight();
        $('.stats_overview.one .stats_content').css({
            height: currStatsContentHeight+'px',
            overflow: 'hidden'
        });
        $('.stats_overview.one .stats_content .stats_content_one').css({position:'absolute'});
        $('.stats_overview.one .stats_content .stats_content_two').css({position:'absolute'});
        $('.stats_overview.one .stats_content .'+nextWorldStatisticsContentPane).css('left', '100%').empty();
    }
    
    var timePeriod = (currWorldStatisticsTimePeriod == 0) ? 'w' : 'm';
    addTooWorldStatsTaskList("loadSecureListData", [{country_id:0,data_type:'country',detection_type:currWorldStatisticsDetectionType,time_period:timePeriod},"world"]);
    addTooWorldStatsTaskList("loadSecureListData", [{country_id:0,data_type:'graph',detection_type:currWorldStatisticsDetectionType,time_period:timePeriod},"world"]);

    if (currWorldStatisticsDetectionType !== 'bad') {
        // no top10 for bad
        addTooWorldStatsTaskList("loadSecureListData", [{country_id:0,data_type:'top10',detection_type:currWorldStatisticsDetectionType,time_period:timePeriod},"world"]);
    }

    runNextInWorldStatsTaskList();
});


var loadStatisticsCountryData = (function(firstRun,scrollToo) {
    if(!firstRun) {
        $(".stats_overview.two .loader").fadeIn();
        if(scrollToo) {
            $(".content").animate({ scrollTop: ($(".stats_overview.two").position().top+$(".content").scrollTop()) });
        }
        nextCountryStatisticsContentPane = (currCountryStatisticsContentPane == "stats_content_one") ? "stats_content_two" : "stats_content_one";
        
        var currStatsContentHeight = $('.stats_overview.two .stats_content').innerHeight();
        $('.stats_overview.two .stats_content').css({
            height: currStatsContentHeight+'px',
            overflow: 'hidden'
        });
        $('.stats_overview.two .stats_content .stats_content_one').css({position:'absolute'});
        $('.stats_overview.two .stats_content .stats_content_two').css({position:'absolute'});
        $('.stats_overview.two .stats_content .'+nextCountryStatisticsContentPane).css('left', '100%').empty();
    }
    var timePeriod = (currCountryStatisticsTimePeriod == 0) ? 'w' : 'm';
    if (currCountryStatisticsCountry == -1) {
        currCountryStatisticsCountry = countriesObjs[0].id;
    }
    addTooCountryStatsTaskList("loadSecureListData", [{country_id:currCountryStatisticsCountry,data_type:'graph',detection_type:currCountryStatisticsDetectionType,time_period:timePeriod},"country"]);
    addTooCountryStatsTaskList("loadSecureListData", [{country_id:currCountryStatisticsCountry,data_type:'top10',detection_type:currCountryStatisticsDetectionType,time_period:timePeriod},"country"]);
    runNextInCountryStatsTaskList();
});


var statisticsPageLoaded = (function() {

    $.each(detectionTypes, function( dt_index, dt_value ) {
        if(dt_value.active == 0) {
            $("ul.type-icons li[data-detectiontype='"+dt_value.id+"']").addClass("disabled");
        }
    });

    buildDetectionTypeDropdowns();
    buildStatisticsCountryDropdown();
    loadStatisticsWorldData(true);
    // loadStatisticsCountryData(true,false);
    addStatisticsEvents();
    addStatisticsDetectionTypeEvents();

    if(isSet(lastTop5Data) && lastTop5Data.length) {
        updateTop5Names(lastTop5Data);

        for(var i = 0; i < 5; i++) {
            $($('.most_infected_links a')[i]).attr('data-country-id', lastTop5Data[i].key);
            $('.name .english', $($('.most_infected_links a')[i])).html(lastTop5Data[i].name);
        }
    }


    var graph_canvas = $('#graph')[0];
    MAP.attach_graph_canvas(graph_canvas);
});

var loadBuzzContent = (function() {
    $('.buzz_content .buzz_column').empty();
    var newBlock = $('<div>').addClass("buzz_block");
    var newBlockContent = $('<div>').addClass("buzz_block_content");
    var newBlockContent_Img = $('<img>').addClass("image");
    var newBlockContent_Info = $('<div>').addClass("info");
    var newBlockContent_Title = $('<h1>').addClass("title");
    var newBlockContent_BtnLink = $('<a>').attr('target', '_blank');
    var newBlockContent_Btn = $('<button>').addClass("buzz_btn fancy_btn_wide white multiline");
    var newBlockContent_Btn_Icon_Normal = $('<i>').addClass("icon");
    var newBlockContent_Btn_Arrow_Normal = $('<i>').addClass("arrow normal");
    var newBlockContent_Btn_Arrow_Hover = $('<i>').addClass("arrow hover");
    
    var currCol = "left";

    var lang_code = window.lang.lang();

    function timestamp_to_locale_date_string(timestamp) {
        var options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        var ts = parseInt(timestamp) * 1000;
        return (new Date(ts)).toLocaleDateString(lang_code, options);
    }

    function add_post(buzz_val) {
        var myBlock = newBlock.clone();
        var myBlockContent = newBlockContent.clone();
        if(isSet(buzz_val.image_url) && (buzz_val.image_url != "")) {
            var httpsImgUrl = buzz_val.image_url.replace(/^http:\/\//i, 'https://');
            var myBlockContent_Img = newBlockContent_Img.clone().attr('src', httpsImgUrl);
        }

        var myBlockContent_Info = newBlockContent_Info.clone().html(timestamp_to_locale_date_string(buzz_val.timestamp));
        var myBlockContent_Title = newBlockContent_Title.clone().html(buzz_val.title);

        var buttonText = window.lang.getText('BUZZ_CTA_' + buzz_val.source.toUpperCase());

        var myBlockContent_BtnLink = newBlockContent_BtnLink.clone().attr('href', buzz_val.link);
        var myBlockContent_Btn = newBlockContent_Btn.clone().addClass(buzz_val.source).html(buttonText);
        var myBlockContent_Btn_Icon_Normal = newBlockContent_Btn_Icon_Normal.clone();
        var myBlockContent_Btn_Arrow_Normal = newBlockContent_Btn_Arrow_Normal.clone();
        var myBlockContent_Btn_Arrow_Hover = newBlockContent_Btn_Arrow_Hover.clone();

        myBlockContent_Btn.append(myBlockContent_Btn_Icon_Normal);
        myBlockContent_Btn.append(myBlockContent_Btn_Arrow_Normal);
        myBlockContent_Btn.append(myBlockContent_Btn_Arrow_Hover);
        myBlockContent_BtnLink.append(myBlockContent_Btn);
        if(isSet(buzz_val.image_url) && (buzz_val.image_url != "")) {
            myBlockContent.append(myBlockContent_Img);
        }
        myBlockContent.append(myBlockContent_Info);
        myBlockContent.append(myBlockContent_Title);
        myBlockContent.append(myBlockContent_BtnLink);

        myBlock.append(myBlockContent);

        if(platformDetection.isMobile) {
            $('.buzz_content.english').append(myBlock);
        } else {
            $('.buzz_content.english .buzz_column.'+currCol).append(myBlock);                
            if(currCol == "left") { currCol = "right"; } else { currCol = "left"; }
        }
    }

    function add_posts(posts) {
        posts.sort(function(a, b) { return b.timestamp - a.timestamp });
        posts.forEach(add_post);
    }

    $.getJSON('assets/data/buzz.json', function(data) {
        var posts = data[lang_code];
        add_posts(posts);
    }).fail(function() {
        if (logToConsole) console.log("failed to load buzz content!");
    });
});
var addTosEvents = (function() {
    $(".site .content div[data-subpage='6'] .close_btn").on('click', function(e) {
        History.pushState({page_id:1, lang:window.lang.lang()}, "", langUrlPrefix+"/");
        $('.footer_links a.tos').css({'color':''});
    });
});
var loadPage = (function(page_id) {
    var newPage = $("<div>").attr('data-subpage', page_id).addClass("subpage");
    var mobileHtml = "";
    if(platformDetection.isMobile) {
        mobileHtml = "_mobile";
    }
    $('.wrapper .site .content').append(newPage);
    if(page_id == 2) {
        newPage.load("subpages/statistics"+mobileHtml+".php?ck="+timeStamp(), function() {
            setTimeout(function() { applyLanguage(2); }, 50);
            setTimeout(statisticsPageLoaded, 250);
        });
    }
    if(page_id == 3) {
        newPage.load("subpages/subsystems"+mobileHtml+".php?ck="+timeStamp(), function() {
            setTimeout(function() { applyLanguage(3); }, 50);
        });
    }
    if(page_id == 4) { 
        newPage.load("subpages/buzz"+mobileHtml+".html?ck="+timeStamp(), function() {
            setTimeout(function() { applyLanguage(4); }, 50);
            setTimeout(loadBuzzContent, 250);
        });
    }
    if(page_id == 5) {
        newPage.load("subpages/widget-setup.php?ck="+timeStamp(), function() {
            setTimeout(function() { applyLanguage(5); }, 50);
            setTimeout(function() { initWidgetSetup(); }, 250); // initWidgetSetup is defined in assets/scripts/widget-setup.js
        });
    }
    if(page_id == 6) {
        newPage.load("subpages/terms_and_conditions.php?ck="+timeStamp(), function() {
            setTimeout(function() { applyLanguage(6); }, 50);
            setTimeout(function() { addTosEvents(); }, 250);
        });
    }
});
var openPage = (function(page_id) {
    $('.screensaver_download_popup').hide();
    closeDropdowns(0);
    if(currPageId != page_id) {
        $(".menu li a[data-subpage]").removeClass("active");
        $(".menu li a[data-subpage='"+page_id+"']").addClass("active");
        $('.content').scrollTop(0);
        if(page_id == 1) {
            if(currPageId == 5) { pauseWidget(); } // this function is defined in widget-setup.js
            closeSite();
        } else {
            $("div[data-subpage]").hide();
            if($("div[data-subpage='"+page_id+"']").length < 1) {
                loadPage(page_id);
            } else {
                if(page_id == 5) { resumeWidget(); } // this function is defined in widget-setup.js
                $("div[data-subpage='"+page_id+"']").show();
            }
            if(!siteOpen) { openSite(); }
        }
        currPageId = page_id;
    }
});
var updateStatisticsGraphSize = (function() {
    var graphWidth = $('.site .content .subpage .stats_leader .graph').outerWidth()+"px";
    var graphHeight = $('.site .content .subpage .stats_leader .graph').outerHeight()+"px";
    
    $('.site .content .subpage .stats_leader .graph').attr('width', graphWidth).attr('height', graphHeight);
});
var initGAPIForSharing = (function() {
    gapi.interactivepost.render('sharePost', googleShareSettingsBase); // prepare gapi interactivepost 
});
var addCountryPopEvents = (function() {
    $('#countrypop .countrypop_social .sharing_icons .facebook').on('click', function(e){ window.open(shareCurrCountryPopup("facebook")); });
    $('#countrypop .countrypop_social .sharing_icons .twitter').on('click', function(e){ window.open(shareCurrCountryPopup("twitter")); });
    $('#countrypop .countrypop_social .sharing_icons .gplus').on('click', function(e){ window.open(shareCurrCountryPopup("gplus")); });
    $('#countrypop .countrypop_social .sharing_icons .vk').on('click', function(e){ window.open(shareCurrCountryPopup("vk")); });
});

var addHistoryJsSupport = (function() {
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        openPage(parseInt(State.data.page_id));
    });
    var initialState = History.getState();
    var initialPageId = 1;
    var initialPageTitle = "";
    var initialPageUrl = "/";
    var hashParts1 = initialState.hash.split( '?' );
    var hashParts2 = (hashParts1[0]+"/").split( '/' );
    $.each(hashParts2, function( index, value ) {
        if(value != "") {
            // if(value == "ru") {
            //     langUrlPrefix = "/ru";
            // }
            if(value == "stats") {
                initialPageId = 2;
                initialPageTitle = window.lang.getText("MENU_STATISTICS");
                initialPageUrl = "/stats/";
            }
            if(value == "subsystems") {
                initialPageId = 3;
                initialPageTitle = window.lang.getText("MENU_DATA_SOURCES");
                initialPageUrl = "/subsystems/";
            }
            if(value == "buzz") {
                initialPageId = 4;
                initialPageTitle = window.lang.getText("MENU_BUZZ");
                initialPageUrl = "/buzz/";
            }
            if(value == "widget") {
                initialPageId = 5;
                initialPageTitle = window.lang.getText("MENU_WIDGET");
                initialPageUrl = "/widget/";
            }
            if(value == "tos") {
                initialPageId = 6;
                initialPageTitle = window.lang.getText("TERMS_OF_SERVICE");
                initialPageUrl = "/tos/";
            }
            if(value == "bad") {
                initialPageId = 1;
                initialPageTitle = "";
                initialPageUrl = "/bad/";

                $('.subheader .menu').hide();
                $('.detection_types').hide();

                MAP.is_bad_mode = true;

                //MAP.set_bad_mode(true);
            }
        }
    });

    //if((initialPageId == 1) && (initialLanguage != 1)) { initialPageUrl = "/"; }
    History.replaceState({page_id:initialPageId}, initialPageTitle, langUrlPrefix+initialPageUrl+niceUrlQueryParamsFix());

    if(initialPageId == 6) {
        $('.footer_links a.tos').css({'color':'#629c7f'});
    }
    openPage(initialPageId);
});

var updateTop5Names = function(data){
    $.each(data, function( top_index, top_value ) {
        data[top_index].name = countriesDict[top_value.key];
    });
};
