
# Building reliable Data Transformation pipeline in BigQuery


## about this liveProject
Imagine you are a Data Engineer working on an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.). 

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help *Finance* team to create a revenue reconciliation report in Data Studio and run it daily. *You have already setup two extraction pipelines (liveProject 1 of this series) and now you need to ingest that data into your BigQuery data warehouse.*

You decided to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they deploy.
*So far it was the right choice and allowed you to successfully save data from these external sources in AWS S3 bucket (your datalake).*
**You have successfully used the same stack to process these data files, adjsut the format when required and sent data to BigQuery, processed it and stored in tables where schemas were predefined with `config` files in your microservices (liveProject 2 of this series).**
**Now you were tasked to create a revenue reconciliation report using data coming from your App and from payment merchant provider (PayPal). Firstly you ran a few tests with built in scheduler and produced a few tables with processed data. But later you decided to create all data transformation pipelines in BigQuery using Dataform (officially part of Google Cloud Platform**


## Techniques employed

So far you've learned how to connect various data sources using *REST APIs* and *microservice* architecture. You have set up your BigQuery project and successfully created a few pipelines to feed data into the `source` tables.

In this livePorject you will learn how to process and transform data in **BigQuery**. Documenting your data transformation is no problem when you have just a few of them. However, the more tables you have more difficult it becomes to keep an eye on everything. Just one of your data transformation pipelines in BigQuery could look like that:
![Modern Data Stack](https://mydataschool.com/liveprojects/img/s2-LP3-pipeline.gif)

You will learn how to:
- create separate environments in BigQuery (Staging and Live)
- connect your *github* account and keep all data transformation scripts in one repo.
- schedule dataset and table updates using [Dataform](dataform.co).


## Project outline

This liveProject will be divided into [3] milestones.

**[1]. Create your BigQuery project and connect to Dataform**

[1.1] **Generating data warehouse credentials**

[1.2] **Connecting your data warehouse and Dataform**

**[2]. Create your tables using Dataform**
[2.1] Add new dataset called `analytics`. We will use it for our **Dataform** tables with enriched data.

[2.2] Using Dataform UI create a new table with our revenue reconciliation data.

[2.3] This is great. However, we need to publish our changes to `analytics` dataset inside `bq-shakhomirov` project. Adjust your dataform project settings accordingly.


**[3]. Configure continuous integration/deployment workflows for your Dataform project**

[3.1] Migrate your DataForm project to git provider, i.e. **github**.
[3.2] Create a *Staging* BigQuery project and adding it to Dataform.


Dataform Web is a fully-managed and free to use web-based interface for developing, deploying, and managing your data projects.

Dataform helps to manage all data processes in your warehouse. You can build your data pipelines the same way software engineers develop software using *CI/CD*, clean your source datasets turning raw data into the production ones your analysts could use to generate data insights.

It helps to alert on things like schema changes in your source data and detects changes making your data pipelines fully observable.

In this liveProject you will build a data pieline which is:
- Being updated every day
- Tested for data quality
- Well documented



# Libraries and setup (if applicable)

NA



# Dataset (if applicable)

[Dataset script for two source tables from liveProject1]()



