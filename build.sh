#!/bin/bash 

set -ex

rm -fr yelpcamp.zip
zip -r yelpcamp.zip *

docker build -t bzon/node-yelp-camp:latest .

rm -fr yelpcamp.zip