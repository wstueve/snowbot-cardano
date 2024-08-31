<!-- This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
For more information, please refer to <http://unlicense.org/> -->
# Solution Overview

This solution makes use of nextjs, tailwind, prisma and mesh Cardano frameworks to create a web application which allows users to
stake coins and NFT's and get rewards in return.

# Prerequisites
node is the application runtime.
```bash
brew install node
```

yarn is the package manager. don't use npm
```bash
brew install yarn
```

npx is required to run the prisma commands. To install npx run the following command to make it globally available.
```bash
yarn global add npx
```

# Local Environment Setup

## Install the google cloud cli
```bash
brew install google-cloud-sdk
```

## login to the google cloud and get the `.env` and `.env.local`
```bash
gcloud auth login
./infra/get-env.sh
```

Update the secret when this file changes to get changes to other devs. Only the `.env.local` is saved.
```bash
gcloud auth login
./infra/set-env.sh
```

This is not needed, but is how the keys were made for the environments.
*generate your CLOAK_MASTER_KEY*
```cloak generate```
*and put it inside of `.env`*

# Database Setup
Version of the db is not so important as we utilize an orm: prisma.
```bash
brew install postgresql@15
brew services start postgresql@15
```
Your user name will be your mac login without a password. Set the password after you login.

Server -> AddServer
localhost
<mac_login>
*no password*

```sql
ALTER ROLE <mac_login>
	PASSWORD 'xxxxxx';
```

Add the application login and then create the snowbot database:
```sql
CREATE ROLE <snowbot_login> WITH
	LOGIN
	NOSUPERUSER
	CREATEDB
	CREATEROLE
	INHERIT
	NOREPLICATION
	CONNECTION LIMIT -1
	PASSWORD 'xxxxxx';
```

```sql
CREATE DATABASE snowbot
    WITH
    OWNER = <snowbot_login>
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```

You must next install all the application packages so that you can migrate your database and then seed it.
```bash
./.infra/apply-migrations.sh
npx prisma db seed
```

You must also do this when you pull new migrations from the repo. The seed must be rerun if the metadata changes or the seed scripts are modified.

Run this command to generate the typescript lib from the model:
```bash
npx prisma generate
```

Apply any migrations not applied. 
```bash
npx prisma migrate deploy
```

Create the db migrations:
```bash
npx prisma migrate dev
```


# Running the Application

To run the application:
```bash
yarn dev
```

And open https://localhost:3030.

# Prisma

Prisma is used to create the database schema and to generate the client code.  The schema is defined in the schema.prisma file with databases separated by folders.

This solution uses two databases, one for the auth and one for the raffle.  The auth database is used to store the user information and the raffle database is used to store the raffle information.

## Code Generation
These commands will generate the client code for the auth/raffle databases.  The client code is used to access the databases.
```bash
npx prisma generate --schema=./prisma/schema.prisma
```

## Apply Migrations
These commands will apply the updates to the database.  This is used to deploy the schema to the database.
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

Run both sets of the above commands to deploy the schema to the database.  Do this when there are new migrations pulled or to init your local database.

## Create Migrations
These commands will checkpoint the schema and create or update a migration. So, change the schema.prisma file and then run the following commands to create a new migration which other devs can use to update their database.  Also, it will be run on the server when the application is deployed.
```bash
npx prisma migrate dev --schema=./prisma/schema.prisma --name MIGRATION_DESC_HERE
```

Docker is not used to host the app unless it's deployed to cloud run.

More info on prisma here:
https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/connect-your-database-typescript-postgres

Preprod:
https://preprod.snowbot.cloud
