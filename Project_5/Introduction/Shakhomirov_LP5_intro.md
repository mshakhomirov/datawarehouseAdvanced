
# Create a BI report with Google Data Studio
![Connecting data](img/s2_lp5_intro.png)


## about this liveProject

## In this liveProject (the fifth of this series) you will create your BI report (revenue reconciliation) using Google Data Studio.

### Previous projects:
* LP1 Set extraction pipe (PayPal) -> 
* LP2 Set ingestion pipe (AWS S3 to BigQuery) -> 
* LP3 Set data transformation pipeline (Dataflow) -> 
* LP4 Wrap it all up with Cloudformation (Software as a code). ->
* **LP5 Set BI for revenue reconciliation (Data Studio) (You are here)**

You are a Data Engineer building an End-to-End project connecting various data sources with your new datawarehouse in **BigQuery**.

Your company is a mobile game development studio and have various products being sold on both platforms, IOS and ANDROID. Your development stack is also hybrid and includes AWS and GCP. 
Your data stack is modern, cost effective, flexible (you can connect any data source you need) and can scale easily to meet growing data resources you have. 
Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

Talking about data ingestion you would need to utilise tools like **Fivetran or Stitch** to extract and prepare 3rd party data sources but if you follow this tutorial you will become totally capable of doing it yourself.

![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

All data files come from varioius data surces, i.e. databases, kinesis firehose streams and various notification services in different formats (CSV, JSON, PARQUET, etc.).
As a data engineer you created a few data pipelines using **AWS Lambda** to extract data from *external data sources* and save it to your *AWS S3 bucket* in JSON format. 

You have also created an *ingest manager* (another AWS Lambda) responsible for loading those files into your **BigQuery data warehouse** (in batch mode) being triggered by *AWS S3 event* each time new data file lands in your datalake.

In *liveProject 4* you chose to use **AWS Cloudformation** to speed up resource provisioning and make things easier for the rest of the team in case they decide to contribute or integrate with other microservices they create.

Finally you are tasked to create a revenue reconciliation report for Finance department where they can see which transactions are missing on both `payment merchant` and your `database` sides.



# Techniques employed

You will learn how to create reports in Data Studio. You will work with templates and connect data sources from your *Data warehouse*.

# Project outline

This liveProject will be divided into **2** milestones.

# [1]. Create a report layout for revenue reconciliation
- Go to [Data Studio](https://datastudio.google.com/reporting/f05459d2-01ef-4ca9-8e8e-436bbf42a043/page/nN2rB/preview) and copy one of the templates created in [Beginners tutorial](https://www.manning.com/liveproject/business-intelligence-with-BigQuery). Click *'Use tempalte'*.
- Modify the template. You would want to have the following:

## Page 1. Raw transaction data and recognised revenue with totals:
* Total revenue according to **PayPal** for selected date range.
* Total revenue according to **your system** for selected date range.
* Missing transactions on both sides for selected date range.
* Revenue aggregation per `country_of_sale`. This is an important step for accurate *Taxation*.

## Page 2. Raw PayPal transaction data with totals:
* PayPal aggregated sales data per `date`, `transaction type`, `country of sale` and `currency of sale`.
* Must have `gross`,`fee`, `net` totals and `Openening` / `Closing balance` for each date.

## Page 3. Recognised revenue prepared for daily upload into accounting system:
* Must have fields:

- Account Reference     - `PAYPAL`
- Nominal A/C Reference - Accounting code number
- Date                  - `DD/MM/YYYY` formatted date
- Reference             - `start_date - end_date`; `DD/MM/YYYY` dates formatted 
- Narrative             - `Country_of_sale - Date_of_sale`; `YYYY-MM-DD` Date_of_sale formatted 
- VAT                   - VAT code, i.e. 'T67'
- Net Amount            - Revenue left after TAX in you account currency. In our case this would be USD.
- VAT Amount            - TAX amount  in your account currency (USD).

## A few things to consider:
- Your PayPal account is in USD currency.
- Users are all over the world.
- In different countries your company has different tax rates.
- You would want to highlight missing data (transactions) on your end (if any) and compare against *PayPal* reports.
- You need to find a way to calculate a 'daily revenue' metric in **PayPal** account currency and prepare it for upload intoyour accounting system.
- You want to upload data daily and PayPal transaction dates be predominant.
- Your database transactions might be late due to several reasons, i.e. due to client application late response, etc. You were tasked to tackle this issue.
- For revenue reconciliation purposes you need only:
        - PayPal transactions with `type` of `Website payment` and `Express checkout`. Read more about **PayPal** event codes [here](https://developer.paypal.com/docs/integration/direct/transaction-search/transaction-event-codes/)
        - completed transactions (status: 'S')
- You would want to alert on `reversed` transactions and receive email notifications about it with a link to a report page containing reversal ones ('T1201' type: 'Chargeback').
- Reversal transactions must have a tax code too. You will need to find a way to link reversal transaction back to original one to get `country_code`.
- your database can't handle reversed transactions yet.
- Your server App sends extra payment info to PayPal `item_name` part of which you would like to use in reporting. Split `item_name` so you could use product name only, i.e. *"InApp Product 8"* and drop *"(ID: #100118)"*

~~~json
...
{   "item_code": "118",
    "item_name": "InApp Product 8 (ID: #100118)",
    ...
}
~~~
- Use PayPal's `item_code` to match that dataset against your database' `transaction_item_id` during revenue reconciliation.
- This daily output for accounting must include the following fields:
    - `Account Reference`     - `PAYPAL`
    - `Nominal A/C Reference` - Accounting code number
    - `Date`                  - `DD/MM/YYYY` formatted date
    - `Reference`             - `start_date - end_date`; `DD/MM/YYYY` dates formatted 
    - `Narrative`             - `Country_of_sale - Date_of_sale`; `YYYY-MM-DD` Date_of_sale formatted 
    - `VAT`                   - VAT code, i.e. 'T67'
    - `Net Amount`            - Revenue left after TAX in you account currency. In our case this would be USD.
    - `VAT Amount`            - TAX amount  in your account currency (USD).





# Libraries and setup (if applicable)

NA



# Dataset (if applicable)

All files with data can be found in ./data/ folder of this project.
