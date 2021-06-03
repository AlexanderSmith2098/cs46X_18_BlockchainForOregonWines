# cs46X_18_BlockchainForOregonWines
Setup:

NOTE: You need to have Docker installed on your system in order to run the docker-compose.yaml file.

Make sure you're in the root of the directory of the project and type in:

docker-compose up --build -d

This creates containers for a single node, the transaction processor, and a mongodb.

If you want to work on the winery client, comment out the "client1" chunk of code in the docker-compose.yaml file.  Then run the docker-compose file as written above.
You'll have to start the winery client manually if you do that.  Navigate to the client folder and type in:

nodemon -L index.js

If you want to work on the customer client, comment out the "client2" chunk of code in the docker-compose.yaml file.  Then run the docker-compose file as written above.
You'll have to start the customer client manually if you do that.  Navigate to the custClient folder and type in:
nodemon -L index.js

NOTE: Running either of the clients outside of Docker is ... really complicated and requires a fair amount of setup.  The Sawtooth-sdk module has a lot of dependencies, and requires a fairly specific environment.  Detailing how to do this is beyond the scope of this readme (since it changes so much depending on the user's OS and such).

When you are finished coding/developing/whatever, simply type docker-down (it doesn't matter where your terminal is currently at).

Whenever you want to start everything up again, simply type:
docker-compose up -d
into a terminal.  Both the UP and DOWN commands will work as long as you're in the directory (or a child directory) that contains the docker-compose.yaml.

Wine batch data will not persist (I couldln't figure out how to do this).  However mongodb data for both the customer and winery clients will.


Our project consists of these components:

1:     A node (the docker-yaml file containerizes all of the components of the node) = The node was constructed using the Hyperledger Sawtooth     javascript SDK.  It has a REST-api and a validator. 
    The REST-api receives requests from our applications and sends them to the validator.  The validator checks the permissions
    of the signing key used to sign an received batch.  Additionally, it uses the attached digital signature to check the integrity
    of data.  Also, it checks the structure of a batch.  It also (along with the transaction processor) manages the state database and the
    blockchain.  After making these checks, it transmits the transactions in the batch (which have been unwrapped) to the transaction processor.

2:  Transaction Processor (This is in the processor folder) = We wrote our transaction processor using JS and Node.js.  It takes incoming transactions and runs them through a series of "business rules".
    Essentially, it determines whether an incoming transaction is valid or invalid.  If it is valid, it updates the state and notifies the validator that the transaction
    is complete.  If the transaction is invalid, the transaction processor communicates this to the validator (but the state database isn't updated).

3:  Winery Client (this is in the client folder) = The winery client was written using JS and Node.js.  It is a web application that allows wineries to interact with the blockchain.  Wineries can fetch wine info from the blockchain and
    create, delete, and edit wine batches that have been added to the blockchain.  Also, QR codes can be generated from wine batches.  When scanned, these QR codes contain URLs that lead to the Customer Client.  The Customer Client will
    display information about the wine batch that was used to generate the QR code.

4:  Customer Client (this is in the custClient folder) = The customer client fetches information from the blockchain (it uses an address that is
    included as a parameter in the url in the QR code) and then displays it for the customer.

![](projecto.PNG)
