// document ready event
$(document).ready(function () {

    // Show-hide footer for mobile version
    $('#footer_openclose_button').on('click', function (event) {
        if ($('#footer').hasClass('closed')) {
            $('#footer').removeClass('closed');
            $('#footer_openclose_button').removeClass('closed');
            $('#footer').animate({height: '160px'}, 250);
        }
        else {
            $('#footer').addClass('closed');
            $('#footer_openclose_button').addClass('closed');
            $('#footer').animate({height: '50px'}, 250);
        }
    });

    // Show download
    $('#footer_screensaver').on('click', function (event) {
        closeDropdowns();
        $('.screensaver_download_bg').show();
        $('.screensaver_download_popup').show();
        ga('send', 'event', {
            eventCategory: 'Download screensaver',
            eventAction: 'Download',
            eventLabel: window.lang.getText("FOOTER_DOWNLOAD_SCREENSAVER") + window.lang.name
        });
        return false;
    });

    $('.screensaver_download_popup .popclose, .screensaver_download_bg').on('click', function (event) {
        $('.screensaver_download_bg').hide();
        $('.screensaver_download_popup').hide();
        return false;
    });
});