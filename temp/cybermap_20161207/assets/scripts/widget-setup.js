/* widget setup code */
var $frame, $widget, $widget_config, $widget_config_defaults;
var fixHeaderPosition = (function() { }); // to be replaced by a function with the same name in interface.js

var initWidgetSetup = (function() {
    $widget_config = {
        width: localStorage.getItem("widget_width") || 640,
        height: localStorage.getItem("widget_height") || 640,
        language: localStorage.getItem("widget_language") || window.lang.lang(),
        theme: localStorage.getItem("widget_theme") || 'dark',
        type: localStorage.getItem("widget_type") || 'dynamic'
    };

    // prepare variables
    $frame = $('<iframe>').css({width:'100%', height:'100%', border: 'none'});
    if (localStorage.getItem("widget_type") == "dynamic")
    {
        $frame.attr('src', 'widget/dynamic.html');
    }
    else
    {
        $frame.attr('src', 'widget/static.html');
    }

    $widget = $('.kas-cybermap-widget')
        .width($widget_config.width)
        .height($widget_config.height)
        .append($frame);

    $widget_config_defaults = {
        language: 'en',
        theme: 'dark',
        type: 'dynamic'
    };

    // Reusing the gapi (muahahaha)
    //$frame[0].contentWindow.gapi = window.gapi;
    
    // Function to update the code field
    var update_code = (function() {
        var data = [];
        _.each($widget_config, function(v, k) {
            if ($widget_config_defaults[k] !== v)
                data.push(_.template('data-${name}="${value}"', { name:k, value:v }));
        });
        data = data.join(' ');

        var code = _.template([
            '<!-- '+window.lang.getText("WIDGET_TAG_DESCRIPTION")+' -->',
            '<script src="https://cybermap.kaspersky.com/assets/scripts/widget.js" async defer></'+'script>',
            '',
            '<!-- '+window.lang.getText("WIDGET_TAG_RENDER_DESCRIPTION")+' -->',
            '<div class="kas-cybermap-widget" ${data}></div>'
        ].join('\r\n'), {
            data: data
        });
        
        var email_body = _.template([
            window.lang.getText("WIDGET_TAG_DESCRIPTION"),
            '<script src="https://cybermap.kaspersky.com/assets/scripts/widget.js" async defer></script>',
            '',
            window.lang.getText("WIDGET_TAG_RENDER_DESCRIPTION"),
            '<div class="kas-cybermap-widget" ${data}></div>'
        ].join(escape("\n")), {
            data: data
        });

        encodeURIComponent(email_body);
        var mailToLink = 'mailto:?subject='+window.lang.getText("WIDGET_EMAIL_TOPIC")+'&body='+email_body;
        $('#widget-code').text(code);
        $('#widget-code-email-btn').off('click');
        $('#widget-code-email-btn').on('click', function(event) {
            event.preventDefault();
            window.open(mailToLink);
        });
        $('.widget-code-email-btn').attr('href', mailToLink);
    });
    update_code();

    function send_config_to_iframe() {
        var msg = JSON.stringify({ config: $widget_config });
        $frame[0].contentWindow.postMessage(msg, '*');
    }

    // Function to update the widget
    var update_widget = (function() {        
        var width = $("#width-slider-container").slider("option", "value");
        var height = $("#height-slider-container").slider("option", "value");
        var lang = get_selected_lang();
        var theme = $('#widgetform_toggle_btn_value_theme').val();
        var type = $('#widgetform_toggle_btn_value_type').val();
                
        $widget_config.width = width;
        $widget_config.height = height;
        $widget_config.language = lang;
        $widget_config.theme = theme;

        localStorage.setItem("widget_width", width);
        localStorage.setItem("widget_height", height);
        localStorage.setItem("widget_language", lang);
        localStorage.setItem("widget_theme", theme);
        localStorage.setItem("widget_type", type);

        if ($widget_config.type != type) {
            if (type == 'static') {
                $frame.attr('src', 'widget/static.html');
            } else {
                $frame.attr('src', 'widget/dynamic.html');
            }
            $widget_config.type = type;
            // reconfigure the iframe once loaded
            setTimeout(send_config_to_iframe, 500);
        }
        
        update_code();
        
        $widget.width($widget_config.width).height($widget_config.height);
        
        send_config_to_iframe();
        fixHeaderPosition();
    });

    send_config_to_iframe();

    // -- Sliders --
    var widgetWidthSliderSliding = false;
    var widgetWidthSliderStart = (function( event, ui ) { widgetWidthSliderSliding = true; });
    var widgetWidthSliderStop = (function( event, ui ) { widgetWidthSliderSliding = false; });
    var widgetWidthSliderChanged = (function( event, ui ) {
        setTimeout(function() {
            $('.input-width-label').html("<b>"+window.lang.getText("WIDGET_WIDTH")+"</b> - "+$( "#width-slider-container" ).slider( "option", "value" )+"px");
            $('#width-slider-active-bg').css({width: (parseInt($( "#width-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
            update_widget();
        }, 50);
    });

    var widgetHeightSliderSliding = false;
    var widgetHeightSliderStart = (function( event, ui ) { widgetHeightSliderSliding = true; });
    var widgetHeightSliderStop = (function( event, ui ) { widgetHeightSliderSliding = false; });  
    var widgetHeightSliderChanged = (function( event, ui ) {
        setTimeout(function() {
            $('.input-height-label').html("<b>"+window.lang.getText("WIDGET_HEIGHT")+"</b> - "+$( "#height-slider-container" ).slider( "option", "value" )+"px");
            $('#height-slider-active-bg').css({width: (parseInt($( "#height-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
            update_widget();
        }, 50);
    });
    
    $(document).mousemove(function(event){
        if(widgetWidthSliderSliding) $('#width-slider-active-bg').css({width: $( "#width-slider-container .ui-slider-handle" ).css("left")});
        if(widgetHeightSliderSliding) $('#height-slider-active-bg').css({width: $( "#height-slider-container .ui-slider-handle" ).css("left")});
    });        

    $( "#width-slider-container" ).slider({
        min: 200,
        max: 720,
        step: 10,
        value: $widget_config.width,
        change: widgetWidthSliderChanged,
        slide: widgetWidthSliderChanged,
        start: widgetWidthSliderStart,
        stop: widgetWidthSliderStop
    });
    $( "#height-slider-container" ).slider({
        min: 200,
        max: 720,
        step: 10,
        value: $widget_config.height,
        change: widgetHeightSliderChanged,
        slide: widgetHeightSliderChanged,
        start: widgetHeightSliderStart,
        stop: widgetHeightSliderStop
    });

    setTimeout(function() {
        $('#width-slider-active-bg').css({width: (parseInt($( "#width-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
        $('#height-slider-active-bg').css({width: (parseInt($( "#height-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
    }, 50);
    // window resize listener for the active bg's
    $(window).on('resize', function(){        
        $('#width-slider-active-bg').css({width: (parseInt($( "#width-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
        $('#height-slider-active-bg').css({width: (parseInt($( "#height-slider-container .ui-slider-handle" ).css("left"))+15)+"px"});
    });








    // -- Toggle buttons --
    // Function to handle toggleButton clicks
    var widgetFormToggleButtonClick = (function(event) {
        var toggleButton = $(event.target).parent();
        var labelPrefix = toggleButton.attr('data-label-prefix');
        var activeToggleButtonValue = $('.widgetform_toggle_btn_input', toggleButton).val();
        $('.widgetform_toggle_btn_option', toggleButton).each(function( index ) {
            if($(this).attr('data-value') == activeToggleButtonValue) {
                $(this).removeClass("active");
            } else {
                $(this).addClass("active");
                $('.widgetform_toggle_btn_input', toggleButton).val($(this).attr('data-value'));
                $(toggleButton.attr('data-label-selector')).html(labelPrefix+$('.value', this).html());
                //$(toggleButton.attr('data-label-selector')+'.english').html(labelPrefix+$('.english', this).html());
                setTimeout(function() {
                    update_widget();
                }, 50);
            }
        });
    });
    
    // Function to build the UI for a toggle button
    // > name should be a string and will be assigned to a hidden input, for reading out the toggle
    // > values should be an array like: [{label:'Fancy Name', val:'theme1'}, {label:'Fancy Name 2', val:'theme2'}]
    // > labelSelector should be a jquery selector string that points too the element containing the label.
    var widgetFormToggleButton = (function(name, values, labelSelector, labelPrefix) {
        var toggleButtonContainer = $("<div>").addClass('widgetform_toggle_btn').attr('data-label-selector', labelSelector).attr('data-label-prefix', labelPrefix);
        var toggleButtonTrigger = $("<div>").addClass('widgetform_toggle_btn_trigger');
        var toggleButtonOptionOne = $("<div>").addClass('widgetform_toggle_btn_option one').attr('data-value', values[0].val).attr('data-toggle-btn-name', name);
        var toggleButtonOptionOneElement = $("<div>").addClass("value").html(values[0].label);
        var toggleButtonOptionTwo = $("<div>").addClass('widgetform_toggle_btn_option two').attr('data-value', values[1].val).attr('data-toggle-btn-name', name);
        var toggleButtonOptionTwoElement = $("<div>").addClass("value").html(values[1].label);
        var toggleButtonFormInput = $("<input>").addClass('widgetform_toggle_btn_input').attr('type', 'hidden').attr('name', name).attr('id', 'widgetform_toggle_btn_value_'+name);

        if(values[0].active == 1) {
            toggleButtonOptionOne.addClass("active");
            toggleButtonFormInput.val(values[0].val);
            $(labelSelector).html(labelPrefix+values[0].label);
        } else if(values[1].active == 1) {
            toggleButtonOptionTwo.addClass("active");
            toggleButtonFormInput.val(values[1].val);
            $(labelSelector).html(labelPrefix+values[1].label);
        }
        
        toggleButtonOptionOne.append(toggleButtonOptionOneElement);
        toggleButtonContainer.append(toggleButtonOptionOne);
        toggleButtonOptionTwo.append(toggleButtonOptionTwoElement);
        toggleButtonContainer.append(toggleButtonOptionTwo);
        toggleButtonContainer.append(toggleButtonFormInput);        
        toggleButtonTrigger.on('click', widgetFormToggleButtonClick);
        toggleButtonContainer.append(toggleButtonTrigger);
                
        return toggleButtonContainer;
    });
    
    var langSelect = $('<select id="widget-lang-select">');

    var lang_options = (function() {
        // enumerate available languages
        var o = {};
        _.each(window.lang.languages, function(code) {
            o[code] = window.lang.getText('LANG_'+code.toUpperCase());
        });
        return o;
    }());

    _.each(lang_options, function(v, k) {
        // add an option element for each available language
        var o = $('<option value="' + k + '">' + v + '</option>');
        if (k == $widget_config.language)
            o = $('<option value="' + k + '" selected>' + v + '</option>');
        langSelect.append(o);
    });

    function get_selected_lang() {
        var lang = 'en';
        var lang = langSelect.find(':selected').val();
        return lang;
    }



    function update_lang_select_label() {
        var lang = get_selected_lang();
        var lang_label = lang_options[lang];
        $('#lang_toggle_container label').html(
            '<b>' + window.lang.getText('WIDGET_LANGUAGE') + '</b> - ' +
            lang_label);
    }
    update_lang_select_label();
    langSelect.on('change', function() {
        update_lang_select_label();
        setTimeout(function() {
            update_widget();
        }, 50);
    });






    var themeToggleBtn = widgetFormToggleButton(
        "theme",
        [{label:window.lang.getText("WIDGET_DARK_THEME"), val:'dark', active:($widget_config.theme == 'dark' ? 1 : 0)}, {label:window.lang.getText("WIDGET_LIGHT_THEME"), val:'light', active:($widget_config.theme == 'light' ? 1 : 0)}],
        "#theme_toggle_container label",
        "<b>"+window.lang.getText("WIDGET_COLOR_THEME")+"</b> - ");

    var typeToggleBtn = widgetFormToggleButton(
        "type",
        [{label:window.lang.getText("WIDGET_TYPE_DYNAMIC"), val:'dynamic', active:($widget_config.type == 'dynamic' ? 1 : 0)}, {label:window.lang.getText("WIDGET_TYPE_STATIC"), val:'static', active:($widget_config.type == 'static' ? 1 : 0)}],
        "#type_toggle_container label",
        "<b>"+window.lang.getText("WIDGET_TYPE")+"</b> - ");


    $('.input-width-label').html("<b>"+window.lang.getText("WIDGET_WIDTH")+"</b> - "+$( "#width-slider-container" ).slider( "option", "value" )+"px");
    $('.input-height-label').html("<b>"+window.lang.getText("WIDGET_HEIGHT")+"</b> - "+$( "#height-slider-container" ).slider( "option", "value" )+"px");
    $('#lang_toggle_container').append(langSelect);
    $('#theme_toggle_container').append(themeToggleBtn);
    $('#type_toggle_container').append(typeToggleBtn);

    // needed for it to pick up language change on page load
    setTimeout(function() {
        var initialPostMsg = JSON.stringify({ config: $widget_config });
        $frame[0].contentWindow.postMessage(initialPostMsg, '*');
    }, 500);
});

var pauseWidget = (function() {
    $frame[0].contentWindow.MAP.pause();
});
var resumeWidget = (function() {
    $frame[0].contentWindow.MAP.resume();
});

