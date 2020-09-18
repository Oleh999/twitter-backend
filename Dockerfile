FROM node:alpine
RUN mkdir /twitter
WORKDIR /twitter
COPY . .
RUN npm install
CMD [ "npm", "run", "start:dev" ]
