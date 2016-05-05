FROM node:0.12.13

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY app.js /usr/src/app/
COPY config.js /usr/src/app/
COPY services /usr/src/app/services

CMD [ "node", "app.js" ]
