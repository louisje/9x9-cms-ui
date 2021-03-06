/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.channelPageSize = 28;

    $page._drawChannels = function (inPageSize, isEnd) {
        // /api/channels
        var cntStart = 0,
            cntEnd = 0,
            cntTotal = 0,
            pageCurrent = 0,
            tmpArr = [],
            tmpArr2 = [],
            strChannels = "";
        var i = 0;
        cntTotal = cms.global.USER_DATA["msoSource"].length;
        pageCurrent = cms.global.USER_DATA["pageInfo"].pageCurrent;

        cntStart = pageCurrent * inPageSize - inPageSize;
        cntEnd = pageCurrent * inPageSize;

        if (cntEnd > cntTotal) {
            cntEnd = cntTotal;
        }
        tmpArr = cms.global.USER_DATA["msoSource"];

        for (i = cntStart; i < cntEnd; i += 1) {
            tmpArr2.push(tmpArr[i]);
        }

        strChannels = tmpArr2.join(',');
        if (cms.global.USER_DATA["pageInfo"].pageCurrent == cms.global.USER_DATA["pageInfo"].pageTotal) {
            $(".load").hide();
        } else {
            $(".load").show();
        }

        nn.api('GET', cms.reapi('/api/channels'), {
            channels: strChannels
        }, function (itemChannel) {
            var cntitemChannel = itemChannel.length;
            var outChannels = [],
                tmpArr = [],
                strMinus = "";
            var i = 0;
            for (i = 0; i < cntitemChannel; i += 1) {
                tmpArr = [];
                strMinus = "";
                tmpArr = itemChannel[i];
                if (-1 === $.inArray(tmpArr.id, cms.global.USER_DATA["mosCurrent"])) {
                    strMinus = "on";
                }

                if ('' === tmpArr.imageUrl) {
                    tmpArr.imageUrl = "images/ch_default.png";
                }
                tmpArr.imageUrl = tmpArr.imageUrl.split('|')[0];

                tmpArr.msoMinus = strMinus;
                outChannels.push(tmpArr);
            }
            $('#store-chanels-li-tmpl').tmpl(outChannels).appendTo('.channel-list');
            $common.autoHeight();
            $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
            if (isEnd) {
                $('#store-slider .slider-vertical').slider('value', 0);
            }
            $('#overlay-s').fadeOut("slow");
            //console.log("scrollbar**" + $('#store-slider .slider-vertical').slider('value'));
        });
    };

    $page.listCategory = function (inCategory, inCatId) {
        $("#store-category-ul").html('');
        $('#store-category-li-tmpl').tmpl(inCategory, {
            actCat: inCatId
        }).appendTo('#store-category-ul');
        $(".func_name").text($("#store-category-ul li.on").text());
    };

    $page.listCatChannel = function (inMsoId, inCatId, inPageSize) {
        console.log("inMsoId: " + inMsoId);
        // base
        nn.api('GET', cms.reapi('/api/store'), {
            categoryId: inCatId,
            sphere: cms.global.MSOINFO.supportedRegion
        }, function (channels) {
            var pageInfo = [];
            var cntChannelSource = channels.length;
            $('#portal-manage').html('');
            if (cntChannelSource > 0) {
                $(".form-title").text(nn._([cms.global.PAGE_ID, 'store-layer', "xxx channels in category:"], [cntChannelSource]));

                pageInfo["pageTotal"] = Math.ceil(cntChannelSource / inPageSize);
                pageInfo["pageCurrent"] = 1;
                if (pageInfo["pageTotal"] == 1) {
                    pageInfo["pageNext"] = 1;
                } else {
                    pageInfo["pageNext"] = 2;
                }

                cms.global.USER_DATA["pageInfo"] = pageInfo;
                cms.global.USER_DATA["msoSource"] = channels;
                console.log("cntChannelSource: " + cntChannelSource);
                nn.api('GET', cms.reapi('/api/mso/{msoId}/store', {
                    msoId: inMsoId
                }), {
                    categoryId: inCatId
                }, function (channelsMso) {
                    var cntChannelsMso = channelsMso.length;
                    if (cntChannelsMso > 0) {
                        cms.global.USER_DATA["mosCurrent"] = channelsMso;
                    } else {
                        cms.global.USER_DATA["mosCurrent"] = [];
                    }
                    $('.channel-list').html("");
                    $page._drawChannels(inPageSize, false);
                    //alert(cntChanels);
                });
            } else {
                $('#overlay-s').fadeOut("slow");
            }
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: store-manage',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        var pageInfo = [],
            msoSource = [],
            mosCurrent = [],
            msoId = 0,
            catId = 0;
        pageInfo["pageTotal"] = pageInfo["pageCurrent"] = pageInfo["pageNext"] = 0;

        cms.global.USER_DATA["pageInfo"] = pageInfo;
        cms.global.USER_DATA["msoSource"] = msoSource;
        cms.global.USER_DATA["mosCurrent"] = mosCurrent;

        var lang = cms.global.USER_DATA.lang;
        // /api/mso/{msoId}/store
        msoId = cms.global.MSO;

        if (msoId < 1) {
            location.href = "./";
        } else {
            //alert(lang);
            nn.api('GET', cms.reapi('/api/categories'), {
                lang: lang
            }, function (categories) {
                var cntCategories = categories.length;
                catId = categories[0].id;
                //$('#portal-manage').html('');
                if (cntCategories > 0 && catId != undefined && catId > 0) {
                    $page.listCategory(categories, catId);
                    $page.listCatChannel(msoId, catId, $page.channelPageSize);
                } else {
                    location.href = "./";
                }
            });

            $('#func-nav .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'func-nav', $(this).data('langkey')]));
            });
            $('#title-func .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
            });
            $('#store-layer .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'store-layer', $(this).data('langkey')]));
            });
            $common.autoHeight();
            $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('store-manage')));