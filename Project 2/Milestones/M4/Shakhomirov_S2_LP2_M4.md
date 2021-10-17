## Adding extra features to ingest manager.
### Handle data transformation, catch data ingestion errors and Monitor the process.

## **Objective**

* Change your Lambda code to handle ingestion errors and save file with *errors* somewhere else for further investigation.
* Monitor service health.


## **Why is this milestone important to the project?**

- You will learn how to handle errors and copy files using node.js and AWS S3. This is step is important in case your data has chanegd and therefore it wouldn't be ingested by BigQuery. Copying such files into a separate bucket might help to investigate those schema changes in future.


## App logic would be the following:
- AWS Cloudwatch event will trigger Lambda each time new file lands in *S3 bucket*.
- Lambda will get BigQuery credentials from `./your-service-account.json` file and authenticate with the service.
- Then Lambda will evaluate the size of this file and if it is too big it will paginate it.
- Looping through each table in `./config.json` Lambda will perform a batch insert operation into a relevant table in **BigQuery**.
- If we have an error in data file during ingestion then Lambda will copy it to another bucket.

## **Workflow**

### [4.1] Change your Lambda code to handle ingestion errors and save file with *errors* somewhere else for further investigation.
- Add `moveFile` function to copy `error` files to a separate **S3** bucket.
- Delegate this job to another Lambda function. Let's call it **ingestManagerMoveFile**
- Create S3 bucket for data files with errors
- Add invokeLambda function to you `ingestManager` microservice which will trigger `moveFile` lambda when encountered a data error.

