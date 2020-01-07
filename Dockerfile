FROM node:10.16.0

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install

RUN npm install -g sequelize-cli pg

EXPOSE 8080
EXPOSE 443

#Run the application.
CMD npm start