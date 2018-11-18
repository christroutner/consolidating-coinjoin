# Create a Dockerized Consolidating CoinJoin Server.
#

#IMAGE BUILD COMMANDS
FROM ubuntu:18.04
MAINTAINER Chris Troutner <chris.troutner@gmail.com>

#Update the OS and install any OS packages needed.
RUN apt-get update
RUN apt-get install -y sudo git curl nano gnupg

#Install Node and NPM
RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs build-essential

#Create the user 'rest' and add them to the sudo group.
RUN useradd -ms /bin/bash coinjoin
RUN adduser coinjoin sudo

#Set password to 'password' change value below if you want a different password
RUN echo coinjoin:password | chpasswd

#Set the working directory to be the home directory
WORKDIR /home/coinjoin

#Setup NPM for non-root global install
RUN mkdir /home/coinjoin/.npm-global
RUN chown -R coinjoin .npm-global
RUN echo "export PATH=~/.npm-global/bin:$PATH" >> /home/coinjoin/.profile
RUN runuser -l coinjoin -c "npm config set prefix '~/.npm-global'"

# Expose the port the API will be served on.
EXPOSE 5000


# Switch to user account.
USER coinjoin
# Prep 'sudo' commands.
RUN echo 'password' | sudo -S pwd

# Clone the rest.bitcoin.com repository
WORKDIR /home/coinjoin
RUN git clone https://github.com/christroutner/consolidating-coinjoin

# Switch to the desired branch. `master` is usually stable,
# and `stage` has the most up-to-date changes.
WORKDIR /home/coinjoin/consolidating-coinjoin

# Install dependencies
RUN npm install

# Start the application.
COPY start-production start-production
CMD ["./start-production"]

#CMD ["npm", "start"]
