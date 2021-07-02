## Create a Lambda function to extract transaction data from PayPal API

**Objective**

You will learn how to connect various data sources using REST APIs and microservice architecture. In this tutorial you will create a Lambda function to extract revenue data from PayPal API and schedule it daily.


**Why is this milestone important to the project?**
This series covers a set of LPs explaining how to build a data warehouse with BigQuery as a central part of this diagram.

Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash
Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

Talking about data ingestion you would need to utilise tools like **Fivetran or Stitch** to extract and prepare 3rd party data sources but if you follow this tutorial you will become totally capable of doing it yourself.


**Workflow**
1. Create a PayPal account with developer access and a Sandbox
   - Go to [developer.paypal.com](https://developer.paypal.com/developer/applications) and create an **Application**. This would an integration for your Node.js app.
   - Create a **sandbox** account to integrate and test code in PayPal’s testing environment.
   - Try to populate your testing environment with some transaction data
   - Try to request this data from PayPal reporting API (use http request)

2. Create a **local** Node.js app called `bq-paypal-revenue` on your machine. This app will do the following:
   - Must connect to your PayPal account and use **PayPal API** Authorization token to extract transaction data for yesterday.
   - Must have a configuration file called `./config.json` which will contain the name of your BigQuery table you would want to update with new PayPal data.
   - Must POST http request to PayPal API to retrieve transaction data and `save` the result as JSON file into your `AWS S3` bucket.
   - Must be able to run locally with `npm run test` command 


**Deliverable**

The deliverable for this milestone is a working Node.js App which would be able to run locally and deploy to their AWS account as a lambda function.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [PayPal developer portal](https://developer.paypal.com)
* [AWS Lambda](https://aws.amazon.com/lambda/)

*help*

* Hint for Step 1:
- Use an access token to query PayPal API
- More info how to get an access token can be found [here](https://developer.paypal.com/docs/api/get-an-access-token-curl/)
or [here](https://developer.paypal.com/docs/api/get-an-access-token-postman/)




* Hint for step 1:
- Supply your Sandbox `client_id:secret` and create a CURL request
- Run it in your command line
~~~bash
curl -v https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "client_id:secret" \
  -d "grant_type=client_credentials"
~~~
->
~~~bash
curl -v https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "AeaiJ-O-6nGhow65KS12EWZ-A_5-A_KNJhI7_eNEHGwhzGJcvZ0etq31j2-rtlf_oBXBfXdoIcbZUdJq:EOzU77x4yfAZWYfxpaDu3r-WFVTIY5vO2S2MMMSAKywfj9IWcf8wyTDdWI2ZTrHnNnjH_fEO4gaUVHkO" \
  -d "grant_type=client_credentials"
~~~
![Output](img/s2-LP1-M1-1-access_token.png)
- Now use this access token to create another request to pull the transaction data you need. Re-use the access token until it expires. Then, get a new token.




* Hint for step 1:
~~~bash
curl -v -X GET https://api-m.sandbox.paypal.com/v2/invoicing/invoices?total_required=true \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Access-Token>"
~~~
-->
~~~bash
curl -v -X GET https://api-m.sandbox.paypal.com/v2/invoicing/invoices?total_required=true \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer A21AAJ8-wS4l75whQrkDVLVBxTr5nRnQu_9euYIxnPVDdL9V4gtfI1ox4btg6lCfii33jU6AyavkOomd1cJ3GViA-LZV3hl-A"
~~~

- You will see something like this:
![result](img/s2-LP1-M1-1-access_token_test.png)

- Now try to mock some transaction data


* Hint for Step 1:

- Check PayPal API calls and create one to generate some sample order / transaction
~~~bash
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJ8-wS4l75whQrkDVLVBxTr5nRnQu_9euYIxnPVDdL9V4gtfI1ox4btg6lCfii33jU6AyavkOomd1cJ3GViA-LZV3hl-A" \
-d '{
  "intent": "AUTHORIZE",
  "purchase_units": [
    {
      "amount": {
        "currency_code": "USD",
        "value": "100.00"
      }
    }
  ]
}'
~~~

- As a result you will see that some sample transaction was created:
![result](img/s2-LP1-M1-1-mock_pp_data.png)
- The response shows the status and other details, i.e. //api.sandbox.paypal.com/v2/checkout/orders/43J66938KW385645X Try to explore the API docs and see what you can supply to your request.

* Hint for Step 1:
When finally you have some completed transactions in your **Sandbox** you would want to use a **Reporting API**:

~~~bash
curl -v -X GET https://api-m.sandbox.paypal.com/v1/reporting/transactions?start_date=2021-07-01T00:00:00-0700&end_date=2021-07-30T23:59:59-0700&fields=all&page_size=100&page=1 \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJ8-wS4l75whQrkDVLVBxTr5nRnQu_9euYIxnPVDdL9V4gtfI1ox4btg6lCfii33jU6AyavkOomd1cJ3GViA-LZV3hl-A"
~~~


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
![img/s2-LP1-M1-1-app_struct.png](img/s2-LP1-M1-1-app_struct.png)

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

* Hint for Step 2:
- create a file called app.js:

~~~js
// 3rd party dependencies
const AWS = require('aws-sdk');
AWS.config.update({ region: "eu-west-1"});
const s3  = new AWS.S3();
const axios = require('axios');
const paypal = axios.create({
    baseURL: 'https://api-m.paypal.com'
  });
const moment    = require('moment');

// Config
const config = require('./config.json');
const tokenConfig = require('./token_config.json');

let pr = txt => { if (DEBUG) console.log(txt) };

exports.handler = async (event, context) => {
    pr("app.handler invoked with event "+ JSON.stringify(event,null,2));
    try {
        pr(`TESTING? : ${TESTING} ${typeof TESTING}`);
        
        let [bucket,tables] =  [ (TESTING==='true') ? BUCKET_TEST : BUCKET , (TESTING==='true') ? config.Staging.Tables : config.Production.Tables];
        pr(`BUCKET : ${bucket} TABLES: ${tables}`);
        
        let access_token = `Bearer A****B` //replace A****B with your token in staging.
        paypal.defaults.headers.common['Authorization'] = access_token;

        if (TESTING==='false') {
            let access_token = `Bearer ` + await getToken(tokenConfig.config);
            paypal.defaults.headers.common['Authorization'] = access_token;
        }

        context.succeed( await processEvent(event,tables,bucket) );
    } catch (e) {
        console.log("Error: "+JSON.stringify(e));
        context.done(e)
    }
};

~~~
- Now you you would want to create a function called `processEvent` to process an event that will trigger the function to extract transaction data from PayPal.


*partial solution*
 
This is a Partial solution for app.js:

~~~js
const DEBUG  = process.env.DEBUG;
const BUCKET_TEST = process.env.DB_BUCKET_TEST || "data-staging.your-bucket.aws";
const BUCKET = process.env.DB_BUCKET || "data.your-bucket.aws";
const KEY    = process.env.DB_KEY || "reconcile/";
const TESTING = process.env.TESTING || 'true';

const AWS = require('aws-sdk');
AWS.config.update({ region: "eu-west-1"});
const s3  = new AWS.S3();

// 3rd party dependencies
const axios = require('axios');
const paypal = axios.create({
    baseURL: 'https://api-m.paypal.com'
  });
const moment    = require('moment');

// Config
const config = require('./config.json');
const tokenConfig = require('./token_config.json');

let pr = txt => { if (DEBUG) console.log(txt) };

exports.handler = async (event, context) => {
    pr("app.handler invoked with event "+ JSON.stringify(event,null,2));
    try {
        pr(`TESTING? : ${TESTING} ${typeof TESTING}`);
        
        let [bucket,tables] =  [ (TESTING==='true') ? BUCKET_TEST : BUCKET , (TESTING==='true') ? config.Staging.Tables : config.Production.Tables];
        pr(`BUCKET : ${bucket} TABLES: ${tables}`);
        
        let access_token = `Bearer A****B` //replace A****B with your token in staging.
        paypal.defaults.headers.common['Authorization'] = access_token;

        if (TESTING==='false') {
            let access_token = `Bearer ` + await getToken(tokenConfig.config);
            paypal.defaults.headers.common['Authorization'] = access_token;
        }

        context.succeed( await processEvent(event,tables,bucket) );
    } catch (e) {
        console.log("Error: "+JSON.stringify(e));
        context.done(e)
    }
};

let processEvent = async (event,tables,bucket) => {
    let now = moment(); 
    let datePrefix = now.format("YYYY/MM/DD/HH/");
    let fileKey = now.format("mm").toString();
    pr(`datePrefix: ${datePrefix} fileKey: ${fileKey}`);

    let end_dt = moment().subtract({ hours: 24, minutes: 0}).format("YYYY-MM-DDT00:00:00-0000");
    let start_dt = moment().subtract({ hours: 48, minutes: 0}).format("YYYY-MM-DDT00:00:00-0000");
    
    pr(`start_dt: ${start_dt} <> end_dt: ${end_dt}`)

    let options = {

        url: '/v1/reporting/transactions',
        params: {
            start_date: start_dt,
            end_date: end_dt, 
            fields: 'all',
            page_size: 500,
        }
    }

    try {

        for (const table of tables) {
            
            let pages = await getSize(options.url, options);
            for (const page of Array(pages).keys()   ) {
                
                options.params.page = page+1;
                let rows = await getTransactionData(options.url, options); 

              
                let params = {
                    Bucket: bucket,
                    Key: KEY + table.name + '/' + datePrefix + table.name + fileKey + options.params.page,
                    Body: JSON.stringify(rows)
                };

                if (rows.length > 0) {
                    await s3.putObject(params).promise();
                    pr(`>> ${rows.length} rows from [table:${table.name}] have been saved to  [s3:${bucket} / ${JSON.stringify(params.Key)}]`);
        
                }
                else{
                    pr(`>> ${rows.length} rows from [table:${table.name}]. Didn't create an object @ [s3:${bucket} / ${JSON.stringify(params.Key)}]`);
                }

            }
            

        }

    } catch (error) {
        console.log('error: ', error);
    }

    return bucket;

};

async function getTransactionData(url,config) {
    try {
        // Query PayPal API and return all transaction_details as per request
    } catch (error) {
      console.error(error);
    }
}
;

async function getSize(url,config) {
    try {
        // Query PayPal API to figure out how big (how many pages) of your transaction data you would have in response.
    } catch (error) {
      console.error(error);
    }
}
;

async function getToken(config) {
    try {
        // Using ./token_config.json exchange with PayPal and get an access_token here
    } catch (error) {
        console.error(error);
    }
}
~~~



*full solution*

* Use a `./deploy.sh` to deploy your Lambda in AWS.
* Use command `npm run test` to run your locally.
* Full solution for app.js:
~~~js
const DEBUG  = process.env.DEBUG;
const BUCKET_TEST = process.env.DB_BUCKET_TEST || "data-staging.your-bucket.aws";
const BUCKET = process.env.DB_BUCKET || "data.your-bucket.aws";
const KEY    = process.env.DB_KEY || "reconcile/";
const TESTING = process.env.TESTING || 'true';

const AWS = require('aws-sdk');
AWS.config.update({ region: "eu-west-1"});
const s3  = new AWS.S3();

// 3rd party dependencies
const axios = require('axios');
const paypal = axios.create({
    baseURL: 'https://api-m.paypal.com'
  });
const moment    = require('moment');

// Config
const config = require('./config.json');
const tokenConfig = require('./token_config.json');

let pr = txt => { if (DEBUG) console.log(txt) };

exports.handler = async (event, context) => {
    pr("app.handler invoked with event "+ JSON.stringify(event,null,2));
    try {
        pr(`TESTING? : ${TESTING} ${typeof TESTING}`);
        
        let [bucket,tables] =  [ (TESTING==='true') ? BUCKET_TEST : BUCKET , (TESTING==='true') ? config.Staging.Tables : config.Production.Tables];
        pr(`BUCKET : ${bucket} TABLES: ${tables}`);
        
        let access_token = `Bearer A****B` //replace A****B with your token in staging.
        paypal.defaults.headers.common['Authorization'] = access_token;

        if (TESTING==='false') {
            let access_token = `Bearer ` + await getToken(tokenConfig.config);
            paypal.defaults.headers.common['Authorization'] = access_token;
        }

        context.succeed( await processEvent(event,tables,bucket) );
    } catch (e) {
        console.log("Error: "+JSON.stringify(e));
        context.done(e)
    }
};

let processEvent = async (event,tables,bucket) => {
    let now = moment(); 
    let datePrefix = now.format("YYYY/MM/DD/HH/");
    let fileKey = now.format("mm").toString();
    pr(`datePrefix: ${datePrefix} fileKey: ${fileKey}`);

    let end_dt = moment().subtract({ hours: 24, minutes: 0}).format("YYYY-MM-DDT00:00:00-0000");
    let start_dt = moment().subtract({ hours: 48, minutes: 0}).format("YYYY-MM-DDT00:00:00-0000");
    
    pr(`start_dt: ${start_dt} <> end_dt: ${end_dt}`)

    let options = {

        url: '/v1/reporting/transactions',
        params: {
            start_date: start_dt,
            end_date: end_dt, 
            fields: 'all',
            page_size: 500,
        }
    }

    try {

        for (const table of tables) {
            let pages = await getSize(options.url, options);
            for (const page of Array(pages).keys()   ) {
                options.params.page = page+1;
                let rows = await getTransactionData(options.url, options);
                pr(`page: ${options.params.page} has ${rows.length}`)
                pr(`Extracting from PayPal for [table:${table.name}] and saving to [s3:${bucket}]`);
                let params = {
                    Bucket: bucket,
                    Key: KEY + table.name + '/' + datePrefix + table.name + fileKey + options.params.page,
                    Body: JSON.stringify(rows)
                };

                if (rows.length > 0) {
                    await s3.putObject(params).promise();
                    pr(`>> ${rows.length} rows from [table:${table.name}] have been saved to  [s3:${bucket} / ${JSON.stringify(params.Key)}]`);
        
                }
                else{
                    pr(`>> ${rows.length} rows from [table:${table.name}]. Didn't create an object @ [s3:${bucket} / ${JSON.stringify(params.Key)}]`);
                }

            }

        }

    } catch (error) {
        console.log('error: ', error);
    }

    return bucket;

};

async function getTransactionData(url,config) {
    try {
        const response = await paypal.get(url,config);
        pr(`>> [getTransactionData] [total_pages]: ${response.data}` );
        
        return response.data.transaction_details;
    } catch (error) {
      console.error(error);
    }
}
;

async function getSize(url,config) {
    try {
        const response = await paypal.get(url,config);
        pr(`>> [getTransactionData] [total_pages]: ${response.data.total_pages}` );
        return response.data.total_pages;
    } catch (error) {
      console.error(error);
    }
}
;

async function getToken(config) {
    try {
        const response = await axios.request(config);

        return response.data.access_token;
    } catch (error) {
        console.error(error);
    }
}

~~~
