FROM node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y unzip

COPY ./ /usr/src/app/

RUN npm i

EXPOSE 3000

CMD [ "node", "app.js" ]
