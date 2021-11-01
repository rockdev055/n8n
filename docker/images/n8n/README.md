## n8n - Workflow Automation

![n8n.io - Workflow Automation](https://n8n.io/n8n-logo.png)

n8n is a free node based "Open Source" (with Commons Clause)
Workflow Automation Tool. It can be self-hosted, easily extended, and
so also used with internal tools.

<a href="https://n8n.io/n8n-screenshot.png"><img src="https://n8n.io/n8n-screenshot.png" width="550" alt="n8n.io - Screenshot"></a>

Is still in beta so can not guarantee that everything works perfectly. Also
is there currently not much documentation. That will hopefully change soon.

## Demo

A short demo (< 3 min) which shows how to create a simple workflow which
automatically sends a new Slack notification every time a Github repository
received or lost a star:

[https://www.youtube.com/watch?v=ePdcf0yaz1c](https://www.youtube.com/watch?v=ePdcf0yaz1c)



## Start n8n in Docker

```
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  n8nio/n8n
```

You can then access n8n by opening:
[http://localhost:5678](http://localhost:5678)


## Start with tunnel

To be able to use webhooks which all triggers of external services like Github
rely on n8n has to be reachable from the web. To make that easy n8n has a
special tunnel service which redirects requests from our servers to your local
n8n instance.

To use it simply start n8n with `--tunnel`

```
docker run -it --rm \
  --name n8n \
  --init \
  -p 5678:5678 \
  -v ~/.n8n:/root/.n8n \
  n8nio/n8n \
  n8n start --tunnel
```

## Persist data

The workflow data gets by default saved in an SQLite database in the user
folder (`/root/.n8n`). That folder also additionally contains the
settings like webhook URL and encryption key.

```
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/root/.n8n \
  n8nio/n8n
```

## Use with MongoDB

Instead of SQLite, it is also possible to run n8n with MongoDB.

It is important to still persist the data in the `/root/.n8` folder. The reason
is that it contains n8n user data. That is the name of the webhook
(in case) the n8n tunnel gets used and even more important the encryption key
for the credentials. If none gets found n8n creates automatically one on
startup. In case credentials are already saved with a different encryption key
it can not be used anymore as encrypting it is not possible anymore.

Replace the following placeholders with the actual data:
 - MONGO_DATABASE
 - MONGO_HOST
 - MONGO_PORT
 - MONGO_USER
 - MONGO_PASSWORD

```
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/root/.n8n \
  n8nio/n8n \
  n8n start \
  --NODE_CONFIG='{\"database\":{\"type\":\"mongodb\", \"mongodbConfig\":{\"url\":\"mongodb://MONGO_USER:MONGO_PASSWORD@MONGO_SERVER:MONGO_PORT/MONGO_DATABASE\"}}}'"
```

A full working setup with docker-compose can be found [here](../../compose/withMongo/README.md)


## License

n8n is licensed under **Apache 2.0 with Commons Clause**
