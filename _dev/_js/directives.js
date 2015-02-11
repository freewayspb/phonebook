(function(){
    angular
        .module('phoneBookDirectives', [])
        .directive('alert',alert)
        .directive('listItems',
            function(){
                return {
                    restrict: 'EA',
                    template: '<div ng-include="contentUrl">',
                    replace: true,

                    link: function (scope, element, attrs) {
                        scope.contentUrl = 'views/items' + attrs.ListType + '.html';
                        attrs.$observe("ListType", function (v) {
                            scope.contentUrl = 'views/items' + v + '.html';
                        });
                    }

                }


            }
        );

    // Функция смены вида list/tile


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