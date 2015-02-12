(function(){
    'use strict';
angular
    .module('phoneBookControllers',[])
    .controller('MainCtrl',  MainCtrl)
    .controller('ShowItemsCtrl',  ShowItemsCtrl)
    .controller('NewItemCtrl',  NewItemCtrl)
    .controller('EditItemCtrl',  EditItemCtrl);
// Зависимости
    MainCtrl.$inject = ['$scope','serviceDB'];
    ShowItemsCtrl.$inject = ['$scope','$route','serviceDB', '$routeParams', '$location','$filter'];
    NewItemCtrl.$inject = ['$scope','$route','serviceDB', '$routeParams', '$location'];
    EditItemCtrl.$inject = ['$scope','$route','serviceDB', '$routeParams', '$location'];
// функционал
    function MainCtrl($scope,serviceDB) {
        $scope.items = serviceDB.items;
        $scope.navigation = {
            listItemsType: '',
            btnAdd: true,
            List: function () {
                this.listItemsType = '';
            },
            Grid: function () {
                this.listItemsType = 'tile';
            }
        };
        $scope.search = '';
        $scope.header = {
            title: ''
        };



    }
    function ShowItemsCtrl($scope,$route,serviceDB,$routeParams, $location,$filter) {
        $scope.navigation.addBtn = true;
        $scope.navigation.btnBack = false;
        $scope.items = serviceDB.items;
        $scope.rev = {};
        // Редактирование по клику на элемент
        $scope.editItems = function (id) {
            $location.path('/items/' + id)
        };
        $scope.order = function (field, reverse) {
            $scope.rev[field] = reverse;
            $scope.rev.active = field;
            $scope.items = $filter('orderBy')($scope.items, field, reverse)
        };
        $scope.header.title = 'Контакты';

    }
    function NewItemCtrl($scope,$route,serviceDB,$routeParams, $location) {
        $scope.navigation.addBtn = false;
        $scope.navigation.btnBack = true;
        $scope.alert = {
            visible: false,
            text: true
        };

        $scope.btnName = 'Добавить';

        $scope.items = {
            data: {
                //name: {first:'test',last:'ist'},
                //email: 'email@email.ru',
                //phone: '5555555',
                //picture: 'http://lorempixel.com/200/200/'
            },
            save: function () {
                var result = serviceDB.save(this.data);
                result.promise.then(function (ref) {
                    if (result.action == 'add') {
                        $scope.items.data = serviceDB.getObject(ref.key());
                        $scope.btnName = 'Сохранить';
                        $scope.alert.text = 'Контактные данные успешно добавлены'
                    } else {
                        $scope.alert.text = 'Контактные данные успешно сохранены'
                    }
                    $scope.alert.visible = true;
                });
            },
            remove: function () {
                if (this.data.$id) {
                    serviceDB.remove(this.data.$id).then(function (ref) {
                        console.log(ref.key());

                        $location.path('/');
                    })
                }
            }
        };
        console.log($scope.items.data.$id);
        if ($routeParams.id !== undefined) {
            $scope.btnName = 'Сохранить';
            $scope.items.data = serviceDB.getObject($routeParams.id);
        }
    }

    function EditItemCtrl($scope,$route,serviceDB,$routeParams, $location){
        $scope.navigation.addBtn = false;
        $scope.navigation.btnBack = true;
        $scope.items.data = serviceDB.getObject($routeParams.id);

    }

})();
// controllers
//
//angular.module('ContactList').controller('AppSaverController', ['$scope', '$firebase', function ($scope, $firebase) {
//
//    var ref = new Firebase("https://greatcontactlist.firebaseio.com/");
//    var sync = $firebase(ref);
//    var messagesArray = sync.$asArray();
//    $scope.persons = messagesArray;
//
//    $scope.appStyle = 'list';
//    $scope.lists = true;
//    $scope.appTitle = 'контакты';
//    $scope.query = '';
//
//    $scope.changeAppstyle = function (button) {
//        $scope.appStyle = button;
//    };
//
//    $scope.clearQuery = function () {
//        $scope.query = '';
//    }
//
//    $scope.personStyle = function () {
//        $scope.lists = false;
//        $scope.appTitle = 'контакт';
//    };
//
//    $scope.listStyles = function () {
//        $scope.lists = true;
//        $scope.appStyle = 'list';
//        $scope.appTitle = 'контакты';
//    }
//}]);
//
//angular.module('ContactList').controller('AddPersonController', ['$scope', '$firebase', '$location', function ($scope, $firebase, $location) {
//    $scope.newPerson = {
//        'name': '',
//        'surname': '',
//        'email': '',
//        'phone': '',
//        'photo': ''
//    };
//
//    $scope.clearQuery();
//    $scope.personStyle();
//
//    $scope.basePush = function () {
//
//        if ($scope.personAdd.$valid) {
//            var ref = new Firebase("https://greatcontactlist.firebaseio.com/");
//            var sync = $firebase(ref);
//
//            var messages = sync.$asArray();
//            messages.$add($scope.newPerson);
//            messages.$save($scope.newPerson);
//
//            $location.path('/');
//        }
//    };
//
//
//    $scope.resetForm = function () {
//        $scope.newPerson = {
//            'name': '',
//            'surname': '',
//            'email': '',
//            'phone': '',
//            'photo': ''
//        };
//    };
//}]);
//
//angular.module('ContactList').controller('ListController', ['$scope', '$location', function ($scope, $location) {
//    $scope.goToPersonPage = function (id) {
//        // $scope.personStyle();
//        $location.path('/personpage/' + id);
//        $scope.listStyles();
//    };
//}]);
//
//angular.module('ContactList').controller('PersonDataController', ['$scope', '$location', function ($scope, $location) {
//    $scope.getId = function () {
//        return $location.url().slice($location.url().lastIndexOf('/') + 1);
//    }
//    $scope.idName = $scope.getId();
//    $scope.personStyle();
//}])