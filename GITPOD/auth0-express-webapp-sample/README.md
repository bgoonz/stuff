# Auth0 example app for Node.js and Gitpod

This is the example app from Auth0 for the express based version readily configured to work with Gitpod.

## Step 1

Got to your [Auth0](https://auth0.com) dashboard and in the applications section create a "regular web application".

> IMPORTANT!
>
> You need to add the following `Allowed Callback URLs`:
> 
> `https://*.ws-eu03.gitpod.io,https://*.ws-us03.gitpod.io` 

<img width="633" alt="Screenshot 2020-12-29 at 15 40 23" src="https://user-images.githubusercontent.com/372735/103291586-65905780-49ec-11eb-8766-f101d7a2b215.png">

## Step 2
Go to your [Gitpod settings](https://gitpod.io/settings) and add two environment variables:

```
AUTH0_CLIENT_ID={copy `Client ID` value from your application}
AUTH0_TENANT_URL=https://{copy `Domain` from your application}
```

<img width="1083" alt="auth0-settings" src="https://user-images.githubusercontent.com/372735/103289786-527b8880-49e8-11eb-9627-65ac35a60019.png">

## Step 3

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)
