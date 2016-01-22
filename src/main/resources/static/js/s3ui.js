var appLogger_ = angular.module('s3ui.main', [ 'ui.bootstrap']).controller('appLoggerCtrl', function($scope, $http, $window) {
	$scope.activeTabs = [ true, false ];
	$scope.endpointURI = "";
	$scope.soapAction = "";
	$scope.initialReq = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n<soap:Body>\n\n</soap:Body>\n</soap:Envelope>';
	$scope.payload = $scope.initialReq;
	$scope.message = "";
	$scope.processing = false
	$scope.initial=true;
		
	$scope.process = function() {
		$scope.processing = true
		$scope.message = "";
		$scope.setResponse("Processing ...");
		$scope.activeTabs[1]= true;
		$scope.activeTabs[0]= false;
		var data = { payload: $window.editor_req.getValue(), endpointURI: $scope.endpointURI, soapAction: $scope.soapAction };
		$http.post("/ws/soap/", data).success(function(data, status) {
			var resp = data.response;
			if (data.status != 'OK') {
				$scope.message = (data.error) ? data.error : "Error while processing SOAP Request";
				resp = data.message;
			}
			$scope.setResponse(resp);
			$scope.processing = false;
        });
	}
	
	$scope.isBtnDisabled = function() {
		return !$scope.endpointURI || !$scope.soapAction || $scope.processing ; 
	}
	
	$scope.setResponse = function(value) {
		$scope.setEditorValue($window.editor_resp, value);
	}
	
	$scope.initResponse = function() {
		if ($scope.initial) {
			$scope.initial = false;
			$scope.setResponse("SOAP Response/Errors goes here!");
		}
	}
	
	$scope.setRequest = function(value) {
		$scope.setEditorValue($window.editor_req, value);
	}

	$scope.setEditorValue = function(editor, value) {
		editor.setValue(value);
		setTimeout(function() {
            editor.refresh();
        }, 1);
	}
	
	$scope.tuneupXML = function() {
		var xml = $window.editor_req.getValue();
		
		// Customize your XML here.
		alert("You can customize payload here!");
		
		//$scope.setRequest(xml);
	}
		
	$scope.clearRequest = function() {
		$scope.setRequest($scope.initialReq);
		$scope.activeTabs[0]= true;
		$scope.activeTabs[1]= false;			
	}
});
