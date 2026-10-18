---
title: How to Connect Corg.ly to a Slack Channel
section: howto
---

When a bark translation should be delivered to a Slack channel, subscribe that channel's incoming webhook to Corg.ly.

## Prerequisites

- Node.js 18 or newer.
- The `corgly` folder from this course.
- Port 3000 is free. SkillSwap uses the same port, so stop it first.
- A Slack incoming webhook URL, shaped like `https://hooks.slack.com/services/T000/B000/XXXX`.

## Do this

From the `corgly` folder:

```
node server.js
```

Save the following as `slack.mjs` in that folder. Put your own Slack URL in `url`.

```javascript
const response = await fetch('http://localhost:3000/v1/webhooks/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://hooks.slack.com/services/T000/B000/XXXX',
    events: ['pet.activity', 'pet.health']
  })
});
const body = await response.json();
console.log(response.status, body.webhook_id, body.status);
```

Then run it:

```
node slack.mjs
```

The demo stores the URL and returns it. It does not sign in to Slack and does not post a message.

## Check

The printout is `201 wh_001 active`. If `url` or `events` is missing, the status is 400 and no subscription is created.
