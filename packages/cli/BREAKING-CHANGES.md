# n8n Breaking Changes

This list shows all the versions which include breaking changes and how to upgrade

## ???

### What changed?

To make it easier to use the data which the Slack-Node outputs we no longer return the whole
object the Slack-API returns if the only other property is `"ok": true`. In this case it returns
now directly the data under "channel".

### When is action necessary?

When you currently use the Slack-Node with Operations Channel -> Create and you use
any of the data the node outputs.

### How to upgrade:

All values that get referenced which were before under the property "channel" are now on the main level.
This means that these expressions have to get adjusted.

Meaning if the expression used before was:
```
{{ $node["Slack"].data["channel"]["id"] }}
```
it has to get changed to:
```
{{ $node["Slack"].data["id"] }}
```


## 0.37.0

### What changed?

To make it possible to support also Rocketchat on-premise the credentials had to be changed.
The `subdomain` parameter had to get renamed to `domain`.

### When is action necessary?

When you currently use the Rocketchat-Node.

### How to upgrade:

Open the Rocketchat credentials and fill the parameter `domain`. If you had previously the
subdomain "example" set you have to set now "https://example.rocket.chat".


## 0.19.0

### What changed?

The node "Read File From Url" got removed as its functionality got added to
"HTTP Request" node where it belongs.

### When is action necessary?

If the "Read File From Url" node gets used in any workflow.

### How to upgrade:

After upgrading open all workflows which contain a "Read File From Url" node.
They will have a "?" as icon as they are not known anymore. Create a new
"HTTP Request" node to replace the old one and add the same URL as the previous
node had (in case you do not know it anymore you can select the old node, copy
it and paste it in a text-editor, it will display all the data the node
contained). Then set the "Response Format" to "File". Everything will then
function again like before.


----------------------------


### What changed?

When "HTTP Request" property "Response Format" was set to "String" it did save
the data by default in the property "response". In the new version that can now
be configured. The default value got also changed from "response" to "data" to
match other nodes with similar functionality.

### When is action necessary?

When "HTTP Request" nodes get used which have "Response Format" set to "String".

### How to upgrade:

After upgrading open all workflows which contain the concerning Nodes and set
"Binary Property" to "response".


## 0.18.0

### What changed?

Because of a typo very often `reponse` instead of `response` got used in code. So also on the Webhook-Node. Its parameter `reponseMode` had to be renamed to correct spelling `responseMode`.

### When is action necessary?

When Webhook-Nodes get used which have "Response Mode" set to "Last Node".

### How to upgrade:

After upgrading open all workflows which contain the concerning Webhook-Nodes and set "Response Mode" again manually to "Last Node".


----------------------------

### What changed?

Because the CLI library n8n used was not maintained anymore and included
packages with security vulnerabilities we had to switch to a different one.

### When is action necessary?

When you currently start n8n in your setup directly via its JavaScript file.
For example like this:
```
/usr/local/bin/node ./dist/index.js start
```

### How to upgrade:

Change the path to its new location:
```
/usr/local/bin/node bin/n8n start
```
