# Testing a deployed solution

~~~bash
aws s3 cp ./data/simple_transaction0.csv s3://bq-shakhomirov.bigquery.aws
~~~

If this file name contains any of table names you mentioned in ./config.json it will be uploaded into BigQuery into relevant table.

