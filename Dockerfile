FROM node:26-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .
RUN npx prisma generate && npm run build

ENTRYPOINT ["npm", "run", "start:prod"]
