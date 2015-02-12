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