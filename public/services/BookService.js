angular.module('app').factory('Book', function($resource) {
    return $resource('http://localhost:8080/api/books/:id');
});
