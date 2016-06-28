FROM node:6.2.0

# add dumb-init for entrypoint to apps
COPY support/docker/dumb-init_1.0.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN mkdir -p /usr/src/stevenschobert.com
RUN mkdir -p /usr/share/nginx/html
WORKDIR /usr/src/stevenschobert.com

COPY lib/ lib/
COPY includes/ includes/
COPY layouts/ layouts/
COPY src/ src/
COPY package.json build.js redirects.json ./

RUN touch .env
RUN npm install

ENV BUILD_DIR /usr/share/nginx/html
ENV SKIP_CLEAN 1

VOLUME /usr/share/nginx/html

CMD ["dumb-init", "node", "build"]
