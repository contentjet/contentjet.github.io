---
title: Webhooks
layout: doc.ejs
order: 15
---

# Webhooks

Webhooks provide a way to trigger a remote URL in response to events as they occur in your projects. One common use-case would be to trigger the build of a static website whenever entries are created, updated or deleted.

Project admins can create webhooks via the UI by going to **Project Settings > Webhooks** then clicking **New Webhook**.

<img src="/images/webhook_modal.jpg" width="635.5" alt="Webhook modal" />

When an event occurs within a project a POST request will be sent to the URL of each Webhook subscribing to that event. The payload of the request will generally have a structure similar to the following:

```json
{
  "action": "update",
  "dateTime": "2018-07-20T05:26:47.568Z",
  "model": "entry",
  "project": {
    "id": 6,
    "name": "My Project"
  },
  "target": [
    {
      "id": 15
    }
  ],
  "webHook": {
    "id": 2,
    "name": "Webhook tester",
    "url": "https://webhook.site/ca57ab41-c795-45b0-86f8-83cc50899588"
  }
}
```

The example above tells us the Entry with id 15 within the Project with id 6 was updated. The payload also tells us the id of the webhook and the time the event was triggered which is important as the order which requests reach your URL is not guarunteed.

The payload is designed to provide enough information for the recipient server to react to the event. Usually the recipient server would process the event by requesting for the updated record via the Contentjet API and then doing something with the returned data such as generating a static website, sending an email, generating a PDF etc.

You can test your webhooks simply by using one of the many free request echoing services like [Webhook Tester](https://webhook.site/) or [Request Catcher](http://requestcatcher.com/).
