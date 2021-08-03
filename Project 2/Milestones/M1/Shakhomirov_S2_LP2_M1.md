##  Build ingestion service with AWS Lambda and set up a trigger

**Objective**

* Create a simple yet effective microservice for data ingestion into your BigQuery data warehouse.


**Why is this milestone important to the project?**

- You will learn how to deploy such microservice to ingest files from *S3* so each event itself triggers the ingestion as soon as data file lands in your S3 bucket.
- You will learn how to process the data inside those files and adjust it for *BigQuery* so it could insert it into tables.
- You will set up a logic to check if the files have been already ingested to prevent duplicates. 


## App logic would be the following:
- AWS Cloudwatch event will trigger Lambda each time new file lands in *S3 bucket*.
- Lambda will get BigQuery credentials from `./your-service-account.json` file and authenticate with the service.
- Then Lambda will evaluate the size of this file and if it is too big it will paginate it.
- Looping through each table in `./config.json` Lambda will perform a batch insert operation into a relevant table in **BigQuery**.

**Workflow**

**[1]. Build ingestion service with AWS Lambda and set up a trigger**
[1.1] Create a new S3 bucket, i.e. `your-bigquery-project-name.test.aws`. 

~~~bash
aws s3 mb s3://bq-shakhomirov.bigquery.aws
~~~
you will something like: `$ make_bucket: bq-shakhomirov.bigquery.aws` confirming bucket was created.
[Read AWS S3 documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-s3-commands.html#using-s3-commands-managing-buckets-creating)

- Copy and upload the datasets from `./data` to your newly created S3 bucket:
~~~bash
$ cd data
$ aws s3 cp ./data/payment_transaction s3://bq-shakhomirov.bigquery.aws/payment_transaction
$ aws s3 cp ./data/paypal_transaction s3://bq-shakhomirov.bigquery.aws/paypal_transaction
~~~

[1.2] Create an empty AWS Lambda function (Node.js). You can do it using *AWS web console* or *AWS CLI*. It is up to you and initialise your `Node.js` app locally.

- you would want to read your dataset files from your **S3 data bucket** and then import that data into your **BigQuery** datawarehouse. So you will need to grant your Lambda function **S3 access** to your bucket like so:
~~~json
{
  "roleName": "your-lambda-role-sea956ms",
  "policies": [
    {
      "name": "AmazonS3FullAccess",
      "id": "ANPAIFIR6V6BVTRAHWINE",
      "type": "managed",
      "arn": "arn:aws:iam::aws:policy/AmazonS3FullAccess",
      "document": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": "*"
          }
        ]
      }
    },
....
~~~
- your microservice folder structure must look like this:
~~~bash
$ (base) Mikes-MBP:bq-ingest-manager mikeshakhomirov$ tree --dirsfirst -L 3

.
└── stack
    └── bq-ingest-manager
        ├── node_modules
        ├── test
        ├── tmp
        ├── app.js
        ├── bq-shakhomirov-service-account-credentials.json
        ├── config.json
        ├── deploy.sh
        ├── package-lock.json
        ├── package.json
        └── readme.md
~~~
- install required `node` modules and libraries as in `./package.json`. You will need:
* "aws-sdk": "2.804.0" to access S3 bucket with data
* "run-local-lambda": "1.1.1" to test nad run your Lamdba locally
* "@google-cloud/bigquery": "^5.7.0" to ingest data
* "moment": "^2.24.0" to process dates and to create relevant `file names` / `BigQuery jobIds`
- in your ./app.js add *async processEvent()* function to handle the events.

[FAQ_1] Why do I need exact node module versions?

[FAQ_2] What is `npm ci` and why can't I just use `npm install` instead?

[1.3] Make sure you can run it locally.
- Add 3rd party dependencies in the beginning of your Lambda:
~~~js
// 3rd party dependencies
const moment = require('moment');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const s3 = new AWS.S3();
~~~
- add this bit inside your *processEvent* function and test your Lambda locally:
~~~js
    let data = await s3.getObject({Bucket: bucket, Key: table.fileKey}).promise();
    console.log( JSON.parse(new Buffer(data.Body).toString()));
~~~
Output must be your `json` transaction from data file in **S3**.

- Now add *BigQuery* library and try to create your first testing table and upload just one data sample in `streaming` mode like so:
~~~js
// 3rd party dependencies
const moment = require('moment');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const s3 = new AWS.S3();
const { BigQuery } = require('@google-cloud/bigquery');

// add config.json here:
...
const bigquery = new BigQuery({
    projectId: config.Staging.gcpProjectId,
    credentials: {
        client_email: config.Staging.gcpClientEmail,
        private_key: bigQueryCreds.private_key,
    },
});

