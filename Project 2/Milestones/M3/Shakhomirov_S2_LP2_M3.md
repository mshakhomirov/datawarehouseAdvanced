## Adding DynamoDB table to store ingestion logs and check if a file was already ingested

**Objective**

* Create a new *DynamoDB* table to keep records of ingested files.


**Why is this milestone important to the project?**

- You will learn how to deploy such microservice to ingest files from *S3* so each event itself triggers the ingestion as soon as data file lands in your S3 bucket.
- You will learn how to process the data inside those files and adjust it for *BigQuery* so it could insert it into tables.
- You will set up a logic to check if the files have been already ingested to prevent duplicates. 


**BigQuery**.

**Workflow**

**[3]. Adding DynamoDB table to store ingestion logs and check if a file was already ingested**
[3.1] Create a new *DynamoDB* table
- Go to AWS [Console](https://us-east-2.console.aws.amazon.com/dynamodb/home?region=us-east-2#gettingStarted:) :
![Create Dynamo table](https://mydataschool.com/liveprojects/img/s2-LP2-M3-1-creeate-Dynamo.png)

- Create two tables `ingestManager` for successfully ingested files and `ingestManagerError` to store file keys of data files that caused errors.
- Add permissions to access Dynamo table to your Lambda.
- Create a script to create your Dynamo table.

[certQuestion_4] Why is *Dynamo* seems liek the best option for storing ingestion logs?

[3.2] Change your microservice code to *log* a record each time file is being ingested into bigquery.
- Add `DynamoDB SDK` to your Lambda function
- Add two functions to handle `successfull` and `error` event for data ingestion.




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



*help*


*Hint for Step [3.2]*

- instantinate client `dynamo` library in your code:
~~~js
const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

...

const params = {
    TableName: 'ingestMAnager',
    Item: {
        'FILE_KEY': { S: event.FILE_KEY },
        'TS': { S: ts },
    }
};

const logSuccessfulEvent = async (params) => {
    try {
        let result = await db.putItem(params).promise();
    } catch (e) {
        console.log(e);
        context.done(e);
    }
    return result;
};
~~~

As a result you should see a new ingestion record created:
![Result](https://mydataschool.com/liveprojects/img/s2-LP2-M3-2-Dynamo-result.png)


[FAQ] My service successfully loads the data into BigQuery but after that I get an error:
~~~bash
job completed
ResourceNotFoundException: Requested resource not found
~~~
[Answer]: Make sure your Dynamo table was deployed in the right region:
So your Dynamo table must be deployed in *'eu-west-1'* region.
~~~js
AWS.config.update({ region: 'eu-west-1' });
~~~


- add `logErrorEvent` function:
~~~js
const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

...

const params = {
    TableName: 'ingestManagerError',
    Item: {
        'FILE_KEY': { S: event.FILE_KEY },
        'TS': { S: ts },
    }
};

const logErrorEvent = async (params) => {
    try {
        let result = await db.putItem(params).promise();
    } catch (e) {
        console.log(e);
        context.done(e);
    }
    return result;
};
~~~

- Change your Lambda code accordingly to log events on *success* and on *error*.


*partial solution*
 
Here is the `app.js` for this milestone. Download this file, use it to develop your solution, and upload your deliverable.
You will have to create your own BigQuery service account credentials `./bq-shakhomirov-b86071c11c27.json` and `./config.json`
To complete the solution you will need to add an extra function to process ERROR event.

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
                    await logSuccessfulEvent(bucket, table.fileKey, now.format('YYYY-MM-DDTHH:mm:ss'));
                    console.log(`Successfully uploaded from :: aws s3 cp s3://${bucket}/${fileKey}`);
                } else if (jobResult instanceof Error) {
                   
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
                    await logSuccessfulEvent(bucket, table.fileKey, now.format('YYYY-MM-DDTHH:mm:ss'));
                    console.log(`Successfully uploaded from :: aws s3 cp s3://${bucket}/${fileKey}`);
                } else if (jobResult instanceof Error) {
                    await logErrorEvent(bucket, table.fileKey, now.format('YYYY-MM-DDTHH:mm:ss'));
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

const logErrorEvent = async (bucket, key, ts) => {

    const fileKey = `${bucket}/${key}`;
    const params = {
        TableName: 'ingestManagerErrors',
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

