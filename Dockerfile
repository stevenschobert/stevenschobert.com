FROM dockerfile/nodejs

ADD . /stevenschobertdotcom
WORKDIR /stevenschobertdotcom

ENV PORT 3000
ENV ADMIN_PORT 3000
EXPOSE 3000

RUN \
  rm -rf ./node_modules && \
  npm install --unsafe-perm

ENTRYPOINT ["make"]
CMD ["start"]
