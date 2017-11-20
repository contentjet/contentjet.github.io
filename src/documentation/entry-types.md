---
title: Entry Types
layout: doc.ejs
order: 30
---
# Entry Types

An Entry Type describes the structure of your content. Unlike traditional content management systems, contentjet allows you to freely add custom fields to describe your content. There are 7 core field types to choose from with most fields supporting an additional format for a total of 13 possible field types!

So what is a format you ask? A format describes how the field should be presented in the UI and/or how it should be validated. For example, if you add a _Text_ field with it's format set to _email_ this tells the API to validate the field's value as an email address. Depending on the field type some formats cause the field to render differently in the UI. Take the _Long text_ field for example. When it's format is set to _markdown_ the contentjet UI will render a full-featured markdown editor as opposed to a standard textara for the _plaintext_ format.

## Text

Used for entering small amounts of text like people or product names.

Format | API validation
--- | ---
plaintext | No
email | Yes
uri | Yes

## Long text

Format | API validation
--- | ---
plaintext | No
markdown | No

## Boolean

## Number

Format | API validation
--- | ---
number | Yes
integer | Yes

## Date

Format | API validation
--- | ---
date | No
datetime | No

## Choice

Format | API validation
--- | ---
single | Yes
multiple | Yes

## Color

Format | API validation
--- | ---
rgb | Yes
rgba | Yes

## Media

## Link

## List
