
**Create your Data Stack resources using Architecture as Code with AWS Cloudformation**
![Connecting data](mydataschool.com/liveprojects/img/s2-intro-1.png)


# about this liveProject

You are a Data Engineer building an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. 
Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

Talking about data ingestion you would need to utilise tools like **Fivetran or Stitch** to extract and prepare 3rd party data sources but if you follow this tutorial you will become totally capable of doing it yourself.

![Modern Data Stack](mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.).
As a data engineer you created a few data pipelines using **AWS Lambda** to extract data from *external data sources* and save it to your *AWS S3 bucket* in JSON format. 

You have also created an *ingest manager* (another AWS Lambda) responsible for loading those files into your **BigQuery data warehouse** (in batch mode) being triggered by *AWS S3 event* each time new data file is being created during the previous step.

You decide to use **AWS Cloudformation** to speed up resource provisioning and amke things easier for the rest of the team in case they decide to contribute or integrate with other microservices they create.

# Techniques employed

You will learn how to create Cloudformation templates and describe various resources from your *Data Stack*.

# Project outline

This liveProject will be divided into **2** milestones.

**[1]. Create AWS Lambda function to extract transaction data from your server MySQL database**
- This function will extract the transaction data (last 3 months)
- It will save the data into *AWS S3 bucket* (your datalake)
- *Ingest manager* (AWS Lambda) will pick it from there to insert new records into **BigQuery** for further processing.

**[2]. Create AWS Lambda function to run SQL queries on your BigQuery data warehouse**
- This function will perform a data check. For that it will query the transactions we have already loaded into BigQuery.
- After that it will compare to what has been extracted from MySQL database.

**[3]. Create a Cloudformation stack with all resources for your task**


You will learn how to provision your resources using **AWS Cloudformation**.





# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK



# Dataset (if applicable)

NA
