
# Building reliable Data Transformation pipeline in BigQuery


## about this liveProject
You are a Data Engineer working on an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

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

- call your BigQuery project whatever you want, for example `bq-shakhomirov`
- generate a **Service account key** for Dataform.
It should look like this `bq-shakhomirov-b89e7a3a9e33.json` with some credentials data in it.
- Go to [Dataform.co](dataform.co) and signup.
- Connect your *BigQuery* project to your Dataform project.

[1.1] **Generating data warehouse credentials**

In order for Dataform to connect to your BigQuery warehouse you’ll need to use *Application Default Credentials* or a *service account and JSON key*.
You’ll need to create a service account from your **[Google Cloud Console](https://console.cloud.google.com/)** and assign it permissions to access **BigQuery**.

*Help for Step 1.1:*
- Read **Dataform** [docs](https://docs.dataform.co/getting-started-tutorial/set-up)

**To create a new service account in Google Cloud Console you need to:**

[1.1] Go to the [Services Account page](https://console.cloud.google.com/iam-admin/serviceaccounts)
- Make sure the new project you created is selected and click `Open`.
- Click on `Create Service Account` and give it a name.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-1.png)
- Grant the new account the **BigQuery Admin** role.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-2.png)

[1.2] Once you’ve done this you need to create a key for your new service account (in JSON format):
- On the Service Accounts page, find the row of the service account that you want to create a key for and click the `Actions` button.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-3.png)
- Then click `Manage keys`.
- Click `Create` and Select JSON key type.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-4.png)

Now you've created a new **BigQuery** project and generated your warehouse credentials, you're ready to create your Dataform project!

For more detailed info on generating credentials for **BigQuery**, see the docs.

[1.2] **Connecting your data warehouse and Dataform**
- Go to [https://app.dataform.co/](https://app.dataform.co/) and create your **Dataform** project. You can choose to sign-up using your **Github** account for example and then create your first project:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-5.png)
- Give your project a name, i.e. `bq-shakhomirov`.
- You will need your BigQuery project ID to connect to Dataform. You can find it in your [BigQuery console](https://console.cloud.google.com/) by simply clicking your project:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-6.png)
- You will see a page like one below. Click `browse` and upload your JSON key:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-7.png)
Click `test connection` and if everything's okay you will be set to go. Then Click `save connection`.


**[2]. Create your tables using Dataform**
[2.1] Add new dataset called `analytics`. We will use it for our **Dataform** tables with enriched data.
[2.2] Using Dataform UI create a new table with our revenue reconciliation data.
- Click on the `New Dataset` button in the left hand side bar.
- Choose whether you want your dataset to be a table, view or incremental table. In this case we want to create a table:
- Name the table `paypal_reconciliation` and click **Create Table**:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-9.png) **TODO** replace an image and point to correct table.
- Insert your table definition SQL right after `config` block:
~~~sql
-- Place your SQL here
~~~
- Use Dataform's **ref()** function to reference `payment_transaction` and `paypal table` as dependancies for `paypal_reconciliation` table.
- Dataform will automatically validate your query and check for any errors
- Once you see that the query is valid you can click Preview Results to check that the data looks correct:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-10.png) **TODO** Add image
- Click `Create Table` to create the table in your warehouse
This will take the SQLX that we’ve written, compile it into the SQL syntax of your warehouse (in this case, BigQuery), and then execute that SQL in your warehouse with the correct boilerplate code to create a table. You will see that your new dataset has been successfully published to datawarehouse:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-11.png) **TODO** Add image

[2.3] This is great. However, we need to publish our changes to `analytics` dataset inside `bq-shakhomirov` project. Adjust your dataform project settings accordingly.

*Hint for Step [2.2]*:
Your Data Warehouse project will depend on raw data stored in your warehouse, created by processes external to it. These external processes can change the structure of your tables over time (column names, column types…).
It is recommended to use `declarations` to define raw data tables.

- In our `paypal_reconciliation` table query you would want to have two **source** tables. You would want to use Dataform's **ref()** function to reference them.
Read about Dataform [Best Practices](https://docs.dataform.co/best-practices/start-your-dataform-project) and try t0 find out how to use `declarations`.

- In your Dataform project create a folder `./definitions/source` and a file called `./definitions/source/payment_transaction.sqlx` with the following content:
~~~json
config {
  type: "declaration",
  database: "bq-shakhomirov",
  schema: "source",
  name: "user_transaction",
}
~~~
- Now you can update your `paypal_reconciliation` table with `${ref("payment_transaction")}` instead of actual table name.
![outcome] **TODO** Add image

*Hint for Step [2.3]*: 
- Go to **Project Configuration** and change your **defaultSchema**.
![outcome](https://mydataschool.com/liveprojects/img/img-M3-12.png)
- Click `Create`. This will create our table in `analytics` dataset in BigQuery.
![outcome](https://mydataschool.com/liveprojects/img/img-M3-13.png) **TODO** Add image

- Click [View logs:](https://mydataschool.com/liveprojects/img/img-M3-14.png) **TODO** Add image

* **Partial solution for step [2.2]** **TODO** Adjust SQL
The code below shows how to use declarations.
~~~sql
config {
  type: "table",
  assertions: {
    uniqueKey: ["transaction_id"]
  }
}
  SELECT
   *
  FROM ${ref("payment_transaction")} t --`bq-shakhomirov.source.payment_transaction`  t
  FULL OUTER JOIN ${ref("paypal_transaction_v")} r --`bq-shakhomirov.production.paypal_transaction_v` r 
   ON r.itemId = t.transaction_item_id
~~~


**[3]. Configure continuous integration/deployment workflows for your Dataform project**
A clean and simple way to separate *staging* and *production* data is to use a different database for each environment.
We will use separate databases for development and production data. For staging environment we will create a separate project in BigQuery (database). So we could safely delete all staging resourcesin case we need to. Google's recommended best practice is to create a separate billing project to separate production and staging environments.
By default, Dataform runs all of your project code from your project's master Git branch. Configuring environments allows you to control this behaviour, enabling you to run multiple different versions of your project code.
A common use-case for environments is to run a staged release process. After testing code in a staging environment, the code is promoted to a stable production environment.

[3.1] Migrate your DataForm project to git provider, i.e. **github**.
[3.2] Create a *Staging* BigQuery project.
- connect it to **Dataform**
- point your `staging` project to the same github repository but use a branch called `Staging`

*Hint for Step 3.2:*
- Read the [docs](https://docs.dataform.co/dataform-web/scheduling/environments)

- Create a staging project:
![Desired outcome](https://mydataschool.com/liveprojects/img/img-M3-20.png)

- Remember we created a service account? We supplied these credentials to dataform. Now we would want that service account to be able to access our staging project.
Go to [IAM](https://console.cloud.google.com/iam-admin/iam) and enable access to **..-staging** project for the service account you created in Step 1.
![Like so](https://mydataschool.com/liveprojects/img/img-M3-21-2.png)
[Enable API here if needed for your staging project](https://console.cloud.google.com/apis/api/bigquerydatatransfer.googleapis.com/overview)

- So after you run the deployment in `staging` you will see all enriched tables created:
![Desired outcome](https://mydataschool.com/liveprojects/img/img-M3-24.png)
![Desired outcome](https://mydataschool.com/liveprojects/img/img-M3-25.png)

- Read more [here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365)



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



