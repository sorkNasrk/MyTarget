/**
 * 旗下基金首页
 */
define("ws/scripts/main/fund/funddetail", function (require, exports, module) {
    var pageId = "#main_fund_funddetail ";

    var productService = require("productService").getInstance();//产品服务类
    var layerWeb = require("layerWeb");   // 弹出框 Web端工具类
    var gconfig = require("gconfig");//全局配置对象
    var global = gconfig.global;//全局对象里面的global
    var commonExt = require("commonExt");
    var enumerateUtils = require("enumerateUtils");
    var dateUtils = require("dateUtils");
    var stringUtils = require("stringUtils");
    var contants = require("contants");
    var wsService = require("wsService").getInstance();//服务类
    require("ws/scripts/utils/page");
    var mySwiper= null;
    var hchart = require("ws/scripts/utils/hchart");

    //require("ws/scripts/utils/highstockUtil");

    //var PCpager = require("mall/scripts/utils/PCpager");
    //require("mall/js/jquery.SuperSlide.2.1.3")
    //require("mall/scripts/utils/echarts/echarts.common.min")
    //require("mall/scripts/utils/tool"); //轮播工具类
    require("plugins/datepicker/WdatePicker");
    var timer = null;
    var count = 60;

    //获取风险等级查看页面
    var riskPageUrl = $('#riskpageurl').val();

    var pageGlobal = {
        "curtPageNo": 1, // 当前页
        "numPerPage": 10,
        "totalPages": 1,
        "is_hot_sale": 0,
        "inputSetTimeout": null,
        "strategyList": null,
        "loading": false,
        "allocation_type": '01',//持仓情况-资产配置
        "reportdate": '',//持仓情况-季度时间
        "selecttype": '',//持仓情况-查询类型
        "flag": '',//持仓情况-查询类型
        "keyword": '',//产品公告搜索内容
        "start_date": '',//产品公告搜索开始时间
        "end_date": '',//产品公告搜索结束时间
        "type": '',//产品公告tab切换类型
        "select_time": '', //产品公告年tab切换类型
        "product_abbr": "", // 产品简称
        "is_qdii": "", // 是否QDII
        "nav_number": "", // 净值精度位
        "showusfundcodeflag": "0", // 展示美元产品代码标志
        "benchmark": "",
        "organizationCanBuy":true,//直销机构是否展示
        "samecode_is_navfund":'',//转型前是否展示净值型  0否,1是 默认为1
        "fund_start_time": '',//筛选开始时间
        "fund_end_time": ''//筛选结束时间
    };

    // 设置全局变量
    var $this = {
        product_id: "",
        product_code: "",
        product_type: "",
        fund_class3: "",
        fund_class2: "",
        fund_class: "",
        local_product_id: "",
        isHbFund: false,
        isFollow: false,
        follow_num: 0,
        buyText: "立即购买",
        isCanBuy: false, //默认不能购买
        isCanPlanBuy: false, //默认不能定投
        userInfo: $.session.getPresistObj(contants.session.USER),
        chartHbType: "0", // 默认货币类型
        product: null,
        management_id: '',
        fundChartType: '1',
        fundChartTime: '1m',
        view_from: '', //来源
        companySort: {
            type: "is_year_rate",
            value: "1"
        },
        nav_page: 10
    };
    //处理pc和5相互切换
    var redict = {
        pro_id: "",
        pro_code: "",
        pro_flag:"1",  //1 是pc  2 是h5
    };

    function getQueryValue (queryName, url) {
        var reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)", "i");
        var r = url || window.location.search.substr(1).match(reg)
        if (r != null) {
            return decodeURI(r[2])
        } else {
            return null
        }
    }

    //初始化
    function init(param) {
        //如果是在资管嘉的流程中，需要隐藏相关UI
        if(param.from == 'zgj'){
            $('#headerContent').hide()
            $('#footerContent').hide()
            $('.local_address').hide()
            $('.download_code').hide()
            $('.pd_right_module5').hide()
            $('#gadgets').hide()
            $('.weichart_info').hide()
            $('.page_main').css('padding-top','20px')
            $('#pd_opeabox').hide()
            $('#product_tab').find('li a').each(function(item,index){
                if($(this).attr('href').indexOf('shtml') > -1){
                    var a = $(this).attr('href').replace('shtml','shtml?from=zgj')
                    $(this).attr('href',a)
                }
            })
        }
        //获取到页面的产品编号
        $this.product_id = $("#product_id").val();
        fundMarketingSpecial();
        var path = window.location.pathname;
        //基金经理
        if(path.indexOf("fundManager.shtml")>-1){
            //pc的路径
            redict.pro_id=  $("#product_id").val();
            //判断页面路径并截取对应的参数
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundManager")-1);
            //当前的访问地址是pc 还是H5
            redict.pro_flag="1";
            //基金档案
        } else if(path.indexOf("fundRecord.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundRecord")-1);
            redict.pro_flag="1";
            //基金费率
        }else if(path.indexOf("fundRate.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundRate")-1);
            redict.pro_flag="1";
            //持仓情况
        }else if(path.indexOf("fundHolding.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundHolding")-1);
            redict.pro_flag="1";
            //基金净值
        }else if(path.indexOf("fundNav.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundNav")-1);
            redict.pro_flag="1";
            //产品公告
        }else if(path.indexOf("fundAnn.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundAnn")-1);
            redict.pro_flag="1";
            //销售机构
        }else if(path.indexOf("fundSaleOrg.shtml")>-1){
            redict.pro_id=  $("#product_id").val();
            redict.pro_code= path.substring(path.indexOf("fund")+5,path.indexOf("fundSaleOrg")-1);
            redict.pro_flag="1";
        }else if(path.indexOf("funddetail.html")>0){
            //当前的路径--直接获取路径上的url带的参数
            redict.pro_id= getUrlParam("product_id");
            redict.pro_code= getUrlParam("product_code");
            //当前的访问地址是pc 还是H5
            redict.pro_flag="2";
        }else{
            //返回首页
            window.location.href="/main/home/index.shtml";
        }
        //需要判断是H5 还是pc
        var sUserAgent = navigator.userAgent.toLowerCase();
        if(/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(sUserAgent)){  //基金是H5
            //如果是h5---加载H5的效果---判断是pc  --如果是从pc 到H5 需要提示跳转路径
            window.location.href="/m/mall/views/mall/funddetail.html?product_id="+redict.pro_id+"&product_code="+redict.pro_code+"";
        }else{
            //pc访问pc 地址直接跳转不需要处理
            commonUtil.querySpecialCode(queryFundDetail, true); //查询基金产品详情信息
        }
    };

    //绑定事件
    function bindPageEvent() {
        //初始化日期插件
        bingSearchDate();
        //初始化画图
        $(pageId + "#fundChartType li").on("click", function () {
            if ($(this).hasClass("act")) {
                return false;
            }
            $this.fundChartType = $(this).attr("data-type")
            $(this).addClass("act").siblings("li").removeClass("act");
            $(pageId + " #attach").hide();
            $(pageId + " .imp_tips").hide();
            $(pageId + " .pd_tabcont .type").remove();
            if ($this.fundChartType == "1") {
                queryAvgreturnList();
                $(pageId + " .chart_imgbox1").height('330px');
                $(pageId + " #container").empty();
                $(pageId + " #fundChartTime .chart_switch").show();
            } else if ($this.fundChartType == "2") {
                queryNavList();
                $(pageId + " .chart_imgbox1").height('380px');
                $(pageId + " #fundChartTime .chart_switch").show();
            } else if ($this.fundChartType == "3") {
                queryNavList();
                $(pageId + " .chart_imgbox1").height('380px');
                $(pageId + " #fundChartTime .chart_switch").show();
            } else if ($this.fundChartType == "4") {
                queryReflectList();
                clearInterval(queryReflectListTimer);
                var queryReflectListTimer = setInterval(function(){
                    queryReflectList()
                },60000)
                $(pageId + " .chart_imgbox1").height('380px');
                $(pageId + " #attach").show();
                $(pageId + " .imp_tips").show();
                $(pageId + " #fundChartTime .chart_switch").hide();
            } else if ($this.fundChartType == "5") {
                queryNavList();
                $(pageId + " .chart_imgbox1").height('380px');
                $(pageId + " #fundChartTime .chart_switch").show();
            } else if ($this.fundChartType == "6") {
                queryNavList();
                $(pageId + " .chart_imgbox1").height('380px');
                $(pageId + " #fundChartTime .chart_switch").show();
            }
        });

        // 选择时间区间重绘图表：收益曲线、单位净值、累计净值、净值估算
        $(pageId + "#fundChartTime .chart_switch span").bindEvent(function () {
            $this.fundChartTime = $(this).attr("data-type")
            $(this).addClass("act").siblings("span").removeClass("act");
            $(pageId + " .pd_tabcont .type").remove();
            if ($this.fundChartType == "1") {
                $(".filter_date1").show();
                queryAvgreturnList();
            } else if ($this.fundChartType == "2") {
                $(".filter_date1").show();
                queryNavList();
            } else if ($this.fundChartType == "3") {
                $(".filter_date1").show();
                queryNavList();
            } else if ($this.fundChartType == "4") {
                //把时间筛选隐藏起来
                $(".filter_date1").hide();
                queryReflectList();
            } else if ($this.fundChartType == "5") {
                $(".filter_date1").show();
                queryNavList();
            } else if ($this.fundChartType == "6") {
                $(".filter_date1").show();
                queryNavList();
            }
        }, "click");

        //时间筛选加载日期控件
        $("#start_time").bindEvent(function () {
            WdatePicker({
                el: 'start_time',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#start_time").trigger("input");
                }
            });

        });
        $("#start_time").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#end_time").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.fund_start_time = key1;
                pageGlobal.fund_end_time = key2;
                pageGlobal.select_time = '';
                //清除固定选择的时间
                $("[data-type]").siblings("span").removeClass("act");

                //再判断是收益净值、单位净值、累计净值中的哪个
                if ($this.fundChartType == "1") {
                    queryAvgreturnList();
                } else if ($this.fundChartType == "2") {
                    queryNavList();
                } else if ($this.fundChartType == "3") {
                    queryNavList();
                } else if ($this.fundChartType == "4") {
                    queryReflectList();
                } else if ($this.fundChartType == "5") {
                    queryNavList();
                } else if ($this.fundChartType == "6") {
                    queryNavList();
                }

                //清空时间
                $("#start_time").val();
                $("#end_time").val();
            }
            e.preventDefault();
        });
        //产品公告加载日期控件
        $("#end_time").bindEvent(function () {
            WdatePicker({
                el: 'end_time',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#end_time").trigger("input");
                }
            });

        });
        $("#end_time").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#start_time").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.fund_start_time = key2;
                pageGlobal.fund_end_time = key1;
                pageGlobal.select_time = '';

                $("[data-type]").siblings("span").removeClass("act");

                //同上
                if ($this.fundChartType == "1") {
                    queryAvgreturnList();
                } else if ($this.fundChartType == "2") {
                    queryNavList();
                } else if ($this.fundChartType == "3") {
                    queryNavList();
                } else if ($this.fundChartType == "4") {
                    queryReflectList();
                } else if ($this.fundChartType == "5") {

                    queryNavList();
                } else if ($this.fundChartType == "6") {
                    queryNavList();
                }

                //清空时间
                $("#start_time").val();
                $("#end_time").val();
            }
            e.preventDefault();
        });

        //切换收益曲线、单位净值...或者近1月、近3月...的时候清除时间删选
        $("[data-type]").click(function () {
            $("#start_time").val("");
            $("#end_time").val("");
        });

        //新发基金预约流程选手隐藏
        $("#rglc").on("click", function () {
            if($(this).hasClass("act")){
                $(this).find("span").text("展开");
                $(this).removeClass("act");
                $(".xf_processlist").slideUp(200);
            }else{
                $(this).find("span").text("收起");
                $(this).addClass("act");
                $(".xf_processlist").slideDown();
            }
        });

        //产品名称气泡
        $(".fund_table").bindChildEvent("tr td div.tit a", function () {
            console.log("进入了产品名称气泡");
            $(this).parent().find(".fund_xxlayer").show();
        },"mousemove");

        $(".fund_table").bindChildEvent("tr td div.tit a", function () {
            console.log("进入了产品名称气泡");
            $(this).parent().find(".fund_xxlayer").hide();
        },"mouseout");

        // TAB切换
        $(pageId + "#product_tab li").on("click", function () {
            $(this).addClass("act").siblings("li").removeClass("act");
            var index = $(this).index();
            $('#fundDetailsList' + index).show().siblings("div").hide();
            switch (index) {
                case 1:
                    queryFundManagerInfo();//基金经理信息查询
                    break;
                case 3:
                    queryFeerate();//基金费率
                    break;
                case 4:
                    //pageGlobal.flag = '2';
                    //pageGlobal.allocation_type = '01';
                    queryAssetAllocationTimer('01', '2');//持仓情况
                    $("#positionSituationList1").show().siblings('div:not(.sub_tabnav)').hide();
                    $("#fundDetailsList4 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
                    break;
                case 5:
                    pageGlobal.start_date = '';
                    pageGlobal.end_date = '';
                    $("#fund_start2").val('');
                    $("#fund_end2").val('');
                    queryNetFundValueList(); //基金净值列表
                    $("#netFundValueList1").show().siblings('div:not(.sub_tabnav)').hide();
                    $("#fundDetailsList5 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
                    //queryDividendFundList();//基金分红
                    break;
                case 6:
                    pageGlobal.type = '';
                    $("#fundDetailsList6 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
                    pageGlobal.keyword = '';
                    $("#fundAnnounKey").val('');
                    $("#fundDetailsList6 .filter_box1 ul.filter_list1 li").eq(3).addClass("act").siblings().removeClass("act");
                    pageGlobal.select_time = '';
                    pageGlobal.start_date = '';
                    pageGlobal.end_date = '';
                    $("#fund_start").val('');
                    $("#fund_end").val('');
                    queryFundAnnouncementList(); //产品公告
                    break;
                case 7:
                    querySalesOrganization(); //销售机构
                    $('#fundDetailsList7 #salesOrganizationList1').show();
                    $('#fundDetailsList7 .sub_tabnav ul li:eq(0)').show();
                    $("#fundDetailsList7 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
                    if(pageGlobal.organizationCanBuy){
                        $('#fundDetailsList7 .pd_detail_box').show();
                    }else{
                        $('#fundDetailsList7 .pd_detail_box').hide();
                    }
                    break;
            }
        });

        //基金经理内部tab切换
        $("#fundDetailsList1 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == '0') {
                queryFundManagerInfo();//基金经理信息查询
                $(pageId + "#fundDetailsList1 .sub_tabcont1").show();
                $(pageId + "#fundDetailsList1 .sub_tabcont2").hide();
                $(pageId + "#fundDetailsList1 .sub_tabcont3").hide();
            } else if (index == '1') {
                $(pageId + "#fundDetailsList1 .sub_tabcont1").hide();
                $(pageId + "#fundDetailsList1 .sub_tabcont2").show();
                $(pageId + "#fundDetailsList1 .sub_tabcont3").hide();
            } else if (index == '2') {
                $(pageId + "#fundDetailsList1 .sub_tabcont1").hide();
                $(pageId + "#fundDetailsList1 .sub_tabcont2").hide();
                $(pageId + "#fundDetailsList1 .sub_tabcont3").show();
                queryHistoryManagerList();
            }
        });

        //基金费率内部tab切换
        $("#fundDetailsList3 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == '0') {

                $(pageId + "#fundDetailsList3 #fundRate1").show();
                $(pageId + "#fundDetailsList3 #fundRate2").hide();
                //基金费率查询
                queryFeerate();
            } else  if (index == '1') {
                $(pageId + "#fundDetailsList3 #fundRate1").hide();
                $(pageId + "#fundDetailsList3 #fundRate2").show();
                //查询可转换基金
                queryConvertibleFund();
            }
        });

        //基金经理介绍显示更多
        $("#fundDetailsList1 .sub_tabcont1").on("click", ".open", function () {
            if ($(this).parent().hasClass("fold")) {
                $(this).parent().removeClass("fold");
                $(this).html("展开");
            } else {
                $(this).parent().addClass("fold");
                $(this).html("收起");
            }
        });

        //基金经理管理基金显示更多
        $("#fundDetailsList1 .sub_tabcont1").on("click", ".more", function () {
            if ($(this).hasClass("fold")) {
                $(this).siblings(".fund_table").css("max-height", "228px");
                $(this).removeClass("fold");
                $(this).find("a").html("展开");
            } else {
                $(this).siblings(".fund_table").css("max-height", "none");
                $(this).addClass("fold");
                $(this).find("a").html("收起");
            }
        });

        //基金档案内部tab切换
        $("#fundDetailsList2 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == '0') {
                $(pageId + "#fundDetailsList2 .sub_tabcont1").show();
                $(pageId + "#fundDetailsList2 .sub_tabcont2").hide();
            } else if (index == '1') {
                $(pageId + "#fundDetailsList2 .sub_tabcont1").hide();
                $(pageId + "#fundDetailsList2 .sub_tabcont2").show();
            }
        });

        //基金费率中的公告跳转
        // $(pageId + " .fund_ad").click(function () {
        //     $("#product_tab li:eq(5)").addClass("act").siblings("li").removeClass("act");
        //     $('#fundDetailsList6').show().siblings("div").hide();
        //     queryFundAnnouncementList(); //产品公告
        // });

        //持仓情况tab切换
        $("#fundDetailsList4 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            $("#positionSituationList" + (index + 1)).show().siblings('div:not(.sub_tabnav)').hide();
            if (index == '0') {
                //pageGlobal.flag = '2';
                //pageGlobal.allocation_type = '01';
                queryAssetAllocationTimer('01', '2')
            } else if (index == '1') {
                // pageGlobal.flag = '';
                //pageGlobal.allocation_type = '02';
                queryAssetAllocationTimer('02', '')
            } else if (index == '2') {
                //pageGlobal.flag = '1';
                // pageGlobal.allocation_type = '04';
                queryAssetAllocationTimer('04', '1')
                queryChangesInShareholding('1');
                $("#changesInShareholding .spel_tabnav li").eq(0).addClass('act').siblings().removeClass("act");
            } else if (index == '3') {
                // pageGlobal.flag = '2';
                // pageGlobal.allocation_type = '04';
                queryAssetAllocationTimer('04', '2')
            }
            //queryAssetAllocationTimer();
        })
        //持股变动tab切换
        $("#positionSituationList3 .spel_tabnav li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == 0) {
                queryChangesInShareholding('1');
            } else {
                queryChangesInShareholding('2');
            }

        })
        //基金净值tab切换
        $("#fundDetailsList5 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            $("#netFundValueList" + (index + 1)).show().siblings('div:not(.sub_tabnav)').hide();
            if (index == 0) {
                pageGlobal.start_date = '';
                pageGlobal.end_date = '';
                $("#fund_start2").val('');
                $("#fund_end2").val('');
                queryNetFundValueList(); //基金净值列表
            } else if(index == 1) {
                queryDividendFundList();//基金分红
            }else{
                pageGlobal.start_date = '';
                pageGlobal.end_date = '';
                $("#fund_start3").val('');
                $("#fund_end3").val('');
                queryNetFundValueList('1')//转型前历史收益
            }
        })
        $("#exportWrap .export_link").click(function () {
            netWorthExport();
        })
        $("#beforeExportWrap .export_link").click(function () {
            netWorthExport();
        })
        //基金公告tab切换
        $("#fundDetailsList6 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == 0) {
                pageGlobal.type = '';
            } else if (index == 1) {
                pageGlobal.type = '155';
            } else if (index == 2) {
                pageGlobal.type = '156';
            } else if (index == 3) {
                pageGlobal.type = '157';
            } else if (index == 4) {
                pageGlobal.type = '158';
            }
            pageGlobal.keyword = '';
            $("#fundAnnounKey").val('');
            $("#fundDetailsList6 .filter_box1 ul.filter_list1 li").eq(3).addClass("act").siblings().removeClass("act");
            pageGlobal.select_time = '';
            pageGlobal.start_date = '';
            pageGlobal.end_date = '';
            $("#fund_start").val('');
            $("#fund_end").val('');
            queryFundAnnouncementList();

        })
        //产品公告切换年
        $("#fundDetailsList6 .filter_box1 ul.filter_list1 li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            if (index == 0) {
                pageGlobal.select_time = '1y';
            } else if (index == 1) {
                pageGlobal.select_time = '3y';
            } else if (index == 2) {
                pageGlobal.select_time = '5y';
            } else if (index == 3) {
                pageGlobal.select_time = '';
            }
            pageGlobal.start_date = '';
            pageGlobal.end_date = '';
            $("#fund_start").val('');
            $("#fund_end").val('');
            queryFundAnnouncementList();
        })
        //产品公告加载日期控件
        $("#fund_start").bindEvent(function () {
            WdatePicker({
                el: 'fund_start',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_start").trigger("input");
                }
            });

        });
        $("#fund_start").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_end").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key1;
                pageGlobal.end_date = key2;
                pageGlobal.select_time = '';
                $("#fundDetailsList6 .filter_box1 ul.filter_list1 li").removeClass("act");
                queryFundAnnouncementList();
            }
            e.preventDefault();
        });
        //产品公告加载日期控件
        $("#fund_end").bindEvent(function () {
            WdatePicker({
                el: 'fund_end',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_end").trigger("input");
                }
            });

        });
        $("#fund_end").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_start").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key2;
                pageGlobal.end_date = key1;
                pageGlobal.select_time = '';
                $("#fundDetailsList6 .filter_box1 ul.filter_list1 li").removeClass("act");
                queryFundAnnouncementList();
            }
            e.preventDefault();
        });

        //基金净值日历
        $("#fund_start2").bindEvent(function () {
            WdatePicker({
                el: 'fund_start2',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_start2").trigger("input");
                }
            });
        });
        $("#fund_start2").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_end2").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key1;
                pageGlobal.end_date = key2;
                pageGlobal.select_time = '';
                queryNetFundValueList();
            }
            e.preventDefault();
        });
        $("#fund_end2").bindEvent(function () {
            WdatePicker({
                el: 'fund_end2',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_end2").trigger("input");
                }
            });

        });
        $("#fund_end2").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_start2").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key2;
                pageGlobal.end_date = key1;
                queryNetFundValueList();
            }
            e.preventDefault();
        });
        //转型前历史收益
        $("#fund_start3").bindEvent(function () {
            WdatePicker({
                el: 'fund_start3',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_start3").trigger("input");
                }
            });
        });
        $("#fund_start3").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_end3").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key1;
                pageGlobal.end_date = key2;
                pageGlobal.select_time = '';
                queryNetFundValueList('1');
            }
            e.preventDefault();
        });
        $("#fund_end3").bindEvent(function () {
            WdatePicker({
                el: 'fund_end3',
                dateFmt: 'yyyy-MM-dd',
                onpicked: function () {
                    $("#fund_end3").trigger("input");
                }
            });

        });
        $("#fund_end3").bind('input propertychange', function (e) {
            var key1 = $.trim($(this).val());
            if ($.string.isEmpty(key1)) {
                return false;
            }
            var key2 = $.trim($("#fund_start3").val());
            if ($.string.isEmpty(key2)) {
                return false;
            }
            if (key1 && key2) {
                pageGlobal.start_date = key2;
                pageGlobal.end_date = key1;
                queryNetFundValueList('1');
            }
            e.preventDefault();
        });
        //产品公告搜索内容
        $("#fundAnnounKey").keydown(function (event) {
            if (event.keyCode == 13) {
                pageGlobal.keyword = $("#fundAnnounKey").val();
                queryFundAnnouncementList();
            }
        })
        //产品公告搜索内容
        $("#fundAnnounSearch").click(function (event) {
            pageGlobal.keyword = $("#fundAnnounKey").val();
            queryFundAnnouncementList();

        })
        //销售机构tab切换
        $("#fundDetailsList7 .sub_tabnav ul li a").click(function () {
            var index = $(this).parent().index();
            $(this).parent().addClass("act").siblings().removeClass("act");
            $("#salesOrganizationList" + (index + 1)).show().siblings('div:not(.sub_tabnav)').hide();

        })
        $('span.value').click(function (e) {
            e.stopPropagation();
            $(this).parent().find('div.time_select_layer').slideToggle(200);
        })

        $('body').click(function (event) {
            if (event.target.className == 'zl-scrollBar zl-verticalBar' || event.target.className == 'zl-scrollContentDiv' || event.target.className == 'time_select_layer') {
                return false;
            }
            if (event.target.className != 'value') {
                $('div.time_select_layer').slideUp(200);
            }
        })
        $('ul.list').bindChildEvent("li", function () {
            pageGlobal.reportdate = $(this).attr('data-date');
            $(this).parent().parent().parent().parent().find('span.value').html($(this).find('span').html() + '<i></i>');
            $(this).parent().parent().parent().slideUp(200);
            if ($(this).parent().parent().parent().parent().parent().parent()[0].id == 'changesInShareholding') {
                $(this).parent().parent().parent().parent().parent().parent().find("div.pd_detail_tit h3 span").html(pageGlobal.reportdate);
                if ($("#changesInShareholding .spel_tabnav li").eq(0).hasClass('act')) {
                    queryChangesInShareholding('1', '2');
                } else {
                    queryChangesInShareholding('2', '2');
                }

            } else {
                $(this).parent().parent().parent().parent().parent().find("div.pd_detail_tit h3 span").html(pageGlobal.reportdate);
                $("#fundDetailsList4 .sub_tabnav ul li:eq(0)").hasClass('act')
                if ($("#fundDetailsList4 .sub_tabnav ul li:eq(0)").hasClass('act')) {
                    queryAssetAllocation('01', pageGlobal.reportdate, '2');
                } else if ($("#fundDetailsList4 .sub_tabnav ul li:eq(1)").hasClass('act')) {
                    queryAssetAllocation('02', pageGlobal.reportdate, '');
                } else if ($("#fundDetailsList4 .sub_tabnav ul li:eq(2)").hasClass('act')) {
                    queryAssetAllocation('04', pageGlobal.reportdate, '1');
                } else if ($("#fundDetailsList4 .sub_tabnav ul li:eq(3)").hasClass('act')) {
                    queryAssetAllocation('04', pageGlobal.reportdate, '2');
                }
            }
        })

        $(pageId + "#fundManagerList").on("click", ".fund_manager .more", function () {
            var text = $(this).prev("p").html();
            var tooltip = $(this).prev("p").attr("data-text");
            if ($(this).html() == "查看全文") {
                $(this).html("收起全文")
            } else {
                $(this).html("查看全文")
            }
            $(this).prev("p").html(tooltip);
            $(this).prev("p").attr("data-text", text);

        })

        $(pageId + "#fundManagerList").on("click", ".check_more_box a", function () {
            $(this).parents(".fundmanager_00").siblings("div").show();
            $(this).parents(".check_more_box").remove()

        })

        //基金经理跳转
        $(pageId + "#fundManagerList").on("click", "tr", function () {
            var pid = $(this).attr("data-id");
            var param = {
                "product_id": pid
            };
            $.desRedirect("fund/funddetail", param);
        })

        // 跳转到指数红绿灯
        // $(pageId + " #productInfo").bindChildEvent("#indexlight", function () {
        //     window.location.href = "/main/fund/indexlight.shtml";
        // }, "click");


        // 相关推荐产品名称气泡
        $(pageId + " #pd_recommend").bindChildEvent("li", function () {
            var is_nick = $(this).find("h3").hasClass("product_nick");
            if (is_nick) {
                $(this).find(".tip_lybox1").show();
            }
        }, "mousemove");
        $(pageId + " #pd_recommend").bindChildEvent("li", function () {
            $(this).find(".tip_lybox1").hide();
        }, "mouseout");

        //点击立即购买或一键定投
        $(pageId + " #pd_opeabox").bindChildEvent("a.popping", function () {
            if (!$(this).hasClass("disabled")) {

                var lcjbuyfundcode=$("#lcjbuyfundcode").val();
                var currentCode=$(this).attr('data-code');
                if(lcjbuyfundcode.indexOf(currentCode)>-1){
                    $("#lcj_purchase").show();
                }else {

                    if ($(this).index() == 0) {
                        $('#loginBuy').attr('href', $.gconfig.global.buyDetail + '?fundCode=' + $(this).attr('data-code'));
                        $('#purchase div.dt_benefit_tit a.link').removeClass('on');
                        $("#purchase .dt_benefit_cont").hide();
                        $("#purchase").show();
                    } else if ($(this).index() == 1) {
                        $('#loginFixed').attr('href', $.gconfig.global.fixedDetail + '?fundCode=' + $(this).attr('data-code'));
                        $("#fixedInvestment div.dt_benefit_tit a.link").removeClass('on');
                        $("#fixedInvestment .dt_benefit_cont").hide();
                        $("#fixedInvestment").show();
                        // if ($(this).attr("data-isetf") == '1') {
                        //     $("#fixedInvestment div.exp_txt_01").show();
                        // } else {
                        //     $("#fixedInvestment div.exp_txt_01").hide();
                        // }
                    }
                }
                $("body").css("overflow", "hidden");
            }



        })
        //基金营销
        $(pageId + " #fundRecomVideo .recom_video_list ul").bindChildEvent("li a img", function () {
            $(this).hide();
            $(this).parent().find('video').show();
            $(this).parent().find('video')[0].play();
            $(this).parent().find('video')[0].controls=true;
            mySwiper.stopAutoplay();
        })
        $(pageId + " #fundRecomVideo .recom_video_list ul").bindChildEvent("li a video", function () {
            if($(this)[0].paused==false){
                $(this)[0].pause();
                $(this)[0].muted=true;
                $(this)[0].controls=false;
                mySwiper.startAutoplay();
            }else{
                $(this)[0].play();
                $(this)[0].muted=false;
                $(this)[0].controls=true;
                mySwiper.stopAutoplay();
            }

        })
        //点击立即购买
        $(pageId + " #footerRecom a").click(function () {
            if (!$(this).hasClass('disabled')) {
                if($(this).attr('data-type') == 1){
                    $('#loginBuy').attr('href',$.gconfig.global.buyDetail+'?fundCode='+$(this).attr('data-code'));
                    $('#purchase div.dt_benefit_tit a.link').removeClass('on');
                    $("#purchase .dt_benefit_cont").hide();
                    $("#purchase").show();
                    $("body").css("overflow", "hidden");
                }else{
                    querynewfundyyMarketing();
                }
            }

        })
        $(pageId + " #fundRecomBtn a").click(function () {
            if (!$(this).hasClass('disabled')) {
                if($(this).attr('data-type') == 1){
                    $('#loginBuy').attr('href',$.gconfig.global.buyDetail+'?fundCode='+$(this).attr('data-code'));
                    $('#purchase div.dt_benefit_tit a.link').removeClass('on');
                    $("#purchase .dt_benefit_cont").hide();
                    $("#purchase").show();
                    $("body").css("overflow", "hidden");
                }else{
                    querynewfundyyMarketing();
                }
            }

        })
        $(pageId + " #fixedCode a").click(function () {
            if (!$(this).hasClass('disabled')) {
                if($(this).attr('data-type') == 1){
                    $('#loginBuy').attr('href',$.gconfig.global.buyDetail+'?fundCode='+$(this).attr('data-code'));
                    $('#purchase div.dt_benefit_tit a.link').removeClass('on');
                    $("#purchase .dt_benefit_cont").hide();
                    $("#purchase").show();
                    $("body").css("overflow", "hidden");
                }else{
                    querynewfundyyMarketing();
                }
            }
        })
    }

    /**
     * 查询基金详情
     */
    function queryFundDetail() {

        var param = {
            "product_id": $this.product_id,
        };

        var queryFinanDetailCallBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var productInfo = resultVo.getResults()[0];
                fillProData(productInfo);
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        };
        productService.queryFundDetail(queryFinanDetailCallBack, param);
    }

    /**
     * 填充产品数据
     * @param product
     */

    function fillProData(product) {
        var product_code = product.product_code || '--';
        var product_name = product.product_name || '--';
        var product_abbr = product.product_abbr || '--';
        var product_type = product.product_type || '--';
        var income_annual_sd = product.income_annual_sd || '--';
        var returns_tt = product.returns_tt || '--';
        var unit_nav = product.unit_nav || '--';
        var total_nav = product.total_nav || '--';
        var nav_date = product.nav_date || '--';
        var yieldrate1d = product.yieldrate1d || '--';
        var product_type_text = product.product_type_text || '--';
        var risk_level = product.risk_level || '--';
        var risk_level_text = product.risk_level_text || '--';
        var scale = product.scale || '--';
        var found_date = dateUtils.dateFormat(product.found_date, "yyyy-MM-dd") || '--';
        var parag_content = product.parag_content || '--';
        var operation_mode = product.operation_mode || '--';
        var newest_asset = product.newest_asset || '--';
        var newest_asset_date = product.newest_asset_date || '--';
        var newest_share = product.newest_share;
        newest_share = newest_share ? stringUtils.moneyFormat(newest_share, 2) : '--';
        var assets_nav = product.assets_nav || '--';
        var fund_manager_name = product.fund_manager_name || '--';
        var manager_id = product.manager_id || '--';
        var custodian = product.custodian || '--';
        var benchmark = product.benchmark || '--';
        var invest_objective = product.invest_objective || '--';
        var invest_scope = product.invest_scope || '--';
        var invest_strategy = product.invest_strategy || '--';
        var risk_tips = product.risk_tips;
        var is_etf = product.is_etf;
        var fund_class = product.fund_class; // 产品分类
        var fund_class2 = product.fund_class2; // 产品二级分类
        var fund_class3 = product.fund_class3;
        var fund_class_text = product.fund_class_text; //
        var fund_class2_text = product.fund_class2_text; //
        var fund_color = product.fund_color; // 产品颜色
        var fund_status = product.fund_status; // 产品状态
        var fund_feature = product.fund_feature;//基金特色图片
        var subscribe_start_time = product.subscribe_start_time; // 认购开始时间
        var subscribe_start_time_date = dateUtils.getDateByStr(subscribe_start_time + " 09:00:00");
        var subscribe_end_time = product.subscribe_end_time; // 认购结束时间
        var subscribe_end_time_date = dateUtils.getDateByStr(subscribe_end_time + " 15:00:00");
        var nowDate = new Date();
        var labelJson = product.labelJson;
        var is_qdii = product.is_qdii;
        try {
            labelJson = JSON.parse(labelJson);
        } catch (e) {

        }

        if (product) {
            pageGlobal.product_abbr = product.product_abbr;
            pageGlobal.is_qdii = product.is_qdii;
            pageGlobal.nav_number = product.nav_number ? product.nav_number : "4";
        }

        $this.product_code = product_code;
        $this.product_type = product_type;
        $this.fund_class = fund_class;
        $this.fund_class2 = fund_class2;
        $this.fund_class3 = fund_class3;
        var showusfundcode = $("#showusfundcode").val();
        pageGlobal.showusfundcodeflag = (showusfundcode.indexOf($this.product_code) != -1) ? "1" : "0";
        if(product.samecode_trans_fund=='1'){
            pageGlobal.samecode_is_navfund = product.samecode_is_navfund;
            $('#beforeTran').show();
        }
        var pathName = window.location.pathname;
        if (pathName.indexOf('/fundHolding.shtml') != '-1') {
            $(pageId + "#product_tab li:eq(4)").addClass("act").siblings("li").removeClass("act");
            //pageGlobal.flag = '2';
            //pageGlobal.allocation_type = '01';
            queryAssetAllocationTimer('01', '2');//持仓情况
            $("#positionSituationList1").show().siblings('div:not(.sub_tabnav)').hide();
            $("#fundDetailsList4 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
        } else if (pathName.indexOf('/fundNav.shtml') != '-1') {
            $(pageId + "#product_tab li:eq(5)").addClass("act").siblings("li").removeClass("act");
            pageGlobal.start_date = '';
            pageGlobal.end_date = '';
            $("#fund_start2").val('');
            $("#fund_end2").val('');
            queryNetFundValueList(); //基金净值列表
            $("#netFundValueList1").show().siblings('div:not(.sub_tabnav)').hide();
            $("#fundDetailsList5 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
        } else if (pathName.indexOf('/fundAnn.shtml') != '-1') {
            $(pageId + "#product_tab li:eq(6)").addClass("act").siblings("li").removeClass("act");
            pageGlobal.type = '';
            $("#fundDetailsList6 .sub_tabnav ul li").eq(0).addClass("act").siblings().removeClass("act");
            pageGlobal.keyword = '';
            $("#fundAnnounKey").val('');
            $("#fundDetailsList6 .filter_box1 ul.filter_list1 li").eq(3).addClass("act").siblings().removeClass("act");
            pageGlobal.select_time = '';
            pageGlobal.start_date = '';
            pageGlobal.end_date = '';
            $("#fund_start").val('');
            $("#fund_end").val('');
            queryFundAnnouncementList(); //产品公告
        } else if (pathName.indexOf('/fundSaleOrg.shtml') != '-1') {
            $(pageId + "#product_tab li:eq(7)").addClass("act").siblings("li").removeClass("act");
            querySalesOrganization(); //销售机构

        }


        var is_reits_fund = false;// 是否REITs基金
        var is_new_fund = false;// 是否新发基金
        var is_close_fund = false; // 是否封闭期
        var is_no_fund = false;// 是否 已清盘/已转型

        if (fund_class2=="HFM0505") {
            is_reits_fund = true;
        }
        if (fund_status == "1") {
            is_new_fund = true;
        }
        if (fund_status == "9") {
            is_close_fund = true;
        }
        if (fund_class2=="HFM0506") {
            is_no_fund = true;
        }

        if (is_new_fund) { // 新发基金

        } else if(is_no_fund) {
            // 隐藏货币基金相关选项
            $(pageId + " .yeshb").hide();
            $(pageId + " .nohb").eq(1).addClass("act").show();
            $(pageId + " .nohb").eq(2).show();
        } else if (is_close_fund) { // 封闭期

        } else {
            if (contants.fundType["货币类"].item_value == fund_class && "净值货币型" != fund_class3) { //货币型

                // 显示货币基金相关选项
                $(pageId + " .yeshb").show();
                $(pageId + " .nohb").hide();
            } else {

                // 隐藏货币基金相关选项
                $(pageId + " .yeshb").hide();
                $(pageId + " .nohb").show();

            }
        }

        var etfspecialfundcode = $("#etfspecialfundcode").val();
        var etfspecialfundcodeArray = etfspecialfundcode.split(',');
        var etffundcode = $("#etffundcode").val();
        var etffundcodeArray = etffundcode.split(',');
        var eftbothlistcode = $("#eftbothlistcode").val()
        var eftbothlistcodeArray = eftbothlistcode.split(',');
        // etf 基金，申赎清单显示隐藏(参考官网fundCom.js中逻辑)
        if (is_etf == "1" || is_etf == "true"|| etfspecialfundcodeArray.indexOf(product_code) != -1) {
            $(pageId + " #pcfMoney").html("场内申赎清单");
            $(pageId + " #pcfList").html("");
            $(pageId + " #pcfMoney").attr('href', '/main/fund/tradelist.shtml?product_code=' + product.product_code);
            $(pageId + " #pcfList").attr('href', '/main/fund/tradelist.shtml?product_code=' + product.product_code + '_1');
            $(pageId + " #pcfList").hide();
            $(pageId + " #pcfCouponList").hide();

            //etf型补券信息查询数组
            var BuQu_Array = etffundcodeArray;
            if (eftbothlistcodeArray.indexOf(product_code) != -1) {
                $(pageId + " #pcfMoney").html("实物申赎清单");
                $(pageId + " #pcfList").html("场内申赎清单");
                $(pageId + " #pcfList").show();
                //上海金ETF特殊判断
                if(['159831'].indexOf(product_code) != -1){
                    $(pageId + " #pcfMoney").attr('href', '/main/fund/goldenlist.shtml?product_code=' + product.product_code);
                    $(pageId + " #pcfList").attr('href', '/main/fund/tradelist.shtml?product_code=' + product.product_code);
                }
            }
            if (['159951'].indexOf(product_code) != -1) {
                $(pageId + " #pcfMoney").html("实物申赎清单");
            }
            if (product_code == '515510' && (new Date()).getTime() < (new Date('2020/05/06')).getTime()) {
                $(pageId + " #pcfMoney").hide();
            }
            if ($.inArray(product_code, BuQu_Array) != -1) {
                $(pageId + " #pcfCouponList").show();
            }
            var showCollectionEntry = function(resultVo){
                if(resultVo.obj.results.results.length == 0){
                    $('#collectionCouponList').hide()
                }else{
                    $(pageId + " #collectionCouponList").attr('href', '/main/fund/collectionlist.shtml?product_code=' + product_code);
                }
            }
            var params = {
                "fundCode": product_code,
                "pdfDate":''
            };
            productService.queryCollectionEntry(showCollectionEntry,params)
            $(pageId + " #pcfDiv").show();
        } else {
            $(pageId + " #pcfDiv").hide();
        }

        //1.填充产品基本信息
        var infoHtml = '';
        if(product.fund_status=="1"){
            infoHtml += '<dl class="d_02"><dd><em>' + subscribe_start_time + '</em></dd><dt>认购开始日期</dt></dl>';
            infoHtml += '<dl class="d_02"><dd><em>' + subscribe_end_time + '</em></dd><dt>认购截止日期</dt></dl>';
        }else if(product.fund_status=='9'){
            infoHtml += '<dl><dd><strong class="ared">' + unit_nav + '</strong></dd><dt>单位净值(' + dateUtils.dateFormat(nav_date, 'yyyy-MM-dd') + ')</dt></dl>';
            infoHtml += '<dl><dd><strong class="ared">' + total_nav + '</strong></dd><dt>累计净值</dt></dl>';
        }else if ("HFM04" == product.fund_class && "净值货币型" != product.fund_class3 ){
            var returns_tt_desc = "万份收益";
            var hundred_revenue_allocation = contants.specialCode["hundred_revenue_allocation"] || "";
            var million_revenue_allocation = contants.specialCode["million_revenue_allocation"] || "";
            if (hundred_revenue_allocation.indexOf($this.product_code) != -1) {
                returns_tt_desc = "百份收益";
            } else if (million_revenue_allocation.indexOf($this.product_code) != -1) {
                returns_tt_desc = "百万份收益";
            }
            infoHtml += '<dl><dd><strong class="' + enumerateUtils.getClassColor(returns_tt) + '">' + stringUtils.parseFloatFormat(returns_tt, '--', 4) + '</strong></dd><dt>'+returns_tt_desc+'(' + dateUtils.dateFormat(nav_date, 'yyyy-MM-dd') + ')</dt></dl>';
            infoHtml += '<dl><dd><strong class="' + enumerateUtils.getClassColor(income_annual_sd) + '">' + stringUtils.parseFloatFormat(income_annual_sd, '--', 4) + '%</strong></dd><dt>七日年化收益率</dt></dl>';
        }else{
            infoHtml += '<dl><dd><strong class="ared">' + unit_nav + '</strong></dd><dt>单位净值(' + dateUtils.dateFormat(nav_date, 'yyyy-MM-dd') + ')</dt></dl>';
            infoHtml += '<dl><dd><strong class="ared">' + total_nav + '</strong></dd><dt>累计净值</dt></dl>';
            if (is_reits_fund) {
                // REITs产品不显示日涨跌幅
                infoHtml += '<dl><dd><strong class="gray">--</strong></dd><dt>日涨跌幅</dt></dl>';
            } else {
                infoHtml += '<dl><dd><strong class="' + enumerateUtils.getClassColor(yieldrate1d) + '">' + stringUtils.parseFloatFormat(yieldrate1d, '--', 2, 1, '<span>%</span>', true) + '</strong></dd><dt>日涨跌幅</dt></dl>';
            }
        }
        infoHtml += '<div id="indexlight" class="fund_gzinfo"></div>';
        $("#productInfo").html(infoHtml);
        if ("HFM02" == product.fund_class && !is_new_fund && !is_no_fund && !is_close_fund) {
            //指数信号灯
            queryindexlightList();
        }

        //2. 非货币 收益走势图；货币型 七日年化
        if (contants.fundType["货币类"].item_value == fund_class && "净值货币型" != fund_class3) { //货币型
            $this.fundChartType = 5;
            queryNavList();
        } else if(is_no_fund) {
            $this.fundChartType = 2;
            queryNavList();
        } else {
            $this.fundChartType = 1;
            $(pageId + " .chart_imgbox1").height('330px');
            queryAvgreturnList();
        }

        //3.基金特色、基金经理相关
        if (fund_feature) {
            $(pageId + "#fundDetailsList0 img").attr("src", fund_feature);
            $("#product_tab li:eq(0)").show().addClass("act").siblings("li").removeClass("act");
            $("#fundDetailsList0").show().siblings("div").hide();
        }

        queryFundManagerInfo();//查询基金经理信息
        if (is_close_fund) {
            //封闭期不展示基金经理tab
            $("#product_tab li:eq(1)").hide();
            //封闭期不展示销售机构tab
            $("#product_tab li:eq(7)").hide();
            if (fund_feature) {
                $("#product_tab li:eq(0)").addClass("act").siblings("li").removeClass("act");
            } else {
                $("#product_tab li:eq(2)").addClass("act").siblings("li").removeClass("act");
            }
        }

        var parag_content_encode = product.parag_content_encode;
        if (parag_content_encode) {
            //“管理人投资回顾与展望”有数据时展示该tab
            parag_content = decodeURIComponent(parag_content_encode);
            $(pageId + "#fundDetailsList1 .sub_tabcont2 .text_indent").html(parag_content);
            $("#fundDetailsList1 .sub_tabnav li:eq(1)").show();
        }

        //4.基金档案相关
        $(pageId + " #tem_name").html(product_name);
        $(pageId + " #run_way").html(operation_mode);
        $(pageId + " #tem_abbr").html(product_abbr);
        $(pageId + " #tem_start").html(found_date);
        $(pageId + " #tem_code").html(product_code);

        if (newest_asset != "--" && newest_asset != null && newest_asset != "") {
            newest_asset = (newest_asset / 100000000);
            var newest_asset_bignumber=stringUtils.dealBigNumber(newest_asset);
            newest_asset = stringUtils.moneyFormat(newest_asset_bignumber, 2);
            $(pageId + " #tem_zcjz").html( newest_asset+ "亿元<br/>(日期：" + dateUtils.dateFormat(newest_asset_date, 'yyyy-MM-dd') + ")");
        } else {
            $(pageId + " #tem_zcjz").html("--");
        }

        $(pageId + " #tem_type").html(fund_class_text || "--");
        $(pageId + " #tem_scale").html(newest_share);
        $(pageId + " #tem_risk").html(risk_level_text + '<a target="_blank" href="'+riskPageUrl+'" class="ared">（查看划分方法与说明)</a>');
        $(pageId + " #tem_manage").html(manager_id);
        $(pageId + " #tem_manager").html(fund_manager_name);
        $(pageId + " #tem_custodian").html(custodian);
        if(!product.benchmark || !product.benchmark.trim()){
            $("#fundDetailsList2 .sub_tabcont1 .pd_detail_box:eq(1)").hide();
        }else{
            $(pageId + " #floating_income_rate").html(product.benchmark);
        }
        if(!product.invest_objective || !product.invest_objective.trim()){
            $("#fundDetailsList2 .sub_tabcont1 .pd_detail_box:eq(2)").hide();
        }else{
            $(pageId + " #invest_objective").html(product.invest_objective);
        }
        if(!product.invest_scope || !product.invest_scope.trim()){
            $("#fundDetailsList2 .sub_tabcont1 .pd_detail_box:eq(3)").hide();
        }else{
            $(pageId + " #invest_scope").html(product.invest_scope);
        }
        if(!product.invest_strategy || !product.invest_strategy.trim()){
            $("#fundDetailsList2 .sub_tabcont1 .pd_detail_box:eq(4)").hide();
        }else{
            $(pageId + " #invest_strategy").html(product.invest_strategy);
        }
        if (risk_tips) {
            $(pageId + " #risk_tips").html(risk_tips);
            $("#fundDetailsList2 .sub_tabnav li:eq(1)").show();
        }
        pageGlobal.benchmark = benchmark;


        //5.基金费率相关
        queryFeerate();
        if (is_new_fund) {
            $("#fundDetailsList3 .pd_detail_box0").show();
            $("#fundDetailsList3 .pd_detail_box1").hide();
        } else {
            $("#fundDetailsList3 .pd_detail_box0").hide();
            $("#fundDetailsList3 .pd_detail_box1").show();
        }
        if (is_close_fund) {
            //封闭期不展示基金费率tab
            $("#product_tab li:eq(3)").hide();
        }

        //6.查询基金交易节点
        // querySessionId(queryTradeInfo);

        //7.展示收益表现
        queryIncomeInfo(product);
        if (is_new_fund || is_close_fund || is_reits_fund || product.fund_class2=='HFM0506') {
            $("#right_box2 .pd_right_module1").hide();
        }

        //8.查询基金荣誉
        // queryProductHonor();
        // if (is_new_fund) {
        //     //新发基金不展示
        //     $("#right_box2 .pd_right_module1").hide();
        //     //新发基金不展示基金净值tab
        //     $("#product_tab li:eq(5)").hide();
        // }

        //10.查询相关推荐基金
        // queryPdRecommend();

        // 11. 只有 主动股票类、其他类 展示行情信息
        if ((contants.fundType["主动股票类"].item_value == fund_class ||
            contants.fundType["其他类"].item_value == fund_class)
            && !is_new_fund && !is_no_fund && !is_close_fund) {
            queryHQMain(); // 上证、深证、创业板 行情信息
        } else {
            $(pageId + ".index_data .close").trigger("click");
        }

        // 12. 指数型号灯
        // if (contants.fundType["股票指数类"].item_value == fund_class
        //     && !is_new_fund && !is_no_fund && !is_close_fund) { // 指数型
        //     queryindexlightList();
        // }

        // 13. slogn：指数型、股票、混合型、债券型 展示；货币 不展示
        // if ($this.isHbFund || is_new_fund || is_no_fund || is_close_fund) {
        //     $(pageId + " .pd_imptips").hide();
        // } else {
        //     $(pageId + " .pd_imptips").show();
        // }

        // 14. 净值估算tab
        if (!$this.isHbFund && !is_new_fund && !is_no_fund && !is_close_fund) {
            queryReflectList(false);
        } else {
            $(pageId + " #fundChartType li[data-type=4]").hide();
        }

        //15.详情页预约、购买、定投、基金比一比按钮展示
        queryFundDisplayStatus(product);

        // var can_appointment = false;//不可预约
        // var discount_bnt = product.discount_bnt || '立即购买';
        // var special_fund_tips = product.special_fund_tips || '';
        // var button_html= '<div class="pd_buybtn">';
        // if(product.is_cn_etf=="1"){
        //     //如果是场内etf基金，展示置灰的购买按钮、基金比一比按钮
        //     button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);">'+discount_bnt+'</a>';
        //     button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);" style="display:none;">一键定投</a>';
        //     button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
        // }else{
        //     // 1.如果fund_status=="1" && is_buy=="1" 展示预约按钮;如果 fund_status=="1" && is_buy!="1",展示购买按钮
        //     // 2.其他产品状态下，如果能购买，展示购买按钮、基金比一比按钮；如果不能购买，能定投，展示定投按钮、基金比一比按钮；如果不能购买，不能定投，展示置灰的购买按钮、基金比一比按钮
        //     var can_buy = true;//可购买
        //     var can_cast = true;//可定投
        //     if(product.fund_status==="4"||product.fund_status==="5"||product.fund_status==="9"||product.fund_status==="a"){
        //         can_buy = false;
        //     }
        //     if(product.state_cast!="0" && product.product_code!="159922" && product.product_code!="159918" && product.product_code!="159910" && product.product_code!="159919"){
        //         can_cast = false;
        //     }
        //     if(product.fund_status=="1" && product.is_buy=="1"){
        //         can_appointment = true;
        //     }else if(product.fund_status=="1" && product.is_buy!="1"){
        //         $(pageId + " #pd_opeabox").removeClass("pd_opeabox").addClass("pd_opeabox2");
        //         button_html+='<a class="btn3 popping" href="javascript:void(0);">'+discount_bnt+'</a>';
        //     }else if(can_buy){
        //         button_html+= '<a class="btn1 popping" href="javascript:void(0);">'+discount_bnt+'</a>';
        //         button_html+= '<a class="btn1 popping" href="javascript:void(0);" style="display:none;">一键定投</a>';
        //         button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
        //     }else if(!can_buy && can_cast){
        //         button_html+= '<a class="btn1 popping" href="javascript:void(0);" style="display:none;">'+discount_bnt+'</a>';
        //         button_html+= '<a class="btn1 popping" href="javascript:void(0);">一键定投</a>';
        //         button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
        //     } else{
        //         button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);">'+discount_bnt+'</a>';
        //         button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);" style="display:none;">一键定投</a>';
        //         button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
        //     }
        // }
        // button_html+= '</div>';
        // if(product.fund_status=="1" && product.is_buy!="1"){
        //     button_html+= '<p class="imp_tips">认购期仅供参考，以基金公告为准，为避免基金认购提前结束，请及时购买。</p>';
        // }
        // if((product.fund_status==="9"||product.fund_status==="a") && product.fund_class2=='HFM0506'){
        //     //已清盘/已转型
        //     if(product.convert_fund_code){
        //         button_html+= '<p class="imp_tips">本基金已转型为<a href="/main/fund/'+product.convert_fund_code+'/fundManager.shtml">product.convert_fund_name</a></p>';
        //     }else{
        //         button_html+= '<p class="imp_tips">本基金已清盘</p>';
        //     }
        // }
        // if(special_fund_tips){
        //     button_html+= '<p class="warn">'+special_fund_tips+'</p>';
        // }
        //
        // if(can_appointment){
        //     $(pageId + " #pd_opeabox").removeClass("pd_opeabox").addClass("pd_opeabox2");
        //     querynewfundyy();
        // }else{
        //     $(pageId + " #pd_opeabox").html(button_html);
        // }
    }


    /**
     * 购买按钮参数查询
     */
    function queryFundDisplayStatus(product) {
        var param = {
            "product_codes": $this.product_code,
            "query_type": "1",
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var data = resultVo.getResults()[0];
                var discount_bnt = product.discount_bnt || '立即购买';
                var special_fund_tips = product.special_fund_tips || '';
                var can_appointment = false;//不可预约
                var can_buy = true;//可购买
                var can_cast = true;//可定投

                //产品可预约，则不可购买、不可定投
                if(data.appoinStatus =='1'){
                    var can_appointment = true;
                    var can_buy = false;
                    var can_cast = false;
                }
                //fundmarket接口无返回，表示尚未开放认购。不可购买、不可定投
                if(data.canbuy =='' && data.declarestatus =='' && data.redeemstatus ==''){
                    var can_buy = false;
                    var can_cast = false;
                }
                //canbuy != '1' 时，表示不可在直销购买。不可购买、不可定投
                if(data.canbuy !='1'){
                    var can_buy = false;
                    var can_cast = false;
                    pageGlobal.organizationCanBuy = false;
                    $('#fundDetailsList7 #salesOrganizationList1').show();
                    $('#fundDetailsList7 .sub_tabnav ul li:eq(0)').show();
                    $('#fundDetailsList7 .sub_tabnav ul li:eq(0)').addClass("act").siblings().removeClass("act");
                    querySalesOrganization();
                }
                //declarestatus <> '1'，表示基金不可申购、认购。不可购买
                if(data.declarestatus !='1'){
                    var can_buy = false;
                }
                //fixstatus <> '1'，表示基金不可定投。不可定投
                if(data.fixstatus !='1'){
                    var can_cast = false;
                }

                //如果能购买，展示购买按钮、基金比一比按钮；如果不能购买，能定投，展示定投按钮、基金比一比按钮；如果不能购买，不能定投，展示置灰的购买按钮、基金比一比按钮
                var button_html= '<div class="pd_buybtn">';

                if(can_buy) {
                    button_html += '<a class="btn1 popping" href="javascript:void(0);" data-code="'+product.product_code+'">' + discount_bnt + '</a>';
                    button_html += '<a class="btn1 popping" href="javascript:void(0);" style="display:none;">一键定投</a>';
                    button_html += '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code=' + product.product_code + '" target="_blank" >选基比一比</a>';
                }else if(can_cast){
                    button_html+= '<a class="btn1 popping" href="javascript:void(0);" style="display:none;">'+discount_bnt+'</a>';
                    button_html+= '<a class="btn1 popping" href="javascript:void(0);" data-code="'+product.product_code+'">一键定投</a>';
                    button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
                } else{
                    button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);" data-code="'+product.product_code+'">'+discount_bnt+'</a>';
                    button_html+= '<a class="btn1 disabled popping" href="javascript:void(0);" style="display:none;">一键定投</a>';
                    button_html+= '<a class="border btn2" href="/main/fund/Gadgets/fundcompare/index.shtml?product_code='+product.product_code+'" target="_blank" >选基比一比</a>';
                }
                button_html+= '</div>';
                if(product.fund_status=="1" && product.is_buy!="1"){
                    button_html+= '<p class="imp_tips">认购期仅供参考，以基金公告为准，为避免基金认购提前结束，请及时购买。</p>';
                }
                if((product.fund_status==="9"||product.fund_status==="a") && product.fund_class2=='HFM0506'){
                    //已清盘/已转型
                    if(product.convert_fund_code){
                        button_html+= '<p class="imp_tips">本基金已转型为<a href="/main/fund/'+product.convert_fund_code+'/fundManager.shtml">product.convert_fund_name</a></p>';
                    }else{
                        button_html+= '<p class="imp_tips">本基金已清盘</p>';
                    }
                }
                //special_fund_tips="该基金由嘉实瑞熙三年封闭运作混合型证券投资基金转型而来";
                //如果产品中配置产品的特殊提示(special_fund_tips)则显示到基金详情下如果没有配置则不显示行
                var funddetailpage = "#main_fund_funddetail ";
                if(special_fund_tips){
                    //  button_html+= '<p class="warn">'+special_fund_tips+'</p>';
                    if(special_fund_tips){
                        $(funddetailpage + " #tem_warn").html(special_fund_tips);
                    }
                }else{
                    $(funddetailpage + " #tem_warn").parent().empty()
                }
                if(can_appointment){
                    $(pageId + " #pd_opeabox").removeClass("pd_opeabox").addClass("pd_opeabox2");
                    querynewfundyy();
                }else{
                    $(pageId + " #pd_opeabox").html(button_html);
                }
                if (can_buy) {
                    $(pageId + ' #fixedCode a').html('立即购买');
                    $(pageId + ' #fixedCode a').attr('data-type','1');
                    $(pageId + ' #footerRecom a span').html('立即购买');
                    $(pageId + ' #footerRecom a').attr('data-type','1');
                    $(pageId + ' #fundRecomBtn a span').html('立即购买');
                    $(pageId + ' #fundRecomBtn a').attr('data-type','1');
                } else if (can_appointment) {
                    $(pageId + ' #fixedCode a').html('预约提醒');
                    $(pageId + ' #fixedCode a').attr('data-type','2');
                    $(pageId + ' #footerRecom a span').html('预约提醒');
                    $(pageId + ' #footerRecom a').attr('data-type','2');
                    $(pageId + ' #fundRecomBtn a span').html('预约提醒');
                    $(pageId + ' #fundRecomBtn a').attr('data-type','2');
                } else {
                    $(pageId + ' #fixedCode a').html('立即购买');
                    $(pageId + ' #fixedCode a').addClass('disabled');
                    $(pageId + ' #footerRecom a span').html('立即购买');
                    $(pageId + ' #footerRecom a').addClass('disabled');
                    $(pageId + ' #footerRecom a img').attr('src','/ws/images/fund_btn06.png');
                    $(pageId + ' #fundRecomBtn a span').html('立即购买');
                    $(pageId + ' #fundRecomBtn a').addClass('disabled');
                    $(pageId + ' #fundRecomBtn a img').attr('src','/ws/images/fund_btn07.png');
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.queryFundDisplayStatus(callBack, param);
    }

    /**
     * 净值信息查询 画图(**)
     * @param product_id 产品编号
     * @param monthNum 查询月份
     * @param is_trend 是否走势图
     */
    function queryNavList() {

        var param = {
            "product_id": $this.product_id,
            "select_time": $this.fundChartTime,
            "type": "2"
        };
        var $span = $("#fundChartTime span.act");
        var _type = $span.data("type");
        var dateList = switchDate(_type);

        //如果时间筛选中存在值的话
        if (pageGlobal.fund_start_time && pageGlobal.fund_end_time) {
            var start_date1 = new Date(pageGlobal.fund_start_time).Format('yyyyMMdd');
            var end_date1 = new Date(pageGlobal.fund_end_time).Format('yyyyMMdd');
            param.start_date =start_date1;
            param.end_date = end_date1;
        } else if (dateList.query_month) {
            param.query_month = dateList.query_month;
        } else {
            param.start_date = dateList.start_date;
        }
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    $(pageId + "#chart_no_data").hide();
                    // $(pageId + "#container").prop("outerHTML", '<div id="container" style="height: 380px;"></div>');
                    $(pageId + "#container").height("380px").show();
                    echartsOption($this.fundChartType, dataList, 'container');
                } else {
                    // $(pageId + "#container").html(stringUtils.showNoData());
                    $(pageId + "#chart_no_data").show();
                    $(pageId + "#container").hide();
                }
            } else {
                $(pageId + "#chart_no_data").show();
                $(pageId + "#container").hide();
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.queryNavList(callBack, param);

        pageGlobal.fund_start_time = "";
        pageGlobal.fund_end_time = "";
        $("#start_time").empty();
        $("#end_time").empty();
    }


    /**
     * 基金估值查询 画图(**)
     * @param renderflag 是否绘图 默认true
     */
    function queryReflectList(renderflag) {
        renderflag = typeof renderflag === "boolean" ? renderflag : true;
        var param = {
            "product_id": $this.product_id
        };
        var callBack = function (resultVo) {
            // 如果不用绘图，并且数据异常，则隐藏净值估算tab
            if (!renderflag) {
                if ((resultVo.getErrorNo() != 0 || resultVo.getResults().length === 0)) {
                    $(pageId + " #fundChartType li[data-type=4]").hide();
                } else {
                    $(pageId + " #fundChartType li[data-type=4]").show();
                }
                return false
            }
            if (resultVo.getErrorNo() == 0) {
                var results = resultVo.getResults();
                if (results && results.length > 0) {
                    $(pageId + "#chart_no_data").hide();
                    try {
                        results = JSON.parse(results[0].data).result[0];
                        dataList = results.datalist;
                        var date = dateUtils.getDateByStr(results.date).Format("MM-dd");
                    } catch (e) {
                        console.error(e)
                    }
                    // $(pageId + "#container").prop("outerHTML", '<div id="container" style="height: 380px;"></div>');
                    $(pageId + "#container").height("380px").show();
                    $(pageId + " #attach .chart_info1 strong:eq(2)").html(date);
                    echartsOption($this.fundChartType, dataList, 'container');
                } else {
                    $(pageId + "#chart_no_data").show();
                    $(pageId + "#container").hide();
                    // $(pageId + "#container").html(stringUtils.showNoData());
                }
            } else {
                $(pageId + "#chart_no_data").show();
                $(pageId + "#container").hide();
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.queryReflectList(callBack, param);

        pageGlobal.fund_start_time = "";
        pageGlobal.fund_end_time = "";
        $("#start_time").empty();
        $("#end_time").empty();
    }

    /**
     * 基金经理查询（**）
     */
    function queryFundManagerInfo() {
        var param = {
            "product_id": $this.product_id,
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var strHtml = '<div class="pd_detail_tit"><h3><i class="ic_01"></i>基金经理</h3></div>';
                    if(dataList[0].manage_status=="0"){
                        $(pageId + " #tem_manager").prev().html("拟任基金经理");
                        $(pageId + "#fundDetailsList1 .sub_tabnav a:eq(0)").html("拟任基金经理");
                        strHtml = '<div class="pd_detail_tit"><h3><i class="ic_01"></i>拟任基金经理</h3></div>';
                    }
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i]
                        var manager_id = item.manager_id
                        var product_list = item.sublist
                        var office_time = item.office_time;
                        var officestr = "--";
                        if(office_time){
                            officestr = "";
                            var new_data = new Date();
                            var betweenDate = dateUtils.getDiffYmdBetweenDate(office_time, new_data.Format("YYYY-MM-dd"));
                            if (betweenDate.y > 0) {
                                officestr += betweenDate.y + "年";
                            }
                            if (betweenDate.m > 0) {
                                officestr += betweenDate.m + "月";
                            }
                            if (betweenDate.d > 0) {
                                officestr += betweenDate.d + "天";
                            }
                        }

                        var label_desc = '';
                        var label = item.label;
                        if (label) {
                            label_desc = '<span>' + item.label + '</span>';
                        }
                        strHtml += '<dl class="manager_dl">';
                        strHtml += '<dt><img src="' + item.fund_manager_photo_url + '"></dt>';
                        strHtml += '<dd><div class="name"><b>' + item.fund_manager_name + '</b>' + label_desc + '</div>';
                        strHtml += '<div class="label"><span>从业日期：<b>' + item.work_year + '</b></span><span>管理时间：<b>' + officestr + '</b></span></div>';
                        strHtml += '<div class="brief fold">' + item.fund_manager_info + '<a href="javaScript:void(0);" class="open" style="display:none;">展开</a></div>';

                        if (product_list && JSON.parse(product_list).length > 0) {
                            product_list = JSON.parse(product_list);
                            strHtml += '<div class="total_num">管理基金</div>';
                            if (product_list.length > 3) {
                                strHtml += '<div class="fund_table t2" style="max-height: 228px;overflow: hidden;"><table cellspacing="0" cellpadding="0">';
                            } else {
                                strHtml += '<div class="fund_table t2" style="max-height: none;overflow: hidden;"><table cellspacing="0" cellpadding="0">';
                            }
                            for (var j = 0; j < product_list.length; j++) {
                                var product = product_list[j];
                                if(getQueryValue('from') == 'zgj'){
                                    strHtml += '<tr data-id="' + product.product_id + '">' +
                                        '<td class="text_lt" width="40%">' +
                                        '<p class="p3"><a target="_blank" href="/main/fund/' + product.product_code + '/fundManager.shtml?from=zgj">' + product.product_abbr + '</a></p>' +
                                        '<p class="p1">' + product.product_code + '</p>' +
                                        '</td>' +
                                        '<td width="20%">' +
                                        '<p class="p2 ' + enumerateUtils.getClassColor(product.yieldratety) + '">' + stringUtils.parseFloatFormat(product.yieldratety, '--', 2, 1, '%', true) + '</p>' +
                                        '<p class="p4">今年以来涨幅</p>' +
                                        '</td>' +
                                        '<td width="20%">' +
                                        '<p class="p2">' + stringUtils.parseFloatFormat(product.total_nav, '--', 4, 1) + '</p>' +
                                        '<p class="p4">累计净值</p>' +
                                        '</td>' +
                                        '</tr>';
                                }else{
                                    strHtml += '<tr data-id="' + product.product_id + '">' +
                                        '<td class="text_lt" width="40%">' +
                                        '<p class="p3"><a target="_blank" href="/main/fund/' + product.product_code + '/fundManager.shtml">' + product.product_abbr + '</a></p>' +
                                        '<p class="p1">' + product.product_code + '</p>' +
                                        '</td>' +
                                        '<td width="20%">' +
                                        '<p class="p2 ' + enumerateUtils.getClassColor(product.yieldratety) + '">' + stringUtils.parseFloatFormat(product.yieldratety, '--', 2, 1, '%', true) + '</p>' +
                                        '<p class="p4">今年以来涨幅</p>' +
                                        '</td>' +
                                        '<td width="20%">' +
                                        '<p class="p2">' + stringUtils.parseFloatFormat(product.total_nav, '--', 4, 1) + '</p>' +
                                        '<p class="p4">累计净值</p>' +
                                        '</td>' +
                                        '</tr>';
                                }
                            }
                            if (product_list.length > 3) {
                                strHtml += '</table></div><div class="more"><a href="javaScript:void(0);">展开</a></div>';
                            } else {
                                strHtml += '</table></div>';
                            }
                        }
                        strHtml += '</dd></dl>';
                    }

                    $(pageId + "#fundDetailsList1 .sub_tabcont1 .pd_detail_box").html(strHtml);
                    $(pageId + "#fundDetailsList1 .brief").each(function(i){
                        var bheight = $(pageId + "#fundDetailsList1 .brief:eq("+i+")").height();
                        if (bheight > 84) {
                            $(pageId + "#fundDetailsList1 .brief:eq("+i+")").removeClass("fold");
                            $(pageId + "#fundDetailsList1 .brief:eq("+i+") a").show();
                        }
                    });

                } else {
                    $(pageId + "#fundDetailsList1 .sub_tabcont1 .pd_detail_box").html(stringUtils.showNoData());
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryFundManagerInfo(callBack, param);
    }



    /**
     * 可转换基金查询
     */
    function queryConvertibleFund() {
        var param = {
            "fund_code": $this.product_code
        };

        var queryCallback = function (resultVo) {
            var dataList = resultVo.getResults("results");
            if (dataList && dataList.length > 0) {
                console.log('true' + dataList );
                var queryConvertibleStockFund = '';
                var queryConvertibleMixFund = '';
                var queryConvertibleBondFund = '';
                var queryConvertibleIndexFund = '';
                var queryConvertibleMoneyFund = '';
                var queryConvertibleStockFundCount = 0;
                var queryConvertibleMixFundCount = 0;
                var queryConvertibleBondFundCount = 0;
                var queryConvertibleIndexFundCount = 0;
                var queryConvertibleMoneyFundCount = 0;

                for (var i = 0; i < dataList.length; i++) {
                    var product_code = dataList[i].product_code;
                    var product_name = dataList[i].product_name;
                    var product_abbr = dataList[i].product_abbr;
                    var product_id = dataList[i].product_id;
                    var unit_nav = dataList[i].unit_nav;
                    var nav_number = dataList[i].nav_number;
                    var total_nav = dataList[i].total_nav;
                    var yieldrate1d = dataList[i].yieldrate1d;
                    var yieldratety = dataList[i].yieldratety;
                    var yieldrate1m = dataList[i].yieldrate1m;
                    var yieldrate3m = dataList[i].yieldrate3m;
                    var yieldrate1y = dataList[i].yieldrate1y;
                    var fund_class_text = dataList[i].fund_class_text;
                    var returns_tt = dataList[i].returns_tt;
                    var income_annual_sd = dataList[i].income_annual_sd;
                    var yieldratety = dataList[i].yieldratety;
                    var yieldrate = dataList[i].yieldrate;
                    var nav_date = dataList[i].nav_date;
                    var is_cn_etf = dataList[i].is_cn_etf;
                    var cn_etf_desc = dataList[i].cn_etf_desc;



                    if (fund_class_text == '主动股票类') {

                        queryConvertibleStockFundCount++;
                        queryConvertibleStockFund +=
                            '                            <tr>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p1">' + queryConvertibleStockFundCount + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td class="title_name">\n' +
                            '                                    <div class="tit">\n' +
                            '                                        <a href=\'/main/fund/' + product_code + '/fundManager.shtml\' target=\'_blank\'>' + product_abbr + '</a>\n' +
                            '                                        <div class="fund_xxlayer" style="top: -13px;left: 100%;display: none;">\n' +
                            '                                            <ul>\n' +
                            '                                                <li><strong> ' + product_name + '</strong></li>\n' +
                            '                                            </ul>\n' +
                            '                                        </div>\n' +
                            '\n' +
                            '                                    </div>\n' +
                            '                                    <p class="p1">' + product_code + '</p>\n' +
                            '                                </td>\n' +
                            '                                   <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(unit_nav) + '">' + stringUtils.parseFloatFormat(unit_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(total_nav) + '">' + stringUtils.parseFloatFormat(total_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                       <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1d) + '">' + stringUtils.parseFloatFormat(yieldrate1d, '--',2, 1, '%')  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldratety) + '">' + stringUtils.parseFloatFormat(yieldratety, '--',2, 1, '%' )   + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1m) + '"> ' + stringUtils.parseFloatFormat(yieldrate1m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate3m) + '">' + stringUtils.parseFloatFormat(yieldrate3m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1y) + '">' + stringUtils.parseFloatFormat(yieldrate1y, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' ;
                        if (is_cn_etf == "1") {
                            var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + cn_etf_desc + '</strong>';
                            queryConvertibleStockFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投' + desc +'</a></div></td>';
                        } else {
                            queryConvertibleStockFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买'+hchart.isPurchaseOrder('3',dataList[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投'+hchart.isPurchaseOrder('4',dataList[i])+'</a></div></td>';
                        }
                        queryConvertibleStockFund += '</tr>';
                    }

                    if (fund_class_text == '股票指数类') {
                        queryConvertibleIndexFundCount++;
                        queryConvertibleIndexFund +=
                            '                            <tr>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p1">' + queryConvertibleIndexFundCount + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td class="title_name">\n' +
                            '                                    <div class="tit">\n' +
                            '                                        <a href=\'/main/fund/' + product_code + '/fundManager.shtml\' target=\'_blank\'>' + product_abbr + '</a>\n' +
                            '                                        <div class="fund_xxlayer" style="top: -13px;left: 100%;display: none;">\n' +
                            '                                            <ul>\n' +
                            '                                                <li><strong> ' + product_name + '</strong></li>\n' +
                            '                                            </ul>\n' +
                            '                                        </div>\n' +
                            '\n' +
                            '                                    </div>\n' +
                            '                                    <p class="p1">' + product_code + '</p>\n' +
                            '                                </td>\n' +
                            '                                                 <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(unit_nav) + '">' + stringUtils.parseFloatFormat(unit_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(total_nav) + '">' + stringUtils.parseFloatFormat(total_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                       <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1d) + '">' + stringUtils.parseFloatFormat(yieldrate1d, '--',2, 1, '%')  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldratety) + '">' + stringUtils.parseFloatFormat(yieldratety, '--',2, 1, '%' )   + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1m) + '"> ' + stringUtils.parseFloatFormat(yieldrate1m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate3m) + '">' + stringUtils.parseFloatFormat(yieldrate3m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1y) + '">' + stringUtils.parseFloatFormat(yieldrate1y, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' ;

                        if (is_cn_etf == "1") {
                            var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + cn_etf_desc + '</strong>';
                            queryConvertibleIndexFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投' + desc +'</a></div></td>';
                        } else {
                            queryConvertibleIndexFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买'+hchart.isPurchaseOrder('3',dataList[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投'+hchart.isPurchaseOrder('4',dataList[i])+'</a></div></td>';
                        }
                        queryConvertibleIndexFund += '</tr>';
                    }

                    if (fund_class_text == '货币类') {
                        queryConvertibleMoneyFundCount++;
                        queryConvertibleMoneyFund +=
                            '<tr>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p1">' + queryConvertibleMoneyFundCount + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td class="title_name">\n' +
                            '                                    <div class="tit">\n' +
                            '                                        <a href=\'/main/fund/' + product_code + '/fundManager.shtml\' target=\'_blank\'>' + product_abbr + '</a>\n' +
                            '                                    </div>\n' +
                            '                                    <p class="p1">' + product_name + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(returns_tt) + ' ">' + stringUtils.parseFloatFormat(returns_tt, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(income_annual_sd) + '">' + stringUtils.parseFloatFormat(income_annual_sd, '--', nav_number, 1, '' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldratety) + '">' + stringUtils.parseFloatFormat(yieldratety, '--', 2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2' + enumerateUtils.getClassColor(yieldrate1y) + '">' + stringUtils.parseFloatFormat(yieldrate1y, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate) + '">' + stringUtils.parseFloatFormat(yieldrate, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' ;
                        if (is_cn_etf == "1") {
                            var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + cn_etf_desc + '</strong>';
                            queryConvertibleMoneyFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投' + desc +'</a></div></td>';
                        } else {
                            queryConvertibleMoneyFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买'+hchart.isPurchaseOrder('3',dataList[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投'+hchart.isPurchaseOrder('4',dataList[i])+'</a></div></td>';
                        }
                        queryConvertibleMoneyFund += '</tr>';

                    }

                    if (fund_class_text == '债券类') {
                        queryConvertibleBondFundCount++;
                        queryConvertibleBondFund +=
                            '                            <tr>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p1">' + queryConvertibleBondFundCount + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td class="title_name">\n' +
                            '                                    <div class="tit">\n' +
                            '                                        <a href=\'/main/fund/' + product_code + '/fundManager.shtml\' target=\'_blank\'>' + product_abbr + '</a>\n' +
                            '                                        <div class="fund_xxlayer" style="top: -13px ;left: 100%;display: none;">\n' +
                            '                                            <ul>\n' +
                            '                                                <li><strong> ' + product_name + '</strong></li>\n' +
                            '                                            </ul>\n' +
                            '                                        </div>\n' +
                            '\n' +
                            '                                    </div>\n' +
                            '                                    <p class="p1">' + product_code + '</p>\n' +
                            '                                </td>\n' +
                            '                                         <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(unit_nav) + '">' + stringUtils.parseFloatFormat(unit_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(total_nav) + '">' + stringUtils.parseFloatFormat(total_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                       <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1d) + '">' + stringUtils.parseFloatFormat(yieldrate1d, '--',2, 1, '%')  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldratety) + '">' + stringUtils.parseFloatFormat(yieldratety, '--',2, 1, '%' )   + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1m) + '"> ' + stringUtils.parseFloatFormat(yieldrate1m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate3m) + '">' + stringUtils.parseFloatFormat(yieldrate3m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1y) + '">' + stringUtils.parseFloatFormat(yieldrate1y, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' ;

                        if (is_cn_etf == "1") {
                            var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + cn_etf_desc + '</strong>';
                            queryConvertibleBondFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投' + desc +'</a></div></td>';
                        } else {
                            queryConvertibleBondFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买'+hchart.isPurchaseOrder('3',dataList[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投'+hchart.isPurchaseOrder('4',dataList[i])+'</a></div></td>';
                        }
                        queryConvertibleBondFund += '</tr>';
                    }

                    if (fund_class_text == '其他类') {
                        queryConvertibleMixFundCount++;
                        queryConvertibleMixFund +=
                            '                            <tr>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p1">' + queryConvertibleMixFundCount + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td class="title_name">\n' +
                            '                                    <div class="tit">\n' +
                            '                                        <a href=\'/main/fund/' + product_code + '/fundManager.shtml\' target=\'_blank\'>' + product_abbr + '</a>\n' +
                            '                                        <div class="fund_xxlayer" style="top: -13px;left: 100%;display: none;">\n' +
                            '                                            <ul>\n' +
                            '                                                <li><strong> ' + product_name + '</strong></li>\n' +
                            '                                            </ul>\n' +
                            '                                        </div>\n' +
                            '\n' +
                            '                                    </div>\n' +
                            '                                    <p class="p1">' + product_code + '</p>\n' +
                            '                                </td>\n' +
                            '                                                   <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(unit_nav) + '">' + stringUtils.parseFloatFormat(unit_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(total_nav) + '">' + stringUtils.parseFloatFormat(total_nav, '--',nav_number, 1, '' )  + '</p>\n' +
                            '                                    <p class="p1">' + nav_date  + '</p>\n' +
                            '                                </td>\n' +
                            '                                       <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1d) + '">' + stringUtils.parseFloatFormat(yieldrate1d, '--',2, 1, '%')  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldratety) + '">' + stringUtils.parseFloatFormat(yieldratety, '--',2, 1, '%' )   + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1m) + '"> ' + stringUtils.parseFloatFormat(yieldrate1m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate3m) + '">' + stringUtils.parseFloatFormat(yieldrate3m, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' +
                            '                                <td>\n' +
                            '                                    <p class="p2 ' + enumerateUtils.getClassColor(yieldrate1y) + '">' + stringUtils.parseFloatFormat(yieldrate1y, '--',2, 1, '%' )  + '</p>\n' +
                            '                                </td>\n' ;
                        if (is_cn_etf == "1") {
                            var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + cn_etf_desc + '</strong>';
                            queryConvertibleMixFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投' + desc +'</a></div></td>';
                        } else {
                            queryConvertibleMixFund += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',dataList[i])+'" data-code="'+product_code+'">购买'+hchart.isPurchaseOrder('3',dataList[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',dataList[i])+'" data-code="'+product_code+'">定投'+hchart.isPurchaseOrder('4',dataList[i])+'</a></div></td>';
                        }
                        queryConvertibleMixFund += '</tr>';

                    }
                }

                $(pageId + "#queryConvertibleStockFund").html(queryConvertibleStockFund);
                $(pageId + "#queryConvertibleMixFund").html(queryConvertibleMixFund);
                $(pageId + "#queryConvertibleBondFund").html(queryConvertibleBondFund);
                $(pageId + "#queryConvertibleIndexFund").html(queryConvertibleIndexFund);
                $(pageId + "#queryConvertibleMoneyFund").html(queryConvertibleMoneyFund);

                /**
                 * 基金转换下的购买和定投
                 */
                $(pageId + ".fund_table .profit_table a").bindChildEvent(function (){
                    var product_id = $(this).attr("data-id");
                    var product_code = $(this).attr("data-code");
                    $.redirect("/m/mall/views/mall/funddetail.html", {
                        "product_id" : product_id,
                        "product_code" : product_code
                    });
                });
            } else {
                console.log('false' + dataList);
                $(pageId + "#queryConvertibleStockFund").html('<tr><td colspan="9">暂无基金信息</td></tr>');
                $(pageId + "#queryConvertibleMixFund").html('<tr><td colspan="9">暂无基金信息</td></tr>');
                $(pageId + "#queryConvertibleBondFund").html('<tr><td colspan="9">暂无基金信息</td></tr>');
                $(pageId + "#queryConvertibleIndexFund").html('<tr><td colspan="9">暂无基金信息</td></tr>');
                $(pageId + "#queryConvertibleMoneyFund").html('<tr><td colspan="9">暂无基金信息</td></tr>');
            }
        }
        productService.queryConvertibleFund(queryCallback, param);
    };

    // 购买、定投气泡
    $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a", function () {
        if($(this).attr("data-iscnetf")){
            $(this).find("strong").show();
        }else if(!$(this).hasClass("gray")){
            if($(this).siblings().hasClass("gray")){
                $(this).find("strong").show();
            }else{
                $(this).parent().find("a:eq(0)").find('strong').show();
            }
        }
    }, "mousemove");
    $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a", function () {
        $(pageId + " .fund_table tbody .btn_box a").find("strong").hide();
    }, "mouseout");

    //点击列表中购买或定投弹窗
    $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a",function(){
        if(!$(this).hasClass("gray")){
            if($(this).index()==0){
                $('#loginBuy').attr('href',$.gconfig.global.buyDetail+'?fundCode='+$(this).attr('data-code'));
                $('#purchase div.dt_benefit_tit a.link').removeClass('on');
                $("#purchase .dt_benefit_cont").hide();
                $("#purchase").show();
            }else if($(this).index()==1){
                $('#loginFixed').attr('href',$.gconfig.global.fixedDetail+'?fundCode='+$(this).attr('data-code'));
                $("#fixedInvestment div.dt_benefit_tit a.link").removeClass('on');
                $("#fixedInvestment .dt_benefit_cont").hide();
                $("#fixedInvestment").show();
                // if($(this).attr("data-iscnetf")=='1'){
                //     $("#fixedInvestment div.exp_txt_01").show();
                // }else{
                //     $("#fixedInvestment div.exp_txt_01").hide();
                // }
            }
            $("body").css("overflow","hidden");
        }
    });

    function htmlEncode(str) {
        return str.replace(/<[^>]*>?/gm, function(match) {
            return match.replace(/[&<>"']/g, function(m) {
                switch (m) {
                    case '&':
                        return '&amp;';
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '"':
                        return '&quot;';
                    case "'":
                        return '&#39;';
                }
            });
        });
    }
    /**
     * 基金费率查询 741414（***）
     */
    function queryFeerate() {
        var param = {
            "product_id": $this.product_id
        };
        var queryFeerateCallBack = function (resultVo) {
            // console.log(resultVo)
            var dataList = resultVo.getResults("results")
            if (dataList && dataList.length > 0) {
                var results = dataList
                var rgRateList = []
                var sgRateList = []
                var shRateList = []
                var mgRateList=[]
                var glFee = ''
                var tgFee = ''
                var xsFee = ''
                var zsFee = ''
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    if ("1" == result.feerate_type) { //认购费率
                        rgRateList.push(result)
                    } else if ("2" == result.feerate_type) { //申购费率
                        sgRateList.push(result)
                    } else if ("3" == result.feerate_type) {//赎回费率
                        shRateList.push(result)
                    }else if ("4" == result.feerate_type) {//赎回费率
                        mgRateList.push(result)
                    }  else if ("0" == result.feerate_type) {//运作费用
                        if ("11" == result.feerate_type2) {//运作管理费
                            glFee = result.standard_fee
                        } else if ("12" == result.feerate_type2) {//运作托管费
                            tgFee = result.standard_fee
                        } else if ("13" == result.feerate_type2) {//销售服务费
                            xsFee = result.standard_fee
                        } else if ("14" == result.feerate_type2) {//指数使用费
                            zsFee = result.standard_fee
                        }
                    }
                }

                var rgfeerate_desc = '';
                var rgHtml = '';
                if (rgRateList.length > 0) {
                    var size = rgRateList.length;
                    rgfeerate_desc = rgRateList[0].feerate_desc || '';
                    if (rgRateList[0].feerate_mode) {
                        rgHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="33%">收费方式</th><th width="34%">认购金额(含认购费)</th><th width="33%">认购费率</th></tr>';
                    } else {
                        rgHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="34%">认购金额(含认购费)</th><th width="33%">认购费率</th></tr>';
                    }

                    for (var i = 0; i < rgRateList.length; i++) {
                        var rate = rgRateList[i]
                        if (i == 0) {
                            if (rgRateList[0].feerate_mode) {
                                rgHtml += '<tr><td rowspan="' + size + '">' + contants.feerate_mode[rgRateList[0].feerate_mode] + '</td>'
                            }
                            if (rate.money_lower_limit != '' && rate.money_upper_limit != '') {
                                rgHtml += '<td>' + rate.money_lower_limit + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else if (rate.money_lower_limit != '' && rate.money_upper_limit == '') {
                                rgHtml += '<td>' + rate.val_rel + rate.money_lower_limit + '</td>'
                            } else if (rate.money_lower_limit == '' && rate.money_upper_limit != '') {
                                rgHtml += '<td>' + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else {
                                rgHtml += '<td>--</td>'
                            }
                            rgHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td></tr>'
                        } else {
                            if (rate.money_lower_limit != '' && rate.money_upper_limit != '') {
                                rgHtml += '<td>' + rate.money_lower_limit + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else if (rate.money_lower_limit != '' && rate.money_upper_limit == '') {
                                rgHtml += '<td>' + rate.val_rel + rate.money_lower_limit + '</td>'
                            } else if (rate.money_lower_limit == '' && rate.money_upper_limit != '') {
                                rgHtml += '<td>' + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else {
                                rgHtml += '<td>--</td>'
                            }
                            rgHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td></tr>'
                        }
                    }
                    rgHtml += '</table>'
                    //$(pageId + "#rgFeeDec").html(rgHtml)
                } else {
                    rgHtml = stringUtils.showNoData();
                }
                $(pageId + "#fundDetailsList3 .detail_info:eq(0)").html(rgfeerate_desc +
                    '<div class="data_table2" id="rgFeeDec">' + rgHtml + '</div>' +
                    '<p class="text_right">理财嘉 购基享优惠 <a class="spel_link ml10" target="_blank" href="https://e.jsfund.cn/lcj/trade/login">费率0折起</a></p>' +
                    '<p>认购计算公式：<br>净认购金额=认购金额/(1+认购费率)<br>认购费用=认购金额-净认购金额<br>认购份额=净认购金额/T日基金份额净值</p>');


                var sgfeerate_desc = '';
                var sgHtml = '';
                if (sgRateList.length > 0) {
                    var size = sgRateList.length;
                    sgfeerate_desc = sgRateList[0].feerate_desc || '';
                    if (sgRateList[0].feerate_mode) {
                        sgHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="33%">收费方式</th><th width="34%">申购金额(含申购费)</th><th width="33%">申购费率</th></tr>';
                    } else {
                        sgHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="34%">申购金额(含申购费)</th><th width="33%">申购费率</th></tr>';
                    }

                    for (var i = 0; i < sgRateList.length; i++) {
                        var rate = sgRateList[i]
                        if (i == 0) {
                            if (sgRateList[0].feerate_mode) {
                                sgHtml += '<tr><td rowspan="' + size + '">' + contants.feerate_mode[sgRateList[0].feerate_mode] + '</td>'
                            }

                            if (rate.money_lower_limit != '' && rate.money_upper_limit != '') {
                                sgHtml += '<td>' + rate.money_lower_limit + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else if (rate.money_lower_limit != '' && rate.money_upper_limit == '') {
                                sgHtml += '<td>' + rate.val_rel + rate.money_lower_limit + '</td>'
                            } else if (rate.money_lower_limit == '' && rate.money_upper_limit != '') {
                                sgHtml += '<td>' + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else {
                                sgHtml += '<td>--</td>'
                            }
                            sgHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td></tr>'
                        } else {
                            if (rate.money_lower_limit != '' && rate.money_upper_limit != '') {
                                sgHtml += '<td>' + rate.money_lower_limit + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else if (rate.money_lower_limit != '' && rate.money_upper_limit == '') {
                                sgHtml += '<td>' + rate.val_rel + rate.money_lower_limit + '</td>'
                            } else if (rate.money_lower_limit == '' && rate.money_upper_limit != '') {
                                sgHtml += '<td>' + rate.val_rel + rate.money_upper_limit + '</td>'
                            } else {
                                sgHtml += '<td>--</td>'
                            }
                            sgHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td></tr>'
                        }
                    }
                    sgHtml += '</table>'
                    //$(pageId + "#sgFeeDec").html(sgHtml)
                } else {
                    sgHtml = stringUtils.showNoData();
                }
                $(pageId + "#fundDetailsList3 .detail_info:eq(1)").html(sgfeerate_desc +
                    '<div class="data_table2" id="sgFeeDec">' + sgHtml + '</div>' +
                    '<p class="text_right">理财嘉 购基享优惠 <a class="spel_link ml10" target="_blank" href="https://e.jsfund.cn/lcj/trade/login">费率0折起</a></p>' +
                    '<p>申购计算公式：<br>净申购金额=申购金额/(1+申购费率)<br>申购费用=申购金额-净申购金额<br>申购份额=净申购金额/T日基金份额净值</p>');

                var shfeerate_desc = '';
                var shHtml = '';
                if (shRateList.length > 0) {
                    shfeerate_desc = shRateList[0].feerate_desc || '';
                    shHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="50%">持有期限</th><th width="50%">赎回费率</th></tr>'
                    for (var i = 0; i < shRateList.length; i++) {
                        var rate = shRateList[i]
                        shHtml += '<tr>'
                        if (rate.hold_lower_time != '' && rate.hold_upper_time != '') {
                            shHtml += '<td>' + rate.hold_lower_time + rate.hold_rel + rate.hold_upper_time + '</td>'
                        } else if (rate.hold_lower_time != '' && rate.hold_upper_time == '') {
                            shHtml += '<td>' + rate.hold_rel + rate.hold_lower_time + '</td>'
                        } else if (rate.hold_lower_time == '' && rate.hold_upper_time != '') {
                            shHtml += '<td>' + rate.hold_rel + rate.hold_upper_time + '</td>'
                        } else {
                            shHtml += '<td>--</td>'
                        }
                        shHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td>'
                        shHtml += '</tr>'
                    }
                    shHtml += '</table>'

                    //$(pageId + "#shFeeDec").html(shHtml)
                } else {
                    shHtml = stringUtils.showNoData();
                }
                $(pageId + "#fundDetailsList3 .detail_info:eq(2)").html(shfeerate_desc +
                    '<div class="data_table2" id="shFeeDec">' + shHtml + '</div>' +
                    '<p>赎回计算公式：<br>赎回总额=赎回数量xT日基金份额净值<br>赎回费用=赎回总额x赎回费率<br>赎回金额=赎回总额-赎回费用</p>');

                var mgfeerate_desc = '';
                var mgHtml = '';
                if (mgRateList.length > 0) {
                    mgfeerate_desc = mgRateList[0].feerate_desc || '';
                    mgHtml = '<table id="tb_mg_fee" border="0" width="100%" cellpadding="0" cellspacing="0"><tr><th width="33%">持续持有天数(D)</th><th width="33%">持续持有年化收益率(R)</th><th width="33%">适用管理费率</th></tr>'
                    for (var i = 0; i < mgRateList.length; i++) {
                        var rate = mgRateList[i]
                        mgHtml += '<tr>'
                        if (rate.hold_lower_time != '' && rate.hold_upper_time != '') {
                            mgHtml += '<td>' + rate.hold_lower_time +  htmlEncode(rate.hold_rel)  + rate.hold_upper_time + '</td>'
                        } else if (rate.hold_lower_time != '' && rate.hold_upper_time == '') {
                            mgHtml += '<td>' + htmlEncode(rate.hold_rel)  + rate.hold_lower_time + '</td>'
                        } else if (rate.hold_lower_time == '' && rate.hold_upper_time != '') {
                            mgHtml += '<td>' + htmlEncode(rate.hold_rel)  + rate.hold_upper_time + '</td>'
                        } else {
                            mgHtml += '<td>--</td>'
                        }
                        mgHtml += '<td>' + rate.limit_desc + '</td>'
                        mgHtml += '<td>' + stringUtils.formatEmpty(rate.standard_fee, '--') + '</td>'
                        mgHtml += '</tr>'
                    }
                    mgHtml += '</table>'

                    $(pageId+"#fundDetailsList3 .mg_fee_dev").show();

                    $(pageId + "#fundDetailsList3 .detail_info:eq(5)").find("th:eq(0)").hide();
                    $(pageId + "#tgFee").hide();


                    //$(pageId + "#shFeeDec").html(shHtml)
                } else {
                    //mgHtml = stringUtils.showNoData();
                    $(pageId+"#fundDetailsList3 .mg_fee_dev").hide();
                }


                $("#mgfee_desc").html(mgfeerate_desc);

                $("#mgFeeDescBtn").click(function(){
                        $("#mgfee_desc img").attr("width","760px");
                        $("#mgfee_btn").show();
                });
                $("#mgfee_close").click(function () {
                    $("#mgfee_btn").hide();
                });



                $(pageId + "#fundDetailsList3 .detail_info:eq(4)").html(
                    '<div class="data_table2" id="shFeeDec">' + mgHtml + '</div>' );

                var mgTrSize=$("#tb_mg_fee tr").size();
                var mgTimgCon="";
                for(var mgRowIndex=1;mgRowIndex<mgTrSize;mgRowIndex++){
                    var currentTxt= $("#tb_mg_fee tr").eq(mgRowIndex).children().eq(0).text();
                    var currentTxtLen=$("#tb_mg_fee tr td:gt("+mgRowIndex+"):contains('"+currentTxt+"')").size();
                    if(currentTxtLen>0){
                        $("#tb_mg_fee tr").eq(mgRowIndex).children().eq(0).attr("rowspan","3");

                        for(var txtIndex=1;txtIndex<currentTxtLen;txtIndex++){
                            $("#tb_mg_fee tr").eq(mgRowIndex+txtIndex).children().eq(0).remove()
                        }
                        mgRowIndex+=currentTxtLen;
                    }



                }



                $(pageId + "#tgFee").html(stringUtils.formatEmpty(glFee, '--'))
                $(pageId + "#glFee").html(stringUtils.formatEmpty(tgFee, '--'))
                $(pageId + "#xsFee").html(stringUtils.formatEmpty(xsFee, '--'))
                $(pageId + "#zsFee").html(stringUtils.formatEmpty(zsFee, '--'))
                if(!zsFee){
                    $(pageId + "#fundDetailsList3 .detail_info:eq(5)").find("th:eq(3)").hide();
                    $(pageId + "#zsFee").hide();
                }

            } else {
                $(pageId + "#rgFeeDec").html(stringUtils.showNoData())
                $(pageId + "#sgFeeDec").html(stringUtils.showNoData())
                $(pageId + "#shFeeDec").html(stringUtils.showNoData())
            }
        };
        productService.queryFeerate(queryFeerateCallBack, param);
    }


    /**
     * 持仓情况查询
     * @param product_id 产品编号
     * @param allocationType 配置类型：1：资产配置 2：行业配置 3：重仓债券 4：重仓股票
     * @param selecttype  1分组(季度) 2数据
     * @param flag  4 五大重仓债券
     */
    function queryAssetAllocationTimer(allocation_type, flag) {
        // qdii产品等于 4
        if(pageGlobal.is_qdii&&pageGlobal.is_qdii!='0'){
            if(allocation_type=='04'){
                flag='4'
            }
        }
        var param = {
            "product_id": $this.product_id,
            "allocation_type": allocation_type,
            "reportdate": '',
            "selecttype": '1',
            "flag": flag

        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var assetAllList = '';
                    var typeIndex = $("#fundDetailsList4 .sub_tabnav ul li.act").index() + 1;
                    for (var i = 0; i < dataList.length; i++) {
                        dataList[i].reportdate_text = dataList[i].reportdate_text ? dataList[i].reportdate_text : '--';
                        dataList[i].reportdate = dataList[i].reportdate ? dataList[i].reportdate : '--';
                        if (i == 0) {
                            $('#positionSituationList' + typeIndex).find('div.pd_detail_box').eq(0).find('span.value').html(dataList[i].reportdate_text + '<i></i>');
                            pageGlobal.reportdate = dataList[i].reportdate;
                            $('#positionSituationList' + typeIndex).find("div.pd_detail_box").eq(0).find('i.ic_01').parent().find('span').html(dataList[i].reportdate);
                        }
                        assetAllList += '<li data-date="' + dataList[i].reportdate + '"><span>' + dataList[i].reportdate_text + '</span></li>'
                    }
                    $('#positionSituationList' + typeIndex).find('div.pd_detail_box').eq(0).find('ul.list').html(assetAllList);
                    queryAssetAllocation(allocation_type, pageGlobal.reportdate, flag);

                } else {
                    if (allocation_type == '01' && flag == '2') {
                        $(" #positionSituationList1 .pd_detail_box").eq(0).find('div.time_select').remove();
                        $(" #positionSituationList1 #assetAllocationDetails").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    } else if (allocation_type == '02' && flag == '') {
                        $(" #positionSituationList2 .pd_detail_box").eq(0).find('div.time_select').remove();
                        $(" #positionSituationList2 .pd_detail_box").eq(0).find('div.data_table2').remove();
                        $(" #positionSituationList2 .pd_detail_box").eq(0).find("div.mt20").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    } else if (allocation_type == '04' && flag == '1') {
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find('div.time_select').remove();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find('div.data_table2').remove();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find("div.mt20").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    } else if (allocation_type == '04' && flag == '2') {
                        $(" #positionSituationList4 .pd_detail_box").eq(0).find('div.time_select').remove();
                        $(" #positionSituationList4 .pd_detail_box").eq(0).find('div.data_table2').html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    }
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryAssetAllocation(callBack, param);
    }

    function queryAssetAllocation(allocation_type, reportdate, flag) {
        // qdii产品等于 4
        if(pageGlobal.is_qdii&&pageGlobal.is_qdii!='0'){
            if(allocation_type=='04'){
                flag='4'
            }
        }
        var param = {
            "product_id": $this.product_id,
            "allocation_type": allocation_type,
            "reportdate": reportdate,
            "selecttype": '2',
            "flag": flag

        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var assetAllList = '';
                    if ($("#fundDetailsList4 .sub_tabnav ul li:eq(3)").hasClass('act')) {
                        queryAssetAllocation2();
                    }
                    var colors = ["#ED0000", "#F67A03", "#F9C304", "#D3B28C", "#3398CE", "#399EFF", "#867CFF", "#D800FF", "#A1328A", "#889FC9"];
                    if (dataList.length > 10) {
                        var dataLen = dataList.length - 10;
                        for (var j = 0; j < dataLen; j++) {
                            var color = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();//随机颜色
                            for (var k = 0; k < colors.length; k++) {
                                if (colors[i] == color) {
                                    color = getListColor(colors, color);
                                }
                            }
                            colors.push(color);
                        }
                    }
                    var mkvNavList = [];
                    //if(pageGlobal.allocation_type=='01'){
                    if ($("#fundDetailsList4 .sub_tabnav ul li.act").index() == 0) {
                        var totalAssets = 0;//总资产
                        var endTotal = '';
                        for (var i = 0; i < dataList.length; i++) {
                            if (dataList[i].pctof_total_asset) {
                                dataList[i].pctof_total_asset = (dataList[i].pctof_total_asset * 100).toFixed(2) + '%';
                                var pctof_total_asset = dataList[i].pctof_total_asset;
                            } else {
                                var pctof_total_asset = '--';
                            }


                            if (dataList[i].contrast) {
                                var contrast = (dataList[i].contrast * 100).toFixed(2);
                                if (dataList[i].contrast >= 0) {
                                    contrast = '<span>' + contrast + '%<i class="compare_up"></i></span>';
                                } else {
                                    contrast = '<span>' + contrast + '%<i class="compare_down"></i></span>';
                                }
                            } else {
                                var contrast = '<span>--<i></i></span>';
                            }
                            if (i % 2 == 0) {
                                var trType = '<tr>';
                            } else {
                                var trType = '<tr class="even">';
                            }
                            var holdingv_val = dataList[i].holdingv_val ? stringUtils.moneyFormat(dataList[i].holdingv_val, 2) : '--';
                            assetAllList += trType + '\
													<td class="first">\
														<p class="name"><em style="background: ' + colors[i] + '"></em>' + dataList[i].secu_category_name + '</p>\
													</td>\
													<td>\
														<span>' + holdingv_val + '</span>\
													</td>\
													<td>\
														<span>' + pctof_total_asset + '</span>\
													</td>\
													<td class="last">\
														' + contrast + '\
													</td>\
												</tr>';
                            mkvNavList.push({
                                value: dataList[i].pctof_total_asset.split('%')[0],
                                name: dataList[i].secu_category_name
                            });
                            totalAssets = hchart.floatAdd(totalAssets, dataList[i].holdingv_val);
                            if (i == dataList.length - 1) {
                                if (i % 2 == 0) {
                                    var trType = '<tr class="even">';
                                } else {
                                    var trType = '<tr>';
                                }

                                var total_assets = totalAssets ? stringUtils.moneyFormat(totalAssets, 2) : '--';
                                endTotal = trType + '\
										<td class="first">\
											<p class="name"><em></em>合计</p>\
										</td>\
										<td>\
											<span>' + total_assets + '</span>\
										</td>\
										<td>\
											<span>100%</span>\
										</td>\
										<td class="last">\
											<span>0.00%<i style="display: inline-block;vertical-align: middle;width: 10px;height: 0;margin-left: 9px;"></i></span>\
										</td>\
									</tr>';
                            }
                        }


                        $("#assetAllocationList").html(assetAllList + endTotal);
                        $("#pieChart1").show();
                        var options = {
                            "pageId": 'pieChart1',
                            "datas": mkvNavList,
                            "colors": colors,
                            "title": '资产分布',
                            "center": hchart.dealNumber(totalAssets) + '元',
                            "top": '35%'
                        }
                        hchart.pieEchart(options);
                    } else if ($("#fundDetailsList4 .sub_tabnav ul li.act").index() == 1) {
                        var pieChart2List = '';
                        var totalAssets = 0;//总资产
                        for (var i = 0; i < dataList.length; i++) {
                            dataList[i].pctof_nav = (dataList[i].pctof_nav * 100).toFixed(2) + '%';
                            dataList[i].holdingv_val = (dataList[i].holdingv_val / 10000).toFixed(2);
                            if (dataList[i].contrast) {
                                var contrast = (dataList[i].contrast * 100).toFixed(2);
                                if (dataList[i].contrast >= 0) {
                                    contrast = '<span>' + contrast + '%<i class="compare_up"></i></span>';
                                } else {
                                    contrast = '<span>' + contrast + '%<i class="compare_down"></i></span>';
                                }
                            } else {
                                var contrast = '<span>--<i></i></span>';
                            }
                            var holdingv_val = dataList[i].holdingv_val ? stringUtils.moneyFormat(dataList[i].holdingv_val, 2) : '--';
                            assetAllList += '<tr>\
											<td class="first"><span>' + dataList[i].secu_category_name + '</span></td>\
											<td><span>' + holdingv_val + '</span></td>\
											<td><span>' + dataList[i].pctof_nav + '</span></td>\
											<td>' + contrast + '</td>\
										</tr>';
                            pieChart2List += '<li><em style="background: ' + colors[i] + ';"></em>' + dataList[i].secu_category_name + '</li>';
                            mkvNavList.push({
                                value: dataList[i].pctof_nav.split('%')[0],
                                name: dataList[i].secu_category_name
                            });
                            totalAssets += Number(dataList[i].holdingv_val);
                        }
                        $("#ndustryDistribution").html(assetAllList);
                        $("#pieChart2List").html(pieChart2List);
                        $("#pieChart2").show();
                        var options = {
                            "pageId": 'pieChart2',
                            "datas": mkvNavList,
                            "colors": colors,
                            "title": '资产分布',
                            "center": hchart.dealNumber(totalAssets, 1) + '元',
                            "top": '40%'
                        }
                        hchart.pieEchart(options);

                    } else if ($("#fundDetailsList4 .sub_tabnav ul li.act").index() == 2) {
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find('div.data_table2').show();
                        $("#pieChart3").show();
                        $("#pieChart3List").parent().show();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find("div.mt20 .compare_no_data").remove();
                        var pieChart3List = '';
                        var totalAssets = 0;//总资产
                        var topTenPositions = dataList.length;
                        for (var i = 0; i < topTenPositions; i++) {
                            dataList[i].pctof_nav = (dataList[i].pctof_nav * 100).toFixed(2) + '%';
                            pieChart3List += '<li><em style="background: ' + colors[i] + ';"></em>' + dataList[i].secu_category_name + '：<b>' + dataList[i].pctof_nav + '</b></li>';
                            mkvNavList.push({
                                value: dataList[i].pctof_nav.split('%')[0],
                                name: dataList[i].secu_category_name
                            });
                            totalAssets += Number(dataList[i].holdingv_val);
                            if (dataList[i].contrast) {
                                var contrast = (dataList[i].contrast * 100).toFixed(2);
                                if (dataList[i].contrast >= 0) {
                                    contrast = '<span>' + contrast + '%<i class="compare_up"></i></span>';
                                } else {
                                    contrast = '<span>' + contrast + '%<i class="compare_down"></i></span>';
                                }
                            } else {
                                var contrast = '<span>--<i></i></span>';
                            }
                            var holdingshares = dataList[i].holdingshares ? stringUtils.moneyFormat(dataList[i].holdingshares, 2) : '--';
                            var holdingv_val = dataList[i].holdingv_val ? stringUtils.moneyFormat(dataList[i].holdingv_val, 2) : '--';
                            assetAllList += '<tr>\
												<td><span>' + dataList[i].secu_category_code + '</span></td>\
												<td><span>' + dataList[i].secu_category_name + '</span></td>\
												<td><span>' + holdingshares + '</span></td>\
												<td><span>' + holdingv_val + '</span></td>\
												<td><span>' + dataList[i].pctof_nav + '</span></td>\
												<td>' + contrast + '</td>\
											</tr>';
                        }
                        $("#pieChart3List").html(pieChart3List);
                        $("#heavyPositionsList").html(assetAllList);
                        $("#positionSituationList3 .table_top_tit").eq(0).find("span.info").html('数据取自【基金最新季报】报告日期：' + dataList[0].reportdate);
                        $("#positionSituationList3 .table_top_tit").eq(0).find("h5").html($("#positionSituationList3 .pd_detail_box").eq(0).find("span.value")[0].innerText + '重仓股票明细');
                        var options = {
                            "pageId": 'pieChart3',
                            "datas": mkvNavList,
                            "colors": colors,
                            "title": '资产分布',
                            "center": hchart.dealNumber(totalAssets, 1) + '元',
                            "top": '40%'
                        }
                        hchart.pieEchart(options);
                    } else if ($("#fundDetailsList4 .sub_tabnav ul li.act").index() == 3) {
                        for (var i = 0; i < dataList.length; i++) {
                            dataList[i].pctof_nav = dataList[i].pctof_nav ? (dataList[i].pctof_nav * 100).toFixed(2) + '%' : '--';
                            var holdingshares = dataList[i].holdingshares ? stringUtils.moneyFormat(dataList[i].holdingshares, 2) : '--';
                            var holdingv_val = dataList[i].holdingv_val ? stringUtils.moneyFormat(dataList[i].holdingv_val, 2) : '--';
                            assetAllList += '<tr>\
												<td>' + dataList[i].secu_category_code + '</td>\
												<td>' + dataList[i].secu_category_name + '</td>\
												<td>' + holdingshares + '</td>\
												<td>' + holdingv_val + '</td>\
												<td>' + dataList[i].pctof_nav + '</td>\
											</tr>'
                        }
                        $("#fiveLargePositionsList").html(assetAllList);
                    }
                } else {
                    if (allocation_type == '01' && flag == '2') {
                        $("#pieChart1").hide();
                        $(" #assetAllocationList").html('<tr><td style="text-align: center;" colspan="4">暂无数据</td></tr>');
                    } else if (allocation_type == '02' && flag == '') {
                        $("#pieChart2").hide();
                        $(' #ndustryDistribution').html('<tr><td style="text-align: center;" colspan="4">暂无数据</td></tr>');
                        $(' #pieChart2List').html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    } else if (allocation_type == '04' && flag == '1') {
                        $("#pieChart3").hide();
                        $("#pieChart3List").parent().hide();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find("div.mt20 .compare_no_data").remove();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find('div.data_table2').hide();
                        $(" #positionSituationList3 .pd_detail_box").eq(0).find("div.mt20").append('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                    } else if (allocation_type == '04' && flag == '2') {
                        $(' #fiveLargePositionsList').html('<tr><td style="text-align: center;" colspan="5">暂无数据</td></tr>');
                        queryAssetAllocation2();
                    }
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryAssetAllocation(callBack, param);
    }

    //券种组合
    function queryAssetAllocation2() {

        var param = {
            "product_id": $this.product_id,
            "allocation_type": '03',
            "selecttype": '2',
            "reportdate": pageGlobal.reportdate

        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var assetAllList = '';
                    var colors = ["#ED0000", "#F67A03", "#F9C304", "#D3B28C", "#3398CE", "#399EFF", "#867CFF", "#D800FF", "#A1328A", "#889FC9"];
                    if (dataList.length > 10) {
                        var dataLen = dataList.length - 10;
                        for (var j = 0; j < dataLen; j++) {
                            var color = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();//随机颜色
                            for (var k = 0; k < colors.length; k++) {
                                if (colors[i] == color) {
                                    color = getListColor(colors, color);
                                }
                            }
                            colors.push(color);
                        }
                    }
                    var mkvNavList = [];
                    var totalAssets = 0;//总资产
                    var endTotal = '';//合计
                    var colorSerial = 0;//颜色序号单独处理
                    for (var i = 0; i < dataList.length; i++) {
                        dataList[i].pctof_nav = (dataList[i].pctof_nav * 100).toFixed(2) + '%';
                        if (dataList[i].contrast) {
                            var contrast = (dataList[i].contrast * 100).toFixed(2);
                            if (dataList[i].contrast >= 0) {
                                contrast = '<span>' + contrast + '%<i class="compare_up"></i></span>';
                            } else {
                                contrast = '<span>' + contrast + '%<i class="compare_down"></i></span>';
                            }
                        } else {
                            var contrast = '<span>--<i></i></span>';
                        }
                        if (dataList[i].secu_category_name == '合计') {
                            if (i % 2 == 0) {
                                var trType = '<tr class="even">';
                            } else {
                                var trType = '<tr>';
                            }

                            var bondscost = dataList[i].bondscost ? stringUtils.moneyFormat(dataList[i].bondscost, 2) : '--';
                            endTotal = trType + '\
										<td class="first">\
											<p class="name"><em></em>' + dataList[i].secu_category_name + '</p>\
										</td>\
										<td>\
											<span>' + bondscost + '</span>\
										</td>\
										<td>\
											<span>' + dataList[i].pctof_nav + '</span>\
										</td>\
										<td class="last" width="20%">\
											' + contrast + '\
										</td>\
									</tr>';
                        } else {

                            if (i % 2 == 0) {
                                var trType = '<tr>'
                            } else {
                                var trType = '<tr class="even">'
                            }
                            if (dataList[i].secu_category_name == '其中：政策性金融债') {
                                var pName = '<p class="name"><em></em>' + dataList[i].secu_category_name + '</p>'
                            } else {
                                var pName = '<p class="name"><em style="background: ' + colors[colorSerial] + ';"></em>' + dataList[i].secu_category_name + '</p>'
                                colorSerial++;
                                mkvNavList.push({
                                    value: dataList[i].pctof_nav.split('%')[0],
                                    name: dataList[i].secu_category_name
                                });
                                totalAssets += Number(dataList[i].bondscost);
                            }
                            var bondscost = dataList[i].bondscost ? stringUtils.moneyFormat(dataList[i].bondscost, 2) : '--';
                            assetAllList += trType + '\
													<td class="first">\
														' + pName + '\
													</td>\
													<td>\
														<span>' + bondscost + '</span>\
													</td>\
													<td>\
														<span>' + dataList[i].pctof_nav + '</span>\
													</td>\
													<td class="last" width="20%">\
														' + contrast + '\
													</td>\
												</tr>';

                        }

                    }
                    $("#pieChart4").show();
                    var options = {
                        "pageId": 'pieChart4',
                        "datas": mkvNavList,
                        "colors": colors,
                        "title": '资产分布',
                        "center": hchart.dealNumber(totalAssets) + '元',
                        "top": '35%'
                    }
                    hchart.pieEchart(options);
                    $("#portfolioOfSecuritiesList").html(assetAllList + endTotal);
                } else {
                    $("#pieChart4").hide();
                    $(" #portfolioOfSecuritiesList").html('<tr><td style="text-align: center;" colspan="4">暂无数据</td></tr>');
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryAssetAllocation(callBack, param);
    }

    /**
     * 基金净值查询
     * @param product_id 产品编号
     * @param type 1 （分页） 2 （画图）
     * @param
     */
    function queryNetFundValueList(transNo) {
        if(!transNo){
            transNo='';
        }
        var param = {
            "product_id": $this.product_id,
            "curtpage": pageGlobal.curtPageNo,
            "numperpage": pageGlobal.numPerPage,
            "start_date": pageGlobal.start_date,
            "end_date": pageGlobal.end_date,
            "trans_no": transNo,
            "type": 1

        };
        var finanCallBack = function (curPage, pageSize) {
            var reqParam = {
                "product_id": $this.product_id,
                "curtpage": curPage,
                "numperpage": pageSize,
                "start_date": pageGlobal.start_date,
                "end_date": pageGlobal.end_date,
                "trans_no": transNo,
                "type": 1
            };
            wsService.queryNetFundValueList(callBack, reqParam);
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults()[0];
                if (dataList.data && dataList.data.length > 0) {
                    for (var i = 0; i < dataList.data.length; i++) {
                        if ($this.fund_class=='HFM04' && $this.fund_class3!="净值货币型") {
                            if ($this.product_code == '000486') {
                                dataList.data[i].seven_days_annual_profit = '';
                            } else {
                                dataList.data[i].seven_days_annual_profit = dataList.data[i].seven_days_annual_profit ? Number(dataList.data[i].seven_days_annual_profit).toFixed(4) : '--';
                            }
                            dataList.data[i].profit_per_million = dataList.data[i].profit_per_million ? Number(dataList.data[i].profit_per_million).toFixed(4) : '--';
                            dataList.data[i].day_rate = dataList.data[i].day_rate ? Number(dataList.data[i].day_rate).toFixed(2) : '--';
                        } else {
                            dataList.data[i].day_rate = dataList.data[i].day_rate ? Number(dataList.data[i].day_rate).toFixed(2) : '--';
                            dataList.data[i].cumulative_net = dataList.data[i].cumulative_net || '--';
                            dataList.data[i].relate_price = dataList.data[i].relate_price || '--';
                        }
                        if(transNo=='1'){
                            if(pageGlobal.samecode_is_navfund=='1'){
                                dataList.data[i].day_rate = dataList.data[i].day_rate ? Number(dataList.data[i].day_rate).toFixed(2) : '--';
                                dataList.data[i].cumulative_net = dataList.data[i].cumulative_net || '--';
                                dataList.data[i].relate_price = dataList.data[i].relate_price || '--';
                            }else{
                                dataList.data[i].seven_days_annual_profit = dataList.data[i].seven_days_annual_profit ? Number(dataList.data[i].seven_days_annual_profit).toFixed(4) : '--';
                                dataList.data[i].profit_per_million = dataList.data[i].profit_per_million ? Number(dataList.data[i].profit_per_million).toFixed(4) : '--';
                                dataList.data[i].day_rate = dataList.data[i].day_rate ? Number(dataList.data[i].day_rate).toFixed(2) : '--';
                            }
                        }

                    }
                    if(transNo=='1'){
                        $('#beforeExportWrap').show();
                        if(pageGlobal.samecode_is_navfund=='1'){
                            $('#beforeHistoricalList').loadPage("template/historicalNavList1", dataList, finanCallBack, false);
                        }else{
                            $('#beforeHistoricalList').loadPage("template/historicalNavList2", dataList, finanCallBack, false);
                        }
                    }else{
                        $("#exportWrap").show();
                        var hundred_revenue_allocation = contants.specialCode["hundred_revenue_allocation"] || "";
                        var million_revenue_allocation = contants.specialCode["million_revenue_allocation"] || "";
                        if (million_revenue_allocation.indexOf($this.product_code) != -1) {//百万份收益
                            $('#historicalNavList').loadPage("template/historicalNavList3", dataList, finanCallBack, false);
                        } else if (hundred_revenue_allocation.indexOf($this.product_code) != -1) {//百份收益
                            $('#historicalNavList').loadPage("template/historicalNavList4", dataList, finanCallBack, false);
                        } else if ($this.fund_class=='HFM04' && $this.fund_class3!="净值货币型") {
                            $('#historicalNavList').loadPage("template/historicalNavList2", dataList, finanCallBack, false);
                        } else {
                            if("1" == pageGlobal.is_qdii && pageGlobal.showusfundcodeflag=='1'){
                                $('#historicalNavList').loadPage("template/historicalNavList5", dataList, finanCallBack, false);
                            }else{
                                $('#historicalNavList').loadPage("template/historicalNavList1", dataList, finanCallBack, false);
                            }

                        }
                    }


                } else {
                    if(transNo=='1'){
                        $(pageId + "#beforeHistoricalList").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>')
                    }else{
                        $(pageId + "#historicalNavList").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>')
                    }

                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryNetFundValueList(callBack, param);
    }

    function netWorthExport() {

        // var param = {
        //     "funcNo":"741012",
        //     "product_id": $this.product_id,
        //     "is_export": 1

        // };
        // var callBack = function (resultVo) {
        //     if (resultVo.getErrorNo() == 0) {
        //         var dataList = resultVo.getResults()[0];
        //         window.location = dataList.file_url;
        //     } else {
        //         layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
        //     }
        // }
        // wsService.queryNetFundValueList(callBack, param);
        var req = new XMLHttpRequest();
        req.open('POST',$.gconfig.global.fileServer + '?product_id=' + $this.product_id, true);
        req.responseType = 'blob';
        req.setRequestHeader('Content-Type', 'application/json');
        req.onload = function() {
            var data = req.response;
            var blob = new Blob([data]);
            var blobUrl = window.URL.createObjectURL(blob);
            download(blobUrl) ;
        };
        req.send();
    }

    function download(blobUrl) {
        var a = document.createElement('a');
        a.download = new Date().getTime() + '.xls';
        a.href = blobUrl;
        a.click();
    }

    /**
     * 基金公告查询
     * @param product_id 产品编号
     * @param allocationType 配置类型：1：资产配置 2：行业配置 3：重仓债券 4：重仓股票
     * @param
     */
    function queryFundAnnouncementList() {

        var param = {
            "product_id": $this.product_id,
            "curtpage": pageGlobal.curtPageNo,
            "numperpage": pageGlobal.numPerPage,
            "keyword": pageGlobal.keyword,
            "start_date": pageGlobal.start_date,
            "end_date": pageGlobal.end_date,
            "type": pageGlobal.type,
            "select_time": pageGlobal.select_time

        };
        var finanCallBack = function (curPage, pageSize) {
            var reqParam = {
                "product_id": $this.product_id,
                "curtpage": curPage,
                "numperpage": pageSize,
                "keyword": pageGlobal.keyword,
                "start_date": pageGlobal.start_date,
                "end_date": pageGlobal.end_date,
                "type": pageGlobal.type,
                "select_time": pageGlobal.select_time
            };
            wsService.queryFundAnnouncementList(callBack, reqParam);
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults()[0];
                if (dataList.data && dataList.data.length > 0) {
                    $(" #productAnnouncementList").loadPage("template/productAnnouList", dataList, finanCallBack, false);
                } else {
                    $(pageId + "#productAnnouncementList").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>')
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryFundAnnouncementList(callBack, param);
    }

    /**
     * 持股变动查询
     * @param product_id 产品编号
     * @param  flag   //1为买入、0为卖出
     * @param
     */
    function queryChangesInShareholding(flag, selecttype) {
        if (!selecttype) {
            selecttype = '1';
        }
        var param = {
            "fundcode": $this.product_code,
            "curtpage": pageGlobal.curtPageNo,
            "numperpage": pageGlobal.numPerPage,
            "reportdate": pageGlobal.reportdate,
            "selecttype": selecttype,
            "flag": flag

        };
        var finanCallBack = function (curPage, pageSize) {
            var reqParam = {
                "fundcode": $this.product_code,
                "curtpage": curPage,
                "numperpage": pageSize,
                "reportdate": pageGlobal.reportdate,
                "selecttype": selecttype,
                "flag": flag
            };
            wsService.queryChangesInShareholding(callBack, reqParam);
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                if (selecttype == '1') {
                    var dataList = resultVo.getResults();
                    if (dataList && dataList.length > 0) {
                        $('#changesInShareholding').find('div.table_top_tit').show();
                        $('#changesInShareholding').find('span.value').parent().show();
                        var assetAllList = '';
                        for (var i = 0; i < dataList.length; i++) {
                            if (i == 0) {
                                $('#changesInShareholding').find('span.value').html(dataList[i].reportdate_text + '<i></i>');
                                pageGlobal.reportdate = dataList[i].reportdate;
                                $('#changesInShareholding').find('i.ic_01').parent().find('span').html(dataList[i].reportdate);
                            }
                            assetAllList += '<li data-date="' + dataList[i].reportdate + '"><span>' + dataList[i].reportdate_text + '</span></li>'
                        }
                        $('#changesInShareholding').find('ul.list').html(assetAllList);
                        queryChangesInShareholding(flag, '2');
                    } else {
                        $(pageId + "#changesInShareholdingList").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>');
                        $('#changesInShareholding').find('i.ic_01').parent().find('span').html('');
                        $('#changesInShareholding').find('span.value').parent().hide();
                        $('#changesInShareholding').find('div.table_top_tit').hide();
                    }
                } else {
                    var dataList = resultVo.getResults()[0];
                    if (dataList.data && dataList.data.length > 0) {
                        $(pageId + "#changesInShareholdingList").parent().find('div.table_top_tit').show();
                        for (var i = 0; i < dataList.data.length; i++) {
                            dataList.data[i].ratioinnav = dataList.data[i].ratioinnav ? (dataList.data[i].ratioinnav * 100).toFixed(2) + '%' : '--';
                            dataList.data[i].amount = dataList.data[i].amount ? stringUtils.moneyFormat(dataList.data[i].amount, 2) : '--';
                        }
                        var labYearReport="年报";
                        if(dataList.data[0].reportdate.indexOf("-06-30")>0){
                            labYearReport="半年报"
                        }
                        if (flag == '1') {
                            var changesList = '<span class="info">报告日期：' + hchart.dateFormat(dataList.data[0].reportdate, 'yyyy-MM-dd') + '，数据取自'+labYearReport+'，单位：人民币元</span><p>累计买入金额超出期初基金资产净值2%或前20名的股票明细</p>';
                            $(" #changesInShareholdingList").loadPage("template/changesholdList1", dataList, finanCallBack, false);
                            $("#changesInShareholding .table_top_tit").html(changesList);
                        } else {
                            var changesList = '<span class="info">报告日期：' + hchart.dateFormat(dataList.data[0].reportdate, 'yyyy-MM-dd') + '，数据取自'+labYearReport+'，单位：人民币元</span><p>累计卖出金额超出期初基金资产净值2%或前20名的股票明细</p>';
                            $(" #changesInShareholdingList").loadPage("template/changesholdList2", dataList, finanCallBack, false);
                            $("#changesInShareholding .table_top_tit").html(changesList);
                        }
                    } else {
                        $(pageId + "#changesInShareholdingList").parent().find('div.table_top_tit').hide();
                        $(pageId + "#changesInShareholdingList").html('<div class="compare_no_data"><img src="/ws/images/compare_no_data.png" alt=""><p class="p1">暂无数据</p></div>')
                    }
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.queryChangesInShareholding(callBack, param);
    }

    /**
     * 历史基金经理查询
     * @param product_id 产品编号
     * @param type 3
     */
    function queryHistoryManagerList() {

        var param = {
            "product_id": $this.product_id,
            "type": 3
        };

        var callBack = function (resultVo) {
            var dataList = resultVo.getResults();//历任基金经理记录
            var historyFundManagerList = '';
            if (dataList && dataList.length > 0) {
                for (var i = 0; i < dataList.length; i++) {
                    var fund_manager_name = dataList[i].fund_manager_name;
                    var office_time = dataList[i].office_time;
                    var departure_date = dataList[i].departure_date;
                    historyFundManagerList += '<tr>\
                                                        <td>' + fund_manager_name + '</td>\
                                                        <td>' + office_time + '</td>\
                                                        <td>' + departure_date + '</td>\
                                                   </tr>';
                }
                $(pageId + "#queryHistoryManagerList").html(historyFundManagerList);
            } else {
                $(pageId + '#queryHistoryManagerList').html('<tr><td>暂无基金经理</td></tr>');
            }
        }
        productService.queryFundManagerInfo(callBack, param);
    }

    /**
     * 基金分红查询
     * @param fundcode 产品代码
     * @param  type 2
     * @param
     */
    function queryDividendFundList() {

        var param = {
            "fundcode": $this.product_code,
            "type": 2
        };

        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();//分红记录
                var dividendFundList = '';
                if (dataList && dataList.length > 0) {
                    for (var i = 0; i < dataList.length; i++) {
                        var str = "000341|000342|000988|000989|000990|000043|000044|070031|070012";
                        var newnavdate = str.indexOf($this.product_code) == -1 ? dataList[i].newnavdate : newnavdate = dataList[i].lastnavdate;
                        var year = dataList[i].registerdate.split("-")[0];
                        dividendFundList += '<tr>\
												<td><span>' + year + '</span></td>\
												<td><span>' + dataList[i].registerdate + '</span></td>\
												<td><span>' + newnavdate + '</span></td>\
												<td><span class="ared">' + (dataList[i].unitprofit * 10).toFixed(4) + '</span></td>\
												<td><span>' + dataList[i].distributedate + '</span></td>\
											</tr>';
                    }
                    $(pageId + "#dividendRecordsList").html(dividendFundList);
                } else {
                    $(pageId + "#dividendRecordsList").html('<tr><td colspan="4"><span class="no_data01">暂无分红记录</span></td></tr>');
                }
            } else {
                //layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
                $(pageId + "#dividendRecordsList").html('<tr><td colspan="5"><span class="no_data01">暂无分红记录</span></td></tr>');
            }
        }
        wsService.queryDividendFundList(callBack, param);
    }

    /**
     * 生成代销机构列表HTML
     * @param list 机构数据列表
     * @returns {string} HTML字符串
     */
    function buildAgencyListHtml(list) {
        var html = '';
        for (var i = 0; i < list.length; i++) {
            if ((i + 1) % 5 == 4) {
                var floatingBox = 'fund_type_01';
            } else if ((i + 1) % 5 == 0) {
                var floatingBox = 'fund_type_02';
            } else {
                var floatingBox = '';
            }
            html += '<li>\
                        <a href="javascript:void(0);">' + list[i].csname + '</a>\
                        <div class="sale_layer ' + floatingBox + '" style="width: 856px;">\
                            <i class="arrow lt_01"></i>\
                            <div class="cont">\
                                <table class="sale_table" border="0" width="100%" cellpadding="0" cellspacing="0">\
                                    <tbody><tr>\
                                        <td width="33%">\
                                            <em class="tit">销售机构全称</em>\
                                            <p>' + list[i].cname + '</p>\
                                        </td>\
                                        <td width="34%">\
                                            <em class="tit">销售机构简称</em>\
                                            <p>' + list[i].csname + '</p>\
                                        </td>\
                                        <td width="33%">\
                                            <em class="tit">法定代表人</em>\
                                            <p>' + list[i].lgperson_name + '</p>\
                                        </td>\
                                    </tr>\
                                    <tr>\
                                        <td>\
                                            <em class="tit">客服电话</em>\
                                            <p>' + list[i].agent_custsvc_telno + '</p>\
                                        </td>\
                                        <td>\
                                            <em class="tit">办公地址</em>\
                                            <p>' + list[i].offi_addr + '</p>\
                                        </td>\
                                        <td>\
                                            <em class="tit">网址</em>\
                                            <p>' + list[i].website + '</p>\
                                        </td>\
                                    </tr>\
                                    <tr>\
                                        <td>\
                                            <em class="tit">住所</em>\
                                            <p>' + list[i].reg_addr + '</p>\
                                        </td>\
                                        <td>\
                                            <em class="tit">联系人</em>\
                                            <p>' + list[i].annc_contaperson + '</p>\
                                        </td>\
                                        <td>\
                                        <em class="tit"></em>\
                                        <p></p>\
                                        </td>\
                                    </tr>\
                                </tbody></table>\
                            </div>\
                        </div>\
                    </li>';
        }
        return html;
    }

    /**
     * 生成代销机构分类区块HTML
     * @param sectionId 区块ID
     * @param title 分类标题
     * @param list 机构数据列表
     * @param isFirst 是否第一个分类
     * @returns {string} HTML字符串
     */
    function buildAgencySectionHtml(sectionId, title, list, isFirst) {
        if (!list || list.length == 0) {
            return '';
        }
        var mtClass = isFirst ? 'mt30' : 'mt40';
        return '<div class="detail_info ' + mtClass + '" id="' + sectionId + '">\
                    <h3>' + title + '</h3>\
                    <ul class="dx_cplist clearfix">' + buildAgencyListHtml(list) + '</ul>\
                </div>';
    }

    /**
     * 销售机构-代销机构
     * @param fundcode 产品代码
     */
    function querySalesOrganization() {

        var param = {
            "fundcode": $this.product_code
        };

        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.obj.results;

                // 是否是etf
                var isEtfProduct = dataList.isEtfProduct
                  && dataList.isEtfProduct[0]
                  && '1' == dataList.isEtfProduct[0].result
                  || false;

                if (isEtfProduct) {

                    // ETF产品处理
                    var typeMap = dataList.etf_sales_chnl_type_name_map[0];
                    var container = $("#agencyOrgContainer");
                    var html = '';
                    var hasData = false;
                    var isFirst = true;

                    for (var type in typeMap) {
                        var list = dataList[type];
                        if (list && list.length > 0) {
                            html += buildAgencySectionHtml('etf_' + type, typeMap[type], list, isFirst);
                            hasData = true;
                            isFirst = false;
                        }
                    }

                    container.html(html);

                    if (!hasData) {
                        $("#fundDetailsList7 .sub_tabnav ul li:eq(1)").hide();
                    }

                } else {

                    // 非ETF产品处理
                    var listBank = dataList.listBank;
                    var listBond = dataList.listBond;
                    var listThird = dataList.listThird;

                    var html = '';
                    html += buildAgencySectionHtml('bankList', '银行', listBank, true);
                    html += buildAgencySectionHtml('securitiesCompanyList', '证券公司', listBond, false);
                    html += buildAgencySectionHtml('salesAgencyList', '第三方销售机构', listThird, false);

                    $("#agencyOrgContainer").html(html);

                    if (html == '') {
                        $("#fundDetailsList7 .sub_tabnav ul li:eq(1)").hide();
                    }

                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        wsService.querySalesOrganization(callBack, param);
    }


    /**
     * 查询产品交易节点
     */
    function queryTradeInfo(sessionid) {
        var param = {
            "sessionid": sessionid,
            "productcode": $this.product_code
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var item = dataList[0];
                    var datetimenow = item.datetimenow;
                    var confirmdate_declare = item.confirmdate_declare;
                    var incomedisplaydate = item.incomedisplaydate;
                    var strHtml = '<ul>' +
                        '<li>' +
                        '<h5>买入提交</h5>' +
                        '<em></em>' +
                        '<p>今日15点前</p>' +
                        '</li>' +
                        '<li class="medium">' +
                        '<h5>确认份额</h5>' +
                        '<em></em>' +
                        (confirmdate_declare ? '<p>' + confirmdate_declare + ' (星期' + dateUtils.getDateByStr(confirmdate_declare).Format("w") + ')</p>' : '--') +
                        '</li>' +
                        '<li>' +
                        '<h5>查看盈亏</h5>' +
                        '<em></em>' +
                        (incomedisplaydate ? '<p>' + incomedisplaydate + ' (星期' + dateUtils.getDateByStr(incomedisplaydate).Format("w") + ')</p>' : '--') +
                        '</li>' +
                        '</ul>';
                    $(pageId + "#buy_process").html(strHtml).show();
                } else {
                    $(pageId + " #buy_process").hide()
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
                $(pageId + " #buy_process").hide()
            }
        }

        productService.queryTradeInfo(callBack, param);
    }


    /**
     * 展示收益表现
     */
    function queryIncomeInfo(product) {
        var strHtml = '<div class="pd_right_tit">' +
            '<h3>收益表现</h3>' +
            '<span class="info">'+product.nav_date+'</span>' +
            '</div>'+
            '<div class="sy_table">'+
            '<table border="0" width="100%" cellpadding="0" cellspacing="0">'+
            '<tbody>'+
            '<tr>' +
            '<th>近1月：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate1m) + '">' + stringUtils.parseFloatFormat(product.yieldrate1m, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>近3月：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate3m) + '">' + stringUtils.parseFloatFormat(product.yieldrate3m, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>近6月：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate6m) + '">' + stringUtils.parseFloatFormat(product.yieldrate6m, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>今年以来：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldratety) + '">' + stringUtils.parseFloatFormat(product.yieldratety, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>近1年：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate1y) + '">' + stringUtils.parseFloatFormat(product.yieldrate1y, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>近3年：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate3y) + '">' + stringUtils.parseFloatFormat(product.yieldrate3y, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>近5年：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate3y) + '">' + stringUtils.parseFloatFormat(product.yieldrate5y, '--', 2, 1, '%') + '</span></td>' +
            '</tr>' +
            '<tr>' +
            '<th>成立以来：</th>' +
            '<td><span class="' + enumerateUtils.getClassColor(product.yieldrate) + '">' + stringUtils.parseFloatFormat(product.yieldrate, '--', 2, 1, '%') + '</span></td>' +
            '</tr>'+
            '</tbody>' +
            '</table>' +
            '</div>';
        $("#right_box2 .pd_right_module1").html(strHtml);
    }

    /**
     * 查询基金荣誉
     */
    function queryProductHonor() {
        var param = {
            "product_id": $this.product_id,
            "select_type": "1"
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var honoerlist = dataList[0].honoerlist;
                    try {
                        honoerlist = JSON.parse(honoerlist);
                    } catch (e) {
                        honoerlist = []
                    }
                    if (honoerlist && honoerlist.length > 0) {
                        var jjryHtml = '';
                        for (var j = 0; j < honoerlist.length; j++) {
                            jjryHtml += '<p>' + honoerlist[j].honor_name + '</p>';
                        }
                        $(pageId + "#right_box2 .pd_right_module2 .fund_glory").html(jjryHtml);
                        $(pageId + "#right_box2 .pd_right_module2").show();
                    } else {
                        $(pageId + "#right_box2 .pd_right_module2").hide();
                    }

                    if (dataList[0].HT_RATE_STAR_3Y || dataList[0].HT_RATE_STAR_5Y || dataList[0].HT_RATE_STAR_10Y) {
                        var jjpjHtml = '';
                        if (dataList[0].HT_RATE_STAR_3Y) {
                            jjpjHtml += '<li>' +
                                '<span class="tit">海通证券（三年）</span>' +
                                '<div class="ct">' +
                                '<span class="star_span"><em></em><em></em><em></em><em></em><em></em></span>' +
                                '</div>' +
                                '</li>';
                        } else if (dataList[0].HT_RATE_STAR_5Y) {
                            jjpjHtml += '<li>' +
                                '<span class="tit">海通证券（五年）</span>' +
                                '<div class="ct">' +
                                '<span class="star_span"><em></em><em></em><em></em><em></em><em></em></span>' +
                                '</div>' +
                                '</li>';
                        } else if (dataList[0].HT_RATE_STAR_10Y) {
                            jjpjHtml += '<li>' +
                                '<span class="tit">海通证券（十年）</span>' +
                                '<div class="ct">' +
                                '<span class="star_span"><em></em><em></em><em></em><em></em><em></em></span>' +
                                '</div>' +
                                '</li>';
                        }
                        $(pageId + "#right_box2 .pd_right_module3 .fund_ratlist").html(jjpjHtml);
                        $(pageId + "#right_box2 .pd_right_module3").show();
                    } else {
                        $(pageId + "#right_box2 .pd_right_module3").hide();
                    }

                    if (dataList[0].HT_YIELD_RATE_RANK_2Y || dataList[0].HT_YIELD_RATE_RANK_3Y || dataList[0].HT_YIELD_RATE_RANK_5Y) {
                        var jjpmList = '';
                        if (dataList[0].HT_RATE_STAR_3Y) {
                            jjpmList += '<li>' +
                                '<span class="tit">海通证券（二年）</span>' +
                                '<div class="ct"><span class="rank_span">' + dataList[0].HT_YIELD_RATE_RANK_2Y + '</span></div>' +
                                '</li>';
                        } else if (dataList[0].HT_RATE_STAR_5Y) {
                            jjpmList += '<li>' +
                                '<span class="tit">海通证券（三年）</span>' +
                                '<div class="ct"><span class="rank_span">' + dataList[0].HT_YIELD_RATE_RANK_3Y + '</span></div>' +
                                '</li>';
                        } else if (dataList[0].HT_RATE_STAR_10Y) {
                            jjpmList += '<li>' +
                                '<span class="tit">海通证券（五年）</span>' +
                                '<div class="ct"><span class="rank_span">' + dataList[0].HT_YIELD_RATE_RANK_5Y + '</span></div>' +
                                '</li>';
                        }
                        $(pageId + "#right_box2 .pd_right_module4 .fund_ratlist").html(jjpmList);
                        $(pageId + "#right_box2 .pd_right_module4").show();
                    } else {
                        $(pageId + "#right_box2 .pd_right_module4").hide();
                    }
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryProductHonor(callBack, param);
    }


    /**
     * 查询相关资讯
     */
    function queryInformation() {
        var param = {
            "product_id": $this.product_id,
            "select_type": "2"
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var strHtml = '';
                    for (var i = 0; i < 5; i++) {
                        var type = dataList[i].type;
                        var url = '';
                        if (type == '0') {
                            url = dataList[i].url;
                        } else if (type == '1' || type == '2') {
                            url = dataList[i].link_url;
                        }
                        strHtml += '<li>' +
                            '<h5><a target="_blank" href="' + url + '">' + dataList[i].title + '</a></h5>' +
                            '<p><span class="time">' + dataList[i].publish_date + '</span></p>' +
                            '</li>';
                    }
                    $(pageId + "#right_box2 .pd_right_module5 ul").html(strHtml);
                } else {
                    $(pageId + "#right_box2 .pd_right_module5 ul").html(stringUtils.showNoData());
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryProductHonor(callBack, param);
    }

    /**
     * 查询相关推荐产品
     */
    function queryPdRecommend() {
        var param = {
            "product_id": $this.product_id
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    var strHtml = '';
                    for (var i = 0; i < (dataList.length > 3 ? 3 : dataList.length); i++) {
                        var labelHtml = '';
                        var labelJson = dataList[i].labelJson;
                        var product_name = dataList[i].fund_name;
                        var yieldrate5y = dataList[i].yieldrate5y;
                        if (labelJson && JSON.parse(labelJson).length > 0) {
                            labelJson = JSON.parse(labelJson);
                            for (var i = 0; i < labelJson.length; i++) {
                                labelHtml += '<span>新能源</span>';
                            }
                        }
                        strHtml += '<li class="animate">' +
                            '<h3 class="ellipsis">' + product_name + '</h3>' +
                            '<p class="p1">' + labelHtml + '</p>' +
                            '<p class="p2 ' + enumerateUtils.getClassColor(yieldrate5y) + '"><span>' + stringUtils.parseFloatFormat(yieldrate5y, '--', 2, 1, '%', true) + '</span></p>' +
                            '<p class="p3">近五年收益率</p>' +
                            '<a href="https://e.jsfund.cn/lcj/trade/login" class="btn animate">立即申购</a>' +
                            '</li>';
                    }
                    $("#pd_recommend ul").html(strHtml);
                    $("#pd_recommend").show();
                } else {
                    $("#pd_recommend").hide();
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
                $("#pd_recommend").hide();
            }
        }

        productService.queryPdRecommend(callBack, param);
    }


    function querySessionId(callBackFunc) {
        var param = {
            "type": "1",
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    callBackFunc(dataList[0].sessionid);
                } else {
                    layerWeb.msg("未获取到sessionid");
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.querySessionId(callBack, param);
    }

    function parseDate(dateValue) {
        if (typeof dateValue === 'number') {
            return new Date(dateValue);
        } else if (typeof dateValue === 'string') {
            if (/^\d{8}$/.test(dateValue)) {
                return new Date(
                    parseInt(dateValue.substr(0, 4), 10),
                    parseInt(dateValue.substr(4, 2), 10) - 1,
                    parseInt(dateValue.substr(6, 2), 10)
                );
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return new Date(dateValue);
            } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateValue)) {
                return new Date(dateValue.replace(/\//g, '-'));
            }
        }
        console.warn('无法解析日期格式:', dateValue);
        return new Date();
    }

    function echartsOption(type, dataList, ele) {
        var type=type.toString();
        var name = "";
        var data = [];
        var data2 = [];
        var _series = [];
        var yAxisMax = 0;
        var yAxisMin = 1e8;
        var yAxisMax2 = 0;
        var yAxisMin2 = 1e8;
        var index_name = "";
        var rangeSelectorEnabled = true;
        var yAxisUnit = "";
        var yAxisUnit2 = "";
        var valueUnit = "";
        var tooltipShow = true;
        var tooltipData = [];
        var navigatorEnabled = false;
        var monthsDiff=""
        var minDate=""
        var maxDate=""
        var minTime, maxTime;
        // 计算数据时间跨度（单位：月）
        if("1"==type){
            var dates = dataList.map(item => parseDate(item.date));
             minDate = new Date(Math.min(...dates.map(d => d.getTime())));
             maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
            monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
                (maxDate.getMonth() - minDate.getMonth());
            if(dataList.length > 6){
                minTime = new Date(dataList[0].date).getTime();
                maxTime = new Date(dataList[dataList.length - 1].date).getTime();
            }
        }else{
            var dates = dataList.map(item => new Date(item.nav_date)); // 假设 item.date 为时间戳或可解析的日期字符串
            minDate = new Date(Math.min.apply(null, dates.map(d => d.getTime())));
            maxDate = new Date(Math.max.apply(null, dates.map(d => d.getTime())));
            monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth());
            if(dataList.length > 6){
                minTime = new Date(dataList[0].nav_date).getTime();
                maxTime = new Date(dataList[dataList.length - 1].nav_date).getTime();
            }
        }
        var chartDom = document.getElementById(ele);
        if (!chartDom) {
            console.error('Chart container not found:', ele);
            return;
        }
        // 获取已存在的图表实例并销毁
        var existingChart = echarts.getInstanceByDom(chartDom);
        if (existingChart) {
            existingChart.dispose();
        }
        const tabArray = [
            { type: 'month', count: 1, text: '近1月' },
            { type: 'month', count: 3, text: '近3月' },
            { type: 'month', count: 6, text: '近6月' },
            { type: 'year', count: 1, text: '近1年' },
            { type: 'year', count: 3, text: '近3年' },
            { type: 'year', count: 5, text: '近5年' },
            { type: 'ytd', text: '今年以来' },
            { type: 'all', text: '成立以来' }
        ];
        const selectedValue = 8;
        var showPrecision = 2;
        var date="";
        if (type == "1") {
            pageGlobal.fund_start_time = "";
            pageGlobal.fund_end_time = "";

            $("#fundChartTime .filter_date1").show();
            name = pageGlobal.product_abbr || '收益';
            yAxisUnit = "%";
            valueUnit = "%";
            navigatorEnabled = false;
            for (var i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var nav_yield = parseFloat(item.nav_yield);
                var hs300_yield = parseFloat(item.hs300_yield);
                date = item.date;
                //处理日期格式
                date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
                date = new Date(date).getTime();
                data.push([date, nav_yield]);
                data2.push([date, hs300_yield]);
                tooltipData.push([date, nav_yield, hs300_yield]);
                if (yAxisMax < nav_yield) yAxisMax = nav_yield;
                if (yAxisMax < hs300_yield) yAxisMax = hs300_yield;
                if (yAxisMin > nav_yield) yAxisMin = nav_yield;
                if (yAxisMin > hs300_yield) yAxisMin = hs300_yield;
            }
            if (dataList.length) {
                index_name = dataList[0].index_name || "业绩比较基准";
            }
            showPrecision = 2;
        } else if (type == "2") {
            pageGlobal.fund_start_time = "";
            pageGlobal.fund_end_time = "";
            $("#fundChartTime .filter_date1").show();
            name = "单位净值";
            if ("1" == pageGlobal.is_qdii && "1" == pageGlobal.showusfundcodeflag) {
                // yAxisUnit = " 美元";
                valueUnit = " 美元";
            }
            else {
                // yAxisUnit = " 元";
                valueUnit = " 元";
            }
            navigatorEnabled = true;
            for (var i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var relate_price = parseFloat(item.relate_price);
                date = new Date(item.nav_date).getTime();
                data.push([date, relate_price]);
                tooltipData.push([date, relate_price]);
                if (yAxisMax < relate_price) yAxisMax = relate_price;
                if (yAxisMin > relate_price) yAxisMin = relate_price;
            }
            showPrecision = parseInt(pageGlobal.nav_number);
        } else if (type == "3") {
            pageGlobal.fund_start_time = "";
            pageGlobal.fund_end_time = "";
            $("#fundChartTime .filter_date1").show();
            name = "累计净值";
            if ("1" == pageGlobal.is_qdii && "1" == pageGlobal.showusfundcodeflag) {
                // yAxisUnit = " 美元";
                valueUnit = " 美元";
            }
            else {
                // isUnit = " 元";
                valueUnit = " 元";
            }
            navigatorEnabled = true;
            for (let i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var cumulative_net = parseFloat(item.cumulative_net);
                date = new Date(item.nav_date).getTime();
                data.push([date, cumulative_net]);
                tooltipData.push([date, cumulative_net]);
                if (yAxisMax < cumulative_net) yAxisMax = cumulative_net;
                if (yAxisMin > cumulative_net) yAxisMin = cumulative_net;
            }
            showPrecision = parseInt(pageGlobal.nav_number);
        } else if (type == "4") {
            pageGlobal.fund_start_time = "";
            pageGlobal.fund_end_time = "";
            //把时间筛选隐藏起来
            $("#fundChartTime .filter_date1").hide();
            name = "净值估算";
            valueUnit = "元";
            yAxisUnit2 = "%";
            navigatorEnabled = false;
            for (let i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var value0 = parseFloat(item[0]);
                var value1 = item[1];
                var value2 = parseFloat(item[2]);
                var value3 = item[3];
                var nowTime = new Date();
                nowTime.setHours(parseInt(value3.substring(0, 2)));
                nowTime.setMinutes(parseInt(value3.substring(2)));
                nowTime.setSeconds(0);
                var time = nowTime.getTime();
                data.push([time, value0]);
                data2.push([time, value2]);
                if (yAxisMax < value0) yAxisMax = value0;
                if (yAxisMin > value0) yAxisMin = value0;
                tooltipData.push([time, value0, value1, value2]);
            }
            var subDataIndex = 0;
            for(var i = dataList.length - 1; i > 0; i--)
            {
                var item = dataList[i];
                if(item[0])
                {
                    subDataIndex = i;
                    break;
                }
            }
            var last = tooltipData[subDataIndex], color = enumerateUtils.getClassColor(last[2]);
            $(pageId + " #attach .chart_info1 strong:eq(0)").attr("class", color).html(last[1] + valueUnit);
            $(pageId + " #attach .chart_info1 strong:eq(1)").attr("class", color).html(last[3] + yAxisUnit2);
            showPrecision = 4;
        } else if (type == "5") {
            name = "七日年化";
            yAxisUnit = "%";
            valueUnit = "%";
            rangeSelectorEnabled = false;
            navigatorEnabled = true;
            for (let i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var seven_days_annual_profit = parseFloat(item.seven_days_annual_profit);
                date = new Date(item.nav_date).getTime();
                data.push([date, seven_days_annual_profit]);
                tooltipData.push([date, seven_days_annual_profit]);
                if (yAxisMax < seven_days_annual_profit) yAxisMax = seven_days_annual_profit;
                if (yAxisMin > seven_days_annual_profit) yAxisMin = seven_days_annual_profit;
            }
            showPrecision = 4;
        } else if (type == "6") {

            rangeSelectorEnabled = false;
            navigatorEnabled = true;
            var hundred_revenue_allocation = contants.specialCode["hundred_revenue_allocation"] || "";
            var million_revenue_allocation = contants.specialCode["million_revenue_allocation"] || "";
            if (hundred_revenue_allocation.indexOf($this.product_code) != -1) {
                name = "百份收益";
            } else if (million_revenue_allocation.indexOf($this.product_code) != -1) {
                name = "百万份收益";
            } else {
                name = "万份收益";
            }

            for (var i = 0; i < dataList.length; i++) {
                var item = dataList[i];
                var profit_per_million = parseFloat(item.profit_per_million);
                date = new Date(item.nav_date).getTime();
                data.push([date, profit_per_million]);
                tooltipData.push([date, profit_per_million]);
                if (yAxisMax < profit_per_million) yAxisMax = profit_per_million;
                if (yAxisMin > profit_per_million) yAxisMin = profit_per_million;
            }
            showPrecision = 4;
        }

        if (yAxisMax == yAxisMin) {
            yAxisMax += 1;
            yAxisMin -= 1;
        }
        // 计算y轴固定间隔
        let tickInterval = 10; // 默认间隔
        const dataRange = yAxisMax - yAxisMin;
        // 根据数据范围自动计算合适的间隔（可根据需要调整）
        if(dataRange > 120){
            tickInterval = Math.ceil( dataRange/5);
        } else if (dataRange > 100) {
            tickInterval = 50;
        } else if (dataRange > 50) {
            tickInterval = 20;
        } else if (dataRange > 10) {
            tickInterval = 5;
        } else if (dataRange > 5) {
            tickInterval = 3;
        } else if (dataRange > 1) {
            tickInterval = 0.5;
        } else if (dataRange >0.8) {
            tickInterval = 0.2;
        } else if (dataRange >0.5) {
            tickInterval = 0.1;
        } else if (dataRange >0.1) {
            tickInterval = 0.05;
        }else if (dataRange >0.05) {
            tickInterval = 0.02;
        }else{
            tickInterval = 0.01;
        }
        // 调整y轴的最大值和最小值，使其为刻度间隔的整数倍
        yAxisMin = Math.floor(yAxisMin / tickInterval) * tickInterval;
        yAxisMax = Math.ceil(yAxisMax / tickInterval) * tickInterval;
        const seriesCommon = {
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: false,
            // normal: {
            //     color: '#FF0000',// 设置线条颜色
            // },
            emphasis: {
                showSymbol: true,
                itemStyle: {
                    backgroundColor: 'inherit', // 继承折线颜色
                    borderWidth: 0,
                    shadowBlur: 12, // 关键：大阴影
                    shadowColor: 'rgba(255, 0, 0, 0.8)',
                    color: '#FF0000',// 设置线条颜色
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            smooth: true,
            areaStyle: { color: 'rgba(255, 0, 0, 0.02)' }
        };
        if (type == "4") {
            _series.push({
                ...seriesCommon,
                name: name,
                type: 'line',
                lineStyle: {
                    color: '#FF0000'
                },
                data: data,
                //symbol: 'none'
            });
            _series.push({
                ...seriesCommon,
                name: '涨跌幅',
                type: 'line',
                yAxisIndex: 1,
                lineStyle: {
                    color: '#FF9000'
                },
                data: data2,
                emphasis: {
                    showSymbol: true,
                    itemStyle: {
                        borderWidth: 0, // 无边框，实现实心效果
                        shadowBlur: 5,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#FF9000',// 设置线条颜色
                        // 注意：不直接设置color，通过回调动态获取
                    }
                },
               // symbol: 'none'
            });
        } else if (type == "1") {
            _series.push({
                ...seriesCommon,
                name: name,
                type: 'line',
                lineStyle: {
                    color: '#FF0000'
                },
                data: data,
                //symbol: 'none'
            });
            _series.push({
                ...seriesCommon,
                type: 'line',
                name: "业绩比较基准",
                lineStyle: {
                    color: '#FF9000'
                },
                data: data2,
                emphasis: {
                    showSymbol: true,
                    itemStyle: {
                        borderWidth: 0, // 无边框，实现实心效果
                        shadowBlur: 5,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#FF9000',// 设置线条颜色
                        // 注意：不直接设置color，通过回调动态获取
                    }
                },
              //  symbol: 'none'
            });
        } else {
            // 当 type 为 2、3、5、6 时，只添加一条折线
            _series.push({
                ...seriesCommon,
                name: name,
                type: 'line',
                lineStyle: {
                    color: '#FF0000'
                },
                data: data,
               // symbol: 'none'
            });
        }

        const option = {
            title: {
                text: ''
            },
            grid: {
                left: '1%', // 左顶满
                right: '1%', // 右顶满
                top: '5%',
                bottom: '12%',
                containLabel: true // 包含坐标轴标签
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    if (type == "4") {
                        let navStr = '<div style="position: relative;width:100px;border: 1px solid #E8E8E8;border-radius: 8px;line-height:24px;font-size:14px;font-family:BarlowSemiCondensed-Regular, microsoft yahei;background:#ffffff;background: rgba(255,255,255,0.70);padding:10px 15px;box-shadow: 0 0 24px 0 rgba(0,0,0,0.10);">';
                        for (let i = 0; i < tooltipData.length; i++) {
                            if (tooltipData[i][0] == params[0].data[0]) {
                                var last = tooltipData[i], color = enumerateUtils.getClassColor(last[2]);
                                $(pageId + " #attach .chart_info1 strong:eq(0)").attr("class", color).html(last[1] + valueUnit);
                                $(pageId + " #attach .chart_info1 strong:eq(1)").attr("class", color).html(last[3] + yAxisUnit2);
                                navStr += `<span>时间</span>: ${new Date(tooltipData[i][0]).toLocaleTimeString()}<br/>`;
                                navStr += `<span>估值</span>: ${tooltipData[i][1]}${valueUnit}<br/>`;
                                navStr += `<span>涨幅</span>: <span style="color: ${last[2] > 0? "#D50000" : ""}">${last[3]}${yAxisUnit2}</span><br/>`;
                            }
                        }
                        navStr += '</div>';
                        return navStr;
                    } else {
                        let s = `<div style="position: relative;width:auto;min-width:200px;border: 1px solid #E8E8E8;border-radius: 8px;line-height:32px;font-size:14px;font-family:BarlowSemiCondensed-Regular, microsoft yahei;background:#ffffff;background: rgba(255,255,255,0.70);padding:10px 15px;box-shadow: 0 0 24px 0 rgba(0,0,0,0.10);">${new Date(params[0].data[0]).toLocaleDateString()}<br/>`;
                        for (let i = 0; i < tooltipData.length; i++) {
                            if (tooltipData[i][0] == params[0].data[0]) {
                                if (type == "1" || type == "5") {
                                    s += `<p style="position: relative;padding-left:25px;"><em style="position:absolute;width:12px;height:4px;left:0;top:50%;margin-top:-2px;background:${_series[0].lineStyle.color}"></em><span style="color:${_series[0].lineStyle.color}">${_series[0].name}</span>: <span style="color:${tooltipData[i][1] > 0? "#D50000" : ""}">${tooltipData[i][1].toFixed(showPrecision)}${valueUnit}</span></p>`;
                                    if (tooltipData[i][2] || tooltipData[i][2] == 0) {
                                        s += `<p style="position: relative;padding-left:25px;"><em style="position:absolute;width:12px;height:4px;left:0;top:50%;margin-top:-2px;background:${_series[1].lineStyle.color}"></em><span style="color:${_series[1].lineStyle.color}">${_series[1].name}</span>: <span style="color:${tooltipData[i][2] > 0? "#D50000" : ""}">${tooltipData[i][2].toFixed(showPrecision)}${valueUnit}</span></p>`;
                                    }
                                } else {
                                    s += `<p style="position: relative;padding-left:25px;"><em style="position:absolute;width:12px;height:4px;left:0;top:50%;margin-top:-2px;background:${_series[0].lineStyle.color}"></em><span style="color:${_series[0].lineStyle.color}">${_series[0].name}</span>: ${tooltipData[i][1].toFixed(showPrecision)}${valueUnit}</p>`;
                                    if (tooltipData[i][2] || tooltipData[i][2] == 0) {
                                        s += `<p style="position: relative;padding-left:25px;"><em style="position:absolute;width:12px;height:4px;left:0;top:50%;margin-top:-2px;background:${_series[1].lineStyle.color}"></em><span style="color:${_series[1].lineStyle.color}">${_series[1].name}</span>: ${tooltipData[i][2].toFixed(showPrecision)}${valueUnit}</p>`;
                                    }
                                }
                                s += '</div>';
                                return s;
                            }
                        }
                        return '';
                    }
                },
                useHTML: true
            },
            // xAxis: {
            //     type: 'time',
            //     boundaryGap: true,
            //     axisLine: {
            //         show: false
            //     },
            //     axisTick: {
            //         show: true,   // 刻度线长度（单位：px）
            //         lineStyle: {
            //             color: '#dfd9d9',  // 刻度线颜色
            //             width: 1        // 刻度线粗细
            //         },
            //         alignWithLabel: true,
            //     },
            //     splitLine: {
            //         show: false,
            //         lineStyle: {
            //             color: '#F2F2F2'
            //         }
            //     },
            //     splitNumber: 6,
            //     // 可以根据数据情况设置最小时间
            //     min: minTime,
            //     // 可以根据数据情况设置最大时间
            //     max: maxTime,
            //     axisLabel: {
            //                 formatter: function (value) {
            //                     const date = new Date(value);
            //                     const year = date.getFullYear();
            //                     const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零处理
            //                     const now = Date.now();
            //                     const diffDays = (now - date.getTime()) / (1000 * 3600 * 24); // 计算时间差（天）
            //                     // 时间周期较短（如 < 30天）时显示 yyyy-mm-dd
            //                     if (monthsDiff <= 3) { // 时间跨度 ≤ 3个月，显示 yyyy-mm-dd
            //                         return date.toISOString().split('T')[0]; // 格式化为 yyyy-mm-dd
            //                     } else { // 时间跨度 > 3个月，显示 yyyy-mm
            //                         const year = date.getFullYear();
            //                         const month = String(date.getMonth() + 1).padStart(2, '0');
            //                         return `${year}-${month}`;
            //                     }
            //                 },
            //         hideOverlap: true,
            //         fontSize: 11,
            //         margin: 12,
            //         color: '#333333' // 设置日期文字颜色为深灰色
            //     }
            // },
            xAxis: {
                type: 'time',
                boundaryGap: true,
                splitLine: {
                    lineStyle: {
                        color: '#F2F2F2'
                    }
                },
                // axisTick: {
                //     alignWithLabel: true,
                //    // splitNumber: 6,
                // },
                axisLabel: {
                    //splitNumber: 6,
                    //interval: 12 * 24 * 3600 * 1000, // 至少间隔10天（可根据需求调整）
                    formatter: function (value) {
                        const date = new Date(value);
                        // 时间周期较短（如 < 30天）时显示 yyyy-mm-dd
                        if (monthsDiff <= 3) { // 时间跨度 ≤ 3个月，显示 yyyy-mm-dd
                            return date.toISOString().split('T')[0]; // 格式化为 yyyy-mm-dd
                        } else { // 时间跨度 > 3个月，显示 yyyy-mm
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            return `${year}-${month}`;
                        }
                    },
                    hideOverlap: true,// 启用自动避重
                    avoidOverlap: true,// 启用自动避
                    fontSize: 11,
                    margin: 12,
                    color: '#333333', // 设置日期文字颜色为深灰色
                    // interval: monthsDiff <= 3 ? (maxDate - minDate) / 4 : 'auto',
                    //minInterval: 10 * 24 * 3600 * 1000 // 至少间隔10天（可根据需求调整）
                }
            },
            yAxis: [
                {
                    type: 'value',
                    max: yAxisMax,
                    min: yAxisMin,
                    splitNumber:4,
                    interval: tickInterval,
                    // ...(type === "2" || type === "3" || type === "5" || type === "6" ? { interval: tickInterval } : {}),
                    axisLabel: {
                        formatter: function (value) {
                            return value.toFixed(showPrecision) + yAxisUnit;
                        }
                    },
                    // minMargin: 5, // 底部余量（数值单位）
                    // maxMargin: 5, // 顶部余量（数值单位）
                    // 若需百分比余量可使用：
                    // min: function (value) { return value.min * 0.95; },
                    // max: function (value) { return value.max * 1.05; }
                },
            ],
            series: _series,
            dataZoom: navigatorEnabled? [{
                type: 'inside',
                start: 0,
                end: 100,
                handleSize: '80%',
                fillerColor: 'rgba(213, 0, 0, 0.15)',
                borderColor: '#FF0000',
                selectedDataBackground: {
                    lineStyle: {
                        color: '#FF0000'
                    },
                    areaStyle: {
                        color: '#FF0000'
                    }
                },
                labelFormatter: function (value) {
                    return '';
                },
                bottom: 10  // 调整内部缩放控件的位置
            }, {
                show: true,
                type: 'slider',
                start: 0,
                end: 100,
                height: 40,  // 增加选择区域的高度，从20改为40
                bottom: 0,
                borderColor: 'transparent',
                fillerColor: 'rgba(213, 0, 0, 0.15)',
                selectedDataBackground: {
                    lineStyle: {
                        color: '#FF0000'
                    },
                    areaStyle: {
                        color: '#FF0000'
                    }
                },
                textStyle: {
                    color: '#999'
                },
                moveHandleSize: 6,  // 增加移动手柄的大小
                labelFormatter: function (value) {
                    return '';
                }
            }] : [],
        };
        //画图插件
        const myChart = echarts.init(document.getElementById(ele));
        myChart.setOption(option);
    }


    /**
     * 初始化分页插件
     */
    function initPage(isInitPager) {
        if (!isInitPager) {
            return false;
        }
        var options = {
            totalPages: pageGlobal.totalPages, //页码数
            currentPage: pageGlobal.curtPageNo, //指定页码
            maxNum: 9,
            numPage: [10, 20, 50],
            defaultNumPage: pageGlobal.numPerPage,
            $element: $(pageId + ' #pagebar'), //指定的元素
            callback: function (curtPageNo) { //回调函数
                pageGlobal.curtPageNo = curtPageNo;
                queryNavListTable();
            }
        };
        pageGlobal.pageObj = new PCpager(options);

        //绑定显示多少行数据事件 div > p.fylist > span > em:nth-child(2)
        $(pageId + " #pagebar > p.fylist > span > em").bindEvent(function () {
            var numPerPage = Number($(this).attr("data-pageNum"));
            if (options.numPage.indexOf(numPerPage) !== -1) {
                pageGlobal.numPerPage = numPerPage;
                pageGlobal.curPage = 1;
                queryNavListTable();
            }
        });
    }

    //初始化日期插件
    function bingSearchDate() {
        $("#startDate").on("click", function () {
            $(this).html(""); // 清空内容，防止日期控件提示日期非法
            WdatePicker({
                el: 'startDate',
                dateFmt: 'yyyy-MM-dd'
            });
        });

        $("#endDate").on("click", function () {
            $(this).html(""); // 清空内容，防止日期控件提示日期非法
            WdatePicker({
                el: 'endDate',
                dateFmt: 'yyyy-MM-dd'
            });
        });
    }

    /**
     * 根据类型返回时间区间
     * @param type
     * @returns {*[]}
     */
    function switchDate(type) {
        var date = new Date(), startDate, queryMonth, endDate = date.Format("yyyyMMdd");
        switch (type) {
            case 1:
                date.setMonth(date.getMonth() - 1);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "1";
                break;

            case 2:
                date.setMonth(date.getMonth() - 3);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "3";
                break;

            case 3:
                date.setMonth(date.getMonth() - 6);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "6";
                break;

            case 4:
                date.setMonth(date.getMonth() - 12);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "12";
                break;

            case 5:
                date.setMonth(date.getMonth() - 36);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "36";
                break;

            case 6:
                date.setMonth(date.getMonth() - 60);
                startDate = date.Format("yyyyMMdd");
                queryMonth = "60";
                break;

            case 7:
                startDate = date.getFullYear() + "0101";
                queryMonth = "";
                break;

            case 8:
                startDate = "";
                endDate = "";
                queryMonth = "";
                break;
        }
        return {"start_date": startDate, "end_date": endDate, "query_month": queryMonth};
    }

    var start_time = $("#start_time").val();
    var end_time = $("#end_time").val();

    /**
     * 查询收益率走势图（741032）
     */
    function queryAvgreturnList() {

        if ("HFM0505" == $this.fund_class2) {
            $(pageId + "#container").hide();
            $(pageId + "#chart_no_data").show();
            return;
        }

        var param = {
            "product_id": $this.product_id,
            "product_code": $this.product_code
        };
        var $span = $("#fundChartTime span.act");
        var _type = $span.data("type");
        var dateList = switchDate(_type);

        if (pageGlobal.fund_start_time && pageGlobal.fund_end_time) {
            console.log(pageGlobal.fund_start_time + " " + pageGlobal.fund_end_time);
            var start_date1 = new Date(pageGlobal.fund_start_time).Format('yyyyMMdd');
            var end_date1 = new Date(pageGlobal.fund_end_time).Format('yyyyMMdd');

            param.start_date = start_date1;
            param.end_date = end_date1;
        } else if (dateList.query_month) {
            param.query_month = dateList.query_month;
        } else {
            param.start_date = dateList.start_date;
        }

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var results = resultVo.getResults();
                if (results && results.length) {
                    for (var i = 0; i < results.length; i++) {
                        var item = results[i];
                        var date = item.date;
                        date = dateUtils.getDateByStr(date).Format("yyyy-MM-dd");
                    }
                    $(pageId + "#chart_no_data").hide();
                    $(pageId + " #container").height("330px").show();

                    var productName = "";
                    var indexName = "";
                    if (results.length) {
                        indexName = results[0].index_name;
                        indexName = indexName ? indexName : pageGlobal.benchmark;
                        indexName = '业绩比较基准：' + indexName;
                    }
                    if ($("#temp").text()) {
                        $(pageId + " .pd_tabcont .imp_tips").next().remove();
                    }
                    $(pageId + " .pd_tabcont .imp_tips").after('<div class="type" id="temp"><span><em class="em_01"></em>' + pageGlobal.product_abbr + '</span><span><em class="em_02"></em>' + indexName + '</span></div>');
                    echartsOption($this.fundChartType, results, "container");
                } else {
                    $(pageId + "#chart_no_data").show();
                    $(pageId + "#container").hide();
                }
                // var chartData = [];
                // for (var i = 0; i < results.length; i++) {
                //     var item = results[i];
                //     var nav_yield = item.nav_yield;
                //     var date = item.date;
                //     date = dateUtils.getDateByStr(date).getTime();
                //     chartData.push([date, parseFloat(nav_yield)])
                // }
                // chartData = chartData.sort(function (a, b) {
                //     return a[0] - b[0]
                // });
                // require("/ws/scripts/utils/hChart/highcharts-zh_CN");
                /*Highcharts.stockChart('container', {
                    subtitle: {
                        text: ""
                    },
                    credits: {
                        enabled: false // 隐藏版权信息
                    },

                    legend: {
                        enabled: false // 禁用图例
                    },
                    title: {
                        text: ""
                    },
                    rangeSelector: {
                        enabled: false,
                        selected: 2
                    },
                    tooltip: {
                        formatter: function () {
                            // 自定义显示内容
                            var x = this.x;
                            if (x) {
                                x = new Date(x);
                            }
                            return "时间：" + x.Format("yyyy-MM-dd") + '<br/>收益：' + parseFloat(this.y).toFixed(2);
                        },
                        style: {padding: '3px', fontSize: '12px'} // 设置提示框中html样式
                    },
                    series: [{
                        data: chartData
                    }]
                });*/
            } else {
                $(pageId + "#chart_no_data").show();
                $(pageId + "#container").hide();
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        };
        wsService.queryAvgreturnList(callback, param);

        pageGlobal.fund_start_time = "";
        pageGlobal.fund_end_time = "";
        $("#start_time").empty();
        $("#end_time").empty();
    }

    // http://hq.sinajs.cn/list=s_sh000001,s_sz399006,s_sz399001
    // 上证、深证、创业板
    function queryHQMain() {
        wsService.queryHQMain(function (resultVo) {
            $(pageId + " .index_data").slideDown();
            /*if (typeof resultVo === "string") {
                var $li = $(pageId + " ._hq_ul li");
                // 此处不使用 eval，第三方数据源如果返回攻击串，可导致跨站脚本攻击
                resultVo = resultVo.replace(/\n/g, "");
            var list = [/var hq_str_s_sh000001\=(.*)\;var hq_str_s_sz399006/, /var hq_str_s_sz399006\=(.*)\;var hq_str_s_sz399001/, /var hq_str_s_sz399001\=(.*)\;/],*/
            var list = ["hq_str_s_sh000001", "hq_str_s_sz399001", "hq_str_s_sz399006"],
                results = [];
            for (var i = 0; i < list.length; i++) {
                var value = window[list[i]];
                try {
                    // results[i] = JSON.parse(list[i].exec(resultVo)[1]).split(",");
                    results[i] = value.split(",");
                } catch (e) {
                    results[i] = "";
                }

                /*for (var j = 0; j < $li.length; j++) {
                    if ($li.eq(j).prop("childNodes")[0].data == results[i][0]) {
                        var _class = enumerateUtils.getClassColor(results[i][2]);
                        $li.eq(j).children("strong").attr("class", _class).html(results[i][1]).end()
                            .children("b").attr("class", _class).html(results[i][3] + "%<i></i>");
                    }
                }*/
                var _class = enumerateUtils.getClassColor(results[i][2]);
                if (window[list[i]]) {
                    $(pageId + " #" + list[i]).children("strong").attr("class", _class).html(results[i][1]).end()
                        .children("b").attr("class", _class).html((results[i][2] > 0 ? "+" : "") + results[i][3] + "%<i></i>")
                }
            }
            // }
        });
    }

    /**
     * 指数信号灯查询
     */
    function queryindexlightList() {
        wsService.queryindexlightList(function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                dataList = dataList[0] || {};
                dataList = JSON.parse(dataList.jsnoResult);
                var str = '';
                for (var i = 0; i < dataList.length; i++) {
                    var item = dataList[i];
                    var fundcode = item.fundcode;
                    if (fundcode == $this.product_code) {
                        var pe_rlevel = item.pe_rlevel;
                        var pe_rlevel_class = "";
                        var trade_text = "";
                        if (pe_rlevel == '估值较低') {
                            pe_rlevel_class = "ic_01";
                            trade_text = "历史低位";
                        } else if (pe_rlevel == '估值适中') {
                            pe_rlevel_class = "ic_02";
                            trade_text = "历史中等";
                        } else if (pe_rlevel == '估值较高') {
                            pe_rlevel_class = "ic_03";
                            trade_text = "历史高位";
                        }
                        str = '<h5>估值处于</h5><p><em class="'+pe_rlevel_class+'"></em><a class="animate"  target="_blank" href="/main/fund/Gadgets/indexlight/index.shtml">'+trade_text+'<i></i></a></p>';
                    }
                }
                if (str) {
                    $(pageId + " #productInfo #indexlight").html(str);
                }
            }
        })
    }

    /**
     * 新发基金预约
     */
    function querynewfundyy() {
        var param = {
            "productcodes": $this.product_code,
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    if (dataList[0].flag == '0' && dataList[0].productCode == $this.product_code) {
                        var yyhtml = '<div class="reserve_input">' +
                            '<input class="t1" type="text"  maxlength="11" placeholder="请输入手机号" />' +
                            '<a class="btn" href="javaScript:void(0);">预约提醒</a>' +
                            '</div>' +
                            '<p class="imp_tips">输入手机号立享在线预约提醒，预约成功将通过短信等方式通知您</p>';
                        $(pageId + " .pd_opeabox2").html(yyhtml);
                        $(pageId + " .pd_opeabox2").show();

                        //点击预约提醒
                        $(pageId + " .pd_opeabox2 .reserve_input .btn").bindEvent(function () {
                            var mobile = $(pageId + " .pd_opeabox2 .reserve_input .t1").val();
                            //if (!mobile) {
                            //	layerWeb.msg("请输入手机号码", 2, 3);
                            //    return;
                            //}

                            //填充手机号码
                            $("#fundyy .msg_input:eq(0) input").val(mobile);

                            //获取图片验证码
                            $("#fundyy .msg_input:eq(1) img").attr("src", gconfig.global.vfImg + '?v=' + randomNum(6));

                            //绑定close
                            $("#fundyy .layer_close").bindEvent(function () {
                                $("#fundyy").hide();
                            })

                            //绑定刷新图片验证码
                            $("#fundyy .msg_input:eq(1) img").bindEvent(function () {
                                $(this).attr("src", gconfig.global.vfImg + '?v=' + randomNum(6));
                            })

                            //绑定获取手机验证码
                            $("#fundyy .msg_input:eq(2) a").bindEvent(function () {
                                var smobile = $("#fundyy .msg_input:eq(0) input").val();
                                var img_code = $("#fundyy .msg_input:eq(1) input").val();
                                if (!smobile && smobile.length != 11) {
                                    layerWeb.msg("手机号码不正确", 2, 3);
                                    return;
                                }
                                if (!img_code) {
                                    layerWeb.msg("请输入图形验证码", 2, 3);
                                    return;
                                }
                                sendmobile(smobile, img_code);//发送短信验证码
                            })

                            //检查输入框
                            $("#fundyy input").bindEvent(function () {
                                var cheack = true;
                                var smobile = $("#fundyy .msg_input:eq(0) input").val();
                                var img_code = $("#fundyy .msg_input:eq(1) input").val();
                                var mobile_code = $("#fundyy .msg_input:eq(2) input").val();
                                if (!smobile || smobile.length != 11) {
                                    cheack = false;
                                }
                                if (!img_code) {
                                    cheack = false;
                                }
                                if (!mobile_code) {
                                    cheack = false;
                                }
                                if (cheack) {
                                    $("#fundyy .message_btn").removeClass("default").attr("disabled", false);
                                } else {
                                    $("#fundyy .message_btn").addClass("default").attr("disabled", true);
                                }
                            }, "input")

                            //点击确认预约
                            $("#fundyy .message_btn").bindEvent(function () {
                                var smobile = $("#fundyy .msg_input:eq(0) input").val();
                                var mobile_code = $("#fundyy .msg_input:eq(2) input").val();
                                if (!$("#fundyy .message_btn").hasClass("default")) {
                                    cheakyy(smobile, mobile_code);//确认预约
                                }
                            })

                            $("#fundyy").show();
                        });
                    } else {
                        $(pageId + " .pd_opeabox2").hide();
                    }
                } else {
                    $(pageId + " .pd_opeabox2").hide();
                }
            } else {
                $(pageId + " .pd_opeabox2").hide();
            }
        }

        productService.querynewfundyy(callBack, param);
    }

    /**
     *发送短信验证码
     *
     **/

    function sendmobile(smobile, img_code) {
        var param = {
            "mobile": smobile,
            "ticket": img_code
        };
        var callBack = function (resultVo) {
            $("#fundyy .msg_input:eq(1) img").attr("src", gconfig.global.vfImg + '?v=' + randomNum(6))
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    if (dataList[0].message == '0') {
                        count = 60;
                        timer = window.setInterval(function () {
                            if (count >= 1) {
                                $("#fundyy .msg_input:eq(2) a").addClass("gray").html(count + "秒后重发");
                                $("#fundyy .msg_input:eq(2) a").unbind();
                                count--;
                            } else {
                                window.clearInterval(timer);
                                $("#fundyy .msg_input:eq(2) a").removeClass("gray").html("获取短信验证码");
                                $("#fundyy .msg_input:eq(2) a").bindEvent(function () {
                                    var smobile = $("#fundyy .msg_input:eq(0) input").val();
                                    var img_code = $("#fundyy .msg_input:eq(1) input").val();
                                    if (!smobile && smobile.length != 11) {
                                        layerWeb.msg("手机号码不正确", 2, 3);
                                        return;
                                    }
                                    if (!img_code) {
                                        layerWeb.msg("请输入图形验证码", 2, 3);
                                        return;
                                    }
                                    sendmobile(smobile, img_code);//发送短信验证码
                                })
                            }
                        }, 1000);
                    } else {
                        layerWeb.msg("发送短信失败！", 2, 3);
                    }
                } else {
                    layerWeb.msg("发送短信失败！", 2, 3);
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.sendmobile(callBack, param);
    }


    /**
     *确认预约
     *
     **/

    function cheakyy(smobile, mobile_code, type) {
        type = type ? type : '';
        var param = {
            "userIdentifier": smobile,
            "captcha": mobile_code,
            "productCode": $this.product_code,
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults()[0].message;
                if(dataList == 0){
                    $("#fundyy").hide();
                    if(!type){
                        var yyhtml = '<div class="reserve_result">' +
                            '<p class="p1">预约成功</p>' +
                            '<p class="p2">通知手机号码：' + smobile.substring(0, 2) + '***' + smobile.substring(7) + '</p>' +
                            '</div>' +
                            '<p class="imp_tips">输入手机号立享在线预约提醒，预约成功将通过短信等方式通知您</p>';
                        $(pageId + " .pd_opeabox2").html(yyhtml);
                    }else{
                        layerWeb.msg('预约成功!', 2, 1);
                    }
                }else if(dataList == -1){
                    layerWeb.msg('预约失败', 2, 3);
                }

            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.appointmentremind(callBack, param);
    }


    function randomNum(n) {
        var t = '';
        for (var i = 0; i < n; i++) {
            t += Math.floor(Math.random() * 10);
        }
        return t;
    }

    //颜色递归
    function getListColor(colorsList, singleColor) {
        for (var i = 0; i < colorsList.length; i++) {
            if (colorsList[i] == singleColor) {
                singleColor = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
                if (colorsList[i] == singleColor) {
                    getListColor(colorsList, singleColor);
                }
            }
        }

        return singleColor;
    }

    /**
     * 基金营销专题页
     */
    function fundMarketingSpecial() {
        var param = {
            "product_id": $this.product_id
        };

        var callBackFunc = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    $(pageId + '.page_main .local_address').remove();
                    $(pageId + '.page_main .index_data').remove();
                    $(pageId + '.page_main .product_data').remove();
                    var specialCode = window.location.pathname.split('/')[3];
                    //主题
                    var dataList1 = dataList[0][1];
                    if(dataList1){
                        var imgList1 = '';
                        dataList1 = JSON.parse(dataList1)
                        for (var i = 0; i < dataList1.length; i++) {
                            var bgImg = document.createElement("img");     //创建一个img元素
                            bgImg.src=dataList1[i];
                            $(pageId + ' #bgBoxImg').append(bgImg)
                        }
                        $(pageId + '.page_main .fund_recom_page').css('background',imgList1);
                        $(pageId + '.page_main .fund_recom_page').css('padding-top','390px');

                    }
                    //头部按钮
                    var dataList2 = dataList[0][2];
                    if(dataList2){
                        dataList2 = JSON.parse(dataList2);
                        $(pageId + ' #fundRecomBtn a img').attr('src',dataList2[0].button_url);
                        $(pageId + ' #fundRecomBtn a em').css('background','url('+dataList2[0].text_url+')' + ' no-repeat center');
                        $(pageId + ' #footerRecom a').attr('data-code',specialCode);
                        $(pageId + ' #fixedCode a').attr('data-code',specialCode);
                        $(pageId + ' #fundRecomBtn a').attr('data-code',specialCode);
                        $(pageId + ' #fundRecomBtn').show();
                    }

                    var dataList3 = dataList[0]["3_1"];
                    if(dataList3){
                        dataList3 = JSON.parse(dataList3);
                        var imgList2 = '';
                        for (var i = 0; i < dataList3.length; i++) {
                            imgList2 += '<div class="fund_recom_img">\
											<img src="'+ dataList3[i].img_url +'" alt="">\
										</div>';
                        }
                        //图片组
                        $(pageId + ' #fundRecomImg').html(imgList2);
                        $(pageId + ' #fundRecomImg').show();
                    }
                    //视频组
                    var dataList4 = dataList[0]["4_2"];
                    if(dataList4){
                        dataList4 = JSON.parse(dataList4);
                        var videoList1 = '';
                        for (var i = 0; i < dataList4.length; i++) {
                            videoList1 += '<li class="swiper-slide">\
												<a href="javascript:void(0);"><img src="'+dataList4[i].video_cover+'" alt="">\
												<video style="width: 100%;height: 460px;display: none;" src="'+dataList4[i].video_url+'"></video>\
												</a>\
											</li>';
                        }
                        $(pageId + ' #fundRecomVideo .recom_video_list ul').html(videoList1);
                        $(pageId + ' #fundRecomVideo').show();
                        if(videoList1){
                            mySwiper = new Swiper('.recom_video_list', {
                                autoplay:4000,
                                loop:true,
                                speed:800,
                                pagination: '.recom_video_list .ban_dot',
                                paginationClickable: true,
                                autoplayDisableOnInteraction: false
                            });
                            $('.fund_recom_video .arrow-left').on('click', function(e){
                                e.preventDefault();
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].pause();
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].muted=true;
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].controls=false;
                                mySwiper.swipePrev();
                                mySwiper.stopAutoplay();
                            });
                            $('.fund_recom_video .arrow-right').on('click', function(e){
                                e.preventDefault();
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].pause();
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].muted=true;
                                $(pageId + " #fundRecomVideo .recom_video_list ul li.swiper-slide-active a video")[0].controls=false;
                                mySwiper.swipeNext();
                                mySwiper.stopAutoplay();
                            });
                        }
                    }
                    //公告组
                    var dataList5 = dataList[0]["5_3"];
                    if(dataList5){
                        dataList5 = JSON.parse(dataList5);
                        var titleList1 = '';
                        for (var i = 0; i < dataList5.length; i++) {
                            titleList1 += '<li><a target="_blank" href="'+dataList5[i].article_url+'"><em></em>'+dataList5[i].article_title+'</a><span>'+hchart.dateFormat(dataList5[i].create_date,'yyyy-MM-dd')+'</span></li>';
                        }
                        $(pageId + ' #fundRecomTitle ul.fund_recom_news').html(titleList1);
                        $(pageId + ' #fundRecomTitle').show();
                    }
                    //底部按钮图片
                    var dataList6 = dataList[0][6];
                    if(dataList6){
                        dataList6 = JSON.parse(dataList6);
                        $(pageId + ' #footerRecom a img').attr('src',dataList6[0].button_url);
                        $(pageId + ' #footerRecom a').attr('data-code',specialCode);
                        $(window).scroll(function(){
                            //底部固定推荐栏
                            if($(window).scrollTop()>600){
                                $('.footer_recom').fadeIn(300);
                            }else{
                                $('.footer_recom').fadeOut(300);
                            }
                        });
                    }
                    //底部文案
                    var dataList7 = dataList[0][7];
                    if(dataList7){
                        dataList7 = JSON.parse(dataList7);
                        $(pageId + ' #footerRecom p').html(dataList7[0]);
                    }
                    //右侧图标
                    var dataList8 = dataList[0][8];
                    if(dataList8){
                        dataList8 = JSON.parse(dataList8);
                        $(pageId + ' #fixedCode img').attr('src',dataList8[0]);
                        $(pageId + ' #fixedCode').show();
                    }
                    //右侧文案
                    var dataList9 = dataList[0][9];
                    if(dataList9){
                        dataList9 = JSON.parse(dataList9);
                        $(pageId + ' #fixedCode p').html(dataList9[0]);
                        $(pageId + ' #fixedCode').show();
                    }
                }
            }
        };
        wsService.fundMarketingSpecial(param, callBackFunc);
    }

    /**
     * 新发基金预约(营销)
     */
    function querynewfundyyMarketing() {
        var param = {
            "productcodes": $this.product_code,
        };
        var callBack = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults();
                if (dataList && dataList.length > 0) {
                    if (dataList[0].flag == '0' && dataList[0].productCode == $this.product_code) {
                        $("#fundyy").show();
                        $("#fundyy .msg_input:eq(1) img").attr("src", gconfig.global.vfImg + '?v=' + randomNum(6));
                        //绑定close
                        $("#fundyy .layer_close").bindEvent(function () {
                            $("#fundyy").hide();
                        })
                        //绑定刷新图片验证码
                        $("#fundyy .msg_input:eq(1) img").bindEvent(function () {
                            $(this).attr("src", gconfig.global.vfImg + '?v=' + randomNum(6));
                        })
                        //绑定获取手机验证码
                        $("#fundyy .msg_input:eq(2) a").bindEvent(function () {
                            var smobile = $("#fundyy .msg_input:eq(0) input").val();
                            var img_code = $("#fundyy .msg_input:eq(1) input").val();
                            if (!smobile && smobile.length != 11) {
                                layerWeb.msg("手机号码不正确", 2, 3);
                                return;
                            }
                            if (!img_code) {
                                layerWeb.msg("请输入图形验证码", 2, 3);
                                return;
                            }
                            sendmobile(smobile, img_code);//发送短信验证码
                        })

                        //检查输入框
                        $("#fundyy input").bindEvent(function () {
                            var cheack = true;
                            var smobile = $("#fundyy .msg_input:eq(0) input").val();
                            var img_code = $("#fundyy .msg_input:eq(1) input").val();
                            var mobile_code = $("#fundyy .msg_input:eq(2) input").val();
                            if (!smobile || smobile.length != 11) {
                                cheack = false;
                            }
                            if (!img_code) {
                                cheack = false;
                            }
                            if (!mobile_code) {
                                cheack = false;
                            }
                            if (cheack) {
                                $("#fundyy .message_btn").removeClass("default").attr("disabled", false);
                            } else {
                                $("#fundyy .message_btn").addClass("default").attr("disabled", true);
                            }
                        }, "input")

                        //点击确认预约
                        $("#fundyy .message_btn").bindEvent(function () {
                            var smobile = $("#fundyy .msg_input:eq(0) input").val();
                            var mobile_code = $("#fundyy .msg_input:eq(2) input").val();
                            if (!$("#fundyy .message_btn").hasClass("default")) {
                                cheakyy(smobile, mobile_code, '1');//确认预约
                            }
                        })
                    }
                }
            }
        }

        productService.querynewfundyy(callBack, param);
    }
    //销毁页面，单页面时候要用
    function destroy() {
        productService.destroy();
        wsService.destroy();
    }

    var fund_funddetail = {
        "init": init,
        "bindPageEvent": bindPageEvent,
        "destroy": destroy
    };
    // 暴露对外的接口
    module.exports = fund_funddetail;
})
