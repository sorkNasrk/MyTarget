/**
 * 旗下基金首页
 */
define("ws/scripts/main/fund/tradelist", function (require, exports, module) {
    var pageId = "#main_fund_tradelist ";

    var productService = require("productService").getInstance();//产品服务类
    var wsService = require("wsService").getInstance();//服务类
    var layerWeb = require("layerWeb");   // 弹出框 Web端工具类
    var gconfig = require("gconfig");//全局配置对象
    var global = gconfig.global;//全局对象里面的global
    var commonExt = require("commonExt");
    var enumerateUtils = require("enumerateUtils");
    var dateUtils = require("dateUtils");
    var stringUtils = require("stringUtils");
    var contants = require("contants");
    var datepicker = require("plugins/datepicker/WdatePicker");

    var $this = {
        product_id: "",
        product_code: "",
        query_date: ""
    };
    var convertFundCode = {"159831": "159831_1",};

    //初始化
    function init(param) {
        let date = new Date();
        let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

        $this.product_id = param.product_id || "";
        $this.product_code = param.product_code == '159831' ? '159831_1' : param.product_code;
        $this.query_date = param.query_date;

        queryPcfList();
    }

    //绑定事件
    function bindPageEvent() {
        // 下载
        $(pageId + " #downloadBtn").bindEvent(function () {
            queryPcfDownload();//获取下载文件
        }, "click");

        // 根据日期搜索
        $(pageId + " #query_date").bindEvent(function () {
            WdatePicker({
                el: 'query_date',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $(pageId + " #query_date").trigger("input");
                }
            });
        }, "click");
        $(pageId + " #query_date").bindEvent(function (e) {
            var key = $.trim($(this).val());
            if (!key || !/\d{4}\-\d{2}\-\d{2}/.test(key)) {
                return false;
            }
            $this.query_date = key;
            queryPcfList();
            e.preventDefault();
        }, "input propertychange");
    }

    // 销毁页面，单页面时候要用
    function destroy() {
        //全部置空
        productService.destroy();
        wsService.destroy();
    }

    /**
     * 查询申赎清单数据（741031）
     */
    function queryPcfList() {
        var param = {
            "product_id": $this.product_id,
            "product_code": $this.product_code,
            "query_date": $this.query_date
        };

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var results = resultVo.getResults("pcf_info");
                var resultsRecord = resultVo.getResults("stock_info");
                var sufix = "";
                //查看isSzCashEtf深圳证券交易所  是否包含159900 申赎现金
                var isIncludeCashRedemption = resultsRecord.filter(item => item.secucode == '159900').length > 0 ? true : false;
                if (results && results.length) {
                    var item = results[0]
                    //更具后缀选择字段展示
                    sufix = item.sufix;
                    changeFieldByFix(item.sufix, item, isIncludeCashRedemption);
                    var pcftradingdaytext = dateFormat(item.TradingDay); // 最新公告日期
                    var pcfpretradingdaytext = item.PreTradingDay ? dateFormat(item.PreTradingDay) : "--";
                    var pcffundname = item.FundName; // 基金名称
                    var compchnname = item.FundManagementCompany; // 基金管理公司名称
                    var pcfetfid = item.FundID || "";
                    pcfetfid = pcfetfid.substring(0, 6);
                    $(pageId + " .isNotStockEtfname").html("成份股信息内容" || "--");
                    var szStockCount = item.isShPcf21Etf == "true" ? item.RecordNum : item.RecordNum;//计算深沪本市场申购赎回组合证券只数
                    //是否为上交所ETF
                    var isShEtf = item.isShEtf == "true" ? true : false;
                    //是否为深交所场内模式ETF
                    var isSzCashEtf = true;//item.UnderlyingSecurityIDSource=="102" && item.Type=="0"? true : false;
                    var isAllowCashEtf = item.isAllowCashEtf == "true" ? true : false; // 是否为现金申赎ETF
                    var isShPcf21Etf = (item.isShPcf21Etf == "true" || item.UnderlyingSecurityIDSource == '101') ? true : false;
                    var isNotStockEtf = item.isNotStockEtf == "true" ? true : false;
                    var isNotStockEtfname = "";
                    var pcfrecnoname = "";
                    var pcfindx = item.UnderlyingSecurityID;
                    var stockValueInt = item.RecordNum, stockValueIntname = "";
                    var pcfindxname = "";

                    var pcfcashcomp = item.CashComponent;
                    var pcfnavpercu = item.NAVperCU;
                    var pcfnav = item.NAV;
                    var pcfestimatedcash = item.EstimateCashComponent, pcfestimatedcashname = "";
                    var pcfmaxcashratio = item.MaxCashRatio, pcfmaxcashrationame = "";
                    var pcfiopvpubtext = (item.Publish == "Y" || item.Publish == "1") ? "是" : "否";
                    var pcfcrunit = item.CreationRedemptionUnit;
                    var pcfcashdividend = item.DividendPerCU;
                    var pcfcswitchtext = item.Creation ? item.Creation : item.is_buy, pcfcswitchtextname = "";
                    var pcfrrswitchtext = item.Redemption, pcfrrswitchtextname = "";

                    var netcreationlimit = item.NetCreationLimit;
                    if (netcreationlimit == "0" || netcreationlimit == "0.00") {
                        netcreationlimit = "不限";
                    }
                    var netredemptionlimit = item.NetRedemptionLimit;
                    if (netredemptionlimit == "0" || netredemptionlimit == "0.00") {
                        netredemptionlimit = "不限";
                    }


                    // // 是否为上交所PCF2.1
                    if (isShPcf21Etf) {

                        $(pageId + " .yesShPcf21Etf").show();
                        $(pageId + " .noShPcf21Etf").hide();

                        // if(!item.Creation){
                        //     $(pageId + " .pcfrrswitchtext").parent().hide();
                        // }


                    } else {
                        $(pageId + " .yesShPcf21Etf").hide();
                        $(pageId + " .noShPcf21Etf").show();
                    }

                    // 默认查询时间
                    if (!$this.query_date || pcftradingdaytext) {

                        $this.query_date = pcftradingdaytext;
                        $(pageId + " #query_date").val(pcftradingdaytext);
                    }
                    //$this.product_code = pcfetfid;


                    $(pageId + " .pcftradingdaytext").html(pcftradingdaytext || "--");
                    $(pageId + " .pcffundname").html(pcffundname || "--");
                    $(pageId + " .compchnname").html(compchnname || "--");
                    $(pageId + " .pcfetfid").html(pcfetfid || "--");

                    // $(pageId + " .pcfindx").html(pcfindx || "--");

                    // $(pageId + " .pcfindxname").html(pcfindxname || "--");

                    $(pageId + " .pcfpretradingdaytext").html(pcfpretradingdaytext || "--");
                    $(pageId + " .pcfcashcomp").html(pcfcashcomp || "--");
                    $(pageId + " .pcfnavpercu").html(pcfnavpercu || "--");
                    $(pageId + " .pcfnav").html(pcfnav || "--");
                    $(pageId + " .pcfestimatedcash").html(pcfestimatedcash || "--");
                    $(pageId + " .pcfmaxcashratio").html(stringUtils.parseFloatFormatDefaultEmp(pcfmaxcashratio, '--', 3, 100, '%'));
                    $(pageId + " .pcfiopvpubtext").html(pcfiopvpubtext || "--");
                    $(pageId + " .pcfcrunit").html(pcfcrunit || "--");
                    $(pageId + " .pcfcashdividend").html(stringUtils.parseFloatFormatDefaultEmp(pcfcashdividend, '--', 2));
                    // if(!isSzCashEtf){
                    //     pcfcswitchtext = pcfcswitchtext=="1" || pcfcswitchtext=="Y"  ? "允许" : "禁止"
                    // }else
                    // {
                    //     pcfcswitchtext =  pcfcswitchtext=="Y"  ? "是" : "否"
                    // }
                    //
                    //

                    // if(!isSzCashEtf){
                    //     pcfrrswitchtext = pcfrrswitchtext=="1" ?"允许" : "禁止"
                    // }else{
                    //     pcfrrswitchtext = pcfrrswitchtext=="Y" ?"是" : "否"
                    // }
                    // $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                    $(pageId + " .netcreationlimit").html(netcreationlimit || "--");
                    $(pageId + " .netredemptionlimit").html(netredemptionlimit || "--");


                }


                if (resultsRecord && resultsRecord.length) {
                    var _html = [];
                    for (var i = 0; i < resultsRecord.length; i++) {
                        var rowItem = resultsRecord[i];
                        var secuname = rowItem.secuname || "";
                        var secucode = rowItem.secucode || "";
                        var secusubflag = rowItem.secusubflag;
                        var secusubflagtext = rowItem.secusubflagtext || "";
                        var secuno = rowItem.secuno || "";
                        var premrate = rowItem.premrate || "";
                        var csubstcashamt = rowItem.csubstcashamt || "";
                        var discount = rowItem.discount || "";
                        var redemptmoney = rowItem.redemptmoney || "";
                        var creationpremrate = rowItem.creationpremrate || "";

                        // if (secusubflag == "2") {
                        //     secuno = 0;
                        // }
                        var secunotext = "";
                        // if (secuno > 0) {
                        secunotext = secuno;
                        // }

                        var premratetext = "";
                        var discounttext = "";

                        var csubstcashamttext = stringUtils.parseFloatFormatDefaultEmp(csubstcashamt, '', 3);

                        var redemptmoneytext = stringUtils.parseFloatFormatDefaultEmp(redemptmoney, '', 3);

                        // 代码小于等于5位->香港市场
                        // 代码为6位，且6开头—>上海市场
                        // 代码为6位，且其他数字开头—>深圳市场
                        // 其他—>空
                        var guapaishichang = rowItem.exchangeName;

                        if (sufix == ".txt") {
                            var creationpremrate = stringUtils.parseFloatFormatDefaultEmp(creationpremrate, '', 3, 100, '%');
                            premratetext = stringUtils.parseFloatFormatDefaultEmp(premrate, '', 3, 100, '%');
                            _html.push('<tr><td>' + secucode + '</td><td>' + secuname + '</td><td>' + secunotext + '</td><td>' + secusubflagtext + '</td>' + (isShPcf21Etf ? '<td>' + premratetext + '</td><td>' + discounttext + '</td>' : '<td>' + premratetext + '</td>') + '<td>' + redemptmoneytext + '</td></tr>')
                        } else if (sufix == ".xml") {
                            if (item.ShXML == "1") {  // 详情文件类型
                                var creationpremrate = stringUtils.parseFloatFormatDefaultEmp(creationpremrate, '', 3, 100, '%');
                                premratetext = stringUtils.parseFloatFormatDefaultEmp(premrate, '', 3, 100, '%');
                                _html.push('<tr><td>' + secucode + '</td><td>' + secuname + '</td><td>' + secunotext + '</td><td>' + secusubflagtext + '</td><td>' + premratetext + '</td><td>' + creationpremrate + '</td><td>' + csubstcashamttext + '</td><td>' + guapaishichang + '</td></tr>')
                            } else {
                                premratetext = stringUtils.parseFloatFormatDefaultEmp(premrate, '', 3, 100, '%');
                                discounttext = stringUtils.parseFloatFormatDefaultEmp(discount, '', 3, 100, '%');
                                _html.push('<tr><td>' + secucode + '</td><td>' + secuname + '</td><td>' + secunotext + '</td><td>' + secusubflagtext + '</td><td>' + premratetext + '</td><td>' + discounttext + '</td><td>' + csubstcashamttext + '</td><td>' + redemptmoneytext + '</td><td>' + guapaishichang + '</td></tr>')
                            }
                        } else if (sufix == ".etf") {
                            var creationpremrate = stringUtils.parseFloatFormatDefaultEmp(creationpremrate, '', 3, 100, '%');
                            premratetext = stringUtils.parseFloatFormatDefaultEmp(premrate, '', 3, 100, '%');
                            _html.push('<tr><td>' + secucode + '</td><td>' + secuname + '</td><td>' + secunotext + '</td><td>' + secusubflagtext + '</td><td>' + premratetext + '</td><td>' + creationpremrate + '</td><td>' + redemptmoneytext + '</td></tr>')
                        }

                    }
                    $(pageId + " #stock_info_table table").show()
                    $(pageId + " #stock_info_table table tbody").html(_html.join("")).show()
                        .parent().siblings(".compare_no_data").hide();
                } else {
                    $(pageId + " #stock_info_table table").hide()
                        .siblings(".compare_no_data").show();
                }

            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        };
        wsService.queryFundPcfList(callback, param);
    }

    function dateFormat(dateStr) {
        var dateStrFormat = "";
        dateStrFormat = dateStr.substr(0, 4) + "-" + dateStr.substr(4, 2) + "-" + dateStr.substr(6, 2);

        return dateStrFormat;
    }

    function changeFieldByFix(sufix, item, isIncludeCashRedemption) {
        switch (sufix) {
            case ".txt":
                //拟指数代码
                if (item.UnderlyingIndex) {
                    $(pageId + " .pcfindx").html(item.UnderlyingIndex || "--");
                    $(pageId + ".pcfindx").parent().show();
                } else {
                    $(pageId + ".pcfindx").parent().hide();
                }
                var pcfindxname = "拟合指数代码";
                $(pageId + " .pcfindxname").html(pcfindxname || "--");
                var pcfrecno = item.TotalRecordNum;
                if (pcfrecno) {
                    isIncludeCashRedemption = isIncludeCashRedemption ? "(含\"159900\"证券)" : "";
                    pcfrecno = pcfrecno + isIncludeCashRedemption;
                } else {

                }
                $(pageId + " .pcfrecno").html(pcfrecno || "--");

                var pcfestimatedcashname = "预估现金部分(元)";
                var pcfmaxcashrationame = "现金替代比例上限";
                var stockValueIntname = pcfrecnoname = "申购赎回组合证券只数";
                var szStockCount = item.isShPcf21Etf == "true" ? item.RecordNum : item.RecordNum;//计算深沪本市场申购赎回组合证券只数
                $(pageId + " .stockValueInt").html(szStockCount || "--");
                var pcfcswitchtextname = "允许申购";
                var pcfrrswitchtextname = "允许赎回";

                $(pageId + " .pcfestimatedcashname").html(pcfestimatedcashname || "--");
                $(pageId + " .pcfmaxcashrationame").html(pcfmaxcashrationame || "--");
                $(pageId + " .pcfrecnoname").html(pcfrecnoname || "--");
                $(pageId + " .stockValueIntname").html(stockValueIntname || "--");
                $(pageId + " .pcfcswitchtextname").html(pcfcswitchtextname || "--");
                $(pageId + " .pcfrrswitchtextname").html(pcfrrswitchtextname || "--");


                //是否允许申购和赎回
                var pcfcswitchtext = item.Creation;
                pcfcswitchtext = pcfcswitchtext == "1" || pcfcswitchtext == "Y" ? "允许" : "禁止"
                $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);

                var pcfrrswitchtext = item.Redemption;
                var pcfrrswitchtext = pcfrrswitchtext == "1" ? "允许" : "禁止"
                $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);


                var netcreationlimitperuser = item.NetCreationLimitPerUser;
                if (netcreationlimitperuser == "0" || netcreationlimitperuser == "0.00") {
                    netcreationlimitperuser = "不限";
                }
                var netredemptionlimitperuser = item.NetRedemptionLimitPerUser;
                if (netredemptionlimitperuser == "0" || netredemptionlimitperuser == "0.00") {
                    netredemptionlimitperuser = "不限";
                }

                $(pageId + " .netcreationlimitperuser").html(netcreationlimitperuser || "--");
                $(pageId + " .netredemptionlimitperuser").html(netredemptionlimitperuser || "--");
                var creationlimit = item.CreationLimit;
                if (creationlimit == "0" || creationlimit == "0.00") {
                    creationlimit = "不限";
                }
                var redemptionlimit = item.RedemptionLimit;
                if (redemptionlimit == "0" || redemptionlimit == "0.00") {
                    redemptionlimit = "不限";
                }
                $(pageId + " .creationlimit").html(creationlimit || "--");
                $(pageId + " .redemptionlimit").html(redemptionlimit || "--");
                var creationlimitperuser = item.CreationLimitPerUser;
                if (creationlimitperuser == "0" || creationlimitperuser == "0.00") {
                    creationlimitperuser = "不限";
                }
                var redemptionlimitperuser = item.RedemptionLimitPerUser;
                if (redemptionlimitperuser == "0" || redemptionlimitperuser == "0.00") {
                    redemptionlimitperuser = "不限";
                }
                $(pageId + " .creationlimitperuser").html(creationlimitperuser || "--");
                $(pageId + " .redemptionlimitperuser").html(redemptionlimitperuser || "--");

                //隐藏字段
                $(pageId + " .jsfundType").parent().hide();
                $(pageId + " .stockValueInt").parent().hide();
                $(pageId + " .netcreationlimit").parent().hide();
                $(pageId + " .netredemptionlimit").parent().hide();
                $(pageId + " .netcreationlimitperuser").parent().hide();
                $(pageId + " .netredemptionlimitperuser").parent().hide();
                $(pageId + " .creationlimitperuser").parent().hide();
                $(pageId + " .redemptionlimitperuser").parent().hide();
                //  明细列头调整

                $(pageId + " .yesSzCashEtf").hide();
                $(pageId+" .SHCashEtf").hide();
                $(pageId + " .noSzCashEtf").show();

                break
            case ".xml":

                if (item.ShXML == "1") {
                    //拟指数代码
                    if (item.UnderlyingIndex) {
                        $(pageId + " .pcfindx").html(item.UnderlyingIndex || "--");
                        $(pageId + ".pcfindx").parent().show();
                    } else {
                        $(pageId + ".pcfindx").parent().hide();
                    }
                    var pcfindxname = "拟合指数代码";
                    $(pageId + " .pcfindxname").html(pcfindxname || "--");


                    var pcfestimatedcashname = "预估现金部分(元)";
                    var pcfmaxcashrationame = "现金替代比例上限";
                    var stockValueIntname = pcfrecnoname = "申购赎回组合证券只数";
                    var szStockCount = item.isShPcf21Etf == "true" ? item.RecordNum : item.RecordNum;//计算深沪本市场申购赎回组合证券只数
                    $(pageId + " .stockValueInt").html(szStockCount || "--");
                    var pcfcswitchtextname = "允许申购";
                    var pcfrrswitchtextname = "允许赎回";
                    var pcfrecno = item.Recordnum;
                    $(pageId + " .pcfrecno").html(pcfrecno || "--");

                    $(pageId + " .pcfestimatedcashname").html(pcfestimatedcashname || "--");
                    $(pageId + " .pcfmaxcashrationame").html(pcfmaxcashrationame || "--");
                    $(pageId + " .pcfrecnoname").html(pcfrecnoname || "--");
                    $(pageId + " .stockValueIntname").html(stockValueIntname || "--");
                    $(pageId + " .pcfcswitchtextname").html(pcfcswitchtextname || "--");
                    $(pageId + " .pcfrrswitchtextname").html(pcfrrswitchtextname || "--");

                    //是否允许申购和赎回
                    // var pcfcswitchtext = item.Creation ?item.Creation: item.is_buy;
                    // pcfcswitchtext = pcfcswitchtext=="1" || pcfcswitchtext=="Y"  ? "允许" : "禁止"
                    // $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);

                    // var pcfrrswitchtext = item.Redemption;
                    // var  pcfrrswitchtext = pcfrrswitchtext=="1" ?"允许" : "禁止"
                    // $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);

                    if (item.Creation == "1") {

                        var pcfcswitchtext = "允许";
                        $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);

                    } else {
                        var pcfcswitchtext = "禁止";
                        $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);
                    }

                    if (item.Redemption == "1") {
                        var pcfrrswitchtext = "允许";
                        $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                    } else {
                        var pcfrrswitchtext = "禁止";
                        $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                    }

                    if (!item.CreationLimit) {
                        $(pageId + " .creationlimit").parent().hide();
                    } else {
                        $(pageId + " .creationlimit").prev().text("当日申购限额");
                        $(pageId + " .creationlimit").html(item.CreationLimit || "--");
                        $(pageId + " .creationlimit").parent().show();
                    }
                    if (!item.RedemptionLimit) {
                        $(pageId + " .redemptionlimit").parent().hide();
                    } else {
                        $(pageId + " .redemptionlimit").prev().text("当日赎回限额");
                        $(pageId + " .redemptionlimit").html(item.RedemptionLimit || "--");
                        $(pageId + " .redemptionlimit").parent().show();
                    }


                    //隐藏字段
                    $(pageId + " .jsfundType").parent().hide();
                    $(pageId + " .stockValueInt").parent().hide();


                    // NetCreationLimit N18 当日净申购基金份额上限 NetCreationLimit
                    // NetRedemptionLimit N18 当日净赎回基金份额上限 NetRedemptionLimit
                    // NetCreationLimitPerAcct N18 单个账户净申购总额限制 NetCreationLimitPerAcct
                    // NetRedemptionLimitPerAcct N18 单个账户净赎回总额限制 NetRedemptionLimitPerAcct
                    // CreationLimitPerAcct N18 单个账户累计申购总额限制 CreationLimitPerAcct
                    // RedemptionLimitPerAcct N18 单个账户累计赎回总额限制 RedemptionLimitPerAcct

                    if (item.NetCreationLimit) {
                        $(pageId + " .netcreationlimit").prev().text("当日净申购基金份额上限");
                        $(pageId + " .netcreationlimit").html(item.NetCreationLimit || "--");
                        $(pageId + " .netcreationlimit").parent().show();
                    } else {
                        $(pageId + " .netcreationlimit").parent().hide();
                    }
                    if (item.NetRedemptionLimit) {
                        $(pageId + " .netredemptionlimit").prev().text("当日净赎回基金份额上限");
                        $(pageId + " .netredemptionlimit").html(item.NetRedemptionLimit || "--");
                        $(pageId + " .netredemptionlimit").parent().show();
                    } else {
                        $(pageId + " .netredemptionlimit").parent().hide();
                    }
                    if (item.NetCreationLimitPerAcct) {
                        $(pageId + " .netcreationlimitperuser").prev().text("单个账户净申购总额限制");
                        $(pageId + " .netcreationlimitperuser").html(item.NetCreationLimitPerAcct || "--");
                        $(pageId + " .netcreationlimitperuser").parent().show();
                    } else {
                        $(pageId + " .netcreationlimitperuser").parent().hide();
                    }
                    if (item.NetRedemptionLimitPerAcct) {
                        $(pageId + " .netredemptionlimitperuser").prev().text("单个账户净赎回总额限制");
                        $(pageId + " .netredemptionlimitperuser").html(item.NetRedemptionLimitPerAcct || "--");
                        $(pageId + " .netredemptionlimitperuser").parent().show();
                    } else {
                        $(pageId + " .netredemptionlimitperuser").parent().hide();
                    }
                    if (item.CreationLimitPerAcct) {
                        $(pageId + " .creationlimitperuser").prev().text("单个账户累计申购总额限制");
                        $(pageId + " .creationlimitperuser").html(item.CreationLimitPerAcct || "--");
                        $(pageId + " .creationlimitperuser").parent().show();
                    } else {
                        $(pageId + " .creationlimitperuser").parent().hide();
                    }
                    if (item.RedemptionLimitPerAcct) {
                        $(pageId + " .redemptionlimitperuser").prev().text("单个账户累计赎回总额限制");
                        $(pageId + " .redemptionlimitperuser").html(item.RedemptionLimitPerAcct || "--");
                        $(pageId + " .redemptionlimitperuser").parent().show();
                    } else {
                        $(pageId + " .redemptionlimitperuser").parent().hide();
                    }


                    $(pageId + ".pcfcashdividend").parent().hide();
                    //  明细列头调整
                    $(pageId+" .SHCashEtf").show();
                    $(pageId + " .yesSzCashEtf").hide();
                    $(pageId + " .noSzCashEtf").hide();
                } else {
                    if (item.UnderlyingSecurityID) {
                        $(pageId + " .pcfindxname").html(pcfindxname || "--");
                        $(pageId + " .pcfindx").html(item.UnderlyingSecurityID || "--");
                        $(pageId + ".pcfindx").parent().show();
                    } else {
                        $(pageId + ".pcfindx").parent().hide();
                    }
                    var pcfindxname = "拟合指数代码";
                    $(pageId + " .pcfindxname").html(pcfindxname || "--");

                    var pcfrecno = item.TotalRecordNum;
                    if (pcfrecno) {
                        isIncludeCashRedemption = isIncludeCashRedemption ? "(含\"159900\"证券)" : "";
                        pcfrecno = pcfrecno + isIncludeCashRedemption;
                    }
                    $(pageId + " .pcfrecno").html(pcfrecno || "--");

                    //是否允许申购和赎回
                    var pcfcswitchtext = item.Creation ? item.Creation : item.is_buy;
                    pcfcswitchtext = pcfcswitchtext == "1" || pcfcswitchtext == "Y" ? "允许" : "禁止"
                    $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);

                    var pcfrrswitchtext = item.Redemption;
                    var pcfrrswitchtext = pcfrrswitchtext == "1" || pcfrrswitchtext == "Y" ? "允许" : "禁止"
                    $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                    var jsfundType = "";//是否本地市场
                    if (item.Type == "0") {
                        jsfundType = "深市 ETF";

                    } else if (item.Type == "3") {
                        jsfundType = "跨市场 ETF";
                    }
                    if (jsfundType) {
                        $(pageId + " .jsfundType").html(jsfundType || "--");
                        $(pageId + " .jsfundType").parent().show();
                    } else {
                        $(pageId + " .jsfundType").parent().hide();
                    }


                    var szStockCount = item.RecordNum;//计算深沪本市场申购赎回组合证券只数
                    $(pageId + " .stockValueInt").html(szStockCount || "--");


                    var pcfestimatedcashname = "预估现金部分(元)";
                    var pcfmaxcashrationame = "现金替代比例上限";
                    var stockValueIntname = "本市场申购赎回组合证券只数";
                    var pcfrecnoname = "全部申购赎回组合证券只数";

                    var pcfcswitchtextname = "允许申购";
                    var pcfrrswitchtextname = "允许赎回";

                    $(pageId + " .pcfestimatedcashname").html(pcfestimatedcashname || "--");
                    $(pageId + " .pcfmaxcashrationame").html(pcfmaxcashrationame || "--");
                    $(pageId + " .pcfrecnoname").html(pcfrecnoname || "--");
                    $(pageId + " .stockValueIntname").html(stockValueIntname || "--");
                    $(pageId + " .pcfcswitchtextname").html(pcfcswitchtextname || "--");
                    $(pageId + " .pcfrrswitchtextname").html(pcfrrswitchtextname || "--");

                    //隐藏字段


                    var netcreationlimitperuser = item.NetCreationLimitPerUser;
                    if (netcreationlimitperuser == "0" || netcreationlimitperuser == "0.00") {
                        netcreationlimitperuser = "不限";
                    }
                    var netredemptionlimitperuser = item.NetRedemptionLimitPerUser;
                    if (netredemptionlimitperuser == "0" || netredemptionlimitperuser == "0.00") {
                        netredemptionlimitperuser = "不限";
                    }

                    $(pageId + " .netcreationlimitperuser").html(netcreationlimitperuser || "--");
                    $(pageId + " .netredemptionlimitperuser").html(netredemptionlimitperuser || "--");
                    var creationlimit = item.CreationLimit;
                    if (creationlimit == "0" || creationlimit == "0.00") {
                        creationlimit = "不限";
                    }
                    var redemptionlimit = item.RedemptionLimit;
                    if (redemptionlimit == "0" || redemptionlimit == "0.00") {
                        redemptionlimit = "不限";
                    }
                    $(pageId + " .creationlimit").html(creationlimit || "--");
                    $(pageId + " .redemptionlimit").html(redemptionlimit || "--");
                    var creationlimitperuser = item.CreationLimitPerUser;
                    if (creationlimitperuser == "0" || creationlimitperuser == "0.00") {
                        creationlimitperuser = "不限";
                    }
                    var redemptionlimitperuser = item.RedemptionLimitPerUser;
                    if (redemptionlimitperuser == "0" || redemptionlimitperuser == "0.00") {
                        redemptionlimitperuser = "不限";
                    }
                    $(pageId + " .creationlimitperuser").html(creationlimitperuser || "--");
                    $(pageId + " .redemptionlimitperuser").html(redemptionlimitperuser || "--");

                    $(pageId + " .stockValueInt").parent().show();
                    $(pageId + " .netcreationlimit").parent().show();
                    $(pageId + " .netredemptionlimit").parent().show();
                    $(pageId + " .netcreationlimitperuser").parent().show();
                    $(pageId + " .netredemptionlimitperuser").parent().show();
                    $(pageId + " .creationlimitperuser").parent().show();
                    $(pageId + " .redemptionlimitperuser").parent().show();
                    //  明细列头调整
                    $(pageId + " .yesSzCashEtf").show();
                    $(pageId + " .noSzCashEtf").hide();
                    $(pageId+" .SHCashEtf").hide();

                }
                break;
            case ".etf":
                //拟指数代码
                if (item.UnderlyingIndex) {
                    $(pageId + " .pcfindx").html(item.UnderlyingIndex || "--");
                    $(pageId + ".pcfindx").parent().show();
                } else {
                    $(pageId + ".pcfindx").parent().hide();
                }
                var pcfindxname = "拟合指数代码";
                $(pageId + " .pcfindxname").html(pcfindxname || "--");


                var pcfestimatedcashname = "预估现金部分(元)";
                var pcfmaxcashrationame = "现金替代比例上限";
                var stockValueIntname = pcfrecnoname = "申购赎回组合证券只数";
                var szStockCount = item.isShPcf21Etf == "true" ? item.RecordNum : item.RecordNum;//计算深沪本市场申购赎回组合证券只数
                $(pageId + " .stockValueInt").html(szStockCount || "--");
                var pcfcswitchtextname = "允许申购";
                var pcfrrswitchtextname = "允许赎回";
                var pcfrecno = item.Recordnum;
                $(pageId + " .pcfrecno").html(pcfrecno || "--");

                $(pageId + " .pcfestimatedcashname").html(pcfestimatedcashname || "--");
                $(pageId + " .pcfmaxcashrationame").html(pcfmaxcashrationame || "--");
                $(pageId + " .pcfrecnoname").html(pcfrecnoname || "--");
                $(pageId + " .stockValueIntname").html(stockValueIntname || "--");
                $(pageId + " .pcfcswitchtextname").html(pcfcswitchtextname || "--");
                $(pageId + " .pcfrrswitchtextname").html(pcfrrswitchtextname || "--");

                //是否允许申购和赎回
                // var pcfcswitchtext = item.Creation ?item.Creation: item.is_buy;
                // pcfcswitchtext = pcfcswitchtext=="1" || pcfcswitchtext=="Y"  ? "允许" : "禁止"
                // $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);

                // var pcfrrswitchtext = item.Redemption;
                // var  pcfrrswitchtext = pcfrrswitchtext=="1" ?"允许" : "禁止"
                // $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);

                if (item.CreationRedemption == "1") {

                    pcfcswitchtext = "允许";
                    $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);
                    var pcfrrswitchtext = "允许";
                    $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                } else if (item.CreationRedemption == "0" || item.CreationRedemption == "") {
                    pcfcswitchtext = "禁止";
                    $(pageId + " .pcfcswitchtext").html(pcfcswitchtext);
                    var pcfrrswitchtext = "禁止";
                    $(pageId + " .pcfrrswitchtext").html(pcfrrswitchtext);
                }

                if (!item.CreationLimit) {
                    $(pageId + " .creationlimit").parent().hide();
                } else {
                    $(pageId + " .creationlimit").parent().show();

                }
                if (!item.RedemptionLimit) {
                    $(pageId + " .redemptionlimit").parent().hide();

                } else {
                    $(pageId + " .redemptionlimit").parent().show();

                }


                var netcreationlimitperuser = item.NetCreationLimitPerUser;
                if (netcreationlimitperuser == "0" || netcreationlimitperuser == "0.00") {
                    netcreationlimitperuser = "不限";
                }
                var netredemptionlimitperuser = item.NetRedemptionLimitPerUser;
                if (netredemptionlimitperuser == "0" || netredemptionlimitperuser == "0.00") {
                    netredemptionlimitperuser = "不限";
                }

                $(pageId + " .netcreationlimitperuser").html(netcreationlimitperuser || "--");
                $(pageId + " .netredemptionlimitperuser").html(netredemptionlimitperuser || "--");
                var creationlimit = item.CreationLimit;
                if (creationlimit == "0" || creationlimit == "0.00") {
                    creationlimit = "不限";
                }
                var redemptionlimit = item.RedemptionLimit;
                if (redemptionlimit == "0" || redemptionlimit == "0.00") {
                    redemptionlimit = "不限";
                }
                $(pageId + " .creationlimit").html(creationlimit || "--");
                $(pageId + " .redemptionlimit").html(redemptionlimit || "--");
                var creationlimitperuser = item.CreationLimitPerUser;
                if (creationlimitperuser == "0" || creationlimitperuser == "0.00") {
                    creationlimitperuser = "不限";
                }
                var redemptionlimitperuser = item.RedemptionLimitPerUser;
                if (redemptionlimitperuser == "0" || redemptionlimitperuser == "0.00") {
                    redemptionlimitperuser = "不限";
                }
                $(pageId + " .creationlimitperuser").html(creationlimitperuser || "--");
                $(pageId + " .redemptionlimitperuser").html(redemptionlimitperuser || "--");

                //隐藏字段
                $(pageId + " .jsfundType").parent().hide();
                $(pageId + " .stockValueInt").parent().hide();
                $(pageId + " .netcreationlimit").parent().hide();
                $(pageId + " .netredemptionlimit").parent().hide();
                $(pageId + " .netcreationlimitperuser").parent().hide();
                $(pageId + " .netredemptionlimitperuser").parent().hide();
                $(pageId + " .creationlimitperuser").parent().hide();
                $(pageId + " .redemptionlimitperuser").parent().hide();
                $(pageId + ".pcfcashdividend").parent().hide();
                //  明细列头调整
                $(pageId + " .yesSzCashEtf").hide();
                $(pageId + " .noSzCashEtf").show();
                $(pageId+" .SHCashEtf").hide();
                break;
        }
    }

    /**
     * 基金分红查询
     * @param product_code 产品代码
     * @param  query_date 查询日期
     * @param
     */
    function queryPcfDownload() {

        var param = {
            "product_code": $this.product_code == '159831' ? '159831_1' : $this.product_code,
            "query_date": $this.query_date
        };


        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var data = resultVo.getResults();
                if (data && data.length > 0) {
                    var file_url = data[0].pcfFileUrl;

                    var sendUrl = $.gconfig.global.pcfFileServer + "?product_code=" + param.product_code + "&query_date=" + param.query_date + "&rdm+" + Math.random();
                    window.open(sendUrl, "_self")

                    // var a = document.createElement("a");
                    // a.download = file_url;
                    // a.setAttribute("target", "_blank");
                    // a.href = file_url;
                    // $("body").append(a); // 修复firefox中无法触发click
                    // a.click();
                    // $(a).remove();
                } else {
                    layerWeb.msg("未查询到下载文件", 2, 3);
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryPcfFileDownload(callBack, param);
    }

    var index = {
        "init": init,
        "bindPageEvent": bindPageEvent,
        "destroy": destroy
    };
    // 暴露对外的接口
    module.exports = index;
});