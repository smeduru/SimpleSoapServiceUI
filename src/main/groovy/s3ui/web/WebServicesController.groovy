package s3ui.web;
import groovy.xml.XmlUtil

import org.apache.http.HttpResponse
import org.apache.http.client.HttpClient
import org.apache.http.client.methods.HttpPost
import org.apache.http.entity.StringEntity
import org.apache.http.impl.client.HttpClientBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

/**
 * Rest Controller for processing soap requestss.
 * @author Sreedhar Meduru
 *
 */
@RestController
@RequestMapping("/ws")
class WebServicesController {
	// Check application.properties file for the auth header info.
	@Value('${http.auth.header}')
	String authHeader
	
	@RequestMapping(method = RequestMethod.POST, value = "/soap")
	ResponseEntity process(@RequestBody Map requestMap) {
		String soapXML = requestMap['payload']
/*		println "============REQUEST:BEGIN============"
		println soapXML
		println "============REQUEST:END============"
*/
		def data = [:];

		try {
			String endPoint = requestMap['endpointURI'] 
			String soapAction = "\"${requestMap['soapAction']}\"" 

			HttpPost httppost = new HttpPost(endPoint)
			httppost.setHeader("Content-Type", "text/xml; charset=UTF-8")
			httppost.setHeader("Authorization", authHeader)
			httppost.setHeader("SOAPAction", soapAction)
			StringEntity se = new StringEntity(soapXML)
			httppost.setEntity(se)

			HttpClient client = HttpClientBuilder.create().build()
			HttpResponse response = client.execute(httppost)

			String key = 'response';
			if (response.getStatusLine().getStatusCode() == HttpStatus.OK.value()) {
				data['status'] = 'OK'
			}
			else {
				key = 'message'
				data['status'] = 'error';
				data['error'] = response.getStatusLine().toString();
			}
			BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

			StringBuffer result = new StringBuffer();
			String line = "";
			while ((line = rd.readLine()) != null) {
				result.append(line);
			}

			def xmlOutput = new StringWriter()
			XmlUtil.serialize result.toString(), xmlOutput
//			println "=============================================================="

			data[key] = xmlOutput.toString()
		}
		catch (Exception e) {
			data['status'] =  'error';
			
			StringWriter errors = new StringWriter();
			e.printStackTrace(new PrintWriter(errors));
			data['message'] = errors.toString();	
		}

		return new ResponseEntity(data, HttpStatus.OK);
	}
}