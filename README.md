# Web interface to SIM-CITY

[![Build Status](https://travis-ci.org/NLeSC/sim-city-web.svg?branch=develop)](https://travis-ci.org/NLeSC/sim-city-web)

Contains a Python JSON webservice and a Grunt/Angular website. It assumes that [SIM-CITY webservice](https://github.org/NLeSC/sim-city-webservice) is running at the location `/explore`, and that the service is using a CouchDB installation at `/couchdb` and that a WMS (Web Mapping Service) is running at location `/geoserver`. The web application is configured for Bangalore-MATSIM 0.3 simulations.

One way to achieve this is to set up nginx proxy configurations for each of the specified services, so the services can run on another port or remotely but be proxied to the current server and port.

## Build & development

Run `grunt` for building and `grunt serve` for preview. Use `./deploy.sh` for deployment on the web server.

## Testing

Running `grunt test` will run the unit tests with karma.
