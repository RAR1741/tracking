# syntax = docker/dockerfile:1

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version and Gemfile
ARG RUBY_VERSION=3.3.1
FROM registry.docker.com/library/ruby:$RUBY_VERSION-bookworm as base

# Rails app lives here
WORKDIR /app

# Set production environment
ENV RAILS_ENV="production" \
    # BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"


# Throw-away build stage to reduce size of final image
FROM base as build

USER postgres
USER root

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libpq-dev \
    libvips \
    pkg-config

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

# Latest chromedriver to control browser tests
ARG DEBIAN_FRONTEND=noninteractive
SHELL ["/bin/bash", "-c"]
RUN SYSTEM_ARCH=$(arch | sed s/aarch64/arm64/) && \
    if [ "$SYSTEM_ARCH" = "amd64" ]; then \
      mkdir -p /etc/apt/keyrings && \
      curl -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | tee /etc/apt/keyrings/chrome.asc && \
      echo "deb [signed-by=/etc/apt/keyrings/chrome.asc arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google.list && \
      apt-get update && \
      apt-get install -y --no-install-recommends \
        google-chrome-stable && \
      rm -rf /var/lib/apt/lists/* && \
      CHROMEDRIVER_VERSION=$(curl https://chromedriver.storage.googleapis.com/LATEST_RELEASE) && \
      mkdir -p /opt/chromedriver-$CHROMEDRIVER_VERSION && \
      curl -sS -o /tmp/chromedriver_linux64.zip http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip && \
      unzip -qq /tmp/chromedriver_linux64.zip -d /opt/chromedriver-$CHROMEDRIVER_VERSION && \
      rm /tmp/chromedriver_linux64.zip && \
      chmod +x /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver && \
      ln -fs /opt/chromedriver-$CHROMEDRIVER_VERSION/chromedriver /usr/local/bin/chromedriver ; \
    else \
      apt-get update && \
      echo "============================ 1 =============================" && \
      apt-get install -y --no-install-recommends debian-archive-keyring && \
      echo "============================ 2 =============================" && \
      echo $'Explanation: Allow installing chromium from the debian repo. \n\
Package: chromium* \n\
Pin: origin "*.debian.org" \n\
Pin-Priority: 100 \n\
\n\
Explanation: Avoid other packages from the debian repo. \n\
Package: * \n\
Pin: origin "*.debian.org" \n\
Pin-Priority: 1 \n\
' > /etc/apt/preferences.d/debian-chromium && \
      cat /etc/apt/preferences.d/debian-chromium && \
      echo "============================ 3 =============================" && \
      apt-get update && \
      echo "============================ 4 =============================" && \
      apt-get install -y --no-install-recommends chromium chromium-driver && \
      echo "============================ 5 =============================" && \
      ln -s $(which chromium) /usr/bin/google-chrome && \
      echo "============================ 6 =============================" && \
      rm -rf /var/lib/apt/lists/* && \
      echo "============================ 7 =============================" && \
      echo "Chromium installed for $SYSTEM_ARCH" ; \
    fi

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libvips postgresql-client postgresql && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

# Run and own only the runtime files as a non-root user for security
# RUN useradd rails --create-home --shell /bin/bash && \
#     chown -R rails:rails db log storage tmp
# USER rails:rails

# Entrypoint prepares the database.
ENTRYPOINT ["/app/bin/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
CMD ["bin/start_server"]
