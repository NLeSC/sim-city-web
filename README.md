# Web interface to SIM-CITY

[![Build Status](https://travis-ci.org/NLeSC/sim-city-web.svg?branch=develop)](https://travis-ci.org/NLeSC/sim-city-web)

An AngularJS website for the [SIM-CITY project](https://www.esciencecenter.nl/project/sim-city). It assumes that [SIM-CITY webservice](https://github.com/NLeSC/sim-city-webservice) is running at the location `/explore`, and that the service is using a CouchDB installation at `/couchdb` and that a WMS (Web Mapping Service) is running at location `/geoserver`. The web application is configured for Bangalore-MATSIM 0.3 simulations (a private simulation repository).

One way to achieve this is to run all services on their own port or host, and set up nginx proxy configurations for each of the specified services so they appear to run on the same host and port. If needed, nginx can be set up to do HTTP(S) authentication.

## Build & development

Run `grunt` for building and `grunt serve` for a preview on port 9000. This preview does not include most dynamic elements since that requires the other services to run on the same port. Alternatively, a local nginx configuration can be set up to proxy all requested services to the local host (see for example `nginx.sample.conf`). Use `./deploy.sh` for deployment on the webserver. See the `deploy.sh` file for assumptions about the webserver configuration.

The directory layout largely follows Yeoman AngularJS with Grunt, while largely using [the Angular Style Guide provided by John Papa](https://github.com/johnpapa/angular-styleguide)

## Testing

Running `grunt test` will run the unit tests with karma.
