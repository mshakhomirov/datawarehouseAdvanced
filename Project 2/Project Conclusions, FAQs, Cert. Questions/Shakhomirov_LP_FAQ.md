# FAQs


[FAQ_1] What is `npm ci` and why can't I just use `npm install` instead?
[ANSWER]
`npm ci` helps to maintain exact node module versions. Read more about [here](https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci)



**[FAQ_2]**
What is the difference between BigQuery batch and streaming data insert?

[ANSWER]
- `streaming` is good but might incure higher costs. Try `batch` insert instead. It has a daily quota of 2000 inserts per table but you can insert a whole file in one attempt. Streaming insert is not so cheap, $0.05 per GB that's $50 for 1TB. Streaming insert is the recommended way to import data, as it's scalable.

**[FAQ_3]**
How do I test/run my service locally on my machine?

[ANSWER]
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
It's memory efficient as it converts batch to stream (not *BigQuery streaming*).
BigQuery streaming !== Node streaming so even though table.insert is not a streaming API in Node terms, it is a streaming API in **BigQuery** terms.