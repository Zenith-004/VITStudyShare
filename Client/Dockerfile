FROM node:20

WORKDIR /db

COPY package*.json ./

RUN npm install

copy . .

ENV PORT=3000

EXPOSE 3000

CMD ["npm","start"]