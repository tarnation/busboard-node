'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('myApp.services'));

  describe('userService', function() {
      var service, $httpBackend, store, mockStop;
      // Set up mock backend
      beforeEach( inject( function( userService, _$httpBackend_ ) {
         service = userService;
        $httpBackend = _$httpBackend_; 
        $httpBackend.when( 'POST', 'api/stops' ).respond( {"data":mockStop} );
      }));

      // Mock up localStorage
      beforeEach( function( ) {
          store = {},
          mockStop = {
              "route" : { "Route" : "999" },
              "direction" : "NORTHBOUND",
              "stop" : "TEST STOP"
          };
          spyOn(localStorage, 'getItem').andCallFake(function (key) {
            return store[key];
          });
          spyOn(localStorage, 'setItem').andCallFake(function (key, value) {
            return store[key] = value + '';
          });
          spyOn(localStorage, "clear").andCallFake(function () {
              store = {};
          });
      });

        it('should call $http with proper config', function( ) {
            $httpBackend.expectPOST( 'api/stops', mockStop );
            service.saveHotStop( mockStop );
            $httpBackend.flush( );
        });
        
        it('should try to store the stop locally', function( ) {
            service.saveHotStop( mockStop );
            expect( localStorage.setItem ).toHaveBeenCalledWith( service.getStoragePrefix( ) + mockStop.route.Route, mockStop );
        });
    });
});
