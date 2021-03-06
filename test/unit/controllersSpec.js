'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
	var q         =  null;
	var $scope    =  null;
	var ctrl      =  null;
	var uService  =  {};
	var nTService = {};
	var aflash    =  {};
	var rS        =  {};
	var loc       =  {};
	var mockStop = {
		route : { Route : "999" },
		direction : { Text : "mockDirection" },
		stop : { Text : "mockStop" }
	};
	var mockDeparture = { Actual : true, DepartureText : "99 min" };



  beforeEach( module('myApp.controllers', 'myApp.services', 'flash' ) );


	describe( 'LoginCtrl', function ( ) {
		var validRsp =  { "data" : { "success" : true, "message" : "foobar" } },
			failRsp  =  { "data" : { "success" : false, "message" : "failed" } };

		beforeEach( inject( function( $rootScope, $controller, userService, flash, $q, $location) {
			$scope  =  $rootScope.$new( );
			$scope.username  =  'foo';
			$scope.password  =  'bar';

			spyOn( userService, 'getSessionUser' ).andReturn( $q.defer( ).promise );

			ctrl = $controller('LoginCtrl', {
				$scope       :  $scope,
				userService  :  userService,
				flash        :  flash,
				$rootScope   :  $rootScope,
				$location    :  $location
			});

			// Hang on for spying
			q         =  $q;
			uService  =  userService;
			aflash    =  flash;
			rS        =  $rootScope;
			loc       =  $location;
		}));

		describe( 'when receiving a good user and pass', function( ) {
			beforeEach( function( ) {
				spyOn( uService, 'login' ).andCallFake( function( user, pass ) {
					var deferred = q.defer( );
					validRsp.data.user = user;
					deferred.resolve( validRsp );
					return deferred.promise;
				});
			});

			it( 'should set the user on $rootScope', function( ) {
				$scope.authenticate( );
				// Applies the resolution of the promise.
				rS.$apply( );
				expect( rS.user ).toEqual( $scope.username );
			});

			it( 'should flash a message', function( ) { } );
			it( 'should change the location', function( ) { } );
		});
	});

	describe( 'hotStopCtrl', function ( ) {

		beforeEach( inject( function( $rootScope, $controller, userService, nexTripService, flash, $q ) {
			$scope  =  $rootScope.$new( );
			
			var deferred = $q.defer( );
			deferred.resolve( [mockStop] );
			spyOn( userService, 'getHotStops' ).andReturn( deferred.promise );

			ctrl  =  $controller( 'hotStopCtrl', {
				$scope          :  $scope,
				userService     :  userService,
				nexTripService  :  nexTripService,
				flash           :  flash,
				$rootScope      :  $rootScope,
			});
			// Save for spying
			q         =  $q;
			uService  =  userService;
			nTService = nexTripService;
			aflash    =  flash;
			rS        =  $rootScope;
		}));

		it( 'should try to get stops on load', function ( ) {
			expect( uService.getHotStops ).toHaveBeenCalled( );
			$scope.$apply( );
			expect( $scope.HotStops ).toEqual( [mockStop] );
		});

		it( 'should get departures for a HotStop at a given index', function ( ) {
			$scope.$apply( );
			
			var def  =  q.defer( );
			def.resolve( [mockDeparture] );
			spyOn( nTService, 'getDepartures' ).andReturn( def.promise );

			$scope.showDepartures( 0, mockStop );
			$scope.$apply( );

			expect( $scope.HotStops[0].departures ).toEqual( [mockDeparture] );
		});

	});

});

