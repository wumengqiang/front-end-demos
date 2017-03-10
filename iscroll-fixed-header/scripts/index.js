/**
 * Created by wumengqiang on 3/7/17.
 */

// style设置
//document.querySelector('.content-wrapper').addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.querySelector('.container').addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

(function(){

	Vue.use(VueResource);
	var vm = new Vue({
		el: '.container',
		data: function(){
			return {
				openAnimation: false,
				type: window.type,
				menu: "introduce",
				topMenu: false, // menu是否在顶部显示
				bannerHeight: 0,
				bannerStyle: {},
				animationOver: false,
				dataAppExample: getDataAppExample(), // 示例微景展信息
				contactList: getContactList(),  // 洽谈合作 信息
				flowInfo: getFlowInfo(),
			}
		},
		created: function(){
			window.onload = this.handleLoaded;
			this.fetchFarmHouseAppExamples();
		},
		mounted: function(){
			this.bindEvent();

		},
		methods: {
			fetchFarmHouseAppExamples: function(){

			},
			handleLoaded: function(){

				setTimeout(function(){
					this.myScroll = new IScroll("#body", {
						probeType: 3,
						click: true,
						mouseWheel:true
					});
					this.myScroll.on('scroll', this.handleScroll);
					this.myScroll.on('scrollEnd', this.handleScroll);
					this.animationOver = true;
					this.bannerHeight = document.querySelector('.banner').clientHeight;
					Vue.nextTick(function(){
						this.myScroll.refresh();
					}.bind(this));

				}.bind(this), 2200);
				this.startOpeningAnimation();

			},
			bindEvent: function(){

			},
			startOpeningAnimation: function(){
				this.openAnimation = true;
				this.loadImages();
			},
			handleChangeMenu: function(menu){
				return;
				if(this.animationOver && this.menu != menu){
					this.menu = menu;
					Vue.nextTick(function(){
						this.myScroll.refresh();
					}.bind(this));
				}
			},
			handleScroll: function(){

				if(! this.bannerHeight){
					this.bannerHeight = document.querySelector('.banner').clientHeight;
				}
				this.topMenu = this.myScroll.y + this.bannerHeight < 90;

				if(this.myScroll.y < 0){
					this.bannerStyle = { transform :  "translate(0px, " +
						(this.topMenu ? - this.myScroll.y + 90 - this.bannerHeight : 0) + "px) translateZ(0px)"};
				} else if(this.myScroll.y >= 0){
					this.bannerStyle = { transform :  "translate(0px, 0px) translateZ(0px)"};
				}

				this.bannerStyle["box-shadow"] = this.topMenu ? '0 2px 8px 2px rgba(0,0,0,.3)' : '';

			},
			loadImages: function(){
				var nodes = document.querySelectorAll('.lazy-load'), length = nodes.length;
				console.log(toString.call(nodes));
				for(var i=0; i < length ; i++){
					nodes[i].setAttribute('src', nodes[i].getAttribute('data-src'));
					nodes[i].onload = this.refreshScroll;
				}

			},
			refreshScroll: function(){
				if(this.myScroll){
					this.myScroll.refresh();
				}
				console.log(this.count ? ++ this.count  : this.count = 1);
			}



		}
	});


	function getDataAppExample(){
		return [
			{
				title: '北京',
				appList: [
					'02b9634e614b448997ab9dae5dd084da',
					'2b10e08f07044e4a81dad917af305a97',
					'3cfb044014fc4520816c10603cf6c0b7',
					'74bd9be62f4c4c76a0bafee2367d5fa4',
					'a6d2e5867367409e920ddafd1b8af3fe'
				],
			}, {
				title: '天津',
				appList: [
					'1b94d392397c455683da3fc2aec051f8',
					'94f9e13bda5642fc8fe7ac97fa3ff61c',
					'291dd9097f834e0e8f067de0b54839b9'
				]
			}, {
				title: '河北',
				appList: [
					'a05167af4a4c4d18ac818d80f32222fa',
					'dbe12653854e4fdb91de881e1f9cb31f',
					'0e0fa004b08d4b6aa6406f1d431ea67f'
				]
			}

		];
	}

	function getContactList(){
		return [
			{
				name: '张世杰',
				area: '华北、华南地区',
				phone: '17432343333',
				email: 'hello@test.com',
				qrcode: './images/wechat-zhangshijie.png'
			},{
				name: '刘皇叔',
				area: '华东地区',
				phone: '18787778777',
				email: 'hello@test.com',
				qrcode: './images/wechat-liuhuangshu.png'
			},
		]
	}

	function getFlowInfo(){
		return [
			{
				title: '资质自评',
				detail:[
					'注册资本金50万元以上',
					'具备月均开拓30家以上商家的能力'
				]
			},{
				title: '合作意向沟通',
				detail:[
					'与渠道经理沟通，确定合作意向'
				]
			},{
				title: '提交申请材料',
				detail:[
					'注册资本金50公司联系方式',
					'公司对公账户信息',
					'营业执照及组织机构代码证信息',
					'业务经办人或法人证件信息万元以上'
				]
			},{
				title: '材料审核'
			},{
				title: '达成合作',
				detail: [
					'签署合作协议',
					'分配渠道商账号',
					'组织业务相关人员培训'
				]
			},{
				title: '开启拓展'
			}
		];
	}

})();