exports.handler = async(event, context) => {
    try {
        // define you const [bucket, tables, key]  depending on environment here:
        ...

        const data = await processEvent(event, tables, bucket, key);
        context.succeed(data);
    } catch (e) {
        console.log(e);
        context.done(e);
    }
}

const processEvent = async(event, tables, bucket, key) => {
    ...
    await createBigQueryTablePartitioned();
    await loadTestDataFromStreamJSON();

}

const createBigQueryTablePartitioned = async() => {
    const schema = 'transaction_id:INT64, user_id:INT64, dt:date';

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
    const options = {
        schema: schema,
        location: 'US',
        timePartitioning: {
            type: 'DAY',
            expirationMs: '7776000000',
            field: 'dt',
        },
    };
    const datasetId = 'source';
    const tableId = 'simple_transaction';

    // Create a new table in the dataset
    const [table] = await bigquery
        .dataset(datasetId)
        .createTable(tableId, options);
    console.log(`Table ${table.id} created with partitioning: `);
    console.log(table.metadata.timePartitioning);

    return table.id;
};

const loadTestDataFromStreamJSON = async() => {

    const datasetId = 'source';
    const tableId = 'simple_transaction';

    const jsonData = [{
        'transaction_id': 100,
        'user_id': 999,
        'dt': '2021-08-01',
    },
    {
        'transaction_id': 101,
        'user_id': 999,
        'dt': '2021-08-01',
    }
    ];

    const job = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .insert(jsonData)
        .then((data) => {
            const apiResponse = data;
            console.log(`apiResponse:: ${apiResponse}`);
        })
        .catch((err) => { console.log(`err: ${err}`); });
};




~~~
![Result](mydataschool.com/liveprojects/img/s2-LP2-M1-1.png)

- `streaming` is good but might incure higher costs. Try `batch` insert instead. It has a daily quota of 2000 inserts per table but you can insert a whole file in one go. Streaming insert is extremely cheap, $0.05 per GB that's $50 for 1TB. Not sure how much volume you have, but usually people are not building around streaming insert because it's better suited. Streaming insert is the recommended way to import data, as it's scalable, it

[1.4] Add *S3 bucket trigger* to your Lambda function so each new *object created* in that bucket it would trigger the **Lambda**.
[1.5] Add `@google-cloud/bigquery` Node.js library to your `package.json` and try running your first query using your **Lambda** programmatically.
[1.6] Add a function to process event that would be responsible for handling the data when it appears in your bucket.
[1.7] Modify your `processEvent` function to handle the data contained in a file and perform a **batch** insert in one of your **BigQuery** tables.


**Deliverable**

The deliverable for this milestone is a working Lambda function.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.

It must be run by using the following commands from your repo:
~~~bash
$ npm ci
$ npm run test
~~~



