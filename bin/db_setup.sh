#!/bin/bash
set -e

# Tracking DB setup
docker-compose exec web-tracking bundle exec rake db:drop db:create db:migrate db:seed
