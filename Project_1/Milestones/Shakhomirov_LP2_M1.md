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
  -u "AcqwlHa97zeM4UfiSLUIEtjJiZvVRjXsJwfBadd88nrseUXYbvuS38XM_5OWxD-wWgTq04fQHJBiB_it:EDRVq2kr566mx-o-TT_cENxoBeRn_XbfLaQROBiFUC0Tk7KI4fmqayt2TKzfHEMnq4njB3OCMj4Nnffn" \
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
  -H "Authorization: Bearer A21AAJ4KhZ2vnGTbsnsXfTGF8jqiGRI2w3zo8TVMIK6rJh4ImTHBOcx1L6C53LZuS-hBRAy1QflXk1BzOyti7Lkc0UtzmUciw"
~~~

- You will see something like this:
![result](img/s2-LP1-M1-1-access_token_test.png)

- Now try to mock some transaction data


* Hint for Step 1:

- Check PayPal API calls and create one to generate some sample order / transaction
~~~bash
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJ4KhZ2vnGTbsnsXfTGF8jqiGRI2w3zo8TVMIK6rJh4ImTHBOcx1L6C53LZuS-hBRAy1QflXk1BzOyti7Lkc0UtzmUciw" \
-d '{
  "intent": "AUTHORIZE",
  "purchase_units": [
    {
      "amount": {
        "currency_code": "GBP",
        "value": "100.00"
      }
    }
  ]
}'
~~~

- As a result you will see that some sample transaction was created:
![result](img/s2-LP1-M1-1-mock_pp_data.png)
- The response shows the status and other details, i.e. //api.sandbox.paypal.com/v2/checkout/orders/43J66938KW385645X Try to explore the API docs and see what you can supply to your request.

- Output example:
~~~bash
{"id":"3EH70075MA948892H","status":"CREATED","links":[{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3EH70075MA948892H","rel":"self","method":"GET"},{"href":"https://www.sandbox.paypal.com/checkoutnow?token=3EH70075MA948892H","rel":"approve","method":"GET"},{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3EH70075MA948892H","rel":"update","method":"PATCH"},{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3EH70075MA948892H/authorize","rel":"authorize","method":"POST"}]}
~~~

* Hint for Step 1:
- To approve your order use a Personal Sandbox account and follow the link [https://www.sandbox.paypal.com/checkoutnow?token=97T22805JR125823D](https://www.sandbox.paypal.com/checkoutnow?token=97T22805JR125823D)
- After customer approved it's order check it's status with this curl request:
~~~bash
curl -v -X GET https://api-m.sandbox.paypal.com/v2/checkout/orders/3EH70075MA948892H \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJ4KhZ2vnGTbsnsXfTGF8jqiGRI2w3zo8TVMIK6rJh4ImTHBOcx1L6C53LZuS-hBRAy1QflXk1BzOyti7Lkc0UtzmUciw"
~~~
and the output would be something like this:
~~~bash
{"id":"3EH70075MA948892H","intent":"CAPTURE","status":"APPROVED","purchase_units":[{"reference_id":"PUHF","amount":{"currency_code":"USD","value":"200.00","breakdown":{"item_total":{"currency_code":"USD","value":"180.00"},"shipping":{"currency_code":"USD","value":"20.00"}}},"payee":{"email_address":"sb-dzyfq6635758@business.example.com","merchant_id":"39AJCL7W5MRAJ"},"shipping":{"name":{"full_name":"John Doe"},"address":{"address_line_1":"Whittaker House","address_line_2":"2 Whittaker Avenue","admin_area_2":"Richmond","admin_area_1":"Surrey","postal_code":"TW9 1EH","country_code":"GB"}}}],"payer":{"name":{"given_name":"John","surname":"Doe"},"email_address":"sb-txsj26679103@personal.example.com","payer_id":"4U2VGYBFX8FH4","address":{"country_code":"GB"}},"create_time":"2021-07-03T08:17:59Z","links":[{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3TU82759JP640141X","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3TU82759JP640141X","rel":"update","method":"PATCH"},{"href":"https://api.sandbox.paypal.com/v2/checkout/orders/3TU82759JP640141X/capture","rel":"capture","method":"POST"}]}%
~~~
- If you are struggling with order approvals try [A PayPal Product API Executor](https://www.paypal.com/apex/home)
- Authorise your order, i.e. use curl `/v2/checkout/orders/{id}/authorize` .
- Capture payment for your order
~~~bash
curl -v -X POST https://api-m.sandbox.paypal.com/v2/checkout/orders/97T22805JR125823D/authorize \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJK6QjcnFSyhVkxKfYI9lqwvMtkg7yprBE1pcQkA_d8aDMVc4JeIEfgXyymkrJEBiPZ07w4crLwv-n1dTgVcBgqgM7HZA" \
-H "PayPal-Request-Id: 7b92603e-77ed-4896-8e78-5dea2050476a"
~~~

- Capture payment to complete transaction:
~~~bash
curl -X POST \
  'https://api.sandbox.paypal.com/v2/checkout/orders/3EH70075MA948892H/capture' \
  -H 'authorization: Bearer A21AAJ4KhZ2vnGTbsnsXfTGF8jqiGRI2w3zo8TVMIK6rJh4ImTHBOcx1L6C53LZuS-hBRAy1QflXk1BzOyti7Lkc0UtzmUciw' \
  -H 'content-type: application/json'
~~~

* Hint for Step 1:
When finally you have some completed transactions in your **Sandbox** you would want to use a **Reporting API**:

~~~bash
curl -v -X GET https://api-m.sandbox.paypal.com/v1/reporting/transactions?start_date=2021-07-01T00:00:00-0700&end_date=2021-07-30T23:59:59-0700&fields=all&page_size=100&page=1 \
-H "Content-Type: application/json" \
-H "Authorization: Bearer A21AAJ4KhZ2vnGTbsnsXfTGF8jqiGRI2w3zo8TVMIK6rJh4ImTHBOcx1L6C53LZuS-hBRAy1QflXk1BzOyti7Lkc0UtzmUciw"
~~~
- The output should be:
~~~bash
{"transaction_details":[],"account_number":"39AJCL7W5MRAJ","start_date":"2021-07-01T07:00:00+0000","end_date":"2021-07-01T08:59:59+0000","last_refreshed_datetime":"2021-07-01T08:59:59+0000","page":1,"total_items":0,"total_pages":0,"links":[{"href":"https://api.sandbox.paypal.com/v1/reporting/transactions?end_date=2021-07-30T23%3A59%3A59-0700&fields=all&start_date=2021-07-01T00%3A00%3A00-0700&page_size=100&page=1","rel":"self","method":"GET"}]}%
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