**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [INSERT A TARGETED READING FROM MANNING RESOURCES, POINTING THE LEARNER TO A FEW PARAGRAPHS, A SECTION, OR A LISTING THAT DESCRIBES WHAT THE LEARNER IS SUPPOSED TO DO TO FIND THE SOLUTION. TELL THE READER WHY THEY ARE READING THIS SELECTION-DON'T JUST LIST THE RESOURCE]
* [INSERT EXTERNAL RESOURCE THAT DESCRIBES WHAT THE LEARNER IS SUPPOSED TO DO TO FIND THE SOLUTION-TELL THE READER WHY THEY ARE READING THIS SELECTION-DON'T JUST LIST THE RESOURCE]



*help*


*Hint for Step [1.3]*
You can load additional data into a table either from **source files** in **Google Cloud Storage** or by **appending** query results. Note that the schema of the loaded data must match the schema of the existing table, but you can update the schema before appending.

[Read How to create BigQuery Load Jobs](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createLoadJob)
[Read about Google File object](https://googleapis.dev/nodejs/storage/latest/Bucket.html#file)
[Read Google Codelabs](https://codelabs.developers.google.com/codelabs/cloud-bigquery-nodejs#9)


* Add this function to `processEvent()` and it will process New line delimited file `./data/simple_transaction`
~~~js
const loadTestDataFromLocalFileJSON = async() => {

    const datasetId = 'source';
    const tableId = 'simple_transaction';

    // Configure the load job. For full list of options, see:
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad
    const metadata = {
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        schema: {
            fields: [
                { name: 'transaction_id', type: 'INT64' },
                { name: 'user_id', type: 'INT64' },
                { name: 'dt', type: 'DATE' },
            ],
        },
        location: 'US',
        writeDisposition: 'WRITE_APPEND',
    };

    await bigquery
        .dataset(datasetId)
        .table(tableId)
        .createLoadJob('./simple_transaction', metadata).then((data) => {
            const job = data[0];
            console.log(`Job ${job} completed.`);

            const apiResponse = data[1];
            console.log(`apiResponse ${apiResponse} .`);
        });
~~~
This function will create a load job from local file and perform a `batch` uplod in streaming mode (memory effective manner).

*Hint for Step 1.3*
In order to upload data from your S3 bucket you would want to create a *readable* stream from it and then create a *writeable* stream that would insert data into BigQuery table.
[Read about JSONstream module](https://github.com/dominictarr/JSONStream)
[Read about BigQuery CreateWriteStream](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createWriteStream)
[Read about job configuration load](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
Add this function to your processEvent() collection:
~~~js
const loadFIleFromS3 = async() => {
    return new Promise((resolve, reject) => {
        const dataset =  bigquery.dataset('source');//'source';
        // console.log(`datasetId: ${JSON.stringify(datasetId)}`);
        const tableId = 'simple_transaction';
        const table = dataset.table(tableId);

        let recordsProcessed = 0;

        const params = { Bucket: 'bq-shakhomirov.bigquery.aws', Key: 'simple_transaction' };
        const request = s3.getObject(params);
        const s1 = request.createReadStream();
        s1.pipe(JSONStream.parse(true))
            .pipe(JSONStream.stringify(false))
            .pipe(table.createWriteStream('json'))
            .on('job', (job) => {
            // `job` is a Job object that can be used to check the status of the
            // request.
            })
            .on('complete', (job) => {
                console.log(`job completed`);
                resolve();
            // The job has completed successfully.
            });

            // .on('data', (d) => { console.log(d); ++recordsProcessed; })
            // .on('close', () => { resolve(recordsProcessed); })
            // .on('error', () => { reject(); });

    });
};
~~~

`npm run test` and this will create a load job with BigQuery `createWriteStream` function. From dataloading angle it is still one job (not streaming insert) but from architecture angle it is memory efficient and is free. You just need to not exceed the quota for batch job per table per day.


*partial solution*
 
Here is the `app.js` for this milestone. Download this file, use it to develop your solution, and upload your deliverable.
You will have to create your own BigQuery service account credentials `./bq-shakhomirov-b86071c11c27.json` and `./config.json`
~~~js
const DEBUG = process.env.DEBUG;
const TESTING = process.env.TESTING || 'true';

// 3rd party dependencies
const moment = require('moment');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const s3 = new AWS.S3();
const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const stream = require('stream');
const through2 = require('through2');
const fs = require('fs');
const { BigQuery } = require('@google-cloud/bigquery');
const JSONStream = require('JSONStream');

// Local dependencies
const config = require('./config.json');
const bigQueryCreds = require('./bq-shakhomirov-b86071c11c27.json');

const pr = (txt) => { if (DEBUG) { console.log(txt); } };

const bigquery = new BigQuery({
    projectId: config.Staging.gcpProjectId,
    credentials: {
        client_email: config.Staging.gcpClientEmail,
        private_key: bigQueryCreds.private_key,
    },
});

exports.handler = async(event, context) => {

    console.log('Now: ', moment());
    try {
        const [bucket, tables, key] = [(TESTING === 'true') ? config.Staging.dataBucket : config.Production.dataBucket, (TESTING === 'true') ? config.Staging.Tables : config.Production.Tables, (TESTING === 'true') ? config.Staging.key : config.Production.key];
        pr(`BUCKET : ${bucket} TABLES: ${tables}`);

        const data = await processEvent(event, tables, bucket, key);
        context.succeed(data);
    } catch (e) {
        console.log(e);
        context.done(e);
    }
};

const processEvent = async(event, tables, bucket, key) => {
    const now = moment();
    pr(`Event bucket :: ${event.Records[0].s3.bucket.name}`);
    pr(`Event fileKey :: ${event.Records[0].s3.object.key}`);
    const fileKey = event.Records[0].s3.object.key;
    for (const table of tables) {
        try {
            pr(`table.dryRun: ${table.dryRun}`);
            pr(`table.name: ${table.name}`);
            pr(`fileKey.includes(table.name): ${fileKey.includes(table.name)}`);
            // eslint-disable-next-line no-empty
            if (!(table.dryRun) && (fileKey.includes(table.name))) {

                await checkIfTableExists(table.name, table.schema);
                const jobResult = await loadCsvFileFromS3(bucket, fileKey, table.name);
                if (jobResult === 'job completed') {
                    // await logSuccessfulEvent(bucket, table.fileKey, now.format('YYYY-MM-DDTHH:mm:ss'));
                    console.log(`Successfully uploaded from :: aws s3 cp s3://${bucket}/${fileKey}`);
                } else if (jobResult instanceof Error) {
                    // await logErrorEvent(bucket, table.fileKey, now.format('YYYY-MM-DDTHH:mm:ss'));
                }
            }
        } catch (e) {
            console.log(e);
        }

    }

    return pr({ 'Successfully uploaded uploaded data from files in S3': `${bucket}` });
}
;

const logSuccessfulEvent = async (bucket, key, ts) => {

    const fileKey = `${bucket}/${key}`;
    const params = {
        TableName: 'ingestMAnager',
        Item: {
            'fileKey': { S: fileKey },
            'ts': { S: ts },
        },
    };
    try {
        let result = await db.putItem(params).promise();
        return result;
    } catch (e) {
        console.log(e);
    }

};

const checkIfTableExists = async(tableId, schema) => {

    const dataset = bigquery.dataset('source');
    const table = dataset.table(tableId);
    try {
        const data = await table.get();
        const apiResponse = data[1];

        // const tableData = data[0];
        console.log(`apiResponse: ${JSON.stringify(apiResponse)}`);
    } catch (e) {
        if (e.code === 404) {
            console.log(`${e.message} >>> Creating table: ${tableId}`);
            await createBigQueryTablePartitioned(tableId, schema);
        }
    }

};

const loadCsvFileFromS3 = async(bucket, key, tableId) => {
    return new Promise((resolve, reject) => {
        const dataset = bigquery.dataset('source');
        const table = dataset.table(tableId);

        const metadata = {
            allowJaggedRows: true,
            skipLeadingRows: 1,
        };

        const params = { Bucket: bucket, Key: key };
        const request = s3.getObject(params);
        const s1 = request.createReadStream();
        s1.pipe(table.createWriteStream(metadata))
            .on('job', (job) => {
            // `job` is a Job object that can be used to check the status of the
            // request.
            })
            .on('complete', (job) => {
                console.log('job completed');
                resolve('job completed');
            })
            .on('error', (error) => { console.log(`[ERROR]:${error}`); reject(error); });

    });
};

const createBigQueryTablePartitioned = async(tableId, schema) => {

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
    const options = {
        schema: schema,
        location: 'US',
        timePartitioning: {
            type: 'DAY',
            expirationMs: '7776000000',
            field: 'dt',
        },
    };
    const datasetId = 'source';

    // Create a new table in the dataset
    const [table] = await bigquery
        .dataset(datasetId)
        .createTable(tableId, options);
    console.log(`Table ${table.id} created with partitioning: `);
    console.log(table.metadata.timePartitioning);
    return table.id;

};
~~~




*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.

- `./config.json`:
~~~js
{
  "Production": 
  {
    "Tables": [

      {
        "name" : "simple_transaction_test_4",
        "schema": "transaction_id:INT64, dt:date",
        "fileKey": "simple_transaction.csv",
        "dryRun": false,
        "notes": ""
      }
      
    ],

    "bigQueryConfigS3": "bq-shakhomirov-b86071c11c27.json",
    "gcpClientEmail": "bq-777@bq-shakhomirov.iam.gserviceaccount.com",
    "gcpProjectId": "bq-shakhomirov",
    "key": "data/",
    "dataBucket": "bq-shakhomirov.bigquery.aws"

  },
  "Staging": 
  {
    "Tables": [

      
      {
        "name" : "simple_transaction",
        "schema": "transaction_id:INT64, user_id:INT64, dt:date",
        "fileKey": "simple_transaction.csv",
        "dryRun": false,
        "dataType": "transaction",
        "notes": ""
      }
      
    ],

    "bigQueryConfigS3": "bq-shakhomirov-b86071c11c27.json",
    "gcpClientEmail": "bq-777@bq-shakhomirov.iam.gserviceaccount.com",
    "gcpProjectId": "bq-shakhomirov",
    "key": "data/",
    "dataBucket": "bq-shakhomirov.bigquery.aws"

  }
}

~~~

- `./package.json`:
~~~js
{
  "name": "bq-ingest-manager-",
  "version": "1.0.0",
  "private": true,
  "description": "Lambda function to process BigQuery data ingestion events",
  "main": "app.js",
  "scripts": {
    "test": "export DEBUG=metrics; run-local-lambda --file app.js --event test/data.json --timeout 10000"
  },
  "directories": {
    "test": "test"
  },
  "author": "Mike Shakhomirov mshakhomirov.medium.com",
  "license": "ISC",
  "devDependencies": {
    "aws-sdk": "2.804.0",
    "run-local-lambda": "1.1.1",
    "eslint": "^7.20.0",
    "eslint-plugin-classes": "^0.1.1",
    "eslint-plugin-promise": "^4.3.1"
  },
  "dependencies": {
    "@google-cloud/bigquery": "^5.7.0",
    "JSONStream": "^1.3.5",
    "fs": "0.0.1-security",
    "moment": "^2.24.0"
  }
}

~~~

- package-lock.json can be found in the repo:
[github.com/]()

