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

