
## about this liveProject
### Project series workflow: 
This series covers a set of LPs explaining how to build a data warehouse with **BigQuery** as a central part of this project.
![projectFlow](https://mydataschool.com/liveprojects/img/projectFlow.drawio.png)

* LP1: Connect **external datasources** (Set data extraction **PayPal**) -> 
* LP2: Load data into BigQuery (AWS S3 to BigQuery ingest manager with Node.JS) -> 
* LP3: Data transformation pipelines with [Dataform](dataform.co) -> 
* LP4: Wrap it all up with [Cloudformation](https://aws.amazon.com/cloudformation/) (Infrastructure as a code) ->
* LP5: Set BI report for revenue reconciliation with [**Google Data Studio**](https://datastudio.google.com/u/0/navigation/reporting)

### Scenario
Imagine you are a Data Engineer working on an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.). 

![Data warehouse](https://mydataschool.com/liveprojects/img/externalDataBigQuery.png)

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help *Finance* team to create a revenue reconciliation report in Data Studio and run it daily. *You have already setup two extraction pipelines (liveProject 1 of this series):[1.] Extracts data from PayPal (recognised revenue) [2.] Second one extracts data from your application MySQL database*
*You have built an ingest manager to load that data into your data warehouse solution in bigquery (liveProject 2).*

You decided to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they deploy.
*So far it was the right choice and allowed you to successfully save data from these external sources in AWS S3 bucket (your datallake). Now you will use the same stack to process these data files, adjsut the format if needed and send data to BigQuery, process it and insert in tables where schemas are predefined with `config` files in your microservices.*
![Final solution](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)

### In this project:
Now you want to improve your deployment pipeline using *Infrastructure as code* with **AWS Cloudformation** so all your AWS resources are described in Coudformation files and the rest of your team can contribute to your project on *Git*. This aims to provision resources quickly and consistently, and manage them throughout their lifecycles with ease.



## Techniques employed

AWS CloudFormation gives you an easy way to model a collection of related AWS and third-party resources, provision them quickly and consistently, and manage them throughout their lifecycles, by treating **infrastructure as code**. CloudFormation template describes your desired resources and their dependencies so you can launch and configure them together as a stack.
In this *liveProject* you will learn how to use a template to create, update, and delete an entire stack as a single unit, as often as you need to, instead of managing resources individually.
You will learn how to use **AWS Cloudformation** to describe extraction pipelines you created in **liveProject 1** and **data ingestion microservice** created in **liveProject 2**.
For this tutorial it will be **free** (or cost just a fraction of a pennny) but you must have an *AWS account* already setup.

[CertQuestion] Waht are the benefits of using AW Cloudformation?
[Answer]
- You can start with a git repository and deploying through a CI/CD pipeline and create utomated deployments with pipeline integrations such as GitHub Actions and AWS CodePipeline.
- Integrate with other AWS services with ease
- Manage resource scaling by sharing CloudFormation templates to be used across your organization


## You will learn how to use AWS Cloudformation to create your infreastructure:
1. *S3 Bucket*.
2. *AWS Lambda functions*.
3. *IAM Roles*.
4. *Logging*.
5. *Cloudwatch Alarms*.
6. *Databases, i.e. Dynamo or MySQL*.


## Project outline

This liveProject will be divided into [3] milestones.
![Architecture](https://mydataschool.com/liveprojects/img/serviceArchitecture.png)

**[1]. Deploy AWS Lambda for extraction pipes with AWS Cloudformation**

**[2]. Adding your data ingestion microservice and DynamoDB table to store ingestion logs and check if a file was already ingested**

**[3]. Adding monitoring and alarms with AWS Cloudformation**

# Libraries and setup (if applicable)

- Node.js
- AWS CLI
- AWS SDK

# Dataset (if applicable)
Can be found here: `Project 2/data`

# [Repo](https://github.com/mshakhomirov/datawarehouseAdvanced/)

# Resources
*   [AWS Cloudformation](https://aws.amazon.com/cloudformation/)
*   [BigQuery Loading Data Documentation](https://cloud.google.com/bigquery/docs/loading-data)
*   [BigQuery Node.js library Documentation](https://googleapis.dev/nodejs/bigquery/4.1.3/Table.html#load)
*   [SDK CLIENT REFERENCE](https://googleapis.dev/nodejs/bigquery/latest/Table.html#get)
*   [bigquery/docs/reference/rest/v2/Job](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
