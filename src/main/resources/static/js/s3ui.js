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
		if ($scope.initial && !$scope.processing) {
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
		var regexp = /<(com\.[Tt].{0,2}[mM]obile\.[^>]+)>/g;
		var match = xml.match(regexp);
		
		if (match != null) {
			for (var i= 0; i< match.length; i++) {
				var className = match[i].substring(1, match[i].length -1);
				if (!className) return;
				
				var arr = className.split('.');
				
				var element = arr.pop();
				element = element.charAt(0).toLowerCase() + element.slice(1); // Make uppercase first letter
				
				var contexts = [];
				var url_arr = [];
				while (arr.length > 3) {
					contexts.push(arr.pop());
				}
				while (arr.length > 0) {
					url_arr.push(arr.pop());
				}	
				
				var xmlns = "http://" + url_arr.join(".") + "/" + contexts.join("/");
				var regEx = new RegExp("<" + className + ">");
				xml = xml.replace(regEx, "<" + element + ' xmlns="' + xmlns + '">');
				xml = xml.replace(new RegExp(className), element);
			}
		}

		var regEx = /<([^\s]+)\sclass=\"org.apache.xerces.jaxp.datatype.XMLGregorianCalendarImpl\"[\s\S]+<\/\1>/g;
		match = xml.match(regEx);
		if (match != null) {
			for (var i = 0; i < match.length; i++) {
				var datexml = match[i];
				var dateRegEx = /<([^\s]+)\sclass=[\s\S]+<year>(\d+)<\/year>[\s\S]+<month>(\d+)<\/month>[\s\S]+<day>(\d+)<\/day>[\s\S]+<timezone>([^<]+)<\/timezone>[\s\S]+<hour>(\d+)<\/hour>[\s\S]+<minute>(\d+)<\/minute>[\s\S]+<second>(\d+)<\/second>[\s\S]+<fractionalSecond>([^<]+)<\/fractionalSecond>[\s\S]+<\/\1>/;
				var m = datexml.match(dateRegEx);
				
				var tag = m[1];
				var year = m[2];
				var month = m[3];
				var day = m[4];
				var timezone = $scope.getTimezone(m[5]);
				
				var hours = m[6];
				var mins = m[7];
				var secs = m[8];
				var millisec = m[9] * 1000;
				
				var datestr = "<" + tag + ">" + year + "-" + $scope.format(month) + "-" + $scope.format(day) + "T" 
					+ $scope.format(hours) + ":" + $scope.format(mins) + ":" + $scope.format(secs) + "." + millisec + timezone + "</" + tag + ">";
				xml = xml.replace(datexml, datestr);
				//alert(datestr);
			}
		}
		
		$scope.setRequest(xml);
	}
		
	$scope.clearRequest = function() {
		$scope.setRequest($scope.initialReq);
		$scope.activeTabs[0]= true;
		$scope.activeTabs[1]= false;			
	}
	
	$scope.getTimezone = function(mins) {
		var hrs = Math.floor(mins / 60)
		mins = Math.abs(mins % 60);

		var symbol = (hrs < 0) ? '-' : '+';
		hrs = Math.abs(hrs);

		hrs = (hrs < 10) ? symbol + "0" + hrs : symbol + hrs;

		if (mins < 10) 
		   mins = "0" + mins;

		return hrs + ":" + mins;

	}
	
	$scope.format = function(num) {
		return num < 10 ? "0" + num : num.toString();
	}
});

