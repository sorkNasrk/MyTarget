/**
 * 服务类
 */
define("ws/scripts/service/productService",function(require, exports, module) {

	var contants = require("contants");

	function ProductService(){
		this.service = new $.domain.Service();
	}

	/**
	 * 功能：查询理财产品列表
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.getFinaList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731820";
		paraMap["risk_level"] = param.risk_level;
		paraMap["min_buy_limit"] = param.per_buy_limit;
		paraMap["income_type"] = param.income_type;
		paraMap["fund_states"] = param.fund_states;
		paraMap["is_income_pre"] = param.is_income_pre;
		paraMap["is_manage_limit"] = param.is_manage_limit;
		paraMap["is_buy_limit"] = param.is_buy_limit; //起购金额排序
		paraMap["is_person_pace"] = param.is_person_pace; //追加金额排序
		paraMap["max_manage_limit"] = param.max_manage_limit;
		paraMap["min_manage_limit"] = param.min_manage_limit;

		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["is_buy_order"] = param.is_buy_order;
		paraMap["fund_account"] = param.fund_account;
		paraMap["is_query_quota"] = param.is_query_quota;
		paraMap["login_ip"] = param.login_ip;
		paraMap["op_station"] = param.op_station;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询理财产品详情接口
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFinanDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731821";
		paraMap["product_id"] = param.product_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["user_id"] = param.user_id;
		paraMap["is_query_quota"] = param.is_query_quota;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询评价
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryProComment = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731915";
		paraMap["product_id"] = param.product_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：产品是否关注查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryProFollow = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731845";
		paraMap["product_id"] = param.product_id;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：添加关注
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.addProFollow = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731843";
		paraMap["product_id"] = param.product_id;
		paraMap["product_sub_type"] = param.product_sub_type;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：取消关注
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.delProFollow = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731844";
		paraMap["product_ids"] = param.product_ids;
		paraMap["product_sub_type"] = param.product_sub_type;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：单个产品基金经理信息
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.querySingleFundManager = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731903";
		paraMap["fund_manager_id"] = param.fund_manager_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：重仓持股查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryStockHold = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731849";
		paraMap["product_id"] = param.product_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询基金资产信息
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFundAsset = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731850";
		paraMap["product_id"] = param.product_id;
		paraMap["allocation_type"] = param.allocation_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金经理查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryFundManager = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731851";
		paraMap["product_id"] = param.product_id
		paraMap["fund_manager_id"] = param.fund_manager_id;
		paraMap["fund_manager_name"] = param.fund_manager_name;
		paraMap["order_work_year"] = param.order_work_year;
		paraMap["order_yieldrate"] = param.order_yieldrate;
		paraMap["order_scale_distri_copy"] = param.order_scale_distri_copy;
		paraMap["is_mouth_rate"] = param.is_mouth_rate;
		paraMap["is_season_rate"] = param.is_season_rate;
		paraMap["is_year_rate"] = param.is_year_rate;
		paraMap["initial_letter"] = param.initial_letter;
		paraMap["is_position"] = param.is_position;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能：查询产品公告接口
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryProductAdList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731852";
		paraMap["product_id"] = param.product_id;
		paraMap["ad_type"] = param.ad_type;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金档案信息
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFundArchives = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731856";
		paraMap["product_id"] = param.product_id;
		paraMap["user_id"] = param.user_id;


		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：定投计划订单查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryPlanBuyOrder = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731919";
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["fund_account"] = param.fund_account;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：收益走势查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryYieldList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731876";
		paraMap["product_ids"] = param.product_ids;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_month"] = param.query_month;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：收益率列表查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryRateList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731847";
		paraMap["product_id"] = param.product_id;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：现金理财账户开通
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.openCashAccount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731878";
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["product_id"] = param.product_id;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["user_id"] = param.user_id;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["ofcash_status"] = param.ofcash_status;
		paraMap["ofcash_balance"] = param.ofcash_balance;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：净值列表查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryNavList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741012";
		paraMap["product_id"] = param.product_id;
		paraMap["type"] = param.type;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_month"] = param.query_month;
		paraMap["is_page"] = param.is_page;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		paraMap["is_trend"] = param.is_trend;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：净值估算查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryReflectList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741022";
		paraMap["product_id"] = param.product_id;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询数据字典
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryEnumValue = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731825";
		paraMap["enum_no"] = param.enum_no;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询基金公司列表
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryAllFundCompany = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731855";
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：基金公司详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryCompanyDetail = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731860";
		paraMap["is_general"] = param.is_general;
		paraMap["management_id"] = param.management_id;

		paraMap["is_nav"] = param.is_nav;
		paraMap["is_date_rate"] = param.is_date_rate;
		paraMap["is_mouth_rate"] = param.is_mouth_rate;
		paraMap["is_season_rate"] = param.is_season_rate;
		paraMap["is_half_year_rate"] = param.is_half_year_rate;
		paraMap["is_year_rate"] = param.is_year_rate;
		paraMap["is_since_rate"] = param.is_since_rate;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：分红拆分信息查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryDividendList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731854";
		paraMap["product_id"] = param.product_id;
		paraMap["incomediv_type"] = param.incomediv_type;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：基金公司列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryCompanyList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731855";
		paraMap["management_name"] = param.management_name;
		paraMap["management_id"] = param.management_id;
		paraMap["is_general"] = param.is_general;
		paraMap["is_page"] = param.is_page;
		paraMap["initial_letter"] = param.initial_letter;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品费率查询
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFeerate = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741014";
		paraMap["product_id"] = param.product_id;
		paraMap["feerate_type"] = param.feerate_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：预约取款
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.reserveMoney = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731881";
		paraMap["fund_account"] = param.fund_account;
		paraMap["reserve_balance"] = param.reserve_balance;
		paraMap["user_id"] = param.user_id;
		paraMap["valid_date"] = param.valid_date;
		paraMap["money_type"] = param.money_type;
		paraMap["reserve_type"] = param.reserve_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：基金定投收益计算器
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.fundCalculate = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731883";
		paraMap["product_id"] = param.product_id;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["user_id"] = param.user_id;
		paraMap["fixed_invest_money"] = param.fixed_invest_money;
		paraMap["fixed_invest_day"] = param.fixed_invest_day;
		paraMap["bonus_way"] = param.bonus_way;
		paraMap["redeem_rate"] = param.redeem_rate;
		paraMap["pre_rate"] = param.pre_rate;
		paraMap["period"] = param.period;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：购买准入检查
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.checkAccessBuy = function(callBackFunc, param, ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["business_type"] = param.business_type;
		paraMap["paper_type"] = param.paper_type;
		paraMap["pay_kind"] = param.pay_kind;
		paraMap["bank_no"] = param.bank_no;
		paraMap["pay_account"] = param.pay_account;
		paraMap["user_id"] = param.user_id;
		paraMap["source"] = param.source;
		paraMap["product_sub_type"] = param.product_sub_type;
		paraMap["fina_belongs"] = param.fina_belongs;

		paraMap["funcNo"] = "731802";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品协议列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryProAgreementList = function(callBackFunc, param ,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["contract_type"] = param.contract_type;
		paraMap["contract_no"] = param.contract_no;
		paraMap["product_id"] = param.product_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["user_id"] = param.user_id;

		paraMap["funcNo"] = "731840";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品协议列表详情
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryProAgreementDetail = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["contract_no"] = param.contract_no;

		paraMap["funcNo"] = "731841";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：签署协议
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.signAgreement = function(callBackFunc, param, ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["contract_nos"] = param.contract_nos;
		paraMap["user_id"] = param.user_id;
		paraMap["batch_no"] = param.batch_no;
		paraMap["is_sign_esp"] = param.is_sign_esp;
		paraMap["replace_param"] = param.replace_param;

		paraMap["funcNo"] = "731842";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：电子约定书签署
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.signEAgreement = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;

		paraMap["funcNo"] = "731807";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品账户开户
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.openTaAccount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["trade_pwd"] = param.trade_pwd;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["product_id"] = param.product_id;
		paraMap["fina_belongs"] = param.fina_belongs;

		paraMap["funcNo"] = "731806";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询是否首次购买
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryIsFirstBuy = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["fina_belongs"] = param.fina_belongs;

		paraMap["funcNo"] = "731810";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品搜索
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.searchProduct = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["search_value"] = param.search_value;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["product_type"] = param.product_type;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		paraMap["funcNo"] = "731861";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询是否跑批
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryIsBatch = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["business_type"] = param.business_type;

		paraMap["funcNo"] = "731929";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：适当性留痕
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.appropriatMark = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["trade_pwd"] = param.trade_pwd;
		paraMap["batch_no"] = param.batch_no;
		paraMap["mark_content"] = param.mark_content;

		paraMap["funcNo"] = "731808";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询下个转入日期
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.nextFixedDateQuery = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["trade_cycle"] = param.trade_cycle;
		paraMap["trade_date"] = param.trade_date;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_time"] = param.query_time;

		paraMap["funcNo"] = "731863";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：定投个数查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.nextFixedNumQuery = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;

		paraMap["funcNo"] = "731907";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：定投查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.fixedInvestQuery = function(callBackFunc, param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["apply_no"] = param.apply_no;
		paraMap["apply_date"] = param.apply_date;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		paraMap["is_query_end"] = param.is_query_end;

		paraMap["funcNo"] = "731817";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：热搜关键字查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.searchHotKey = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["query_num"] = param.query_num;

		paraMap["funcNo"] = "731874";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：现金理财账户查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryCashAccount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["apply_no"] = param.apply_no;
		paraMap["apply_date"] = param.apply_date;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		paraMap["funcNo"] = "731877";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：现金理财账户修改
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.modifyCashAccount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["ofcash_status"] = param.ofcash_status;
		paraMap["ofcash_balance"] = param.ofcash_balance;
		paraMap["type"] = param.type;

		paraMap["funcNo"] = "731879";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：预约取款
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryReserveMoney = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;

		paraMap["funcNo"] = "731880";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：炎黄汇利常见问题查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlQuestionList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["product_id"] = param.product_id;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		paraMap["funcNo"] = "731890";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：炎黄汇利常见问题详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlQuestionDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731891";
		paraMap["sort_field"] = param.sort_field;
		paraMap["theme_id"] = param.theme_id;
		paraMap["is_order"] = param.is_order;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：炎黄汇利当前数量查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlAmount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["product_code"] = param.product_code;

		paraMap["funcNo"] = "731920";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：炎黄汇利昨日预估收益
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlPredictIncome = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731921";
		paraMap["fund_account"] = param.fund_account;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：炎黄汇利累计收益
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlBalanceCount = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["product_code"] = param.product_code;

		paraMap["funcNo"] = "731922";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：炎黄汇利昨日预估收益
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryYhhlPredictIncome = function(callBackFunc, param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["fund_account"] = param.fund_account;
		paraMap["product_code"] = param.product_code;

		paraMap["funcNo"] = "731921";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：定投修改
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.modifyPlanBuy = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731816";
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["operator_type"] = param.operator_type;
		paraMap["apply_no"] = param.apply_no;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;
		paraMap["ration_type"] = param.ration_type;
		paraMap["balance"] = param.balance;
		paraMap["invest_name"] = param.invest_name;
		paraMap["fixed_id"] = param.fixed_id;
		paraMap["trade_cycle"] = param.trade_cycle;
		paraMap["trade_date"] = param.trade_date;
		paraMap["apply_date"] = param.apply_date;
		paraMap["trade_cycle_unit"] = param.trade_cycle_unit;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["max_ration_balance"] = param.max_ration_balance;
		paraMap["login_ip"] = param.login_ip;
		paraMap["op_station"] = param.op_station;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询TA账户
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryTaAccount = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731867";
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["product_code"] = param.product_code;
		paraMap["ta_code"] = param.ta_code;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：文章列表
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryArticleList = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731864";
		paraMap["catalog_id"] = param.catalog_id;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/*	*//**
	 * 功能：文章详情
	 * 参数: callBackFunc:回调函数
	 *//*
	ProductService.prototype.queryArticleDetail = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731865";
		paraMap["article_id"] = param.article_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};*/
	/**
	 * 功能：公告详情
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryAdDetail = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731853";
		paraMap["ad_id"] = param.ad_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：产品评价添加
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.addProComment = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731914";
		paraMap["user_id"] = param.user_id;
		paraMap["order_id"] = param.order_id;
		paraMap["comment_fraction"] = param.comment_fraction;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：查询主题列表
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryThemeList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731826";
		paraMap["sort_field"] = param.sort_field;
		paraMap["theme_id"] = param.theme_id;
		paraMap["is_order"] = param.is_order;
		paraMap["is_page"] = param.is_page;
		paraMap["sort_field"] = param.sort_field;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：下载信息查询 731931
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryDownloadInfo = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;;
		paraMap["sessionId"] = contants.invokeParam.sessionId;


		paraMap["funcNo"] = "731931";
		paraMap["soft_type1"] = param.soft_type1;
		paraMap["soft_type2"] = param.soft_type2;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**********************服务产品接口*************************/
	/**
	 * 功能：服务产品列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServiceProductsList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731500";
		paraMap["product_type"] = param.product_type;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServiceProductDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731501";
		paraMap["fund_code"] = param.fund_code;
		paraMap["fund_id"] = param.fund_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品协议列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServiceProductAgreementList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731504";
		paraMap["fund_id"] = param.fund_id;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品协议详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtAgreementdetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731505";
		paraMap["file_id"] = param.file_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：适当性匹配查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.checkServiceProductMatch = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731503";
		paraMap["fund_id"] = param.fund_id;
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-协议签署
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.servicePdtsignAgreement = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731506";
		paraMap["contract_nos"] = param.contract_nos;
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["fund_code"] = param.fund_code;
		paraMap["replace_param"] = param.replace_param;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品价格查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtPrices = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731502";
		paraMap["fund_id"] = param.fund_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-可用卡券数量查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtCardNumber = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731507";
		paraMap["user_id"] = param.user_id;
		paraMap["fund_account"] = param.fund_account;
		paraMap["fund_id"] = param.fund_id;
		paraMap["rules_id"] = param.rules_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-卡券列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtCardList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731508";
		paraMap["fund_id"] = param.fund_id;
		paraMap["rules_id"] = param.rules_id;
		paraMap["is_expired"] = param.is_expired;
		paraMap["using_status"] = param.using_status;
		paraMap["card_status"] = param.card_status;
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品视频列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtVideoList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731511";
		paraMap["fund_id"] = param.fund_id;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品视频详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtVideoDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731512";
		paraMap["vedio_id"] = param.vedio_id;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品订阅列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.querySubscribeList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731513";
		paraMap["fund_account"] = param.fund_account;
		paraMap["user_id"] = param.user_id;
		paraMap["service_id"] = param.service_id;
		paraMap["is_service_end"] = param.is_service_end;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品订单列表查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtOrderList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731514";
		paraMap["user_id"] = param.user_id;
		paraMap["fund_account"] = param.fund_account;
		paraMap["order_ids"] = param.order_ids;
		paraMap["pay_way"] = param.pay_way;
		paraMap["fund_id"] = param.fund_id;
		paraMap["order_state"] = param.order_state;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品订单详情查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryServicePdtOrderDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731515";
		paraMap["order_id"] = param.order_id;
		paraMap["user_id"] = param.user_id;
		paraMap["fund_account"] = param.fund_account;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-产品评价添加
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.servicePdtEvaluate = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731516";
		paraMap["user_id"] = param.user_id;
		paraMap["order_id"] = param.order_id;
		paraMap["comment_fraction"] = param.comment_fraction;
		paraMap["comment_content"] = param.comment_content;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品退订
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.serviceOrderUnsubscribe = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731517";
		paraMap["user_id"] = param.user_id;
		paraMap["fund_account"] = param.fund_account;
		paraMap["order_id"] = param.order_id;
		paraMap["unsubscribe_cause"] = param.unsubscribe_cause;
		paraMap["unsubscribe_reason"] = param.unsubscribe_reason;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：服务产品-服务产品取消
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.serviceOrderClear = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731519";
		paraMap["user_id"] = param.user_id;
		paraMap["order_id"] = param.order_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：服务产品-推荐查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.querySerProductRecommend = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731518";
		paraMap["recommend_father_type"] = param.recommend_father_type;
		paraMap["recommend_type"] = param.recommend_type;
		paraMap["request_num"] = param.request_num;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能号731650
	 * 服务产品文章列表查询
	 */
	ProductService.prototype.queryArticleList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731650";
		paraMap["fund_id"] = param.fund_id;
		paraMap["is_subscribe"] = param.is_subscribe;//0 不需要订阅 1需要订阅
		paraMap["is_new"] = param.is_new;// 是否最新 1:是，0：不是
		paraMap["is_head"] = param.is_head;//是否头条 1:是，0：不是
		paraMap["is_hot"] = param.is_hot;//是否推荐文章 1:是，0：不是
		paraMap["cur_page"] = param.cur_page?param.cur_page:1;
		paraMap["num_per_page"] = param.num_per_page?param.num_per_page:10;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能号 731651
	 * 服务产品文章详情查询
	 */
	ProductService.prototype.queryArticleDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731651";
		paraMap["id"] = param.id;
		paraMap["user_id"] = param.user_id;//

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能号 731654
	 * 查询服务产品剩余天数
	 */
	ProductService.prototype.queryCustServics = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731654";
		paraMap["fund_id"] = param.fund_id;
		paraMap["user_id"] = param.user_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能号 731655
	 * 文章点赞
	 */
	ProductService.prototype.loveArticle = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731655";
		paraMap["id"] = param.id;
		paraMap["user_id"] = param.user_id;//

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能号 731656
	 * 文章取消点赞
	 */
	ProductService.prototype.cancleLoveArticle = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731656";
		paraMap["article_ids"] = param.id;
		paraMap["user_id"] = param.user_id;//

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能号 731905
	 * 查看可转换积极
	 */
	ProductService.prototype.queryConversionList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731905";
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		paraMap["register_corp_code"] = param.register_corp_code;
		paraMap["prod_id"] = param.prod_id;
		paraMap["search_value"] = param.search_value;
		paraMap["is_date_rate"] = param.is_date_rate;
		paraMap["is_mouth_rate"] = param.is_mouth_rate;
		paraMap["is_season_rate"] = param.is_season_rate;
		paraMap["is_half_year_rate"] = param.is_half_year_rate;
		paraMap["is_year_rate"] = param.is_year_rate;
		paraMap["login_ip"] = param.login_ip;
		paraMap["op_station"] = param.op_station;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：适当性匹配查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.appropriatenessMatch = function(callBackFunc,param,ctrlParam){
		var paraMap = {};
//		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731866";
		paraMap["product_code"] = param.product_code;
		paraMap["product_id"] = param.product_id;
		paraMap["ta_code"] = param.ta_code;
		paraMap["fina_belongs"] = param.fina_belongs;
		paraMap["user_id"] = param.user_id;
		paraMap["source"] = param.source;
		paraMap["user_type"] = param.user_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(ctrlParam.isShowWait);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：产品交易规则查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryTradeRule = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "731922";
		paraMap["product_id"] = param.product_id;
		paraMap["rule_type"] = param.rule_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};




	/**
	 * 功能：查询基金列表接口
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFundList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741010";
		paraMap["cur_page"] = param.cur_page;
		paraMap["num_per_page"] = param.num_per_page;
		paraMap["channel_source"] = param.channel_source;
		paraMap["hotno"] = param.hotno;
		paraMap["mangerno"] = param.mangerno;
		paraMap["fundtype"] = param.fundtype;
		paraMap["fundtype2"] = param.fundtype2;
		paraMap["transactionstatus"] = param.transactionStatus;
		paraMap["riskcode"] = param.riskcode;
		paraMap["starttime"] = param.starttime;
		paraMap["endtime"] = param.endtime;
		paraMap["keyword"] = param.keyword;
		paraMap["orderbystatus"] = param.orderbystatus;
		paraMap["product_columns"] = param.product_columns;
		paraMap["keyword"] = param.keyword;
		paraMap["select_times"] = param.select_times;
		paraMap["query_status_type"] = param.query_status_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询基金列表接口
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryInvestmentTeamList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741056";
		paraMap["teamCode"] = param.teamCode;


		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询基金产品详情接口
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFundDetail = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741011";
		paraMap["product_id"] = param.product_id;
		paraMap["user_id"] = param.user_id;
		paraMap["fund_account"] = param.fund_account;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询基金按钮购买显示
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryFundDisplayStatus = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741044";
		paraMap["product_codes"] = param.product_codes;
		paraMap["query_type"] = param.query_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能查询所有可转换基金
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryConvertibleFund = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741047";
		paraMap["fund_code"] = param.fund_code;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：热门主题查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryHotTheme = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.ichannel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741006";
		paraMap["selecttype"] = param.selecttype;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金经理查询
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryFundManagerInfo = function(callBackFunc,param){
		var paraMap = {};
		paraMap["channel_source"] = contants.invokeParam.channel_source;
		paraMap["sessionId"] = contants.invokeParam.sessionId;

		paraMap["funcNo"] = "741013";
		paraMap["product_id"] = param.product_id;
		paraMap["type"] = param.type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：获取sessionid
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.querySessionId = function(callBackFunc,param){
		var paraMap = {};

		paraMap["funcNo"] = "741023";
		paraMap["type"] = param.type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询相关推荐产品
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryPdRecommend = function(callBackFunc,param){
		var paraMap = {};

		paraMap["funcNo"] = "741018";
		paraMap["product_id"] = param.product_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询产品交易节点
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryTradeInfo = function(callBackFunc, param){
		var paraMap = {};

		paraMap["funcNo"] = "741029";
		paraMap["sessionid"] = param.sessionid;
		paraMap["productcode"] = param.productcode;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询基金荣誉1/相关资讯2
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryProductHonor = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741019";
		paraMap["product_id"] = param.product_id;
		paraMap["select_type"] = param.select_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询基金分类
	 * 参数: callBackFunc:回调函数
	 *
	 *
	 */
	ProductService.prototype.queryFundClass = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741026";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询产品预约条件
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.querynewfundyy = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741035";
		paraMap["productcodes"] = param.productcodes;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：发送短信验证码
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.sendmobile = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741036";
		paraMap["mobile"] = param.mobile;
		paraMap["ticket"] = param.ticket;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：预约提醒
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.appointmentremind = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741037";
		paraMap["captcha"] = param.captcha;
		paraMap["userIdentifier"] = param.userIdentifier;
		paraMap["productCode"] = param.productCode;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询数据字典
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryEnumInfo = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741039";
		paraMap["enum_no"] = param.enum_no;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：集合申购清单是否顯示
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryCollectionEntry = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741050";
		paraMap["fundCode"] = param.fundCode;
		paraMap["pdfDate"] = param.pdfDate;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询基金经理列表
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryFundManagerList = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741051";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：查询基金经理信息
	 * 参数: callBackFunc:回调函数
	 */
	ProductService.prototype.queryFundManagerInfoDetail = function(callBackFunc, param){
		var paraMap = {};
		paraMap["funcNo"] = "741052";
		paraMap["managerId"] = param.managerId;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		//reqParamVo.setIsShowWait(true);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 释放操作
	 */
	ProductService.prototype.destroy = function(){
		this.service.destroy();
	};

	/**
	 * 实例化对象
	 */
	function getInstance(){
		return new ProductService();
	}

	var productService = {
		"getInstance" : getInstance
	};

	// 暴露对外的接口
	module.exports = productService;
});
