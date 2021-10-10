
# **Connecting external data sources to BigQuery**
![Connecting data](https://mydataschool.com/liveprojects/img/s2-intro-1.png)


## about this liveProject

You are a Data Engineer working on an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.).
As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help Finance team to create a revenue reconciliation report in Data Studio and run it daily. 

You decide to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they deploy.

## Techniques employed

You will learn how to connect various data sources using REST APIs and microservice architecture. In this tutorial you will create a Lambda function to extract revenue data from PayPal API and schedule it daily.
When Lambda is being executed it extracts the data from PayPal and saves to S3. This will source data for a table in your data warehouse, i.e.:
- table: `your_project.production.paypal_transaction`.

## Project outline

This liveProject will have only **1** milestone with **2** steps .

**[1]. Create a PayPal account with developer access and a Sandbox**

**[2]. Create a Lambda function to extract transaction data from PayPal API**


You will learn how to connect various data sources to your data warehouse. This series covers a set of LPs explaining how to build a data warehouse with BigQuery as a central part of this project.

### So the workflow would be: 
* LP1 Set extraction pipe (PayPal) -> 
* LP2 Set ingestion pipe (AWS S3 to BigQuery) -> 
* LP3 Set data transformation pipeline (Dataflow) -> 
* LP4 Wrap it all up with Cloudformation (Software as a code). ->
* LP4 Set BI for revenue reconciliation (Data Studio) 

Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

If we talk about data ingestion in general you would want to use tools like **Fivetran or Stitch** to extract data from *3rd party data sources* but if you follow this tutorial you will become totally capable of doing it yourself.

![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)



# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK



# Dataset (if applicable)

NA

# Repo
https://github.com/mshakhomirov/datawarehouseAdvanced/
