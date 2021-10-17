
## about this liveProject
Imagine you are a Data Engineer working on an End-to-End project connecting various data sources with your new data warehouse in **BigQuery**.

![Final solution](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.).

![Data warehouse](https://mydataschool.com/liveprojects/img/externalDataBigQuery.png)

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the data warehouse. This should help *Finance* team to create a revenue reconciliation report in [**Google Data Studio**](https://datastudio.google.com/u/0/navigation/reporting) and run it daily. *You have already setup PayPal data pipeline (liveProject 1 of this series) and now you need to ingest that data into your BigQuery data warehouse.*

You were tasked to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they built.
*So far it was the right choice and allowed you to store data from these external sources in AWS S3 bucket (your data lake). Now you will use the same stack to process these data files, adjsut the format if needed and send data to BigQuery, process it and insert in tables where schemas are predefined with `config` files in your microservices.*

![Final solution](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)



## Techniques employed

Loading data into BigQuery is simple if you have one file and it has a format readable by this datawarehouse solution, i.e. New line delimited JSON.
It might be a little bit more tricky if you have an infrastructure of dozens of **firehose delivery streams** or **Kafka** saving data in small batches every *5 minutes*.
In this liveProject you will learn how to extend extraction pipeline you created in **liveProject 1** by adding a **data ingestion microservice**. You will use Node.js and AWS Lambda functions which seems to be the most cost effective solutions for this task. For this tutorial it will be **free** (or cost just a fraction of a pennny) but you must have an *AWS account* already setup.


## You will learn how to:
1. Create such microservice to ingest files from *S3*.
2. Trigger this microservice when new files land in your *S3 data bucket*.
3. Process the files and prepare it for *BigQuery* so it could insert it into tables.
4. Set up a logic to check if the file has been already ingested to prevent duplicates. You will use *AWS DynamDb* to keep every ingestion record.
5. Catch data ingestion errors and save files in your *data error bucket* for further investigation.
6. Monitor your data loading process.


## Project outline

This liveProject will be divided into [4] milestones.
![Architecture](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)

### **[1]. Build ingestion service with AWS Lambda and set up a trigger**
[1.1] Create a new S3 bucket, i.e. `your-bigquery-project-name.test.aws`. 
[1.2] Create an empty AWS Lambda function (Node.js). You can do it using *AWS web console* or *AWS CLI*. It is up to you and initialise your `Node.js` app locally.
[1.3] Make sure you can run it locally.
[1.4] Add *S3 bucket trigger* to your Lambda function so each new *object created* in that bucket it would trigger the **Lambda**.
[1.5] Add `@google-cloud/bigquery` Node.js library to your `package.json` and try running your first query using your **Lambda** programmatically.
[1.6] Add a function to process event that would be responsible for handling the data when it lands in your bucket.
[1.7] Modify your `processEvent` function to handle the data contained in a file and perform a **batch** insert in one of your **BigQuery** tables.

### **[2]. Adding support for CSV file format**
Very often source data is saved differently but we still need to be able to ingest it. JSONwise *BigQuery* supports only [new line delimited JSON](http://ndjson.org/). 
*You would want to add the following to your microservice:*
[2.1] Add feature to handle CSV format.


### **[3]. Adding DynamoDB table to store ingestion logs and check if a file was already ingested**
[3.1] Create a new *DynamoDB* table
[3.2] Change your microservice code to *log* a record each time file is being ingested into bigquery.

### **[4]. Update the service to handle data transformation, catch data ingestion errors and Monitor the process**
[4.1] Change your Lambda code to handle ingestion errors and save file with *errors* somewhere else for further investigation.
[4.2] Perform a simple load testing for your microservice
[4.3] Set up monitoring and alarms.
[4.4] Add feature to handle array of JSON objects
[4.5] Add feature to handle a string of JSON objects

# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK



# Dataset (if applicable)
Can be found here: `Project 2/data`

# Repo
* https://github.com/mshakhomirov/datawarehouseAdvanced/
* [BigQuery-ingest-manager](https://github.com/mshakhomirov/BigQuery-ingest-manager).