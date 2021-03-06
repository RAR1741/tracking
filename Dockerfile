# base image
FROM node:latest

# set working directory
WORKDIR /app

EXPOSE 3000

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY docker-entry.sh .

# install and cache app dependencies
COPY package*.json /app/

# start app
CMD ["blitz", "dev"]