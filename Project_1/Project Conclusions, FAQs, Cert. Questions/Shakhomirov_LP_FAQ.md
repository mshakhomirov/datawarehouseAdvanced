# FAQs


**I'm trying to run `./deploy.sh` from my command line but keep getting an error.**
**[ANSWER]** 
You might want to check your AWS CLI credentials. Another reason is that you might need to run `chmod +x deploy.sh` first providing correct acccess permissions.

**How do I run AWS Lambda locally on my machine?**

**[ANSWER]**
The solution will use `run-local-lambda` package to run Lambda locally. Check ./package.json for more info about the modules used. Simply run `$npm run test` from your command line.





**How do I deploy my AWS Lambda?**
**[ANSWER]**
There is a handy script to deploy your solution: `.bq-paypal-revenue/deploy.sh`
This will chain some AWS CLI commands to package and deploy your Lambda. Check those commands and try runing them separately from your command line.

**How do I generate PayPal sample transaction in my Sandbox account?**
In general the flow would be the following:
- Create PayPal [developer](https://developer.paypal.com/developer/applications) account
- Get access token [here](https://developer.paypal.com/docs/api/get-an-access-token-curl/)
- Run CURL to generate a sample order, i.e. `POST https://api-m.sandbox.paypal.com/v2/checkout/orders ...`
- Use [A PayPal Product API Executor](https://www.paypal.com/apex/home) to **approve** the order, This would emulate a customer accepting the order.
- Authorise your order, i.e. use curl `/v2/checkout/orders/{id}/authorize` .
- Capture payment to complete transaction, i.e. `POST 'https://api.sandbox.paypal.com/v2/checkout/orders/{orderId}/capture' `



**How do I get a PayPal Access token and run CURL requests with my AWS Lambda?**
**[ANSWER]** You would want to use npm module called `axios` for this (or any other suitable module for HTTPS requests):
Take a look at Hints for **Milestone 1**:

* Hint for Step 2:
You would want to use the following Node.js modules:
- **axios** to make HTTP requests to PayPal API
- **moment** to handle datetime data and parameters
- **aws-sdk** to save data to S3
- **run-local-lambda** to test your lambda locally

* Initialise a new Node.js app so you have a `./package.json` like this:
~~~js
{
  "name": "bq-paypal-revenue",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node app.js",
    "test": "export DEBUG=metrics; run-local-lambda --file app.js --event test/data.json --timeout 10000"
  },
  "directories": {
    "test": "test"
  },
  "devDependencies": {
    "aws-sdk": "2.804.0",
    "run-local-lambda": "1.1.1"
  },
  "main": "app",
  "dependencies": {
    "axios": "^0.21.1",
    "moment": "^2.20.1"
  }
}
~~~

* Your app directory would look like this:
![img/s2-LP1-M1-1-app_struct.png](https://mydataschool.com/liveprojects/img/s2-LP1-M1-1-app_struct.png)

* Hint for Step 2:
- use `./config.json` to separate your live and staging environments. For example:
~~~js
{ "Production": 
    {
      "Tables": [
        {
          "name" : "paypal_transaction"
        }
      ]
    }
  ,
  "Staging": 
    {
      "Tables": [
        
        {
          "name" : "paypal_transaction"
        }
    ]
    }

}
~~~

- create a file to configure your PayPal access token credentials and replace `"Basic *"` with your combination of **client_id** and **secret**, i.e.:

~~~js
{
    "config": {
        "method": "post",
        "url": "https://api-m.paypal.com/v1/oauth2/token",
        "headers": { 
        "Authorization": "Basic *", 
        "Content-Type": "application/x-www-form-urlencoded"
        },
        "data" : "grant_type=client_credentials"
  }
}

~~~




**I am trying to run `bq-paypal-revenue` Lambda locally and keep getting the same error:**
~~~json
{
    ...
    data: {
      error: 'invalid_token',
      error_description: 'The token passed in was not found in the system'
    }
  },
  isAxiosError: true,
  toJSON: [Function: toJSON]
}
~~~
**[ANSWER]**
This is most likely a credentials issue. Check your endpoint, i.e. `baseURL: 'https://api-m.paypal.com'`. If you are using a sandbox it will be: `baseURL: 'https://api-m.sandbox.paypal.com'`
Another reason might be that credentials supplied in `./bq-paypal-revenue/token_config.json` are not correct. You would want to pass your Base64 encoded string `clien_id:client_secret` to Authorization header. You will see your clien_id and client_secret values, appended to the text "Basic " in Headers as follows: ` "Authorization": "Basic QWNxd2xIYT....`. Use it to get access token using OAuth2.0. Read more about it [here](https://learning.postman.com/docs/sending-requests/authorization/).

Check the line 6:` "Authorization": "Basic QWNxd2xIYT....`. This part after "Basic " must be the same as in response after you did CURL to obtain authorisation token, i.e.:
*Auth request*
```shell
curl -v https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "client_id:secret" \
  -d "grant_type=client_credentials"

```

*Response:*
```shell
...
> POST /v1/oauth2/token HTTP/1.1
> Host: api-m.sandbox.paypal.com
> Authorization: Basic QWNxd2xIYTk3emVNNFVmaVNMVUlFdGpKaVp2VlJqWHNKd2ZCYWRkODhucnNlVVhZYnZ1...
```
This Authorization goes into ./bq-paypal-revenue/token_config.json.