### [4.2] Perform a simple load testing for your microservice
- Deploy your Lambda: `./deploy.sh`
- Create a script to copy file `./data/simple_transaction.csv` 300 times.
- Upload data folder recursively to S3. That must trigger your Lambda function 300 times and insert 900 records into your target table:
![load test](https://mydataschool.com/liveprojects/img/s2-LP2-M3-3-Load-test.png)
- Make sure it creates batch load jobs and not streaming inserts:
![load jobs](https://mydataschool.com/liveprojects/img/s2-LP2-M3-3-Load-jobs.png)

### [4.3] Set up monitoring and alarms.
- Go to your Dynamo Db monitoring and check the stats:
![Monitoring](https://mydataschool.com/liveprojects/img/s2-LP2-M3-2-Dynamo-monitoring.png)
- Create an **AlarmNotificationTopic** with Simple Notification Service (SNS) to receive notifications by email in case of any ingestion errors
- When you created your Lambda and attached the policy it must have created a **LogGroupName**: `/aws/lambda/ingestManager`. Use it to create **ERRORMetricFilter** where ERROR count > 0. For example, my Log group looks like this:
![Log Group](https://mydataschool.com/liveprojects/img/s2-LP2-M3-4-Lambda-Logs-CreateMetricFilter.png)
- Finally create **ERRORMetricAlarm** with action to trigger an alarm when number ERROR greater than 5 for 5 consecutive minutes. It should send notification to your SNS topic.    
- Desired outcom would be a notification in case of ingest manager error:
![Notification](https://mydataschool.com/liveprojects/img/s2-LP2-M3-12-create-alarm-select-metric.png)

### [4.4] Add feature to handle array of individual JSON objects
Imagine you have another service extracting data from MySQL database and output looks like an array of JSON objects:
* `[{...},{...},{...}]` 
You would want to transform it into `nldj`:  `'{...}'\n'{...}'\n'{...}'\n`

### [4.5] Add feature to handle a string of JSON objects
Imagine you are working with standard Firehose output where data has been written like a string of `JSON` objects `{...}{...}{...}`. You would want to prepare data for BigQuery (transform into `nldj`)
 from OBJECT_STRING to SRC, i.e. `{...}{...}{...}` >>> `'{...}'\n'{...}'\n'{...}'\n`


### **Deliverable**

The deliverable for this milestone is a working Lambda function.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.

It must be run by using the following commands from your repo:
~~~bash
$ npm ci
$ npm run test
~~~



## **Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

## *Resources*
* [Amazon Web Services in Action, Second Edition](https://www.manning.com/books/amazon-web-services-in-action-second-edition?query=Amazon%20Web%20Services%20in%20Action,%20Second%20Edition)
* [Cloudwatch alarms](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cw-alarm.html)


## *help*
### *Hint for step [4.1]*

- create another Lambda and add this function to copy files to a new bucket like so:
~~~js
let params = {
    Bucket: destinationBucket ,
    CopySource: sourceBucket + '/' + file.Key,
    Key: file.Key.replace( ('events/'+tables[i] +'/' + oldPrefix) , newPrefix)
};

s3.copyObject(params, function(copyErr, copyData){
    if (copyErr) {
    console.log(err);
    }
    else {
    console.log('Copied: ', params.Key);
    }
}); 
~~~

- each time **ingest manager** encounters an error make it invoke that `moveFile` lambda with event data containing source metadata of S3 file that needs to be moved.

### *Hint for step [4.3]*
- Use the following pattern to create an ERRORMetricFilter: FilterPattern: 'ERROR'
- call it `ingestManagerStagingMetricFilter`
![screen](https://mydataschool.com/liveprojects/img/s2-LP2-M3-5-Lambda-Logs-CreateMetricFilter.png)
- Now go to `SNS` and create your alarm topic:
![alarmTopic](https://mydataschool.com/liveprojects/img/s2-LP2-M3-6-alarmNotificationTopic.png)
- Click create subscription and enter your email:
![subscribe](https://mydataschool.com/liveprojects/img/s2-LP2-M3-7-Subscribe-alarmNotificationTopic.png)
- Finally create an alarm:
![select metric](https://mydataschool.com/liveprojects/img/s2-LP2-M3-9-create-alarm-select-metric.png)
![create alarm threshold](https://mydataschool.com/liveprojects/img/s2-LP2-M3-10-create-alarm-select-metric.png)
- Choose where to send notification if encountered an alarm:
![send to](https://mydataschool.com/liveprojects/img/s2-LP2-M3-11-create-alarm-select-metric.png)

[FAQ] I can't find my ERRORcount metric.
[Answer] Try raising an ERROR by running your Lmabda. That will generate a required metric stat so you will be able to see it in *Cloudwatch*.

### *Hint for Step [4.2]*
- create a file called `./bq-ingest-manager/stack/bq-ingest-manager/loadTestGenerateData.js`
~~~js
const fs = require('fs');
const data = require("fs").readFileSync("./tmp/simple_transaction.csv", "utf8")
for (let i = 5; i < 300; i++) {
    fs.writeFileSync(`./data/simple_transaction${i}.csv`, data);
  } 
// Then copy the files to s3 and emulate multi file upload trigger to invoke your ingest manager service.
// $ aws s3 cp ./data s3://bq-shakhomirov.bigquery.aws --recursive
~~~

### *Hint for Step [4.4], [4.5]*
* replace your `./config.json` with `npm config` so you could start using `yaml`. It looks better and easier to read.
* Add `fileFormat` to your config file to describe the transformation you need, i.e.:
```yaml
...
    fileFormat: 
      load: NLDJ
      transform: 
        from: OBJECT_STRING
```

## *partial solution*
 
Here is the `app.js` for this milestone. Download this file, use it to develop your solution, and upload your deliverable.
You will have to create your own BigQuery service account credentials `./bq-shakhomirov-b86071c11c27.json` and `./config.json`
You will also need to create your own solution for steps [4.4], [4.5].
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




## *full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.
Clone the repo and go to branch `liveProject`:
[BigQuery-ingest-manager](https://github.com/mshakhomirov/BigQuery-ingest-manager).

# Prerequisites
- AWS account
- BigQuery project. Replace service account key file with yous: `./stack/bq-ingest-manager/bq-shakhomirov-b86071c11c27Example.json`

# Usage
##  Testing locally
[1] Create some files in your datalake S3 bucket, i.e.
~~~bash
aws s3 cp ./data/simple_transaction0.csv s3://bq-shakhomirov.bigquery.aws
aws s3 cp ./data/simple_transaction s3://bq-shakhomirov.bigquery.aws
~~~
[2] Supply this object to `./test/data.json`, i.e.
~~~json
{
  "Records": [
      {
          "bucket": {
              "name": "bq-shakhomirov.bigquery.aws"
          },
          "object": {
              "key": "reconcile/paypal_transaction/2021/10/03/05/paypal_transaction181"
          }
      }
  ]
}
~~~
This will emulate **s3ObjCreate** event which would trigger the Lambda when deployed and file lands in your datalake ready for data ingestion into BigQuery.

[3] In command line Run `npm run test`

If this file name contains any of table names you mentioned in `./config/staging.yaml` it will be uploaded into **BigQuery** into a relevant table:
~~~yaml
Tables:
  -
    pipeName: paypal_transaction              # pick all files which have this in file key.
    bigqueryName: paypal_transaction_src      # BigQuery table name to insert data.
    datasetId: source
    schema:
      - name: "src"
        type: "STRING"
        mode: "NULLABLE"
    # partitionField: created_at              # if empty use date(ingestion time) as partition. Default BigQuery setting.
    fileFormat:
      load: CSV                               # load as.
      delimiter: 'þ'                          # hacky way of loading into one column. An individual JSON object per one row.
      transform:                              # Transform from this into load format accepted by BigQuery.
        from: OUTER_ARRAY_JSON                # Array of individual JSON objects to SRC, i.e. [{...},{...},{...}] >>> '{...}'\n'{...}'\n'{...}'\n
      compression: none
    dryRun: false                             # If true then don't insert into a table.
    notes: For example, daily extract from PayPal API by bq-data-connectors/paypal-revenue AWS Lambda
~~~

Loads data from CSV file format into BigQuery in batch mode.
It's memory effective as it converts batch to stream (not *BigQuery streaming*).
BigQuery streaming !== Node streaming so even though table.insert is not a streaming API in Node terms, it is a streaming API in **BigQuery** terms.

## Loading multiple files located in s3 bucket
You can upload multiple files in one go.

[1] Create a payload with all the files which match S3 bucket name, prefix and contain a pipe name as defined in  `./stack/bq-ingest-manager/test/integration/loadTestPipelines.json`
```shell
npm run test-service
```
This will update the file with sample paypload in `./stack/bq-ingest-manager/test/integration/loadTestPayload.json`

[2] Run the service locally with this payload you've just created:
```shell
npm run test-load
```



