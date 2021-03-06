
# Architecting data-intensive datawarehouse solutions with BigQuery in multi cloud.
# **Connecting external data sources to BigQuery with Node.JS and APIs**
![Data warehouse](https://mydataschool.com/liveprojects/img/externalDataBigQuery.png)

**Keywords**: datawarehouse, bigquery, serverless, aws, lambda function, data architecture, event-driven, data pipelines, external data source connectors.

## about this liveProject
### Project series: 
This series covers a set of LPs explaining how to build a data warehouse with **BigQuery** as a central part of this project.
![projectFlow](https://mydataschool.com/liveprojects/img/projectFlow.drawio.png)

* LP1: Connect **external datasources** (Set data extraction **PayPal**) -> 
* LP2: Load data into BigQuery (AWS S3 to BigQuery ingest manager with Node.JS) -> 
* LP3: Data transformation pipelines with [Dataform](dataform.co) -> 
* LP4: Wrap it all up with [Cloudformation](https://aws.amazon.com/cloudformation/) (Infrastructure as a code) ->
* LP5: Set BI report for revenue reconciliation with [**Google Data Studio**](https://datastudio.google.com/u/0/navigation/reporting)

### Scenario
Imagine you are a Data Engineer working on an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.
IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 


Your data stack is modern, event-driven, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP.

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.).

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help Finance team to create a revenue reconciliation report in [**Google Data Studio**](https://datastudio.google.com/u/0/navigation/reporting) and run it daily. 

You were tasked to use **AWS Lambda functions** and **Node.js** to extract data daily from PayPal transaction API and save to **AWS S3** first. This simple pipeline will ensure data is saved and prepared for loading into BigQuery later.

## Techniques employed

You will learn how to connect various data sources using **REST APIs** and **microservice** architecture. In this tutorial you will create a Lambda function to extract revenue data from PayPal API and schedule it daily.
When Lambda is being executed it extracts the data from PayPal and saves to S3. This will source data for a table in your data warehouse, i.e.:
- table: `your_project.production.paypal_transaction`.

## Project outline

This liveProject will have only **1** milestone with **2** steps .

**[1]. Create a PayPal account with developer access and a Sandbox**

**[2]. Create a PayPal data connector with AWS Lambda**


You will learn how to connect various data sources to your data warehouse. It explains how to use **AWS lambda functions** to extract data from external data sources, i.e. transaction data from PayPal API.



# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK
- PayPal Developer account


# Dataset (if applicable)

NA

# Repo
https://github.com/mshakhomirov/datawarehouseAdvanced/
