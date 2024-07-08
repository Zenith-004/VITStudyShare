FROM node:20

WORKDIR /server

COPY package*.json ./

RUN npm install

copy . .

ENV PORT=4000

EXPOSE 4000

CMD ["npm","start"]