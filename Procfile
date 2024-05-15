web: bin/rails server -b "0.0.0.0"
release: bin/rake db:migrate && bundle exec bootsnap precompile app/ lib/ && bin/rails assets:precompile
