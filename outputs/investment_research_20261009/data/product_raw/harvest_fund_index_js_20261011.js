/**
 * 旗下基金首页
 */
define("ws/scripts/main/fund/index", function (require, exports, module) {
    var pageId = "#main_fund_index ";

    var productService = require("productService").getInstance();//产品服务类
    var layerWeb = require("layerWeb");   // 弹出框 Web端工具类
    var gconfig = require("gconfig");//全局配置对象
    var global = gconfig.global;//全局对象里面的global
    var commonExt = require("commonExt");
    var enumerateUtils = require("enumerateUtils");
    var dateUtils = require("dateUtils");
    var stringUtils = require("stringUtils");
    var contants = require("contants");
    var hchart=require("ws/scripts/utils/hchart");

    // var uaflag = navigator.userAgent.toLowerCase()
    // if(uaflag.match(/alipayclient/i) == 'alipayclient'){
    //     $('.mobile-header').hide()
    // }

    var $this = {
        // 筛选条件
        type: 'table',
        screenOption: {
            productTypes: "",
            riskLevels: "",
            statesType: "",
            buyLimitType: "",
            minFoundDays: "",
            maxFoundDays: "",
            fundCompany: "",
            isDateRate: "",
            isMouthRate: "",
            isSeasonRate: "",
            isHalfYearRate: "",
            isYearRate: "1",
            searchValue: "",
            orderbyStatus:"0",
            product_columns:"yieldrate",
            product_columnsh5:"yieldrate",
            orderbyStatush5:"0",
            fund_typeh5:"",
            allManagers:null,
            tyMangerId:"",
            tyTeamCode:"",
            tyTeamPage:0,

        },
        overlay_time:"成立以来",
        sreach_input: "",
        fundType: "",
        fund_class2_open: "1",
        manId:"",
        teamCode:""
    }

    var pageGlobal = {
        "curtPageNo": 1, // 当前页
        "numPerPage": 10,
        "totalPages": 1,
        "is_hot_sale": 0,
        "inputSetTimeout": null,
        "strategyList": null,
        "loading": false,
        "checkStatus": true,
    };

    //初始化
    function init(param) {
        $this.fundType = param.fundType;
        $this.screenOption.fund_type = param.fundType;
        $this.screenOption.tyMangerId = param.manId;//基金经理编号
        $this.screenOption.tyTeamCode=param.teamCode; //投资组名称
        loadHotTheme();//查询热门主题
        loadFundManagerNew();//查询基金经理
        loadFundClass(); //基金分类
        if(($this.screenOption.tyMangerId==''||$this.screenOption.tyMangerId==undefined||$this.screenOption.tyMangerId==null)&&($this.screenOption.tyTeamCode==''||$this.screenOption.tyTeamCode==undefined||$this.screenOption.tyTeamCode==null)){ //不为空就不查询
            commonUtil.querySpecialCode(loadFundList,true); //基金列表
        }
        //commonUtil.querySpecialCode(loadFundList,true); //基金列表
        commonUtil.querySpecialCode(loadFundListh5,true); //h5基金列表
    }

    //处理基金经理数据
    function loadFundManagerNew() {
        var callBack = function (resultVo) {

            //forEach IE 兼容
            Array.prototype.myForEach = function myForEach(callBack, context) {
                typeof context === "undefined" ? context = window : null;

                if ("forEach" in Array.prototype) {
                    this.forEach(callBack, context);
                    return;
                }
                for (var i = 0; i < this.length; i++) {
                    typeof callBack === "function" ? callBack.call(context, this[i], i, this) : null;
                }
            };

            var allFMInfo = JSON.parse(resultVo.obj.results['results'][0]['allFMInfo'])
            var beforeFMInfo = JSON.parse(resultVo.obj.results['results'][0]['beforeFMInfo'])
            var fundManagerInfo = JSON.parse(resultVo.obj.results['results'][0]['fundManagerInfo'])
            var concatedArr = beforeFMInfo.concat(allFMInfo)
            $this.screenOption.allManagers = concatedArr
            var managerTypeStr = ''
            var allManagerCnStr = ''
            var managerAEStr = ''
            var managerFJStr = ''
            var managerKOStr = ''
            var managerPTStr = ''
            var managerUZStr = ''

            //拼接所有基金经理
            concatedArr.myForEach(function (item, index) {
                allManagerCnStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
            })
            $("#allManagerList").html(allManagerCnStr)

            //拼接首字母A-E的基金经理
            var qualifiedAE = ['A', 'B', 'C', 'D', 'E']
            concatedArr.myForEach(function (item, index) {
                if (qualifiedAE.indexOf(item.fund_manager_name_en.charAt(0).toUpperCase()) > -1) {
                    managerAEStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
                }
            })
            $("#managerAE").html(managerAEStr)

            //拼接首字母F-J的基金经理
            var qualifiedFJ = ['F', 'G', 'H', 'I', 'J']
            concatedArr.myForEach(function (item, index) {
                if (qualifiedFJ.indexOf(item.fund_manager_name_en.charAt(0).toUpperCase()) > -1) {
                    managerFJStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
                }
            })
            $("#managerFJ").html(managerFJStr)

            //拼接首字母K-O的基金经理
            var qualifiedKO = ['K', 'L', 'M', 'N', 'O']
            concatedArr.myForEach(function (item, index) {
                if (qualifiedKO.indexOf(item.fund_manager_name_en.charAt(0).toUpperCase()) > -1) {
                    managerKOStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
                }
            })
            $("#managerKO").html(managerKOStr)

            //拼接首字母P-T的基金经理
            var qualifiedPT = ['P', 'Q', 'R', 'S', 'T']
            concatedArr.myForEach(function (item, index) {
                if (qualifiedPT.indexOf(item.fund_manager_name_en.charAt(0).toUpperCase()) > -1) {
                    managerPTStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
                }
            })
            $("#managerPT").html(managerPTStr)

            //拼接首字母U-Z的基金经理
            var qualifiedUZ = ['U', 'V', 'W', 'X', 'Y', 'Z']
            concatedArr.myForEach(function (item, index) {
                if (qualifiedUZ.indexOf(item.fund_manager_name_en.charAt(0).toUpperCase()) > -1) {
                    managerUZStr += '<a href="javaScript:void(0)" data-value=' + item.manager_id + '>' + item.fund_manager_name + '</a>'
                }
            })
            $("#managerUZ").html(managerUZStr)

            //Object.keys IE 兼容
            if (!Object.keys) Object.keys = function(o) {
                if (o !== Object(o))
                    throw new TypeError('Object.keys called on a non-object');
                var k=[],p;
                for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
                return k;
            }

            //Object.values IE 兼容
            if (!Object.values) Object.values = function(obj) {
                if (obj !== Object(obj))
                    throw new TypeError('Object.values called on a non-object');
                var val=[],key;
                for (key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj,key)) {
                        val.push(obj[key]);
                    }
                }
                return val;
            }




            //基金经理类型
            // managerTypeStr = '<div class="manager_list_box clearfix">'
            // fundManagerInfo.myForEach(function (item, index) {
            //     managerTypeStr += '<div class="manager_type">' + Object.keys(item).toString() + '</div><div class="manager_type_list">'
            //     Object.values(item)[0].myForEach(function (item1, index1) {
            //         if(item1.label != null && item1.label != ''){
            //             managerTypeStr += '<a href="javascript:void(0);" data-value='+ item1.manager_id +'><em class="pf_tag">'+ item1.label +'</em>'+ item1.fund_manager_name +'</a>'
            //         }else{
            //             managerTypeStr += '<a href="javascript:void(0);" data-value='+ item1.manager_id +'>'+ item1.fund_manager_name +'</a>'
            //         }
            //     })
            //     managerTypeStr += '</div>'
            // })
            // managerTypeStr += '</div>'
            var manager_type=[
                {type:"投资风格",child:["成长","价值","平衡","增强"]},
                {type:"行业赛道",child:["科技","周期","消费","制造","健康"]},
                {type:"债券固收",child:["固收+","纯债","短债","货币"]}
            ];

            managerTypeStr = '<div class="manager_list_box clearfix">'
            manager_type.forEach(function (item, index) {
                managerTypeStr += '<div class=" " style=" height: 35px" > <div class="manager_type">' +  item.type + '</div><div class="manager_type_list">'
                Object.values(item.child).forEach(function (item1, index1) {
                    if(item1 != null && item1 != ''){
                        managerTypeStr += '<em class="pf_tag" style="margin-left: 20px; height: 25px; font-size: 14px;line-height: 25px;">'+ item1 +'</em>'
                    }
                })
                managerTypeStr += '</div></div>'
            })
            managerTypeStr += '</div>'
            $(".manager_list_wrap").html(managerTypeStr)
            //新增2022年12月8日 单独查询基金经理
            if($this.screenOption.tyMangerId && !$this.screenOption.tyTeamCode){
                //clearSelect();
                $(pageId + "#manager_list_wrap a").removeClass('act');
                // 添加对应的选中状态
                $(".manager_type_list  a").each(function(){
                    var check_tab=$(this).attr("data-value")
                    if($this.screenOption.tyMangerId==check_tab){
                        $(this).addClass("act").parent().siblings('.manager_type_list').children().removeClass("act");
                    }
                })
                // $(this).addClass("act").parent().siblings('.manager_type_list').children().removeClass("act");
                $("#all_manager_list a").removeClass("act")
                var paraman = {
                    "managerId":$this.screenOption.tyMangerId
                }
                var callParamback = function(resultVo){
                    let resultInfo = resultVo.obj.results.results[0]
                    console.log(resultInfo)
                    $('.fund_adbox_info').show()
                    $('.fund_adbox_info .manager_avatar').attr('src',resultInfo.fund_manager_photo_url)
                    $('.fund_adbox_info .name').text(resultInfo.fund_manager_name)
                    if(resultInfo.label != ''){
                        $('.fund_adbox_info .tag').show()
                        $('.fund_adbox_info .tag').text(resultInfo.label)
                    }else{
                        $('.fund_adbox_info .tag').hide()
                    }
                    $('.fund_adbox_info .experience').html(resultInfo.fund_manager_info)
                }
                productService.queryFundManagerInfoDetail(callParamback,paraman)
                //改变状态
                $this.screenOption.fund_manager=$this.screenOption.tyMangerId;
                commonUtil.querySpecialCode(loadFundList);

            }

            //投资组
            if($this.screenOption.tyTeamCode){
                //clearSelect();
                $(pageId + "#manager_list_wrap a").removeClass('act');
                // 添加对应的选中状态
                $(".manager_type_list  a").each(function(){
                    var check_tab=$(this).attr("data-value")
                    if($this.screenOption.tyMangerId==check_tab){
                        $(this).addClass("act").parent().siblings('.manager_type_list').children().removeClass("act");
                    }
                })
                // $(this).addClass("act").parent().siblings('.manager_type_list').children().removeClass("act");
                $("#all_manager_list a").removeClass("act")
                var paraman = {
                    "teamCode":$this.screenOption.tyTeamCode
                }
                var queryInvestmentTeamCallParamback = function(resultVo){

                    console.log(resultVo);
                    let resultInfo = resultVo.obj.results.results[0]

                    var teamInfo= JSON.parse(resultVo.obj.results['results'][0]['teamInfo']);
                    var teamMemberList= JSON.parse(resultVo.obj.results['results'][0]['teamMemberList']);
                    console.log("---------------------")
                    console.log(teamInfo)
                    console.log(teamMemberList)
                    console.log("---------------------")
                    var leaderManager=teamMemberList[0];
                    $this.screenOption.fund_manager=leaderManager.manager_id;
                    $this.screenOption.tyMangerId=leaderManager.manager_id;

                    $('.fund_adbox_info').show()
                    $('.fund_adbox_info .manager_avatar').attr('src',leaderManager.fund_manager_photo_url)
                    $('.fund_adbox_info .name').text(leaderManager.fund_manager_name)
                    if(leaderManager.label != ''){
                        $('.fund_adbox_info .tag').show()
                        $('.fund_adbox_info .tag').text(leaderManager.label)
                    }else{
                        $('.fund_adbox_info .tag').hide()
                    }
                    $('.fund_adbox_info .experience').html(leaderManager.fund_manager_info)

                    $("#team_tit").text(teamInfo.pannel_group_name.substr(0,teamInfo.pannel_group_name.indexOf("-")));
                    if(teamInfo.team_img_url){
                        $(".sub_title").css("background-image","url("+teamInfo.team_img_url+")");
                    }else{
                        $(".sub_title").css("background-image","url('/ws/addimages/researchpic01.png')");

                    }

                    for(var i=0;i<teamMemberList.length;i++){
                        var item=teamMemberList[i];
                        var classNames="";
                        if(i==0){
                            classNames="act"
                        }else{

                        }
                        var manager_title="<li class='"+classNames+"' data-man-no='"+item.manager_id+"' >"+item.fund_manager_name+"</li>"
                        $("#member_title_nav").append(manager_title);
                    }

                    $("#member_title_nav li").click(function () {
                        var manager_id=$(this).attr("data-man-no");
                        $(this).attr("class","act").siblings().removeAttr("class");
                        $this.screenOption.fund_manager=manager_id;
                        $this.screenOption.tyMangerId=manager_id;
                        commonUtil.querySpecialCode(loadFundList,true);
                    });

                    var managerMembers=   teamMemberList.filter(function( index ) {

                        if(index.team_leader!=1) {return index;}
                    });
                    appendMemberElement(managerMembers);
                    if(managerMembers.length==0){
                        $(".team_member_title").hide();
                    }
                    if(managerMembers.length>2){
                        $(".team_member_select").show();
                        $("#team_member_left").click(function () {
                            var tempManagerPage=0;
                            tempManagerPage= $this.screenOption.tyTeamPage>0?$this.screenOption.tyTeamPage-1:0;
                            if(tempManagerPage!=$this.screenOption.tyTeamPage){
                                $this.screenOption.tyTeamPage=tempManagerPage;
                                appendMemberElement(managerMembers);
                            }

                        });
                        $("#team_member_right").click(function () {
                            var totlePage= totlePage=Math.ceil(managerMembers.length/2);
                            var tempManagerPage = totlePage-1> $this.screenOption.tyTeamPage?$this.screenOption.tyTeamPage+1:totlePage-1;
                            if(tempManagerPage!=$this.screenOption.tyTeamPage){
                                $this.screenOption.tyTeamPage=tempManagerPage;
                                appendMemberElement(managerMembers);
                            }

                        });
                    }
                    commonUtil.querySpecialCode(loadFundList,true);
                }
                productService.queryInvestmentTeamList(queryInvestmentTeamCallParamback,paraman)
                //改变状态
                $this.screenOption.fund_manager=  $this.screenOption.tyMangerId;

            }
        }
        productService.queryFundManagerList(callBack)
    }

    function appendMemberElement(membersList) {
        $("#div_members").empty();
        var minItem=  $this.screenOption.tyTeamPage*2;
        var maxItem=  membersList.length>($this.screenOption.tyTeamPage+1)*2 ? ($this.screenOption.tyTeamPage+1)*2:membersList.length;
        for(var i=minItem;i<maxItem;i++){
            var item=membersList[i];
            var itemClass="fund_adbox_info";
            if(i>0){
                itemClass="fund_adbox_info marginleft20";
            }
            var memberElement='<div class="'+itemClass+'" style="flex:1;">' +
                '<div class="manager_member_detail clearfix">' +
                '<img src="'+item.fund_manager_photo_url+'" class="manager_avatar" >' +
                '<div class="manager_info">' +
                '<div class="name_box">' +
                '<span class="name">'+item.fund_manager_name+'</span>' ;
            if(item.label){
                memberElement+='<span class="tag">'+item.label+'</span>'
            }
            memberElement+= '</div>' +
                '<div class="experience"> ' +item.fund_manager_info+
                '</div>' +
                '</div>' +
                '</div>';
            $("#div_members").append(memberElement);
        }

        var memberCount=$(".manager_member_detail").length;
        if(memberCount<=2){
            var item1= $($(".manager_member_detail")[0]).height();
            var item2= $($(".manager_member_detail")[1]).height();
            if(item>item2){
                $($(".manager_member_detail")[1]).height(item1);
            }else{
                $($(".manager_member_detail")[0]).height(item2);
            }

        }
    }

    //绑定事件
    function bindPageEvent() {

        // 筛选条件--基金经理类型
        $(pageId + "#manager_list_wrap").on("click", "a", function () {
            clearSelect();
            $this.screenOption.fund_manager = $(this).attr('data-value');
            $(pageId + "#manager_list_wrap a").removeClass('act');
            $(this).addClass("act").parent().siblings('.manager_type_list').children().removeClass("act");
            $("#all_manager_list a").removeClass("act")
            var params = {
                "managerId":$this.screenOption.fund_manager
            }
            var callback = function(resultVo){
                let resultInfo = resultVo.obj.results.results[0]
                console.log(resultInfo)
                $('.fund_adbox_info').show()
                $('.fund_adbox_info .manager_avatar').attr('src',resultInfo.fund_manager_photo_url)
                $('.fund_adbox_info .name').text(resultInfo.fund_manager_name)
                if(resultInfo.label != ''){
                    $('.fund_adbox_info .tag').show()
                    $('.fund_adbox_info .tag').text(resultInfo.label)
                }else{
                    $('.fund_adbox_info .tag').hide()
                }
                $('.fund_adbox_info .experience').html(resultInfo.fund_manager_info)
            }
            productService.queryFundManagerInfoDetail(callback,params)
            commonUtil.querySpecialCode(loadFundList);
        });

        //筛选条件--基金经理类字母排序
        $(pageId + ".manager_all_list").on("click", "a", function (index) {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
                $(".pf_condlayer2").eq($(this).index()).hide();
                return false;
            }
            clearSelect();
            $("#all_manager_list").show();
            $(this).addClass("act on").siblings().removeClass("act on");
            $(".pf_condlayer2").eq($(this).index()).show().siblings().hide();
            if(!$(pageId + "#all_manager_list a").hasClass("act")){
                $this.screenOption.fund_manager = '';
                commonUtil.querySpecialCode(loadFundList);
            }
        });

        $(pageId + "#all_manager_list").on("click", "a", function () {
            $this.screenOption.fund_manager = $(this).attr('data-value');
            $(pageId + "#all_manager_list a").removeClass('act');
            $(this).addClass("act").parent().siblings('.pf_condlayer2').children().removeClass("act");
            $("#manager_list_wrap a").removeClass("act")
            var params = {
                "managerId":$this.screenOption.fund_manager
            }
            var callback = function(resultVo){
                let resultInfo = resultVo.obj.results.results[0]
                console.log(resultInfo)
                $('.fund_adbox_info').show()
                $('.fund_adbox_info .manager_avatar').attr('src',resultInfo.fund_manager_photo_url)
                $('.fund_adbox_info .name').text(resultInfo.fund_manager_name)
                if(resultInfo.label != ''){
                    $('.fund_adbox_info .tag').show()
                    $('.fund_adbox_info .tag').text(resultInfo.label)
                }else{
                    $('.fund_adbox_info .tag').hide()
                }
                $('.fund_adbox_info .experience').html(resultInfo.fund_manager_info)
            }
            productService.queryFundManagerInfoDetail(callback,params)
            commonUtil.querySpecialCode(loadFundList);
        });

        /*       /!**
                * 清空筛选数据
                * @param isGL 是否是高级筛选  默认为false
                * @param isClearGL 是否清理高级筛选内容 默认为true
                * @param isSearch 是否是搜索 默认为false
                *!/
               function clearSelect(isGL, isClearGL, isSearch) {
                   !isGL && isGL !== false && (isGL = false);
                   !isClearGL && isClearGL !== false && (isClearGL = true);
                   !isSearch && isSearch !== false && (isSearch = false);

                   $this.screenOption.hot_theme = "";
                   $(pageId + " #hot_theme a").eq(0).addClass("act").siblings("a").removeClass("act");
                   $this.screenOption.fund_manager = "";
                   $(".fund_adbox_info").hide();
                   $("#all_manager_list").hide();
                   $("#all_manager_list a").removeClass("act");
                   $("#hot_theme a").each(function(){
                       if($(this).hasClass('on')){
                           $(".manager_all_list a").removeClass("act on");
                           return false;
                       }
                   })
                   $("#fund_type a").each(function(){
                       if($(this).hasClass('act')){
                           $(".manager_all_list a").removeClass("act on");
                           return false;
                       }
                   })
                   $(".manager_list_wrap a").removeClass("act");
                   $this.screenOption.fund_type = "";
                   $(pageId + " #fund_type a").eq(0).addClass("act").siblings("a").removeClass("on act");
                   $this.screenOption.fund_type2 = "";
                   $(pageId + " #fund_type2").hide();
                   $(pageId + " .fund_adbox").hide();

                   if (!isGL && $(pageId + " #gjsx").hasClass("on")) {
                       $(pageId + " #gjsx").trigger("click");
                   }

                   if (isClearGL) {
                       $(pageId + " #gj_item").html("");
                       $(pageId + " #pf_condbox .icon_check").removeClass("checked");
                   }

                   if (!isSearch) {
                       $this.screenOption.keyword = "";
                       $(pageId + " #searchValue").val("");
                   }

                   $(pageId + " .pf_checklist").removeClass("hidden");
                   switchCheckStatus(false);
               }*/

        // 点击产品搜索
        // $(pageId + " #searchValue").bindEvent(function (e) {
        //     if (e.keyCode === 13) {
        //         $(pageId + " #searchProduct").trigger("click");
        //     }
        //     clearSelect(false, true, true);
        // }, "keydown");

        $(pageId + " #searchValue").keydown(function (e) {
            if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13) {
                $(pageId + " #searchProduct").click();
            }
        });

        $(pageId + " #searchProduct").bindEvent(function () {
            clearSelect(false, true, true);
            $this.screenOption.keyword = "";
            var searchval = $(this).siblings("input").val();
            $this.screenOption.keyword = searchval;
            var allManagerList = $this.screenOption.allManagers;
            allManagerList.forEach(function(item,index){
                if(item.fund_manager_name == ($this.screenOption.keyword).trim()){
                    var params = {
                        "managerId":item.manager_id
                    }
                    var callback = function(resultVo){
                        let resultInfo = resultVo.obj.results.results[0]
                        console.log(resultInfo)
                        $('.fund_adbox_info').show()
                        $('.fund_adbox_info .manager_avatar').attr('src',resultInfo.fund_manager_photo_url)
                        $('.fund_adbox_info .name').text(resultInfo.fund_manager_name)
                        if(resultInfo.label != ''){
                            $('.fund_adbox_info .tag').text(resultInfo.label)
                        }else{
                            $('.fund_adbox_info .tag').hide()
                        }
                        $('.fund_adbox_info .experience').html(resultInfo.fund_manager_info)
                    }
                    $this.screenOption.fund_manager = item.manager_id;
                    $this.screenOption.keyword = "";
                    productService.queryFundManagerInfoDetail(callback,params);
                    return
                }
            })
            if($this.screenOption.keyword == ''){
                commonUtil.querySpecialCode(loadFundList,true); //基金列表
            }else{
                commonUtil.querySpecialCode(loadFundList);
            }
        }, "click");

        $(pageId + " #searchValue").bindEvent(function () {
            if($(this).val() == ''){
                clearSelect(false, true, true);
                $this.screenOption.keyword = "";
                commonUtil.querySpecialCode(loadFundList,true); //基金列表
            }
        }, "input");

        // 筛选条件--热门主题
        $(pageId + " #hot_theme").on("click", "a", function () {
            clearSelect();
            $this.screenOption.hot_theme = $(this).attr('data-value');
            $(this).addClass("act").siblings().removeClass("act");
            if ($(this).attr('data-url')) {
                $(pageId + " .fund_adbox img").attr("src", $(this).attr('data-url'));
                $(pageId + " .fund_adbox").show();
            } else {
                $(pageId + " .fund_adbox").hide();
            }
            commonUtil.querySpecialCode(loadFundList);
        });

        // 筛选条件--基金大类型
        $(pageId + " #fund_type").on("click", "a", function () {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
                $(pageId + " .pf_condlayer").hide();
                return false;
            }
            clearSelect();
            $this.screenOption.fund_type = $(this).attr('data-value');
            $(this).addClass("act on").siblings().removeClass("act on");
            var data_value = $(this).attr('data-value');
            if (data_value && $(pageId + " .pf_condlayer .cont" + data_value).length) {
                $(pageId + " .pf_condlayer").show();
                $(pageId + " .pf_condlayer .cont" + data_value).show().siblings().hide();
                $(pageId + " .pf_condlayer .cont" + data_value + " a:eq(0)").addClass("act").siblings().removeClass("act");
            } else {
                $(this).removeClass("on");
                $(pageId + " .pf_condlayer").hide();
                /**
                 * 货币型处理置灰【长期业绩、短期业绩选择】
                 * addby chenxy20201026
                 */
                var fundType01 = gconfig.global.fundType01;
                if(fundType01 && fundType01 == data_value) {
                    switchCheckStatus(true);
                }
            }
            // if(($(this).html() == "货币类" && $(".fund_table:eq(0)").hasClass("move0")) || ($(this).html() != "货币类" && $(".fund_table:eq(0)").hasClass("move1"))){
            //     var e = $(".fund_table:eq(1)");
            //     e.prev().insertAfter(e);
            // }
            commonUtil.querySpecialCode(loadFundList);
        });

        // 筛选条件--基金二级分类
        $(pageId + " .pf_condlayer").on("click", "a", function () {
            $this.screenOption.fund_type2 = $(this).attr('data-value');
            $(this).addClass("act").siblings().removeClass("act");
            /**
             * 非货币型处理恢复【长期业绩、短期业绩选择】
             * addby chenxy20201026
             */
            var data_value = $(this).attr('data-value');
            var fundType01 = gconfig.global.fundType01;
            if(fundType01 && data_value && fundType01 == data_value) {
                switchCheckStatus(false);
            }
            commonUtil.querySpecialCode(loadFundList);
        });

        // 高级筛选
        $(pageId + " #gjsx").bindEvent(function () {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
                if(!$(pageId + " #pf_condbox span").hasClass("checked")){
                    $(pageId + " #pf_condbox").hide();
                }else{
                    $(pageId + " #pf_condbox dl").hide();
                    $(pageId + " #pf_condbox").css("border-bottom","0");
                    $(pageId + " #gjsz").hide();
                }
            } else {
                $(this).addClass("on");
                $(pageId + " #pf_condbox dl").show();
                $(pageId + " #gjsz").show();
                $(pageId + " #pf_condbox").show();
            }
        });

        // 高级筛选--交易状态
        $(pageId + " #account_status").on("click", "span", function () {
            clearSelect(true, false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("checked")) {
                $(this).removeClass("checked");
                $(pageId + " #account_status" + index).remove();
            } else {
                $(this).addClass("checked");
                $(pageId + " #gj_item").append('<span id="account_status' + index + '" item="account_status" index="' + index + '">' + data_desc + '<a class="delete" href="javaScript:void(0)"></a></span>');
            }
        });

        // 高级筛选--风险等级
        $(pageId + " #risk_level").on("click", "span", function () {
            clearSelect(true, false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("checked")) {
                $(this).removeClass("checked");
                $(pageId + " #risk_level" + index).remove();
            } else {
                $(this).addClass("checked");
                $(pageId + " #gj_item").append('<span id="risk_level' + index + '" item="risk_level" index="' + index + '">' + data_desc + '<a class="delete" href="javaScript:void(0)"></a></span>');
            }
        });

        // 高级筛选--成立时间
        $(pageId + " #start_time").on("click", "span", function () {
            clearSelect(true, false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("checked")) {
                $(this).removeClass("checked");
                $(pageId + " #start_time" + index).remove();
            } else {
                $(this).addClass("checked");
                $(pageId + " #gj_item").append('<span id="start_time' + index + '" item="start_time" index="' + index + '">' + data_desc + '<a class="delete" href="javaScript:void(0)"></a></span>');
            }
        });

        // 高级筛选--删除下面显示块
        $(pageId + " #gj_item").on("click", "a", function () {
            var item = $(this).parent().attr("item");
            var index = $(this).parent().attr("index");
            $(this).parent().remove();
            $(pageId + " #" + item + " span").eq(index).removeClass("checked");
            clearSelect(true, false);
            if(!$(pageId + " #pf_condbox span").hasClass("checked")){
                $(pageId + " #pf_condbox").hide();
            }
            commonUtil.querySpecialCode(loadFundList);
        });

        // 高级筛选--点击确认
        $(pageId + " #gjsz a:eq(0)").bindEvent(function () {
            clearSelect(true, false);
            $(pageId + " #gjsz").hide();
            $(pageId + " .fund_adbox").hide();
            $(pageId + " #gjsx").removeClass("on");
            if(!$(pageId + " #pf_condbox span").hasClass("checked")){
                $(pageId + " #pf_condbox").hide();
            }else{
                $(pageId + " #pf_condbox dl").hide();
                $(pageId + " #pf_condbox").css("border-bottom","0");
            }
            commonUtil.querySpecialCode(loadFundList);
        });

        // 高级筛选--点击重置
        $(pageId + " #gjsz a:eq(1)").bindEvent(function () {
            $(pageId + " #gj_item").html("");
            $(pageId + " #pf_condbox span.checked").removeClass("checked");
        });

        // 点击长短期业绩
        $(pageId + " #yj span").bindEvent(function () {
            if(pageGlobal.checkStatus) {
                $this.screenOption.yebx = "";
                $(this).addClass('checked').siblings().removeClass('checked');
                $(pageId + " .fund_table thead .sort_link").removeClass("up").removeClass("down");
                $this.screenOption.yebx = $(this).index();
                if ($this.screenOption.yebx == "1") {
                    $this.screenOption.orderbyStatus = "0";
                    $this.screenOption.product_columns = "yieldratety";
                    $(pageId + " .fund_table thead .sort_link:eq(15)").removeClass("up").addClass("down");
                    $(pageId + " .fund_table_cl thead .sort_link:eq(15)").removeClass("up").addClass("down");
                } else {
                    $this.screenOption.orderbyStatus = "0";
                    $this.screenOption.product_columns = "yieldrate";
                    $(pageId + " .fund_table thead .sort_link:eq(7)").removeClass("up").addClass("down");
                    $(pageId + " .fund_table_cl thead .sort_link:eq(7)").removeClass("up").addClass("down");
                }
                commonUtil.querySpecialCode(loadFundList);
            }
        });

        // 表头排序
        $(pageId + " .fund_table").on("click", "th", function () {
            if(!$(this).find("a").hasClass("sort_link")){
                return false;
            }
            $this.screenOption.orderbyStatus = "";
            $this.screenOption.product_columns = "";
            var type = $(this).find(".sort_link").attr("data-type");
            var value = ''
            $(this).siblings("th").find(".sort_link").removeClass('up').removeClass('down');
            if ($(this).find(".sort_link").hasClass("down")) {
                $(this).find(".sort_link").removeClass("down").addClass("up");
                value = 1
            } else {
                $(this).find(".sort_link").addClass("down").removeClass('up');
                value = 0
            }
            $this.screenOption.orderbyStatus = value;
            $this.screenOption.product_columns = type;
            commonUtil.querySpecialCode(loadFundList);
        });

        // 点击收藏
        $(pageId + " .fund_table tbody").bindChildEvent(".focus", function () {
            if ($(this).hasClass("on") == true) {
                $(this).removeClass("on");
                var fundId = $(this).parent().parent().attr("data-id");
                var followList = $.getStorage("followList");
                followList = JSON.parse(followList);
                for (var i = 0; i < followList.length; i++) {
                    if (followList[i] == fundId) {
                        followList.splice(i);
                    }
                }
                $.setSessionStorage("followList", JSON.stringify(followList));
            } else {
                $(this).addClass("on");
                var fundId = $(this).parent().parent().attr("data-id");
                if (!$.getStorage("followList")) {
                    var followList = [];
                } else {
                    var followList = $.getStorage("followList");
                    followList = JSON.parse(followList);
                }
                followList.push(fundId);
                $.setSessionStorage("followList", JSON.stringify(followList));
            }
        });
        /*$(pageId + " #fundtbody").on("click", "td div", function () {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
        });*/

        // 点击查看
        // $(pageId + " #fundtbody").on("click", "td.first", function () {
        //     var pid = $(this).parents("tr").attr("data-id");
        // 	var pcode = $(this).parents("tr").attr("data-code");
        //     window.location.href = "/main/fund/"+pcode+"/fundManager.shtml";
        // });

        // 产品名称气泡
        $(pageId + " .fund_table tbody").bindChildEvent("td.first", function () {
            // if ($this.screenOption.fund_manager) {
            //     $(this).find(".fund_xxlayer li:last").show();
            // } else {
            //     $(this).find(".fund_xxlayer li:last").hide();
            // }

            var awidth= $(this).find("a").width();
            var tips = $(this).find(".warn").html();
            if(awidth>=196 || tips){
                $(this).find(".fund_xxlayer").show();
            }
        }, "mousemove");
        $(pageId + " .fund_table tbody").bindChildEvent("td.first", function () {
            $(this).find(".fund_xxlayer").hide();
        }, "mouseout");

        // 购买、定投气泡
        // $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a", function () {
        //     if($(this).attr("data-iscnetf")){
        //         $(this).find("strong").show();
        //     }else if(!$(this).hasClass("gray")){
        //         if($(this).siblings().hasClass("gray")){
        //             $(this).find("strong").show();
        //         }else{
        //             $(this).parent().find("a:eq(0)").find('strong').show();
        //         }
        //     }
        // }, "mousemove");
        // $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a", function () {
        //     $(pageId + " .fund_table tbody .btn_box a").find("strong").hide();
        // }, "mouseout");



        //点击列表中购买或定投弹窗
        $(pageId + " .fund_table tbody").bindChildEvent("td div.btn_box a",function(){
            if(!$(this).hasClass("gray")){
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
                        // if($(this).attr("data-iscnetf")=='1'){
                        //     $("#fixedInvestment div.exp_txt_01").show();
                        // }else{
                        //     $("#fixedInvestment div.exp_txt_01").hide();
                        // }
                    }
                }
                $("body").css("overflow","hidden");
            }
        });

        //h5点击事件
        //显示筛选框
        $(pageId + " #select").bindEvent(function () {
            $(pageId + " .mobile-cond_overlay").show();
        }, "click");

        //一级分类
        $(pageId + " #fund_class").on("click", "span", function () {
            clearSelecth5(true,true);
            $this.screenOption.fund_typeh5 = $(this).attr('data-value');
            $(this).addClass("act on").siblings().removeClass("act on");
            var data_value = $(this).attr('data-value');
            if (data_value && $(pageId + " #fund_class2 .cont" + data_value).length) {
                $this.fund_class2_open="2";
                $(pageId + " #fund_class2").show();
//                $(pageId + " .overlayer_box").css({top:"2.44rem",height:"calc(100% - 2.44rem)"});
                $(pageId + " #fund_class2 .cont" + data_value).show().siblings().hide();
                $(pageId + " #fund_class2 .cont" + data_value + " span:eq(0)").addClass("on").siblings().removeClass("on");
            }else{
                $this.fund_class2_open="1";
//                $(pageId + " .overlayer_box").css({top:"2.06rem",height:"calc(100% - 2.06rem)"});
                $(pageId + " #fund_class2").hide();
            }

            commonUtil.querySpecialCode(loadFundListh5);
        });

        // 基金二级分类
        $(pageId + " #fund_class2").on("click", "span", function () {
            $this.screenOption.fund_type2h5 = $(this).attr('data-value');
            $(this).addClass("on").siblings().removeClass("on");
            var data_value = $(this).attr('data-value');
            commonUtil.querySpecialCode(loadFundListh5);
        });

        // 高级筛选--交易状态
        $(pageId + " #jyzt").on("click", "li", function () {
            clearSelecth5(true,false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("act")) {
                $(this).removeClass("act");
                $(pageId + " #account_statush5" + index).remove();
            } else {
                $(this).addClass("act");
            }
        });

        // 高级筛选--风险等级
        $(pageId + " #fxdj").on("click", "li", function () {
            clearSelecth5(true,false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("act")) {
                $(this).removeClass("act");
                $(pageId + " #risk_levelh5" + index).remove();
            } else {
                $(this).addClass("act");
            }
        });

        // 高级筛选--成立时间
        $(pageId + " #clsj").on("click", "li", function () {
            clearSelecth5(true,false);
            var index = $(this).index();
            var data_desc = $(this).text();
            if ($(this).hasClass("act")) {
                $(this).removeClass("act");
                $(pageId + " #start_timeh5" + index).remove();
            } else {
                $(this).addClass("act");
            }
        });

        // 高级筛选--点击确认
        $(pageId + " #sure").bindEvent(function () {
            clearSelecth5(true,false);
            $(pageId + " .mobile-cond_overlay").hide();
            commonUtil.querySpecialCode(loadFundListh5);
        });

        // 高级筛选--点击关闭
        $(pageId + " #close").bindEvent(function () {
            $(pageId + " .main_box li.act").removeClass("act");
            $(pageId + " .mobile-cond_overlay").hide();
        });


        // 高级筛选--点击重置
        $(pageId + " #reset").bindEvent(function () {
            $(pageId + " .main_box li.act").removeClass("act");

        });
        //收益率切换
        $(pageId + " .overlayer_box .overlay_time li").bindEvent(function () {
            $(this).addClass("act").siblings().removeClass("act");
            $(pageId + " #list_title tr i").removeClass("act");
            $this.overlay_time=$(this).attr("data-key");
            $(pageId + " #list_title tr i").html($this.overlay_time);
            $(pageId + " .overlayer_box").hide();
            $this.screenOption.product_columnsh5 =  $(this).attr("data-value");
            commonUtil.querySpecialCode(loadFundListh5);
        });

        $(pageId + " .overlayer_box").bindEvent(function () {
            $(pageId + " #list_title tr i").removeClass("act");
            $(pageId + " .overlayer_box").hide();
        });

        //跳到净值估算
        $(pageId + "#jzgs").bindEvent(function () {
            var href="/main/fund/Gadgets/estimation/index.shtml";
            window.location.href=href;
        });
    }


    /**
     * 清空筛选数据
     * @param isGL 是否是高级筛选  默认为false
     * @param isClearGL 是否清理高级筛选内容 默认为true
     * @param isSearch 是否是搜索 默认为false
     */
    function clearSelect(isGL, isClearGL, isSearch) {
        !isGL && isGL !== false && (isGL = false);
        !isClearGL && isClearGL !== false && (isClearGL = true);
        !isSearch && isSearch !== false && (isSearch = false);

        $this.screenOption.hot_theme = "";
        $(pageId + " #hot_theme a").eq(0).addClass("act").siblings("a").removeClass("act");
        $this.screenOption.fund_manager = "";
        $(".fund_adbox_info").hide();
        $("#all_manager_list").hide();
        $("#all_manager_list a").removeClass("act");
        $("#hot_theme a").each(function(){
            if($(this).hasClass('on')){
                $(".manager_all_list a").removeClass("act on");
                return false;
            }
        })
        $("#fund_type a").each(function(){
            if($(this).hasClass('act')){
                $(".manager_all_list a").removeClass("act on");
                return false;
            }
        })
        $(".manager_list_wrap a").removeClass("act");
        $this.screenOption.fund_type = "";
        $(pageId + " #fund_type a").eq(0).addClass("act").siblings("a").removeClass("on act");
        $this.screenOption.fund_type2 = "";
        $(pageId + " #fund_type2").hide();
        $(pageId + " .fund_adbox").hide();

        if (!isGL && $(pageId + " #gjsx").hasClass("on")) {
            $(pageId + " #gjsx").trigger("click");
        }

        if (isClearGL) {
            $(pageId + " #gj_item").html("");
            $(pageId + " #pf_condbox .icon_check").removeClass("checked");
        }

        if (!isSearch) {
            $this.screenOption.keyword = "";
            $(pageId + " #searchValue").val("");
        }

        $(pageId + " .pf_checklist").removeClass("hidden");
        switchCheckStatus(false);
    }







    /**
     * 查询热门主题
     */
    function loadHotTheme() {
        var param = {
            "selecttype": "2"
        }

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    var themeHtml = '<a class="act" href="javascript:void(0);" data-value="">全部</a>';
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        themeHtml += '<a href="javascript:void(0);" data-value="' + item.theme_id + '" data-url="' + item.theme_photo_url + '">' + item.theme_name + (item.is_recommon == "1" ? '<em class="pf_hot"></em>' : '') + '</a>'
                    }

                    $(pageId + " #hot_theme").html(themeHtml);
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryHotTheme(callback, param);
    }

    /**
     * 查询基金经理
     */
    function loadFundManager() {
        var param = {
            "type": "2"
        }

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    var managerHtml = '<a class="act" href="javascript:void(0);" data-value="">全部</a>';
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        var label = '';
                        if (item.label) {
                            label = '<em class="pf_tag">' + item.label + '</em>';
                        }
                        managerHtml += '<a href="javascript:void(0);" data-value="' + item.manager_id + '" data-url="' + item.fund_manager_intro_imgurl + '">' + item.fund_manager_name + label + '</a>'
                    }

                    // $(pageId + " #fund_manager").html(managerHtml);
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryFundManagerInfo(callback, param);
    }


    /**
     * 查询基金分类
     */
    function loadFundClass() {
        var param = {}
        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    var typeHtml = '<a class="act" href="javaScript:void(0)" data-value="">全部</a>';
                    var h5typeHtml = '<span class="act" data-value="">全部</span>';
                    var a_index= 0;
                    var childHtml = '';
                    var h5childHtml = '';

                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        var dropstr = '';
                        if(item.listchild && JSON.parse(item.listchild).length >0){
                            dropstr = '<i class="arrow"></i>';
                        }
                        if($this.fundType && $this.fundType == item.item_value){
                            a_index = i+1;
                        }
                        typeHtml += '<a class="dropdown" href="javaScript:void(0)" data-value="' + item.item_value + '">' + (item.item_name || "--") + dropstr +'</a>';

                        h5typeHtml+='<span data-value="' + item.item_value + '">'+(item.item_name)+'</span>';
                        var listchild = item.listchild;
                        if (listchild && JSON.parse(listchild).length > 0) {
                            listchild = JSON.parse(listchild);
                            h5childHtml +='<div class="mobile_type_list cont' + item.item_value + '" style="display:none;"><span class="on" data-value="">全部</span>';
                            childHtml += '<div class="cont cont' + item.item_value + '" style="display: none;"><a href="javaScript:void(0)" data-value="">全部</a>';
                            for (var j = 0; j < listchild.length; j++) {
                                childHtml += '<a href="javaScript:void(0)" data-value="' + listchild[j].item_value + '">' + (listchild[j].item_name || "--") + '</a>';
                                h5childHtml +='<span data-value="' + listchild[j].item_value + '">'+listchild[j].item_name +'</span>';
                            }
                            childHtml += '</div>';
                            h5childHtml +='</div>';
                        }
                    }
                    $(pageId + " #fund_type").html(typeHtml);
                    $(pageId + " #fund_type2").html(childHtml);
                    $(pageId + " #fund_class").html(h5typeHtml);
                    $(pageId + " #fund_class2").html(h5childHtml);
                    if($this.fundType){
                        $(pageId + " #fund_type a").eq(a_index).addClass("on act").siblings("a").removeClass("on act");
                        var data_value =  $(pageId + " #fund_type a").eq(a_index).attr('data-value');
                        if (data_value && $(pageId + " .pf_condlayer .cont" + data_value).length) {
                            $(pageId + " .pf_condlayer").show();
                            $(pageId + " .pf_condlayer .cont" + data_value).show().siblings().hide();
                            $(pageId + " .pf_condlayer .cont" + data_value + " a:eq(0)").addClass("act").siblings().removeClass("act");
                        } else {
                            $(pageId + " #fund_type a").eq(a_index).removeClass("on");
                            $(pageId + " .pf_condlayer").hide();
                        }

                    }
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryFundClass(callback, param);
    }

    /**
     * 查询基金公司
     */
    function queryAllFundCompany() {
        var param = {
            cur_page: "1",
            num_per_page: "500",
        }
        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    var fundCom = '<span>基金公司：</span><strong  class="str_02 hide"><a href="javascript:void(0);" class="current">全部</a>'
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        fundCom += '<a href="javascript:void(0);" data-value="' + item.ta_inner_code + '">' + item.manager_name + '</a>';
                    }
                    fundCom += '</strong ><a href="javascript:void(0);" class="see_more">展开全部<em></em></a>'

                    $(pageId + "#fundCompanyList").html(fundCom);
                }

            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }
        productService.queryAllFundCompany(callback, param);
    }

    /**
     * 加载产品列表
     */
    function loadFundList() {
        var account_status = "";
        $("#account_status span").each(function () {
            if ($(this).hasClass("checked")) {
                account_status += $(this).attr("data-value") + ",";
            }
        });
        if(account_status.length>0){
            account_status = account_status.substring(0, account_status.length - 1);
        }


        var risk_level = "";
        $("#risk_level span").each(function () {
            if ($(this).hasClass("checked")) {
                risk_level += $(this).attr("data-value") + ",";
            }
        });
        if(risk_level.length>0){
            risk_level = risk_level.substring(0, risk_level.length - 1);
        }


        var start_time = "";
        $("#start_time span").each(function () {
            if ($(this).hasClass("checked")) {
                start_time += $(this).attr("data-value") + ",";
            }
        });
        if(start_time.length>0){
            start_time = start_time.substring(0, start_time.length - 1);
        }


        var param = {
            "hotno": $this.screenOption.hot_theme,
            "mangerno": $this.screenOption.fund_manager,
            "fundtype": $this.screenOption.fund_type,
            "fundtype2": $this.screenOption.fund_type2,
            "transactionStatus": account_status,
            "riskcode": risk_level,
            "select_times": start_time,
            "product_columns": $this.screenOption.product_columns,
            "orderbystatus": $this.screenOption.orderbyStatus,
            "keyword": $this.screenOption.keyword,
            "query_status_type":"1",
            "sessionId": '2'
        };

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    renderHtml(dataList);
                } else {
                    $(pageId + " #fundtbody").parents(".fund_table").hide();
                    $(pageId + " #fundtbody_hb").parents(".fund_table").hide();
                    $(pageId + " #no_data").show();
                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryFundList(callback, param);
    }

    // 渲染列表
    function renderHtml(data) {
        var nowDate = new Date();
        if ($this.screenOption.yebx == "1") {
            $(pageId + " #fundthead .tr1").hide();
            $(pageId + " #fundthead .tr2").show();

            $(pageId + " #fundthead_cl .tr1").hide();
            $(pageId + " #fundthead_cl .tr2").show();

        } else {
            $(pageId + " #fundthead .tr1").show();
            $(pageId + " #fundthead .tr2").hide();

            $(pageId + " #fundthead_cl .tr1").show();
            $(pageId + " #fundthead_cl .tr2").hide();
        }
        var strHtml = '';
        var strHtml_hb = '';
        var strHtml_cl = '';
        var followList = $.getStorage("followList");
        try {
            followList = JSON.parse(followList);
        } catch (e) {
            followList = [];
        }

        for (var i = 0; i < data.length; i++) {
            var unit_nav = data[i].unit_nav || '--';
            var total_nav = data[i].total_nav || '--';
            var followFlag = followList.indexOf(data[i].product_id) > -1;
            var followClass = followFlag ? "on" : "";
            var amngeryears = data[i].amngeryears;
            var amngerydate = data[i].amngerydate;
            var manager_date = stringUtils.formatEmpty(amngeryears, "--") + "年" + stringUtils.formatEmpty(amngerydate, "--") + "天";
            var subscribe_start_time = dateUtils.getDateByStr(data[i].subscribe_start_time + " 09:00:00");
            var fund_status = data[i].fund_status;
            var fund_class2 = data[i].fund_class2;
            var fund_status_desc = '';
            if(fund_status=='1'){
                fund_status_desc = '<div class="new_icon01"></div>';
            }else if(fund_status=='a' || fund_class2=="HFM0506"){
                fund_status_desc = '<div class="zhongzhi_icon01"></div>';
            }
            var special_fund_tips = '';
            if(data[i].special_fund_tips){
                special_fund_tips = '<p class="warn">'+data[i].special_fund_tips+'</p>';
            }

            if (contants.fundType["货币类"].item_value == data[i].fund_class && "净值货币型" != data[i].fund_class3 ) {
                // 货币
                var hundred_revenue_allocation = contants.specialCode["hundred_revenue_allocation"] || "";
                var million_revenue_allocation = contants.specialCode["million_revenue_allocation"] || "";
                strHtml_hb += '<tr data-id="' + data[i].product_id + '" data-code="' + data[i].product_code + '">';
                strHtml_hb += '<td class="first"><div class="tit"><em class="c_01" style="background:'+data[i].color+'">'+fund_status_desc+'</em><a target="_blank" href="/main/fund/'+data[i].product_code+'/fundManager.shtml" title="">' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</a><div class="fund_xxlayer" style="top: -28px; left: 106%; display: none;"><ul><li><span>基金简称：</span><strong>' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</strong></li><li style="display: none;"><span>管理时间：</span><strong>' + manager_date + '</strong></li></ul>'+special_fund_tips+'</div></div><p class="p1">' + stringUtils.formatEmpty(data[i].product_code, '--') + '</p></td>';
                if(hundred_revenue_allocation.indexOf(data[i].product_code) != -1){
                    strHtml_hb += '<td><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p><p class="txt">百份收益</p></td>';
                }else if(million_revenue_allocation.indexOf(data[i].product_code) != -1){
                    strHtml_hb += '<td><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p><p class="txt">百万份收益</p></td>';
                }else{
                    strHtml_hb += '<td><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                }
                strHtml_hb += '<td><p class="p2">' + stringUtils.parseFloatFormat(data[i].income_annual_sd, '--', 4, 1, '%', false) + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                strHtml_hb += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldratety) + '">' + stringUtils.parseFloatFormat(data[i].yieldratety, '--', 2, 1, '%', true) + '</p></td>';
                strHtml_hb += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1y, '--', 2, 1, '%', true) + '</p></td>';
                strHtml_hb += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate, '--', 2, 1, '%', true) + '</p></td>';
                strHtml_hb += '<td><div class="focus ' + followClass + '"></div></td>';
                if(data[i].is_cn_etf=="1"){
                    var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>'+data[i].cn_etf_desc+'</strong>';
                    strHtml_hb += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',data[i])+'" data-code="'+data[i].product_code+'">购买' + desc +'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',data[i])+'" data-code="'+data[i].product_code+'">定投' + desc +'</a></div></td>';
                }else{
                    strHtml_hb += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('1',data[i])+'" data-code="'+data[i].product_code+'">购买'+hchart.isPurchaseOrder('3',data[i])+'</a><a href="javascript:void(0);" class="'+hchart.isPurchaseOrder('2',data[i])+'" data-code="'+data[i].product_code+'">定投'+hchart.isPurchaseOrder('4',data[i])+'</a></div></td>';
                }
                strHtml_hb += '</tr>'
            } else {

                if(fund_status=='a' || fund_class2=="HFM0506"){
                    strHtml_cl += '<tr data-id="' + data[i].product_id + '" data-code="' + data[i].product_code + '">';
                    strHtml_cl += '<td class="first"><div class="tit"><em class="c_01" style="background:' + data[i].color + '"></em>' + fund_status_desc + '<a target="_blank" href="/main/fund/' + data[i].product_code + '/fundManager.shtml" title="">' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</a><div class="fund_xxlayer" style="top: -28px; left: 106%; display: none;"><ul><li><span>基金简称：</span><strong>' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</strong></li><li style="display: none;"><span>管理时间：</span><strong>' + manager_date + '</strong></li></ul>' + special_fund_tips + '</div></div><p class="p1">' + stringUtils.formatEmpty(data[i].product_code, '--') + '</p></td>';

                    if (fund_status == "1") {
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                        strHtml_cl += '<td><p class="p2">--</p></td>';
                    } else if ($this.screenOption.yebx == "1") {
                        strHtml_cl += '<td><p class="p2">' + unit_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml_cl += '<td><p class="p2">' + total_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1d) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1d, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1w) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1w, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate3m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate3m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate6m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate6m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldratety) + '">' + stringUtils.parseFloatFormat(data[i].yieldratety, '--', 2, 1, '%', true) + '</p></td>';
                    } else {
                        strHtml_cl += '<td><p class="p2">' + unit_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml_cl += '<td><p class="p2">' + total_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1d) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1d, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate2y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate2y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate3y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate3y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate5y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate5y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml_cl += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate, '--', 2, 1, '%', true) + '</p></td>';
                    }
                    strHtml_cl += '<td><div class="focus ' + followClass + '"></div></td>';
                    if (data[i].is_cn_etf == "1") {
                        var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + data[i].cn_etf_desc + '</strong>';
                        strHtml_cl += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('1', data[i]) + '" data-code="' + data[i].product_code + '">购买' + desc + '</a><a href="javascript:void(0);" class="gray" data-code="' + data[i].product_code + '">定投' + desc + '</a></div></td>';
                    } else {
                        strHtml_cl += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('1', data[i]) + '" data-code="' + data[i].product_code + '">购买' + hchart.isPurchaseOrder('3', data[i]) + '</a><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('2', data[i]) + '" data-code="' + data[i].product_code + '">定投' + hchart.isPurchaseOrder('4', data[i]) + '</a></div></td>';
                    }
                    strHtml_cl += '</tr>'
                }else
                {


                    strHtml += '<tr data-id="' + data[i].product_id + '" data-code="' + data[i].product_code + '">';
                    strHtml += '<td class="first"><div class="tit"><em class="c_01" style="background:' + data[i].color + '"></em>' + fund_status_desc + '<a target="_blank" href="/main/fund/' + data[i].product_code + '/fundManager.shtml" title="">' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</a><div class="fund_xxlayer" style="top: -28px; left: 106%; display: none;"><ul><li><span>基金简称：</span><strong>' + stringUtils.formatEmpty(data[i].product_abbr, '--') + '</strong></li><li style="display: none;"><span>管理时间：</span><strong>' + manager_date + '</strong></li></ul>' + special_fund_tips + '</div></div><p class="p1">' + stringUtils.formatEmpty(data[i].product_code, '--') + '</p></td>';

                    if (fund_status == "1") {
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                        strHtml += '<td><p class="p2">--</p></td>';
                    } else if ($this.screenOption.yebx == "1") {
                        strHtml += '<td><p class="p2">' + unit_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml += '<td><p class="p2">' + total_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1d) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1d, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1w) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1w, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate3m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate3m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate6m) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate6m, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldratety) + '">' + stringUtils.parseFloatFormat(data[i].yieldratety, '--', 2, 1, '%', true) + '</p></td>';
                    } else {
                        strHtml += '<td><p class="p2">' + unit_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml += '<td><p class="p2">' + total_nav + '</p><p class="p1">' + dateUtils.dateFormat(data[i].nav_date, "yyyy-MM-dd") + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1d) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1d, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate1y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate1y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate2y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate2y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate3y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate3y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate5y) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate5y, '--', 2, 1, '%', true) + '</p></td>';
                        strHtml += '<td><p class="p2 ' + enumerateUtils.getClassColor(data[i].yieldrate) + '">' + stringUtils.parseFloatFormat(data[i].yieldrate, '--', 2, 1, '%', true) + '</p></td>';
                    }
                    strHtml += '<td><div class="focus ' + followClass + '"></div></td>';
                    if (data[i].is_cn_etf == "1") {
                        var desc = '<strong class="tips2" style="display: none;"><em></em><i></i>' + data[i].cn_etf_desc + '</strong>';
                        strHtml += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('1', data[i]) + '" data-code="' + data[i].product_code + '">购买' + desc + '</a><a href="javascript:void(0);" class="gray" data-code="' + data[i].product_code + '">定投' + desc + '</a></div></td>';
                    } else {
                        strHtml += '<td><div class="btn_box clearfix"><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('1', data[i]) + '" data-code="' + data[i].product_code + '">购买' + hchart.isPurchaseOrder('3', data[i]) + '</a><a href="javascript:void(0);" class="' + hchart.isPurchaseOrder('2', data[i]) + '" data-code="' + data[i].product_code + '">定投' + hchart.isPurchaseOrder('4', data[i]) + '</a></div></td>';
                    }
                    strHtml += '</tr>'
                }
            }
        }
        if (strHtml) {
            $(pageId + " #fundtbody").html(strHtml).parents(".fund_table").addClass("move0").show();
        } else {
            $(pageId + " #fundtbody").parents(".fund_table").addClass("move0").hide();
        }
        if (strHtml_cl) {
            $(pageId + " #fundtbody_cl").html(strHtml_cl).parents(".fund_table").addClass("move0").show();
        } else {
            $(pageId + " #fundtbody_cl").parents(".fund_table").addClass("move0").hide();
        }


        if (strHtml_hb) {
            $(pageId + " #fundtbody_hb").html(strHtml_hb).parents(".fund_table").addClass("move1").show();
        } else {
            $(pageId + " #fundtbody_hb").parents(".fund_table").addClass("move1").hide();
        }

        if($("#fund_type a.act").html() == "货币类"){
            $(pageId + " .pf_checklist").hide();
        }else{
            $(pageId + " .pf_checklist").show();
        }
        if(($("#fund_type a.act").html() == "货币类" && $(".fund_table:eq(0)").hasClass("move0")) || ($("#fund_type a.act").html() != "货币类" && $(".fund_table:eq(0)").hasClass("move1"))){
            var e = $(".fund_table:eq(1)");
            e.prev().insertAfter(e);
        }

        if (data.length === 0) {
            $(pageId + " #fundtbody").parents(".fund_table").hide();
            $(pageId + " #fundtbody_hb").parents(".fund_table").hide();
            $(pageId + " #no_data").show();
        } else {
            $(pageId + " #no_data").hide();
        }
    }

    /**
     * h5加载产品列表
     */
    function loadFundListh5() {
        var account_status = "";
        $("#jyzt li").each(function () {
            if ($(this).hasClass("act")) {
                account_status += $(this).attr("data-value") + ",";
            }
        });
        if(account_status.length>0){
            account_status = account_status.substring(0, account_status.length - 1);
        }


        var risk_level = "";
        $("#fxdj li").each(function () {
            if ($(this).hasClass("act")) {
                risk_level += $(this).attr("data-value") + ",";
            }
        });
        if(risk_level.length>0){
            risk_level = risk_level.substring(0, risk_level.length - 1);
        }


        var start_time = "";
        $("#clsj li").each(function () {
            if ($(this).hasClass("act")) {
                start_time += $(this).attr("data-value") + ",";
            }
        });
        if(start_time.length>0){
            start_time = start_time.substring(0, start_time.length - 1);
        }

        var param = {
            "hotno": "",
            "mangerno": "",
            "fundtype": $this.screenOption.fund_typeh5,
            "fundtype2": $this.screenOption.fund_type2h5,
            "transactionStatus":account_status,
            "riskcode": risk_level,
            "select_times": start_time,
            "product_columns": $this.screenOption.product_columnsh5,
            "orderbystatus": $this.screenOption.orderbyStatush5,
            "keyword": '',
            "sessionId": '2'
        };

        var callback = function (resultVo) {
            if (resultVo.getErrorNo() == 0) {
                var dataList = resultVo.getResults("results");
                if (dataList && dataList.length > 0) {
                    renderHtmlh5(dataList);
                } else {
                    $(pageId + " .mobile-no_data").show();
                    $(pageId + " .mobile-table02").hide();

                }
            } else {
                layerWeb.msg(resultVo.getErrorInfo(), 2, 3);
            }
        }

        productService.queryFundList(callback, param);
    }

    // 渲染列表
    function renderHtmlh5(data) {

        var strHtml = '';
        var strHtml_title = '';
        var followList = $.getStorage("followList");
        try {
            followList = JSON.parse(followList);
        } catch (e) {
            followList = [];
        }
        if($this.screenOption.fund_typeh5=="HFM04"){
            strHtml_title +='<tr><th width="50%">基金名称</th><th width="20%">万份收益</th><th width="30%">七日年化</th></tr>';
        }else{
            strHtml_title +='<tr><th width="50%">基金名称</th><th width="20%">单位净值</th><th width="30%"><i>'+$this.overlay_time+'</i></th></tr>';
        }
        $(pageId + " #list_title").html(strHtml_title);
        for (var i = 0; i < data.length; i++) {
            var unit_nav = data[i].unit_nav || '--';
            var total_nav = data[i].total_nav || '--';
            var followFlag = followList.indexOf(data[i].product_id) > -1;
            var followClass = followFlag ? "on" : "";
            var amngeryears = data[i].amngeryears;
            var amngerydate = data[i].amngerydate;
            var manager_date = stringUtils.formatEmpty(amngeryears, "--") + "年" + stringUtils.formatEmpty(amngerydate, "--") + "天";
            var subscribe_start_time = dateUtils.getDateByStr(data[i].subscribe_start_time + " 09:00:00");
            var fund_status = data[i].fund_status;
            var yield_rate="";
            if($this.screenOption.product_columnsh5=="yieldrate1d"){
                yield_rate=data[i].yieldrate1d;
            }else if($this.screenOption.product_columnsh5=="yieldratety"){
                yield_rate=data[i].yieldratety;
            }else if($this.screenOption.product_columnsh5=="yieldrate1m"){
                yield_rate=data[i].yieldrate1m;
            }else if($this.screenOption.product_columnsh5=="yieldrate3m"){
                yield_rate=data[i].yieldrate3m;
            }else if($this.screenOption.product_columnsh5=="yieldrate6m"){
                yield_rate=data[i].yieldrate6m;
            }else if($this.screenOption.product_columnsh5=="yieldrate1y"){
                yield_rate=data[i].yieldrate1y;
            }else if($this.screenOption.product_columnsh5=="yieldrate3y"){
                yield_rate=data[i].yieldrate3y;
            }else if($this.screenOption.product_columnsh5=="yieldrate5y"){
                yield_rate=data[i].yieldrate5y;
            }else if($this.screenOption.product_columnsh5=="yieldrate"){
                yield_rate=data[i].yieldrate;
            }else{
                yield_rate=data[i].yieldrate1y;
            }
            strHtml += '<tr width="50%" class="pro" data-id="' + data[i].product_id + '" data-code="' + data[i].product_code + '"><td>';
            if(fund_status=='1'){
                strHtml += '<em class="new"></em>';
            }
            strHtml +='<p class="tit"><a href="javaScript:void(0);">'+stringUtils.formatEmpty(data[i].product_abbr, '--')+'</a></p><p class="p1">'+data[i].product_code+'</p></td>';
            //全部tab
            if($this.screenOption.fund_typeh5==""){
                strHtml +='<td width="20%"><p class="p2">'+unit_nav+'</p><p class="p1">'+dateUtils.dateFormat(data[i].nav_date, "MM-dd") +'</p></td>';
                strHtml+='<td width="30%"><p class="p3 '+enumerateUtils.getClassColorh5(yield_rate) +'">'+stringUtils.parseFloatFormat(yield_rate, '- -', 2, 1, '%', true)+'</p></td>'
            }else{
                if(contants.fundType["货币类"].item_value == data[i].fund_class && "净值货币型" != data[i].fund_class3){
                    var hundred_revenue_allocation = contants.specialCode["hundred_revenue_allocation"] || "";
                    var million_revenue_allocation = contants.specialCode["million_revenue_allocation"] || "";
                    if(hundred_revenue_allocation.indexOf(data[i].product_code) != -1){
                        strHtml += '<td width="20%"><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p><p class="p1">百份收益</p></td>';
                    }else if(million_revenue_allocation.indexOf(data[i].product_code) != -1){
                        strHtml += '<td width="20%"><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p><p class="p1">百万份收益</p></td>';
                    }else{
                        strHtml += '<td width="20%"><p class="p2">' + stringUtils.parseFloatFormat(data[i].returns_tt, '--', 4, 1) + '</p></td>';
                    }
                    strHtml+='<td width="30%"><p class="p3 '+enumerateUtils.getClassColorh5(data[i].income_annual_sd) +'">'+stringUtils.parseFloatFormat(data[i].income_annual_sd, '--', 4, 1, '%', false) +'</p></td>'

                } else{
                    if(contants.fundType["货币类"].item_value == data[i].fund_class && "净值货币型" == data[i].fund_class3){
                        if($this.screenOption.fund_typeh5=="HFM04"){
                            strHtml +='<td width="20%"><p class="p2">'+unit_nav+'</p><p class="p1">单位净值</p></td>';
                            strHtml+='<td width="30%"><p class="p3 '+enumerateUtils.getClassColorh5(yield_rate) +'">'+stringUtils.parseFloatFormat(yield_rate, '- -', 2, 1, '%', true)+'</p><p class="p1">近一年收益率</p></td>'
                        }else{
                            strHtml +='<td width="20%"><p class="p2">'+unit_nav+'</p><p class="p1">'+dateUtils.dateFormat(data[i].nav_date, "MM-dd") +'</p></td>';
                            strHtml+='<td width="30%"><p class="p3 '+enumerateUtils.getClassColorh5(yield_rate) +'">'+stringUtils.parseFloatFormat(yield_rate, '- -', 2, 1, '%', true)+'</p></td>'
                        }
                    }else{
                        strHtml +='<td width="20%"><p class="p2">'+unit_nav+'</p><p class="p1">'+dateUtils.dateFormat(data[i].nav_date, "MM-dd") +'</p></td>';
                        strHtml+='<td width="30%"><p class="p3 '+enumerateUtils.getClassColorh5(yield_rate) +'">'+stringUtils.parseFloatFormat(yield_rate, '- -', 2, 1, '%', true)+'</p></td>'
                    }

                }
            }
        }
        strHtml+='</tr>';
        $(pageId + " #fund_list").html(strHtml);
        //跳转详情
        $(pageId + " #fund_list tr.pro").bindEvent(function () {
            var product_id = $(this).attr("data-id");
            var product_code = $(this).attr("data-code");
            $.redirect("/m/mall/views/mall/funddetail.html", {
                "product_id" : product_id,
                "product_code" :product_code
            });
        });
        //切换收益
        $(pageId + " #list_title tr i").bindEvent(function () {
//            if($this.fund_class2_open=="1"){
//                $(pageId + " .overlayer_box").css({top:"2.06rem",height:"calc(100% - 2.06rem)"});
//            }else{
//                $(pageId + " .overlayer_box").css({top:"2.44rem",height:"calc(100% - 2.44rem)"});
//            }
            if($(this).hasClass("act")){
                $(this).removeClass("act");
                $(pageId + " .overlayer_box").hide();
            }else{
                $(this).addClass("act");
                $(pageId + " .overlayer_box").show();
            }

        });
        if (data.length === 0) {
            $(pageId + " .mobile-no_data").show();
            $(pageId + " .mobile-table02").hide();
        } else {
            $(pageId + " .mobile-table02").show();
            $(pageId + " .mobile-no_data").hide();
        }
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
                commonUtil.querySpecialCode(loadFundList);
            }
        };
        pageGlobal.pageObj = new PCpager(options);

        //绑定显示多少行数据事件 div > p.fylist > span > em:nth-child(2)
        $(pageId + " #pagebar > p.fylist > span > em").bindEvent(function () {
            var numPerPage = Number($(this).attr("data-pageNum"));
            if (options.numPage.indexOf(numPerPage) !== -1) {
                pageGlobal.numPerPage = numPerPage;
                pageGlobal.curPage = 1;
                commonUtil.querySpecialCode(loadFundList);
            }
        });
    }

    /**
     * h5清空筛选数据
     * @param isGL 是否是高级筛选  默认为false
     * @param isClearGL 是否清理高级筛选内容 默认为true
     * @param isSearch 是否是搜索 默认为false
     */
    function clearSelecth5(isGL, isClearGL, isSearch) {
        !isGL && isGL !== false && (isGL = false);
        !isClearGL && isClearGL !== false && (isClearGL = true);
        !isSearch && isSearch !== false && (isSearch = false);

        $this.screenOption.hot_theme = "";
        $this.screenOption.fund_manager = "";
        $this.screenOption.fund_typeh5 = "";
        $(pageId + " #fund_class span").eq(0).addClass("act on").siblings("span").removeClass("act on");
        $this.screenOption.fund_type2h5 = "";
        $(pageId + " #fund_class2").hide();

        if (isClearGL) {
            $(pageId + " .main_box li.act").removeClass("act");
        }


    }

    /**
     * 切换长期业绩、短期业绩选择
     * statusFlag true切换为不可选中
     */
    function switchCheckStatus(statusFlag) {
        if(statusFlag) {
            $(pageId + " .pf_checklist").addClass("hidden");
            $(pageId + " .pf_checklist").hide();
            pageGlobal.checkStatus = false;
            // $(pageId + " #yj span").removeClass("checked");
            // $(pageId + " #yj span:eq(1)").addClass("checked");
            $(pageId + " .fund_table").removeClass("mt30");
        }
        else {
            $(pageId + " .pf_checklist").removeClass("hidden");
            $(pageId + " .pf_checklist").show();
            pageGlobal.checkStatus = true;
            $(pageId + " .fund_table:eq(1)").removeClass("mt30");
            // $(pageId + " #yj span").removeClass("checked");
            // $(pageId + " #yj span:eq(0)").addClass("checked");
        }
    }

    // 销毁页面，单页面时候要用
    function destroy() {
        //全部置空

    }

    var index = {
        "init": init,
        "bindPageEvent": bindPageEvent,
        "destroy": destroy
    };
    // 暴露对外的接口
    module.exports = index;
})
