/**
 * 程序入口配置读取
 * 项目开发时需要的自定义配置
 * 另外：configuration为系统配置模块或者配置模板
 * 这里可以扩展，支持多个系统共用一个项目：
 * 思路：在最开始的地方做一个sysCode的获取，然后在这个模块初始化时赋不同系统的configuration配置模块的引用，
 * 当然还要做修改的地方，比如地址栏hash处理，需要增加sysCode（涉及到的模块main和appUtils）
 */
define(function(require, exports, module) {


	var configuration = {
		"firstLoadCss": "", //项目中的需要先加载的css样式文件
		//"layerTheme": "a", //各种弹出层样式主题样式，默认为系统自带
		"pageTitle" : "",//页面标题
		"projPath" : "/ws/", //工程目录
		"pageType" : "shtml",//页面格式
		"filters": {
			//未登录
			"-999": function(resultVo){

			},
			"-995": function(resultVo){
				return false;
			},
			"-997": function(resultVo){
				return false;
			}

		},

		headerPage: {
			pageCode: "main/include/header",
			jsonParam: {},
			isLoad: false
		},
		footerPage : {
			pageCode: "main/include/footer",
			jsonParam: {},
			isLoad: false
		},

		/**
		 * 项目中模块的别名配置
		 */
		"pAlias": {
			"wsService":"/ws/scripts/service/ws/wsService",
			"resultVoUtil" : "/ws/scripts/utils/resultVoUtil", // 处理返回数据集工具类
			"server":"/servlet/json",
			"pcfFileServer": "/servlet/exportPCF",
			"layerWeb": "/ws/scripts/utils/layer/layerWeb",
			"layerUtils" : "plugins/layer/scripts/layerUtils",
			"productService": "ws/scripts/service/productService", //产品相关业务js
			"userService": "ws/scripts/service/userService", //用户相关业务js
			"commonExt": "ws/scripts/common/commonExt",
			"enumerateUtils": "ws/scripts/utils/enumerateUtils", //数据字典方法
			"dateUtils": "ws/scripts/utils/dateUtils", //dateUtils日期工具类
			"stringUtils": "ws/scripts/common/stringUtils", //字符串工具类
			"contants": "ws/scripts/constants/serviceConstants", //常量类
			"validatorUtil": "ws/scripts/utils/validator/validatorUtil", // 底层框架校验类
		},

		/**
		 * 项目中需要调用到的常量、变量这里配置
		 * 调用方式，通过require("gconfig").global.*来调用
		 */
		"global": {
			"session_time":30,
			"home": "index",
			"server": "/servlet/json",
			"pcfFileServer": "/servlet/exportPCF",
			"fileServer": "/servlet/exportExcel",
			"vfImg":  "/servlet/VfImage",
			"mobile": "/servlet/SmsAction",
			"oldImageUrl":"https://lcjapi.jsfund.cn/v0/api/trade/imagecode/get",
			"presonUrljob":"https://www.jsfund.cn/izenportal/service/bonsPerson/getBonsPerson",
			"presonUrlOut":"https://www.jsfund.cn/izenportal/service/bonsPerson/getBonsPersonOut",
			"hqserver": "https://hq.sinajs.cn/list=s_sh000001,s_sz399001,s_sz399006",// 行情地址
			"indexlightserver": "https://lcj.jsfund.cn/v1/specialfunds?type=indexfund",// 指数信号灯数据地址
			"calculatorSearch": "https://dtsq.jsfund.cn/fundinfo/list?isjiashi=1",// 定投计算器搜索列表
			"calculatorResult": "https://dtsq.jsfund.cn/fixed/compare",// 定投计算器测算结果
			"calculatorChart": "https://dtsq.jsfund.cn/fixed/calculation",// 定投计算器走势图
			"buyDetail":"https://e.jsfund.cn/lcj/trade/buy",//购买
			"fixedDetail":"https://e.jsfund.cn/lcj/trade/fixedinvestset",//定投
			"fundType01": "HFM04", // 货币型分类标识
			"riskTips": "/main/a/20190219/417358.shtml", // 风险测评划分方法与说明
			"ios":"http://a.app.qq.com/o/simple.jsp?pkgname=com.harvestfund2&ckey=CK1478012682030",
			"android":"http://a.app.qq.com/o/simple.jsp?pkgname=com.harvestfund2&ckey=CK1478012682030",
			"myConCern":"http://118.102.23.28:8082/api/trade/user/my_concern",
			"myAttention":"http://118.102.23.28:8082/api/trade/user/fund_attention",
			"mySessId":"http://118.102.23.28:8082/api/trade/access/init",
		},
		//全局初始化函数
		initFunc:function(callBackFunc){
			//初始化js和css
			var jsAndCss = [];
			jsAndCss.push("/ws/scripts/service/ws/wsService");
			jsAndCss.push("/ws/css/page.css");
			jsAndCss.push("/ws/css/scrollBar.css");
			// jsAndCss.push("/ws/scripts/utils/loginUtil");
			jsAndCss.push("/ws/scripts/utils/commonUtil");
			jsAndCss.push("/ws/scripts/utils/page");
			jsAndCss.push("/ws/scripts/utils/layer/layerWeb");
			//jsAndCss.push("/ws/scripts/utils/bannerUtil");
			//jsAndCss.push("/ws/scripts/utils/orderUtil");
			//jsAndCss.push("/ws/scripts/utils/shareUtil");
			jsAndCss.push("/ws/scripts/utils/echarts");
			// jsAndCss.push("/ws/scripts/utils/transUtil");
			// jsAndCss.push("/ws/scripts/utils/bindAccountUtil");
			// sAndCss.push("/ws/scripts/utils/password");
			require.async(jsAndCss,function(){
				if(callBackFunc){
					callBackFunc();
				}
			});


			//ADD BY HUANGRONALDO TIME:2014.5.28
			$("a[data-page^='/ws/views/']").live("click", function(){ //绑定 点击事件
				var pageCode = $(this).attr("data-page") ;
				var isAuthenticated = $(this).attr("data-isAuthenticated") ;
				if($.string.isNotEmpty(pageCode) && $.string.startWith (pageCode,"/ws/views/")){
					pageCode = $.string.replaceAll(pageCode,"/ws/views/","") ; //替换字符串
				}
				if("1"==isAuthenticated){ //需要校验登录
					$.isLoginAndShow(pageCode) ; //调用登录校验方法，并且
				}else{
					$.redirect(pageCode,{});//
				}
			});
			$("input[type='password']").attr("oncopy","return false").attr("onpaste","return false").attr("oncut","return false") ;
			$("input:password").live("copy cut paste",function(e){return false;}) ;

			// 产品产品分类
			require.async("ws/scripts/utils/commonUtil", function (page) {
				page.getFundType();
			});
		}
	};
	//暴露对外的接口
	module.exports = window.configuration = configuration;
});