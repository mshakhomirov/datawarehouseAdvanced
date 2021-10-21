
# Building a reliable Data Transformation pipeline with BigQuery abd Dataform


## about this liveProject
### Project series: 
This series covers a set of LPs explaining how to build a data warehouse with **BigQuery** as a central part of this project.
![projectFlow](https://mydataschool.com/liveprojects/img/projectFlow.drawio.png)

* LP1: Connect **external datasources** (Set data extraction **PayPal**) -> 
* LP2: Load data into BigQuery (AWS S3 to BigQuery ingest manager with Node.JS) -> 
* **LP3: Data transformation pipelines with [Dataform](dataform.co) and BigQuery** -> 
* LP4: Wrap it all up with [Cloudformation](https://aws.amazon.com/cloudformation/) (Infrastructure as a code) ->
* LP5: Set BI report for revenue reconciliation with [**Google Data Studio**](https://datastudio.google.com/u/0/navigation/reporting)

###  Scenario
Imagine you are a Data Engineer working on an End-to-End project connecting various data sources into your new data warehouse in **BigQuery**.

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.). 
![Data warehouse](https://mydataschool.com/liveprojects/img/externalDataBigQuery.png)

Your data stack is modern, cost effective, flexible (you can connect any data source you want) and can scale easily to meet growing data resources you have. Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

As a data engineer you were tasked to create a new data pipeline to feed financial data from **PayPal** into the datawarehouse. This should help *Finance* team to create a revenue reconciliation report in Data Studio and run it daily. *You have already setup two extraction pipelines (liveProject 1 of this series) and now you need to ingest that data into your BigQuery data warehouse.*

You decided to use **AWS Lambda functions** and **Node.js** for this task as the rest of your team have been using this tech for many other microservices they deploy.
*So far it was the right choice and allowed you to successfully save data from these external data sources in AWS S3 bucket (your datalake).*
**You have successfully used the same stack to process these data files, adjsut the format when required and sent data to BigQuery, processed it and stored in tables where schemas were predefined with `config` files in your microservices (liveProject 2 of this series).**

![](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)

### In this project:
**You were tasked to create a revenue reconciliation report using data coming from your App and from payment merchant provider (PayPal). Firstly you ran a few tests with built in scheduler and produced a few tables with processed and enriched data. But later you decided to create all data transformation pipelines in BigQuery using Dataform (officially part of Google Cloud Platform**


## Techniques employed

So far you've learned how to connect various data sources using *REST APIs* and *microservice* architecture. You have set up your BigQuery project and successfully created a few pipelines to feed data into the `source` tables.

In this livePorject you will learn how to process and transform data in **BigQuery**. Documenting your data transformation is no problem when you have just a few of them. However, the more tables you have more difficult it becomes to keep an eye on everything. Just one of your data transformation pipelines in BigQuery could look like that:
![Modern Data Stack](https://mydataschool.com/liveprojects/img/s2-LP3-pipeline.gif)

### You will learn how to:
- create isolated *Staging* and *Live* environments in BigQuery.
- connect your *github* account and keep all data transformation scripts in one repo.
- schedule dataset and table updates using [Dataform](dataform.co).


## Project outline

This liveProject will be divided into [2] milestones.

## Milestone 1
### **[1]. Create your BigQuery project and connect to Dataform**

[1.1] **Generating data warehouse credentials**

[1.2] **Connecting your data warehouse and Dataform**

### **[2]. Create your tables using Dataform**
[2.1] Add new dataset called `analytics`. We will use it for our **Dataform** tables with enriched data.

[2.2] Using Dataform UI create source tables from `./data` files.

[2.3] Create a final revenue reconciliation table. You would want to publish  it to `analytics` dataset inside your `production` project. In my csae it's `bq-shakhomirov`. Adjust your dataform project settings accordingly.

## Milestone 2
### **[3]. Configure continuous integration/deployment workflows for your Dataform project**

[3.1] Migrate your DataForm project to git provider, i.e. **github**.
[3.2] Create a *Staging* BigQuery project and add it to Dataform.
[3.3] Running `analytics` schema table updates on a schedule.


Dataform Web is a fully-managed and free to use web-based interface for developing, deploying, and managing your data projects.

Dataform helps to manage all data processes in your warehouse. You can build your data pipelines the same way software engineers develop software using *CI/CD*, clean your source datasets turning raw data into the production ones your analysts could use to generate data insights.

It helps to alert on things like schema changes in your source data and detects changes making your data pipelines fully observable.

### In this liveProject you will build a data pieline which is:
- Being updated every day
- Tested for data quality
- Well documented



# Libraries and setup (if applicable)

NA



# Dataset (if applicable)

All files with data can be found in `./data/` folder of this project.
```shell
.
├── accounting_tax_type.csv
├── country_tax_codes.csv
├── payment_transaction_src
└── paypal_transaction_raw.json
```



