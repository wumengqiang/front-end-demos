if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : ''
                ;
        });
    };
}

(function () {
    var demo = angular.module('demo', [])
        .controller('DemoController', DemoController);

    DemoController.$inject = ["$scope", "$interval", "$timeout"];

    function DemoController($scope, $interval, $timeout) {
        var vm = this; // viewmodel
        window.vm = vm;
        // 数据初始化
        vm.init = init;

        vm.initRotator = initRotator;
        vm.handleOrientationChange = handleOrientationChange;
        vm.getDistance = getDistance;
        vm.getAngleByDistance = getAngleByDistance;

        vm.init();
        function init() {
            vm.pageContainer = angular.element('.page-container');
            vm.pageMain = angular.element('.page-main');
            vm.img = './images/demo      -sm.jpg';
            vm.initRotator();
        }

        function initRotator(){
            var header = angular.element('.demo-info header');
            var imageEl = header.find('.bg-img');

            var image = new Image();
            image.src = vm.img;
            image.onload =  function(){
                var RATIO = 1.2, DELTA = 60; // 图片可晃动区域的宽或高 至少是可显示区域的倍数
                var height, width;

                var clientHeight = header.height();
                var clientWidth = header.width();
                // 按比例缩小或放大图片
                if(clientHeight / clientWidth > image.height / image.width){ // 图片比较宽  按照高度最小
                    height = clientHeight * RATIO;
                    width = image.width *  ( height / image.height );
                } else{ // 图片比较窄
                    width = clientWidth * RATIO;
                    height = image.height * (width / image.width);

                }

                vm.rotateInfo = {
                    DELTA: DELTA,   // 
                    RATIO: RATIO,
                    container: {
                        height: clientHeight,
                        width: clientWidth
                    },
                    img: {
                        height: height,
                        width: width
                    },
                    border: { // x,y值是负值
                        x:  clientWidth - width ,
                        y: clientHeight - height
                    },
                    position: { // 先处于中间值
                        x: (clientWidth - width) / 2,
                        y: (clientHeight - height) / 2
                    },
                    ratio: { // 设置某一个轴60°旋转完毕
                        x: clientWidth * (RATIO - 1) / DELTA,
                        y: clientHeight * (RATIO - 1) / DELTA
                    },
                    relativeAngle: {},
                    lastAngle: { // last angle
                        beta: 0,
                        gamma: 0,
                    }
                };
                var style = "width:{0}px;height:{1}px;transform: translate3d({2}px, {3}px ,0);".format(vm.rotateInfo.img.width,
                    vm.rotateInfo.img.height, vm.rotateInfo.position.x, vm.rotateInfo.position.y);
                imageEl.attr('style', style);

                window.addEventListener('deviceorientation', vm.handleOrientationChange);
            };

        }

        function handleOrientationChange(event){
            var RATIO = vm.rotateInfo.RATIO, DELTA = vm.rotateInfo.DELTA;
            if(! vm.rotateInfo.relativeAngle.gamma){
                vm.rotateInfo.relativeAngle = {
                    gamma: event.gamma,
                    beta: event.beta
                };
                vm.rotateInfo.lastAngle = {
                    gamma: event.gamma,
                    beta: event.beta
                };
            }
            var gamma = event.gamma, beta = event.beta;

            // 跳变值处理 在手机上有时候值会发生跳变，例如一般情况下值的变化会在10以内， 有时候值会从40调到110或110跳变到40
            if(Math.abs(gamma - vm.rotateInfo.lastAngle.gamma) > 10){
                vm.rotateInfo.relativeAngle.gamma = vm.getAngleByDistance(gamma, - vm.rotateInfo.relativeAngle.gammaDelta, 90);
            }

            if(Math.abs(beta - vm.rotateInfo.lastAngle.beta) > 10){
                vm.rotateInfo.relativeAngle.beta = vm.getAngleByDistance(beta, - vm.rotateInfo.relativeAngle.betaDelta, 180);
            }

            var gammaDelta = vm.getDistance(vm.rotateInfo.relativeAngle.gamma, event.gamma, 90),
                betaDelta = vm.getDistance(vm.rotateInfo.relativeAngle.beta, event.beta, 180);

            // 对于beta(x轴), gamma(y轴)旋转相应 不响应alpha(z轴)
            if(gammaDelta > DELTA) {
                vm.rotateInfo.relativeAngle.gamma = vm.getAngleByDistance(event.gamma,  - DELTA, 90);
                gammaDelta = DELTA;
            } else if(gammaDelta < - DELTA){
                vm.rotateInfo.relativeAngle.gamma = vm.getAngleByDistance(event.gamma,  DELTA, 90);
                gammaDelta = - DELTA;
            }

            if(betaDelta > DELTA) {
                vm.rotateInfo.relativeAngle.beta = vm.getAngleByDistance(event.beta, - DELTA, 180);
                betaDelta = DELTA;
            } else if(betaDelta < - DELTA){
                vm.rotateInfo.relativeAngle.beta = vm.getAngleByDistance(event.beta,  DELTA, 180);
                betaDelta = - DELTA;
            }


            var x = vm.rotateInfo.ratio.x * (gammaDelta) + vm.rotateInfo.position.x;
            var y = vm.rotateInfo.ratio.y * (betaDelta)  + vm.rotateInfo.position.y;
            vm.rotateInfo.relativeAngle.gammaDelta = gammaDelta;
            vm.rotateInfo.relativeAngle.betaDelta = betaDelta;
            // 图片边缘检测 如果超出图片边缘, 就设为图片边缘部分
            if(x  > 0){
                x = 0 ;
            } else if(x < vm.rotateInfo.border.x){
                x = vm.rotateInfo.border.x;
            }

            if(y > 0){
                y = 0;
            } else if(y < vm.rotateInfo.border.y){
                y = vm.rotateInfo.border.y;
            }

            var style = "width:{0}px;height:{1}px;transform: translate3d({2}px, {3}px ,0);".format(vm.rotateInfo.img.width,
                vm.rotateInfo.img.height, x, y);
                angular.element('.demo-info header .bg-img').attr('style', style);

            vm.rotateInfo.lastAngle = {
                beta : event.beta,
                gamma: event.gamma
            }
        }

        /*
         * 获取两个旋转角度之间的角度差, 设置0 -> 90 -> -90 -> 0 为正方向
         * 
         *  @param startAngle 开始角度
         *  @param endAngle  结束角度
         */
        function getDistance(startAngle, endAngle, maxAngle){ 
            if(startAngle * endAngle >= 0){  // e.g. 45 -> 90 or  -90 -> -45
                return endAngle - startAngle;
            } else{ // startAngle * endAngle < 0 // e.g. 89 -> -89
                if(Math.abs(startAngle - endAngle) > maxAngle){
                    return (maxAngle * 2 - Math.abs(startAngle - endAngle)) * (startAngle > 0 ? 1 : -1);
                } else{
                    return endAngle - startAngle;
                }
            }
        }

        /*
         * 根据角度和距离计算出结果角度
         * @angle 起始角度
         * @distance 距离
         * @maxAngle 最大角度 例如 90
         */
        function getAngleByDistance(angle, distance, maxAngle){
            var endAngle = angle + distance;
            if(Math.abs(endAngle) > maxAngle){
                if(angle > 0){ // e.g. angle: 80 distance: 20 maxAngle:90
                    endAngle = -2 * maxAngle + angle + distance;
                } else{  // e.g. angle: -80 distance: -20 maxAngle:90
                    endAngle = 2 * maxAngle + angle + distance;
                }
            }

            return endAngle;
        }
    }
})();
