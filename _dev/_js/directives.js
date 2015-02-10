(function(){
    angular
        .module('phoneBookDirectives', [])
    .directive('listItems', listItems)
    .directive('alert',alert);
    // Функция смены вида list/tile
    function listItems() {
         var directive = {
            link: link,
            template: '<div ng-include="contentUrl"></div>',
             bindToController: true,
            replace: true,
            restrict: 'EA'

            };
        return directive;
        function link(scope, el, attrs) {
            scope.contentUrl = 'views/items' + attrs.ListType + '.html';
            attrs.$observe("ListType", function (v) {
                scope.contentUrl = 'views/items' + v + '.html';
            });
        }
    }
    // Функция алертов
    function alert() {
        return {
            restrict: 'A',
            scope: {
                iAlert: '=alert'
            },
            link: function (scope, element, attrs) {
                console.log(scope);
                element.hide();
                scope.$watch('iAlert', function (newVal, oldVal) {
                    if (newVal) {
                        element.show();
                        element.fadeOut(3000, function () {
                            scope.iAlert = false;
                            scope.$apply();
                            console.log(scope);
                        });
                    }
                })
            }
        }
    }

})();