define(function(require, exports, module) {
    var $ = require('./jquery');
    var cookieUtil = require('./tool');
    
    var TanChiShe = {
		direction: 39,                                 //默认方向为右边开始
		keyDisenable: false,                           //按键使不能标志
		stopSign: false,                               //蛇停止移动的标志
		defaultTime: 40,                               //默认游戏结束时间
		eateggNum: 0,                                  //吃了鸡蛋的数量
		score: 0,                                      //设置游戏的分数
		colNum: 50,                                    //设置游戏区域的列数
		lineNum: 25,                                   //设置游戏区域的行数
		margin: 50,                                    //设置游戏区域所在DIV的margin值	
		initSnakeLength: 4,                            //初始蛇的长度
		initSnakePosition: [],                         //存放初始化时蛇的每一个单元的位置
		snakePosition: [],                             //存放蛇的每一个单元的位置
		snakeColor: [                                  //设置蛇的颜色
			'#99FF00',
			'#0000FF',
			'#800080',
			'#007A85',
			'#FCBB00'
		],
		currSnakeColorIndex: 0,                         //当前蛇的颜色的索引
		eggColorIndex: 0,                               //鸡蛋颜色的索引	
		snakeGoId: null,                                //蛇移动定时器id
		defaultSpeed: 200,                              //蛇初始速度200ms
		maxScore: cookieUtil.get('maxScore') || 0,      //设置最大的分数
		playTime: 0,                                    //玩的次数
		bombPosition: [],                               //保存所有炸弹的位置
		isHasTip: false,                                //是否有了加分加时提示
		isCreateGameArea: false,                        //是否创建过游戏区域
		playAreaHtml: '',                               //保存类名playArea的div下的html
		isShowEat: false,                               //是否显示id为eat的div
		isShowDialog: false,                            //是否显示id为dialog的div
		
		init: function() {
			var _sHtml = '',
			    _self  = this;
			
			_sHtml += '<div class="aside" style="float: left; width: 20%; min-width: 243px; background: #CCCC33;">'           ;
			_sHtml +=     '<div style="width: 243px; margin:25px auto 0 auto;">'                                              ;
			_sHtml +=         '<div class="eateggNum" style="margin:10px 0;">'                                                ;
			_sHtml +=             '已贪吃：<i style="margin:0 10px; font-weight:bold; color:green;">0</i>个'                   ;
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div class="score" style="margin:10px 0;">'                                                    ;
			_sHtml +=             '积分：<i style="margin:0 10px; font-weight:bold; color:green;">0</i>分'                     ;
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div class="speed" style="margin:10px 0;">'                                                    ;
			_sHtml +=             '速度：<i style="margin:0 10px; font-weight:bold; color:green;">0</i>毫秒跑<span>0</span>px' ;
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div class="maxScore" style="margin:10px 0;">'                                                 ;
			_sHtml +=             '曾经最高得分：<b style="margin:0 10px;">' + this.maxScore + '</b>分'                        ;
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div style="margin-top:20px;">'                                                                ;
			_sHtml +=             '<b style="font-weight:bold; font-size:18px; line-height:25px;">得分记录：</b>'              ;
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div class="scoreRecord" style="overflow:auto; background-color:#ffffff; border:1px solid #000000; width:210px; height:300px; font-size:14px; line-height:20px; padding-left:5px;">';
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=         '<div class="" style="margin:10px 0;">'                                                         ;
			_sHtml +=             '说明：<span style="font-size:14px; margin-left:10px; display:block; color:#000;">A/a键 ：开始/停止，<br>空格键：重新开始，<br>每吃一个蛋换取5秒，<br>撞边或触碰炸弹或吃到尾巴或到时间一律Over。';
			_sHtml +=         '</div>'                                                                                        ;
			_sHtml +=     '</div>'                                                                                            ;
			_sHtml += '</div>'                                                                                                ;
			_sHtml += '<div id="main" style="width:80%; height:100%;min-width: 952px;margin:0 0 0 20%;">'           ;
			_sHtml +=     '<div style="font-size:20px; line-height:70px; color:#000000; text-align:center;">'                 ;
			_sHtml +=         '剩余时间<i class="time" style="color:red; font-size:35px; margin-left:10px; margin-right:5px">' + this.defaultTime + '</i>S' ;
			_sHtml +=     '</div>'                                                                                            ;
			_sHtml += '</div>'                                                                                                ;
			_sHtml += '<div id="dialog" style="position:absolute; text-align:center; top:0; bottom:0; left:0; right:0; display:none; z-index:20200;">';
			_sHtml +=     '<div class="mask" style="width:100%; height:100%; background-color:#eeeeee; opacity:0.5; text-align:center;"></div>' ;
			_sHtml +=     '<div style="position:absolute; width:100%; top: 250px; left:0; text-align:center;">'               ;
			_sHtml +=         '<div id="dialog_txt" style="display:inline-block; background-color:#CD0000; color:#ffffff; line-height:80px; font-weight:bold; font-size:30px; padding:0 30px; text-align:center;"></div>' ;
			_sHtml +=     '</div>'                                                                                            ;
			_sHtml += '</div>'                                                                                                ;
			
			
			$('body').css({
				'margin'   : 0,
				'padding'  : 0,
				'font-size': '18px',
				'background': '#FFFF99'
			}).html(_sHtml).on('keydown', function(event) {
				var _keyCode = event.which;
				
				if (_self.keyDisenable) {
					return;
				};
				
				if (_self.snakeGoId){                   //当蛇在运动时
					if ((_self.direction == 37 || _self.direction == 39) && (_keyCode == 38 || _keyCode == 40)) {
						_self.direction = _keyCode;
						_self.keyDisenable = true;
					}else if ((_self.direction == 38 || _self.direction == 40) && (_keyCode == 37 || _keyCode == 39)) {
						_self.direction = _keyCode;
						_self.keyDisenable = true;
					}else if (_keyCode == 65) {
						if (_self.stopSign){
							_self.stop();
						}else {
							_self.goAgain();
						};
						_self.stopSign = !_self.stopSign;
					}else if (_keyCode == 32) {
						_self.resetGameArea();
					};
				}else if (_keyCode == 65) {
					if (_self.isShowDialog) {
						_self.hideDialog();
						_self.createGameArea();
						_self.isShowDialog = false;
					};
					
					if (_self.stopSign){
						_self.stop();
					}else {
						_self.goAgain();
					};
					_self.stopSign = !_self.stopSign;
				}else if (_keyCode == 32){
					if (_self.isShowDialog) {
						_self.hideDialog();
						_self.isShowDialog = false;
					};
					_self.resetGameArea();
				};
				return false;
			});
			
			_self.createGameArea();
		},
		
		createGameArea: function() {
			var _center_top,          //游戏区域中心单元格的top值
			    _center_left;         //游戏区域中心单元格的left值
			    
			
			if(this.isCreateGameArea) {
				this.currSnakeColorIndex = 0;
				this.eggColorIndex = 0;
				this.score = 0;
				this.defaultSpeed = 200;
				this.snakePosition = this.cloneObject(this.initSnakePosition);
				this.bombPosition = [];
				clearInterval(this.timeGoId);
				this.timeGoId = null;
				$('div.playArea').remove();
				this.setAside(0, 0, this.defaultSpeed, this.defaultTime);
				$('#main').append(this.playAreaHtml);
			}else {
				this.unit_wh = parseInt(($('#main').width() - this.margin * 2) / this.colNum);    //游戏区域的组成单元宽高
				$('div.speed').find('span').html(this.unit_wh);
				
				this.playAreaWidth = this.unit_wh * this.colNum;                                     //游戏区域的宽
				this.playAreaHeight = this.unit_wh * this.lineNum;                                   //游戏区域的高
				_center_top = this.unit_wh * parseInt(this.lineNum / 2);
				_center_left = this.unit_wh * parseInt(this.colNum / 2);
		
				this.playAreaHtml += '<div class="playArea" style="position:relative;width:' + this.playAreaWidth +'px; height:' + this.playAreaHeight + 'px;margin:0 auto;border:1px solid #fff;background-color:#CC9933;">';
				
				for (var i = this.initSnakeLength - 1, j = 0; i >= 0; i--, j++){
					this.snakePosition.push({'x': (_center_left - i * this.unit_wh), 'y': _center_top});
					this.playAreaHtml += '<div class="snake" style="z-index:20000; position:absolute; left:' + this.snakePosition[j].x + 'px; top:' + this.snakePosition[j].y + 'px; background-color:'+ this.snakeColor[this.currSnakeColorIndex] +'; width:' + this.unit_wh + 'px; height:' + this.unit_wh + 'px;"></div>';
				};
				this.initSnakePosition = this.cloneObject(this.snakePosition);
				
				this.playAreaHtml += '<div id="eat" style="display: none; position: absolute; width: 0; height: 0; z-index: 20100; border-style:solid ; border-width:' + parseInt(this.unit_wh/2 + 1) + 'px;"></div></div>'
				
				$('#main').append(this.playAreaHtml);
				
				this.isCreateGameArea = true;
			};
			
			
			
			this.setEgg();
			this.setBomb();
		},
		
		go: function() {
			var _snakeTailPosition = this.snakePosition[this.snakePosition.length - 1],
			    x,                   //保存蛇下一个移动到的单元位置的left值
				y;                   //保存蛇下一个移动到的单元位置的top值
				
			if(this.isShowEat) {
				$('#eat').hide();
				this.isShowEat = false;
			};
			
			
			if (this.direction == 37){
				x = _snakeTailPosition.x - this.unit_wh;
				y = _snakeTailPosition.y;
			}else if (this.direction == 39){
				x = _snakeTailPosition.x + this.unit_wh;
				y = _snakeTailPosition.y;
			}else if (this.direction == 38){
				x = _snakeTailPosition.x;
				y = _snakeTailPosition.y - this.unit_wh;
			}else if(this.direction == 40){
				x = _snakeTailPosition.x;
				y = _snakeTailPosition.y + this.unit_wh;
			}else {
				throw new Error('TanChiShi.direction has error.');
			};
			
			if (this.isOver(x, y)){
				this.showScore();
				this.showDialog('出界！');
				this.keyDisenable = false;
				return;
			};
			if (this.eatEgg(x, y)){return;};
			
			
			$('div.snake').first().css({
				'top': y + 'px',
				'left': x + 'px'
			}).appendTo($('div.playArea'));
			
			if (this.isEatSelf(x, y)) return;
			if (this.isBlast(x, y)) return;
			this.snakePosition.shift();
			this.snakePosition.push({'x': x, 'y': y});
			
			this.keyDisenable = false;
		},
		
		resetGameArea: function() {
			this.eateggNum = 0;
			clearInterval(this.snakeGoId);
			this.snakeGoId = null
			clearInterval(this.timeGoId);
			this.timeGoId = null;
			this.stopSign = false;
			this.direction = 39;
			this.createGameArea();
		},
		
		setEgg: function() {
			do{
				this.egg_x = this.rd(0, this.colNum) * this.unit_wh;
				this.egg_y = this.rd(0, this.lineNum) * this.unit_wh;
			}while(this.isInSnake(this.egg_x, this.egg_y) || this.isInBomb(this.egg_x, this.egg_y));
			
			if (this.eggColorIndex == this.snakeColor.length - 1) {
				this.eggColorIndex = 0;
			}else {
				this.eggColorIndex++;
			};
			
			$('div.playArea').append(
				'<div class="egg" style="position:absolute; width:' + this.unit_wh +'px; height:' + this.unit_wh + 'px; background-color:' + this.snakeColor[this.eggColorIndex] + '; z-index:20000; top:' + this.egg_y + 'px; left:' + this.egg_x + 'px;border-radius:50%;"></div>'
			);
		},
		
		eatEgg: function(x, y) {
			var _score;
			
			if (x == this.egg_x && y == this.egg_y){
				$('div.snake').css({
					'background-color' : this.snakeColor[this.eggColorIndex]
				});
				
				this.eat(this.egg_x, this.egg_y);
				$('div.egg').removeClass('egg').addClass('snake').css({
					'border-radius': '0'
				}).appendTo($('div.playArea'));
	
				this.snakePosition.push({'x': this.egg_x, 'y': this.egg_y});
				this.currSnakeColorIndex = this.eggColorIndex;
				_score = this.defaultSpeed >= 100 ? 10 : (this.defaultSpeed > 50 ? 20 : 30);
				if (this.defaultSpeed >= 50){
					this.defaultSpeed -= 3;
				};
				this.eateggNum += 1; 
				this.setTip(_score, 5);
				this.score += _score;
				this.setAside(this.eateggNum, this.score, this.defaultSpeed, parseInt($('i.time').html()) + 5);
				
				clearInterval(this.snakeGoId);
				this.snakeGoId = null;
				this.snakeGoId = setInterval(this.bind(this, this.go), this.defaultSpeed);
	
				this.setEgg();
				this.keyDisenable = false;
				
				if (this.eateggNum%2 == 0 && this.defaultSpeed > 80){
					this.setBomb();
				}
				return true;
			};
			return false;
		},
		
		isInSnake: function(x, y) {
			return this.snakePosition.some(function (item, index, array){
				return (item.x == x) && (item.y == y)
			})
		},
		
		isOver: function(x, y) {
			if (x>=0 && y>=0 && this.playAreaWidth>x && this.playAreaHeight>y){
				return false;
			}else {
				return true;
			}
		},
		
		isEatSelf: function(x, y) {
			if(this.isInSnake(x, y)){
				this.showScore();
				this.eggColorIndex--;
				this.eat(x, y);
				this.showDialog('sb，你吃到自己了！');
				this.keyDisenable = false;
				return true;
			}
			return false;
		},
		
		showDialog: function(str) {
			var _self = this;
			
			clearInterval(this.snakeGoId);
			this.snakeGoId = null;
			this.stopSign = true;
			this.direction = 39;
			this.defaultSpeed = 200;
			this.eateggNum = 0;
			$('#dialog').show();
			this.isShowDialog = true;
			$('#dialog_txt').html(str);
			clearInterval(this.timeGoId);
			this.timeGoId = null;
			this.dialogId = setTimeout(function (){
				$('#dialog').hide();
				_self.isShowDialog = false;
				_self.createGameArea();
				_self.stopSign = false;
			}, 3000);
		},
		
		hideDialog: function() {
			$('#dialog').hide();
			clearTimeout(this.dialogId);
			this.dialogId = null;
			$('div.eateggNum').find('i').html(0);
			$('div.score').find('i').html(0);
			$('div.speed').find('i').html(this.defaultSpeed);
		},
		
		stop: function() {
			clearInterval(this.snakeGoId);
			this.snakeGoId = null;
		},
		
		goAgain: function() {
			clearInterval(this.timeGoId);
			this.snakeGoId = setInterval(this.bind(this, this.go), this.defaultSpeed);
			this.timeGoId = setInterval(this.bind(this, this.timeGo), 1000);
		},
		
		timeGo: function(){
			var _time = $('i.time').html();
			if (_time == 0){
				this.showScore();
				this.showDialog('超时啦!');
				return;
			};
			$('i.time').html(_time - 1);
		},
		
		showScore: function() {
			this.playTime++;
			var _currScore = this.score;
			var _now = new Date();
			var _aTime = [_now.getHours(), _now.getMinutes(), _now.getSeconds(), this.playTime].map(function (item, index, array){
				return item < 10 ? ('0'+item) : item;
			});
			var _scoreInfo,
			    _now,
			    _expires;
			
			if (this.maxScore < _currScore){
				this.maxScore = _currScore;			
				_now = new Date();
				expires = _now.setTime(_now.getTime() + 7 * 24 * 60 * 1000);
				cookieUtil.set("maxScore", _currScore, expires);
				$('div.maxScore').find('b').html(_currScore);
			};
			
			_scoreInfo = _aTime[0] + ':' + _aTime[1] + ':' + _aTime[2] + ' 第' + _aTime[3] + '次得分：' + _currScore + '分<br>'
			$('div.scoreRecord').html($('div.scoreRecord').html() + _scoreInfo);
		},
		
		setBomb: function() {
			var _bomb_x,
			    _bomb_y;
			    
			do{
				_bomb_x = this.rd(0, this.colNum) * this.unit_wh;
				_bomb_y = this.rd(0, this.lineNum) * this.unit_wh;
			}while(this.isInSnake(_bomb_x, _bomb_y) || (this.egg_x == _bomb_x && this.egg_y == _bomb_y) || this.isInBomb(_bomb_x, _bomb_y));
			this.bombPosition.push({'x': _bomb_x, 'y': _bomb_y});
			
			$('div.playArea').append(
				'<div class="bomb" style="position:absolute; z-index:20001; top:' + _bomb_y + 'px; left:' + _bomb_x + 'px;width:' + this.unit_wh + 'px; height:' + this.unit_wh + 'px;"><img src="img/bomb.gif" width="' + this.unit_wh + '" height="' + this.unit_wh + '"></div>'
			);
		},
		
		isInBomb: function(x, y) {
			return this.bombPosition.some(function (item, index, array){
				return (item.x == x) && (item.y == y);
			});
		},
		
		isBlast: function(x, y) {
			if (this.isInBomb(x, y)){
				this.showScore();
				this.eggColorIndex--;
				this.eat(x, y);
				this.showDialog('傻叼，吃到炸弹啦！');
				this.bombPosition = [];
				this.keyDisenable = false;
				return true;
			};
			return false;
		},
		
		eat: function(x, y) {
			var _currColor = this.snakeColor[this.eggColorIndex];
			var _aColor = [_currColor, _currColor, _currColor, _currColor];
			var _brown = '#CC9933';        //棕色
			var _sColor;
			
			switch(this.direction){
				case 37: _aColor[3] = _brown; break;
				case 38: _aColor[0] = _brown; break;
				case 39: _aColor[1] = _brown; break;
				case 40: _aColor[2] = _brown; break;
				default: throw new TypeError('The value of direction in TanChiShe is false!');
			};
			_sColor = _aColor.join(' ');
			
			$('#eat').css({'left': x, 'top': y, 'border-color': _sColor, 'display': 'block'});
			this.isShowEat = true;
		},
		
		setTip: function(score, time) {
			if(this.isHasTip) {
				$('#tip').css({
					'top': this.egg_y,
					'left': this.egg_x,
					'font-size': 12,
					'opacity': 1
				}).text('+' + score + '分+' + time + '秒').animate({
					opacity: 0,
					fontSize: '15px'
				}, 1000);
			}else {
				$('div.playArea').append(
					'<div id="tip" style="position:absolute;width:80px;z-index:20101; top:' + this.egg_y + 'px; left:' + (this.egg_x) + 'px;font-size:12px; font-weight:bolder; color:red;">+' + score + '分+' + time + '秒</div>'
				);
			
				$('#tip').animate({
					opacity: 0,
					fontSize: '15px'
				}, 1000);
				this.isHasTip = true;
			}
		},
		
		setAside: function(eatNum, score, speed, time) {
			$('div.eateggNum').find('i').html(eatNum);
			$('div.score').find('i').html(score);
			$('div.speed').find('i').html(speed);
			$('i.time').html(time);
		},
		
		
		rd: function(n, m) {
			var c = n - m + 1;
			return parseInt(Math.random() * c + m);
		},
		
		bind: function(context, func) {
			var self = context;
			return function (){
				func.apply(self, arguments);
			};
		},
		//实现深克隆
		cloneObject: function(obj) {
			if(obj === null || typeof obj !== 'object') {
				return obj;
			};
			var _temp = obj.constructor();
			for(var key in obj) {
				_temp[key] = this.cloneObject(obj[key]);
			};
			return _temp;
		}
	}
    
    module.exports = TanChiShe;
});



