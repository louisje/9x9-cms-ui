/*global cms */

(function ($geturl) {
    'use strict';

    $geturl.iniSharingList = function (inObj) {
        var strCid = '',
            strEid = '',
            strBrand = '',
            strBaseURL = 'http://www.9x9.tv/view?',
            strSurl = '',
            userUrlFile = cms.global.USER_URL.attr('file');

        if ('' === userUrlFile) {
            userUrlFile = 'index.html';
        }
        strBrand = inObj.find('.select-txt-gray').text();
        strCid = inObj.data('metach');
        strEid = inObj.data('metaep');
        if (userUrlFile === 'index.html') {
            strSurl = strBaseURL + ['brand=' + strBrand, 'ch=' + strCid].join('&');
        } else {
            strSurl = strBaseURL + ['brand=' + strBrand, 'ch=' + strCid, 'ep=e' + strEid].join('&');
        }

        return strSurl;
    };

    // NOTE: remember to change page-key to match func-name
}(cms.namespace('get-url')));