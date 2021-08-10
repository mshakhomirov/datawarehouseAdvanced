
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)


# about this liveProject
You are a Data Engineer building an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.). 

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help *Finance* team to create a revenue reconciliation report in Data Studio and run it daily. *You have already setup two extraction pipelines (liveProject 1 of this series) and now you need to ingest that data into your BigQuery data warehouse.*

You decided to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they deploy.
*So far it was the right choice and allowed you to successfully save data from these external sources in AWS S3 bucket (your datallake). Now you will use the same stack to process these data files, adjsut the format if needed and send data to BigQuery, process it and insert in tables where schemas are predefined with `config` files in your microservices.*



# Techniques employed

Loading data into BigQuery is simple if you have one file and it has a format readable by this datawarehouse solution, i.e. New line delimited JSON.
It might be a little bit more tricky if you have an infrastructure of dozens of **firehose delivery streams** or **Kafka** saving data in small batches every *5 minutes*.
In this liveProject you will learn how to extend extraction pipeline you created in **liveProject 1** by adding a **data ingestion microservice**. You will use Node.js and AWS Lambda functions which seems to be the most cost effective solutions for this task. For this tutorial it will be **free** (or cost just a fraction of a pennny) but you must have an *AWS account* already setup.


## You will learn how to:
1. Create such microservice to ingest files from *S3*.
2. Trigger this microservice when new files land in your *S3 data bucket*.
3. Process the data inside those files and adjust it for *BigQuery* so it could insert it into tables.
4. Set up a logic to check if the files have been already ingested to prevent duplicates. You will use *AWS DynamDb* to keep every ingestion record.
5. Catch data ingestion errors and save files in your *data error bucket* for further investigation.
6. Monitor your data loading process.


# Project outline

