/**
 * 服务类
 */
define("/ws/scripts/service/ws/wsService",function(require, exports, module) {

	function WsService(){
		this.service = new $.domain.Service();
	}

	/**
	 * 功能:分页查询文章(741000)
	 */
	WsService.prototype.queryArticleList = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741000";
		paraMap["catalogId"] = reqParam.catalogId;
		paraMap["branchNo"] = reqParam.branchNo;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		paraMap["key_word"] = reqParam.key_word;
		paraMap["start_date"] = reqParam.start_date;
		paraMap["end_date"] = reqParam.end_date;
		paraMap["catalogIds"] = reqParam.catalogIds;
		paraMap["select_type"] = reqParam.select_type;
		paraMap["is_head"] = reqParam.is_head;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能:新增投诉与建议(741001)
	 */
	WsService.prototype.submitSuggest = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741001";
		paraMap["fund_account"] = reqParam.fundaccount;
		paraMap["name"] = reqParam.name;
		paraMap["phone"] = reqParam.phone;
		paraMap["mobile"] = reqParam.mobile;
		paraMap["e_mail"] = reqParam.e_mail;
		paraMap["suggest_content"] = reqParam.suggest_content;
		paraMap["gender"] = reqParam.sex;
		paraMap["reply_type"] = reqParam.reply_type;
		paraMap["ticket"] = reqParam.ticket;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能:分页查询文章(741002)
	 */
	WsService.prototype.queryArticleListandhits = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741002";
		paraMap["type"] = reqParam.type;
		paraMap["catalog_id"] = reqParam.catalog_id;
		paraMap["rows"] = reqParam.rows;
		paraMap["hits"] = reqParam.hits;
		paraMap["article_id"] = reqParam.article_id;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询视频列表分页(741003)
	 */
	WsService.prototype.queryVideoPage = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741003";
		paraMap["catalogid"] = reqParam.catalogid;
		paraMap["mangername"] = reqParam.mangername;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		paraMap["keyword"] = reqParam.keyword;
		paraMap["start_date"] = reqParam.start_date;
		paraMap["end_date"] = reqParam.end_date;
		paraMap["fundcode"] = reqParam.fundcode;
		paraMap["fundname"] = reqParam.fundname;
		paraMap["select_time"] = reqParam.select_time;
		paraMap["is_head"] = reqParam.is_head;
		paraMap["query_type"] = reqParam.query_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能:根据机构名称查询基金名称
	 * param: org_name
	 * param: type
	 */
	WsService.prototype.queryImportList = function(reqParam,callBackFunc) {
		var paraMap = {};
		paraMap["funcNo"] = "741017";
		paraMap["org_name"] = reqParam.org_name;
		paraMap["type"] = 2;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能:根据基金代码查询代销机构
	 * param: fundcode
	 * param: type
	 */
	// WsService.prototype.querySaleCompanyByFundcode = function(reqParam,callBack) {
	// 	console.log("根据基金代码查询代销机构");
	// 	var paraMap = {};
	// 	paraMap["funcNo"] = "741017";
	// 	paraMap["fundcode"] = reqParam.fundcode;
	// 	paraMap["type"] = 1;
	// 	var reqParamVo = $.getReqParamVo();
	// 	reqParamVo.setUrl($.gconfig.global.server);
	// 	reqParamVo.setReqParam(paraMap);
	// 	/*reqParamVo.setIsShowWait(true);*/
	// 	this.service.invoke(reqParamVo,callBack);
	// };

	/**
	 * 功能:根据基金名称查询代销机构
	 * param: fundcode
	 * param: type
	 */
	WsService.prototype.querySaleCompanyByFundname = function(reqParam,callBack) {
		console.log("根据基金名称查询代销机构");
		var paraMap = {};
		paraMap["funcNo"] = "741017";
		paraMap["fundname"] = reqParam.fundname;
		paraMap["type"] = 1;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBack);
	};


	/**
	 * 功能:根据销售机构查询查询基金名称
	 * param: fundcode
	 * param: type
	 */
	WsService.prototype.queryFundNameBySaleCompany = function(reqParam,callBack) {
		console.log("根据销售查询基金名称");
		var paraMap = {};
		paraMap["funcNo"] = "741017";
		paraMap["org_name"] = reqParam.org_name;
		paraMap["type"] = 2;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBack);
	};

	/**
	 * 功能:分页查询重要公告(741004)
	 */
	WsService.prototype.queryImportList = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741004";
		paraMap["catalogId"] = reqParam.catalogId;
		paraMap["key_word"] = reqParam.key_word;
		paraMap["start_date"] = reqParam.start_date;
		paraMap["end_date"] = reqParam.end_date;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能:搜索查询(741005)
	 */
	WsService.prototype.querySearchInfo = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741005";
		paraMap["keyword"] = reqParam.keyword;
		paraMap["type"] = reqParam.type;
		paraMap["rows"] = reqParam.rows;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		paraMap["query_status_type"] = reqParam.query_status_type;
		paraMap["is_phone"] = reqParam.is_phone;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询热点问题(741006)
	 */
	WsService.prototype.queryhotArticle = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741006";
		paraMap["selecttype"] = reqParam.selecttype;
		paraMap["type"] = reqParam.type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能:模糊搜索查询下拉框 只展示最新的5条(741007)
	 */
	WsService.prototype.searchDropdown = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741007";
		paraMap["keyword"] = reqParam.keyword;
		paraMap["rows"] = reqParam.rows;
		paraMap["product_code"] = reqParam.product_code;
		paraMap["selecttype"] = reqParam.selecttype;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能:产品推荐管理(741009)
	 * type-查询类型:1-查询组下的基金  2-查询分组信息
	 * groupno-组英文名
	 */
	WsService.prototype.queryProductrecommendation = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741009";
		paraMap["type"] = reqParam.type;
		paraMap["groupno"] = reqParam.groupno;
		paraMap["oderbystatus"] = reqParam.oderbystatus;
		paraMap["product_columns"] = reqParam.product_columns;
		paraMap["query_status_type"] = reqParam.query_status_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);//true有转圈圈,false无*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能:查询产品详情数据(741011)
	 */
	WsService.prototype.queryproductdetail = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741011";
		paraMap["product_id"] = reqParam.product_id;
		paraMap["product_code"] = reqParam.product_code;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询产品详情数据(741012)
	 */
	WsService.prototype.queryproductnav = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741012";
		paraMap["product_id"] = reqParam.product_id;
		paraMap["type"] = reqParam.type;
		paraMap["query_month"] = reqParam.query_month;
		paraMap["start_date"] = reqParam.start_date;
		paraMap["end_date"] = reqParam.end_date;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		paraMap["select_time"] = reqParam.select_time;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能:查询基金公告(741015)
	 */
	WsService.prototype.queyrAnnPage = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741015";
		paraMap["product_id"] = reqParam.product_id;
		paraMap["curtpage"] = reqParam.curtpage;
		paraMap["numperpage"] = reqParam.numperpage;
		paraMap["keyword"] = reqParam.keyword;
		paraMap["start_date"] = reqParam.start_date;
		paraMap["end_date"] = reqParam.end_date;
		paraMap["type"] = reqParam.type;
		paraMap["select_type"] = reqParam.select_type;
		paraMap["select_time"] = reqParam.select_time;
		paraMap["old_type"] = reqParam.old_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:养老金登录(741023)
	 */
	WsService.prototype.loginfundacco = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741023";
		paraMap["type"] = reqParam.type;
		paraMap["logincco"] = reqParam.logincco;
		paraMap["sessionid"] = reqParam.sessionid;
		paraMap["password"] = reqParam.pwd;
		paraMap["logintype"] = reqParam.logintype;
		paraMap["ticket"] = reqParam.ticket;
		paraMap["tokenid"] = reqParam.tokenid;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询视频中心(741027)
	 */
	WsService.prototype.searchVideoinfo = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741027";
		paraMap["video_id"] = reqParam.video_id;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询养老基金列表(741028)
	 */
	WsService.prototype.queuryoldProduct = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741028";
		paraMap["fundtype"] = reqParam.fundtype;
		paraMap["selecttype"] = reqParam.selecttype;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能:查询养老基金列表(741030)
	 */
	WsService.prototype.queuryArticleInfo = function(reqParam,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741030";
		paraMap["catalogid"] = reqParam.catalogid;
		paraMap["articleid"] = reqParam.articleid;
		paraMap["rows"] = reqParam.rows;
		paraMap["query_status_type"] = reqParam.query_status_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(false);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：持仓情况查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryAssetAllocation = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741020";
		paraMap["product_id"] = param.product_id;
		paraMap["allocation_type"] = param.allocation_type;
		paraMap["allocation_types"] = param.allocation_types;
		paraMap["reportdate"] = param.reportdate;
		paraMap["selecttype"] = param.selecttype;
		paraMap["flag"] = param.flag;


		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：销售机构查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.querySalesOrganization = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741017";
		paraMap["fundcode"] = param.fundcode;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金公告查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryFundAnnouncementList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741015";
		paraMap["product_id"] = param.product_id;
		paraMap["curtpage"] = param.curtpage;
		paraMap["numperpage"] = param.numperpage;
		paraMap["keyword"] = param.keyword;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["select_time"] = param.select_time;
		paraMap["type"] = param.type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金净值查询
	 * 参数: callBackFunc:回调函数
	 *       type 1 （分页） 2 （画图）
	 */
	WsService.prototype.queryNetFundValueList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741012";
		paraMap["product_id"] = param.product_id;
		paraMap["type"] = param.type;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["curtpage"] = param.curtpage;
		paraMap["numperpage"] = param.numperpage;
		paraMap["is_export"] = param.is_export;
		paraMap["trans_no"] = param.trans_no;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金分红查询
	 * 参数: callBackFunc:回调函数
	 *       type 类型为2 查询分红信息
	 */
	WsService.prototype.queryDividendFundList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741016";
		paraMap["fundcode"] = param.fundcode;
		paraMap["type"] = param.type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：持股变动查询
	 * 参数: callBackFunc:回调函数
	 *       flag 1为买入、0为卖出
	 */
	WsService.prototype.queryChangesInShareholding = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741024";
		paraMap["fundcode"] = param.fundcode;
		paraMap["flag"] = param.flag;
		paraMap["selecttype"] = param.selecttype;
		paraMap["reportdate"] = param.reportdate;
		paraMap["curtpage"] = param.curtpage;
		paraMap["numperpage"] = param.numperpage;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：净值估算
	 * 参数: callBackFunc:回调函数
	 *       type
	 */
	WsService.prototype.queryEstimationList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741010";
		paraMap["type"] = param.type;
		paraMap["fundtype"] = param.fundtype;
		paraMap["query_status_type"] = param.query_status_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：公告详情
	 * 参数: callBackFunc:回调函数
	 *       ad_id 公告id
	 */
	WsService.prototype.queryAnnouncementDetails = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741021";
		paraMap["ad_id"] = param.ad_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：高端公告详情
	 * 参数: callBackFunc:回调函数
	 *       ad_id 公告id
	 */
	WsService.prototype.queryAnnouncementDetailsForHighProfile = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741053";
		paraMap["id"] = param.ad_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：申购赎回清单查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryPcfList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741031";
		paraMap["product_code"] = param.product_code;
		paraMap["product_id"] = param.product_id;
		paraMap["query_date"] = param.query_date;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：申购赎回清单查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryFundPcfList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "742002";
		paraMap["product_code"] = param.product_code;
		paraMap["product_id"] = param.product_id;
		paraMap["query_date"] = param.query_date;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：上海金ETF实物申赎清单查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryGoldenPdfList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741054";
		paraMap["productCode"] = param.fundCode;
		paraMap["queryDate"] = param.pdfDate;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：申购赎回清单下载
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryPcfDownload = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741038";
		paraMap["product_code"] = param.product_code;
		paraMap["query_date"] = param.query_date;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	WsService.prototype.queryPcfFileDownload = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "742003";
		paraMap["product_code"] = param.product_code;
		paraMap["query_date"] = param.query_date;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：收益率走势查询
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryAvgreturnList = function(callBackFunc,param){
		var paraMap = {};
		paraMap["funcNo"] = "741032";
		paraMap["product_code"] = param.product_code;
		paraMap["product_id"] = param.product_id;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_month"] = param.query_month;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：基金对比收益率走势查询
	 * 参数: callBackFunc:回调函数
	 *       flag 1为买入、0为卖出
	 */
	WsService.prototype.queryCompareChart = function(param, callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741032";
		paraMap["product_code"] = param.product_code;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_month"] = param.query_month;
		paraMap["is_forceshow"] = param.is_forceshow;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能：ESg画图
	 * 参数: callBackFunc:回调函数
	 *
	 */
	WsService.prototype.queryEsgChart = function(param, callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741040";
		paraMap["producths_code"] = param.productHsCode;
		paraMap["query_month"] = param.query_month;
		paraMap["product_code"] = param.productCode;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能：查询养老相关文章
	 * 参数: callBackFunc:回调函数
	 *
	 */
	WsService.prototype.queryArtice = function(param, callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741019";
		paraMap["product_id"] = param.product_id;
		paraMap["product_code"] = param.product_code;
		paraMap["select_type"] = param.select_type;
		paraMap["curtpage"] = param.curtpage;
		paraMap["numperpage"] = param.numperpage;
		paraMap["keyword"] = param.keyword;
		paraMap["select_time"] = param.select_time;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};



	/**
	 * 功能：基金对比风险数据查询
	 * 参数: callBackFunc:回调函数
	 *       flag 1为买入、0为卖出
	 */
	WsService.prototype.queryRiskData = function(param, callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741033";
		paraMap["product_ids"] = param.product_ids;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：上证、深证、创业板 行情信息
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryHQMain = function (callBackFunc) {
		// $.get($.gconfig.global.hqserver, callBackFunc)
		$.ajax({
			url: $.gconfig.global.hqserver,
			dataType: "script",
			cache: "false",
			type: "GET",
			success: callBackFunc
		})
	};

	/**
	 * 功能：指数型号灯
	 * 参数: callBackFunc:回调函数
	 */
	//WsService.prototype.queryindexlightList = function (callBackFunc) {
	//    $.get($.gconfig.global.indexlightserver, callBackFunc)
	//};
	WsService.prototype.queryindexlightList = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741034";
		paraMap["query_status_type"] = param.query_status_type;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：获取多支基金最大净值日期
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryMaxStartDate = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741041";
		paraMap["product_codes"] = param.product_codes;
		paraMap["start_date"] = param.start_date;
		paraMap["end_date"] = param.end_date;
		paraMap["query_month"] = param.query_month;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：对接客服中心
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.custService = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741046";
		paraMap["search_key"] = param.search_key;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询h5首页长期精选
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryh5recomfundlist = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741042";
		paraMap["query_type"] = param.query_type;
		paraMap["groupno"] = param.groupno;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};
	/**
	 * 功能：基金营销专题页
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.fundMarketingSpecial = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741048";
		paraMap["product_id"] = param.product_id;

		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};

	/**
	 * 功能：模糊查询产品列表和代销机构列表
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.queryfundAndOrglist = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "741049";
		paraMap["keyword"] = param.keyword;
		paraMap["query_type"] = param.query_type;
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};


	/**
	 * 功能：查询总资产数据
	 * 参数: callBackFunc:回调函数
	 */
	WsService.prototype.querySyChart = function(param,callBackFunc){
		var paraMap = {};
		paraMap["funcNo"] = "742001";
		var reqParamVo = $.getReqParamVo();
		reqParamVo.setUrl($.gconfig.global.server);
		reqParamVo.setReqParam(paraMap);
		/*	reqParamVo.setIsShowWait(true);*/
		this.service.invoke(reqParamVo,callBackFunc);
	};







	/**
	 * 释放操作
	 */
	WsService.prototype.destroy = function(){
		this.service.destroy();
	};


	/**
	 * 实例化对象
	 */
	function getInstance(){
		return new WsService();
	}

	var wsService = {
		"getInstance" : getInstance
	};


	// 暴露对外的接口
	module.exports =   wsService;
});
