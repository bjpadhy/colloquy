FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Building code for production
RUN npm ci --only=production
RUN npm install pm2 -g

# Bundle app source
COPY . .

# ENV Variables
ENV PM2_PUBLIC_KEY ----REDACTED----
ENV PM2_SECRET_KEY ----REDACTED----
ENV NODE_ENV=production
ENV SESSION_SECRET=----REDACTED----
ENV MAIL_DOMAIN=----REDACTED----
ENV MAIL_API_KEY=----REDACTED----
ENV KEYFILE=----REDACTED----
ENV BUCKET=----REDACTED----
ENV PROJECT_ID=----REDACTED----
ENV DB_STRING=----REDACTED----
ENV REDISCLOUD_URL=----REDACTED----

EXPOSE 8080
CMD [ "npm", "start" ]
