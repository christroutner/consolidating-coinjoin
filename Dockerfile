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
RUN useradd -ms /bin/bash rest
RUN adduser rest sudo

#Set password to 'password' change value below if you want a different password
RUN echo rest:password | chpasswd

#Set the working directory to be the connextcms home directory
WORKDIR /home/rest

#Setup NPM for non-root global install
RUN mkdir /home/rest/.npm-global
RUN chown -R rest .npm-global
RUN echo "export PATH=~/.npm-global/bin:$PATH" >> /home/rest/.profile
RUN runuser -l rest -c "npm config set prefix '~/.npm-global'"

# Expose the port the API will be served on.
EXPOSE 3000


# Switch to user account.
USER rest
# Prep 'sudo' commands.
RUN echo 'password' | sudo -S pwd

# Clone the rest.bitcoin.com repository
WORKDIR /home/rest
RUN git clone https://github.com/Bitcoin-com/rest.bitcoin.com

# Switch to the desired branch. `master` is usually stable,
# and `stage` has the most up-to-date changes.
WORKDIR /home/rest/rest.bitcoin.com
RUN git checkout stage
# EDIT THE LINE ABOVE TO REFLECT THE BRANCH YOU WANT TO USE

# Install dependencies
RUN npm install

# Copy the config file.
# EDIT THESE LINES TO REFLECT THE CONFIG FILE YOU WANT TO USE
#COPY config/start-mainnet /home/rest/rest.bitcoin.com/start-mainnet
#RUN sudo chmod 775 /home/rest/rest.bitcoin.com/start-mainnet
COPY config/start-testnet /home/rest/rest.bitcoin.com/start-testnet
#RUN sudo chmod 775 /home/rest/rest.bitcoin.com/start-testnet


# Startup bitcore, insight, and the full node.
#CMD ["/home/rest/rest.bitcoin.com/start-mainnet"]
CMD ["/home/rest/rest.bitcoin.com/start-testnet"]
