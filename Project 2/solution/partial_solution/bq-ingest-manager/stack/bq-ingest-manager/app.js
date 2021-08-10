
const DEBUG = process.env.DEBUG;
const SAVETO = process.env.SAVETO || 's3';
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
    // const fileKey = 's3://bq-shakhomirov.bigquery.aws/simple_transaction.csv';
    const fileKey = `${bucket}/${key}`;
    const params = {
        TableName: 'ingestMAnager',
        Item: {
            // 'FILE_KEY': { S: event.FILE_KEY },
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
        writeDisposition: 'WRITE_APPEND', // 'WRITE_TRUNCATE', // Set the write disposition to overwrite existing table data.

    };
    const jsonData = [{
        'transaction_id': 102,
        'user_id': 777,
        'dt': '2021-08-01',
    }];
    console.log(`JSON.stringify(jsonData[0]:: ${JSON.stringify(jsonData[0])}`);

    await bigquery
        .dataset(datasetId)
        .table(tableId)
        .createLoadJob('./tmp/simple_transaction', metadata).then((data) => {
        // .createLoadJob(JSON.stringify(jsonData[0]), metadata).then((data) => {
            const job = data[0];
            console.log(`Job ${job} completed.`);

            const apiResponse = data[1];
            console.log(`apiResponse ${apiResponse} .`);

        });


    // load() waits for the job to finish
    // console.log(`Job ${job.id} completed.`);

    // Check the job's status for errors
    // const errors = job.status.errors;
    // if (errors && errors.length > 0) {
    //     throw errors;
    // }

    // load() waits for the job to finish
    // console.log(`Job ${job.id} completed.`);
};



const loadTestDataFromFileJSON = async() => {


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
        writeDisposition: 'WRITE_APPEND', // 'WRITE_TRUNCATE', // Set the write disposition to overwrite existing table data.

    };
    const jsonData = [{
        'transaction_id': 101,
        'user_id': 777,
        'date': '2021-08-01',
    }];

    const [job] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .load(jsonData, metadata);

    // load() waits for the job to finish
    console.log(`Job ${job.id} completed.`);

    // Check the job's status for errors
    const errors = job.status.errors;
    if (errors && errors.length > 0) {
        throw errors;
    }

    // load() waits for the job to finish
    // console.log(`Job ${job.id} completed.`);
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
    },
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



const loadTestDatafromStreamRawJSON = async() => {


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
                { name: 'date', type: 'DATE' },
            ],
        },
        location: 'US',
    };
    const jsonData = {
        'transaction_id': 333,
        'user_id': 999,
        // 'date': '2021-08-01',
    } ;

    let raw = {
        insertId: 2,
        json: jsonData
    }

    const job = await bigquery
        .dataset(datasetId)
        .table(tableId)
        // .load(jsonData, metadata);
        .insert(raw, {raw: true})
        .then((data) => {
            const apiResponse = data;
            console.log(`apiResponse:: ${apiResponse}`);
        })
        .catch((err) => {console.log(`err: ${err}`); });

    // load() waits for the job to finish
    // console.log(`Job ${job.id} completed.`);
};

const createBigQueryJob = async() => {
    const options = {
        query: `
        select 
            *
        from
            production.payment_history 
        order by 1 desc
        limit 3
        ;`,
        location: 'US',
    };
    const [job] = await bigquery.createQueryJob(options);
    pr(`Job ${job.id} started.`);

    return job;
};

const getFileFromS3 = async(dataBucket, dataFileKey) => {
    const params = { Bucket: dataBucket, Key: dataFileKey };
    const request = s3.getObject(params);
    pr(`request:: ${JSON.stringify(request)}`);
};

const saveResultsLocally = async(job, location, format = '[]') => {
    return new Promise((resolve, reject) => {

        const jsonStream = fs.createWriteStream(location, { flags: 'a' });
        if (format === '[]') {
            job.getQueryResultsStream()
                .on('error', () => { reject(); })
                .pipe(arraystream)
                .pipe(jsonStream)
                .on('finish', () => {
                    resolve();
                });

        } else if (format === 'nldj') {
            job.getQueryResultsStream()
                .on('error', () => { reject(); })
                .pipe(through2.obj(function(row, enc, next) {

                    this.push(`${JSON.stringify(row)}\n`);
                    console.log(JSON.stringify(row));

                    next();
                },
                ))
                .pipe(jsonStream)
                .on('finish', () => {
                    resolve();
                });
        }

    });
};

const saveResultsToS3 = async(job, bucket, key, format = '[]') => {
    return new Promise((resolve, reject) => {

        const uploadStream = ({ Bucket, Key }) => {
            const s3 = new AWS.S3();
            AWS.config.update({ region: 'eu-west-1' });
            const pass = new stream.PassThrough();
            return {
                writeStream: pass,
                promise: s3.upload({ Bucket, Key, Body: pass }).promise(),
            };
        };
        const { writeStream, promise } = uploadStream({ Bucket: bucket, Key: key });

        if (format === '[]') {
            job.getQueryResultsStream()
                .on('error', () => { reject(); })
                .pipe(arraystream)
                .pipe(writeStream)
                .on('close', () => {
                    console.log('upload finished');

                });

            promise.then(() => {
                console.log('upload completed successfully');
                resolve();
            }).catch((err) => {
                console.log('upload failed.', err.message);
            });

        } else if (format === 'nldj') {
            job.getQueryResultsStream()
                .on('error', () => { reject(); })
                .pipe(through2.obj(function (row, enc, next) {

                    this.push(`${JSON.stringify(row)}\n`);
                    console.log(JSON.stringify(row));

                    next();
                },
                ))
                .pipe(writeStream)
                .on('close', () => {
                    console.log('upload finished');

                });

            promise.then(() => {
                console.log('upload completed successfully');
                resolve();
            }).catch((err) => {
                console.log('upload failed.', err.message);
            });
        }

    });
};

// Helper function to process stream as JSON array
const arraystream = new stream.Transform({ objectMode: true });
arraystream._hasWritten = false;

// eslint-disable-next-line func-names
arraystream._transform = function(chunk, encoding, callback) {
    // console.log('_transform:' + chunk);
    if (!this._hasWritten) {
        this._hasWritten = true;
        this.push(`[${JSON.stringify(chunk)}`);

    } else {
        this.push(`,${JSON.stringify(chunk)}`);
    }
    callback();
};

// eslint-disable-next-line func-names
arraystream._flush = function(callback) {
    // console.log('_flush:');
    this.push(']');
    callback();

};
