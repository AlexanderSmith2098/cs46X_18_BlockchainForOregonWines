FROM ubuntu:bionic
# It might not be necessary to install all of this NPM crap since node_modules is simply included in the image.
RUN apt-get install libstdc++6 -y
RUN apt-get update \
    && apt-get install gnupg -y
RUN apt-get upgrade -y
RUN apt-get install software-properties-common -y
RUN add-apt-repository ppa:ubuntu-toolchain-r/test -y
RUN apt-get dist-upgrade -y
WORKDIR /app
COPY . .
# COPY ["package.json", "package-lock.json*", "handler.js", "index.js", "node_modules", "./"]
ENV NODE_VERSION=12.0.0
RUN apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
COPY . .
#RUN npm install -y
CMD ["node", "index.js"]