This liveProject will be divided into [4] milestones.
![Architecture](https://mydataschool.com/liveprojects/img/serviceArchitecture.png)

## App logic would be the following:
- AWS Cloudwatch event will trigger Lambda each time new file lands in *S3 bucket*.
- Lambda will get BigQuery credentials from `./your-service-account.json` file and authenticate with the service.
- Then Lambda will evaluate the size of this file and if it is too big it will paginate it.
- Looping through each table in `./config.json` Lambda will perform a batch insert operation into a relevant table in **BigQuery**.


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
![Result](https://mydataschool.com/liveprojects/img/s2-LP2-M1-1.png)

- `streaming` is good but might incure higher costs. Try `batch` insert instead. It has a daily quota of 2000 inserts per table but you can insert a whole file in one go. Streaming insert is extremely cheap, $0.05 per GB that's $50 for 1TB. Not sure how much volume you have, but usually people are not building around streaming insert because it's better suited. Streaming insert is the recommended way to import data, as it's scalable, it has a nice per row error message, so you can retry rows and not the full file.

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



[1.4] Add *S3 bucket trigger* to your Lambda function so each new *object created* in that bucket it would trigger the **Lambda**.
[1.5] Add `@google-cloud/bigquery` Node.js library to your `package.json` and try running your first query using your **Lambda** programmatically.
[1.6] Add a function to process event that would be responsible for handling the data when it appears in your bucket.
[1.7] Modify your `processEvent` function to handle the data contained in a file and perform a **batch** insert in one of your **BigQuery** tables.

**[2]. Adding support for different file formats in your microservice**
Very often source data is saved differently but we still need to be able to ingest it. JSONwise *BigQuery* supports only new line delimited JSON. 

[CertQuestion_1] Try to think about the way you would like to have your data in the data warehouse. What would be the most cost effective way? The most convenient way? Most reliable?

*You would want to add the following to your microservice:*
[2.1] Add feature to handle CSV
[2.2] Add feature to handle array of JSON objects
[2.3] Add feature to handle a string of JSON objects

Most of the times you will be dealing with `CSV` and `JSON` as a data engineer. `Parquet` and `AVRO` formats are not very oftenly seen unless there is a reson to use them.

[certQuestion_2] Try to think when would you use each format?

[certQuestion_3] So far you've been dealing with relatively small data files. Yes, your architecture outputs them in this way and you've been lucky. What would you do if one of your data is huge, i.e. contains millions of records and it's size is more than 1 Gb?

*Hint for Step [2.1]*
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

*Hint for Step [2.2] and [2.3]*
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

*Hint for Step [2.3]*
In order to upload data from your S3 bucket you would want to create a *readable* stream from it and then create a *writeable* stream that would insert data into BigQuery table.
[Read about JSONstream module](https://github.com/dominictarr/JSONStream)
[Read about BigQuery CreateWriteStream](https://googleapis.dev/nodejs/bigquery/latest/Table.html#createWriteStream)
[Read about job configuration load](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
Add this function to your processEvent() collection:
~~~js
const loadJsonFileFromS3 = async() => {
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

**[4]. Modifying the service to catch ingestion errors and Monitor your the process**
[4.1] Change your Lambda code to handle ingestion errors and save file with *errors* somewhere else for further investigation.
- Add `moveFile` function to copy `error` files to a separate **S3** bucket.
- Delegate this job to another Lambda function. Let's call it **ingestManagerMoveFile**
- Create S3 bucket for data files with errors
- Add invokeLambda function to you `ingestManager` microservice which will trigger `moveFile` lambda when encountered a data error.

[4.2] Perform a simple load testing for your microservice
- Deploy your Lambda: `./deploy.sh`
- Create a script to copy file `./data/simple_transaction.csv` 300 times.
- Upload data folder recursively to S3. That must trigger your Lambda function 300 times and insert 900 records into your target table:
![load test](https://mydataschool.com/liveprojects/img/s2-LP2-M3-3-Load-test.png)
- Make sure it creates batch load jobs and not streaming inserts:
![load jobs](https://mydataschool.com/liveprojects/img/s2-LP2-M3-3-Load-jobs.png)

[4.3] Set up monitoring and alarms.
- Go to your Dynamo Db monitoring and check the stats:
![Monitoring](https://mydataschool.com/liveprojects/img/s2-LP2-M3-2-Dynamo-monitoring.png)
- Create an **AlarmNotificationTopic** with Simple Notification Service (SNS) to receive notifications by email in case of any ingestion errors
- When you created your Lambda and attached the policy it must have created a **LogGroupName**: `/aws/lambda/ingestManager`. Use it to create **ERRORMetricFilter** where ERROR count > 0. For example, my Log group looks like this:
![Log Group](https://mydataschool.com/liveprojects/img/s2-LP2-M3-4-Lambda-Logs-CreateMetricFilter.png)
- Finally create **ERRORMetricAlarm** with action to trigger an alarm when number ERROR greater than 5 for 5 consecutive minutes. It should send notification to your SNS topic.    
- Desired outcom would be a notification in case of ingest manager error:
![Notification](https://mydataschool.com/liveprojects/img/s2-LP2-M3-12-create-alarm-select-metric.png)

*Hint for step [4.3]*
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

*Hint for Step [4.2]*
- create a file called `./bq-ingest-manager/stack/bq-ingest-manager/loadTestGenerateData.js`
~~~js
const fs = require('fs');
const data = require("fs").readFileSync("./tmp/simple_transaction.csv", "utf8")
for (let i = 5; i < 300; i++) {
    fs.writeFileSync(`./data/simple_transaction${i}.csv`, data);
  } 

// $ aws s3 cp ./data s3://bq-shakhomirov.bigquery.aws --recursive
~~~

# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK



# Dataset (if applicable)
NA

# Repo
https://github.com/mshakhomirov/datawarehouseAdvanced/



# Resources
[BigQuery Loading Data Documentation](https://cloud.google.com/bigquery/docs/loading-data)
[BigQuery Node.js library Documentation](https://googleapis.dev/nodejs/bigquery/4.1.3/Table.html#load)