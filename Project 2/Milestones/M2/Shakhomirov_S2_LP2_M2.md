##  Adding support for different file formats in your microservice

## **Objective**

* Your data ingestion microservice must be able to read various file formats and load data into BigQuery.
**BigQuery can ingest 4 major file formats:**
- [new line delimited JSON](http://ndjson.org/). 
- CSV
- parquet (not covered in this project)
- avro (not covered in this project)


## **Why is this milestone important to the project?**
Very often source data is saved differently but we still need to be able to ingest it. JSONwise *BigQuery* supports only new line delimited JSON. 

You will learn how to process your data and prepare it for BigQuery.


## **Workflow**
[CertQuestion_1] Try to think about the way you would like to have your data in the data warehouse. What would be the most cost effective way? The most convenient way? Most reliable?

*You would want to add the following to your microservice:*
### [2.1] Add feature to handle CSV files.


Most of the times you will be dealing with `CSV` and `JSON` as a data engineer. `Parquet` and `AVRO` formats are not very oftenly seen unless there is a reson to use them.

[certQuestion_2] When would you use each format?

[certQuestion_3] So far you've been dealing with relatively small data files. What would you do if one of your data files is huge, i.e. contains millions of records and/or of a size of more than 1 Gb?





## **Deliverable**

The deliverable for this milestone is a working Lambda function. It must be able to read JSON file format.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.

It must be run by using the following commands from your repo:
~~~bash
$ npm ci
$ npm run test
~~~



## **Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

## *Resources*

[Read How to create BigQuery Load Jobs](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createLoadJob)
[Read about Google File object](https://googleapis.dev/nodejs/storage/latest/Bucket.html#file)
[Read Google Codelabs](https://codelabs.developers.google.com/codelabs/cloud-bigquery-nodejs#9)
[Read about JSONstream module](https://github.com/dominictarr/JSONStream)
[Read about BigQuery CreateWriteStream](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createWriteStream)
[Read about job configuration load](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
[Manning Book: Designing cloud data platforms ](https://livebook.manning.com/book/designing-cloud-data-platforms/welcome/v-8/)



## *help*

### *Hint for Step [2.1]*
- Read [Manning Book: Designing cloud data platforms ](https://livebook.manning.com/book/designing-cloud-data-platforms/welcome/v-8/). Check Chapter 4, it explains how data gets into the platform.

### *Hint for Step [2.1]*
- Create your `CSV` file to load or you can use one from our data folder:
~~~bash
aws s3 cp ./data/simple_transaction.csv s3://bq-shakhomirov.bigquery.aws/simple_transaction.csv
~~~
*Replace `s3://bq-shakhomirov.bigquery.aws/simple_transaction.csv` with your bucket and file key*

- Create a function to process `CSV` as a stream:

~~~js
const loadCsvFileFromS3 = async() => {
    return new Promise((resolve, reject) => {
        const dataset =  bigquery.dataset('source');//'source';
        const tableId = 'simple_transaction';
        const table = dataset.table(tableId);

        const metadata = {
            allowJaggedRows: true,
            skipLeadingRows: 1
        };

        let recordsProcessed = 0;

        const params = { Bucket: 'bq-shakhomirov.bigquery.aws', Key: 'simple_transaction.csv' };
        const request = s3.getObject(params);
        const s1 = request.createReadStream();
        s1.pipe(table.createWriteStream(metadata))
            .on('job', (job) => {
            // `job` is a Job object that can be used to check the status of the
            // request.
            })
            .on('complete', (job) => {
                console.log(`job completed`);
                resolve();
            // The job has completed successfully.
            });

    });
};
~~~

*Adjust **DatasetId** and **TableId** to match yours*
- add this function inside `processEvent()`
- Run: $ `npm run test`
~~~bash
job completed
~~~

You will see your records from CSV inside `source.simple_transaction` table.

### *Hint for Step [2.2] and [2.3]*
- Try `batch insert` with BigQuery library *Hint for Step [1.3]*
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

### *Hint for Step [2.3]*
In order to upload data from your S3 bucket you would want to create a *readable* stream from it and then create a *writeable* stream that would insert data into BigQuery table.
[Read about JSONstream module](https://github.com/dominictarr/JSONStream)
[Read about BigQuery CreateWriteStream](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createWriteStream)
[Read about job configuration load](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
Add this function to your processEvent() collection:
~~~js
const loadJsonFIleFromS3 = async() => {
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

- add `fileFormat` property to each table object in your `config.json`
- adjust `processEvent` logic accordingly.



## *partial solution*
 
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

// Add you JSON processing functions here below:
// ...
~~~




## *full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.
### Your microservice folder structure must look like this:
~~~bash
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
        "fileFormat": "CSV",
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
        "fileFormat": "JSON",
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

- app.js

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

// Add you JSON processing functions here below:

const loadJsonFIleFromS3 = async() => {
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



