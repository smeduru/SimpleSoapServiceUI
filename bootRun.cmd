java -jar build/libs/SimpleSoapServiceUI-1.0.jar -Dhttps.protocols="TLSv1" -Djdk.tls.client.protocols="TLSv1" -Djavax.net.ssl.trustStore=./cacerts


REM java -Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n \
       -jar build/libs/SimpleSoapServiceUI-1.0.jar