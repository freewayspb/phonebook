(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'angular'
        ], factory);
    } else {
        factory();
    }
}(function () {
    'use strict';

    angular.module('blueimp.fileupload', [])
        .provider('fileUpload', function () {
            var $config = this.defaults = {
                dataType: 'json',
                autoUpload: false,
                send: function (e, data) {
                    var uploading = angular.element('<div class="picture__uploading"/>'),
                        scope = angular.element(e.target).fileupload('option', 'scope'),
                        picBlock = angular.element('.' + scope.picBlock);
                    if (picBlock[0].tagName.toLowerCase() == 'div') {
                        picBlock.css({position: 'relative'}).append(uploading);
                    } else {
                        picBlock.wrap('<div></div>').css({position: 'relative'}).append(uploading);
                    }
                },
                done: function (e, data) {
                    var scope = angular.element(e.target).fileupload('option', 'scope'),
                        picBlock = angular.element('.' + scope.picBlock),
                        img = picBlock.find('img');

                    scope.imgSrc = data.result.src;
                    if (img.length) {
                        img.on('load', function () {
                            picBlock.find('.picture__uploading').remove();
                        })
                    }

                    scope.$apply();
                    if (!img.length) {
                        picBlock.find('.picture__uploading').remove();
                    }
                }
            };
            this.$get = [
                function () {
                    return {
                        defaults: $config
                    };
                }
            ];
        })
        .controller('FileUploadController', [
            '$scope', '$element', '$attrs', 'fileUpload',
            function ($scope, $element, $attrs, fileUpload) {
                $scope.imgSrc = 'testImgSrc';
                $element.fileupload(angular.extend(
                    {scope: $scope},
                    fileUpload.defaults
                ));

                // Observe option changes:
                $scope.$watch(
                    $attrs,
                    function (newOptions) {
                        if (newOptions) {
                            console.log(newOptions);
                            $element.fileupload('option', newOptions);
                        }
                    },
                    true
                );
            }
        ])
        .directive('fileUpload', function () {
            return {
                require: "ngModel",
                controller: 'FileUploadController',
                scope: {
                    picBlock: '@'
                },
                link: function (scope, iElement, iAttrs, ngModelCtrl) {
                    ngModelCtrl.$render = function () {
                        scope.imgSrc = ngModelCtrl.$viewValue;
                    };

                    ngModelCtrl.$parsers.push(function (viewValue) {
                        return viewValue;
                    });

                    scope.$watch('imgSrc', function (newValue) {
                        ngModelCtrl.$setViewValue(newValue);
                    })
                }

            };
        })
}));
