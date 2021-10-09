# Create a BI report with Google Data Studio

## **Objective**

You will learn how to *create a business intelligence reports* using your data. You will deploy a revenue reconciliation report using [Google Data Studio](https://datastudio.google.com).


## **Why is this milestone important to the project?**
This LP explains how to transform your data into a final dataset ready for further *Business Intelligence*. 
You will use **Data Studio** template and connect it to your data warehouse.
In your `analytics` dataset your data has been checked, cleansed, validated and prepared for reporting.
This approach gives you an easy way to deliver your data models to your final customers as reports. 
In this *liveProject* I will be using **BigQuery** as a central part of this diagram.

Modern data stack tools (not a complete list of course):
    * Ingestion: **Fivetran, Stitch**
    * Warehousing: Snowflake, Bigquery, Redshift
    * Transformation: dbt, Dataflow, APIs.
    * BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

**In previous liveProjects we have built a complete data pipeline using *Serverless* which scales well.** It follow the ELT (Extract - Load - Transform) pattern, well documented, easily scalable and can be easily reproduced in any other environment. It is also very cost effective due to full control over partitioning in BigQuery.

Reporting tools for Data Visualisation can be expensive especially when you want to make this feature available for multiple users, control their access priviliges and also give them freedom to create their own reports. 
In this *liveProject* you will learn how to achieve these goals using a completely free community solution such as **Google Data Studio**.




## Workflow

### 1. Create source tables to work with (if you haven't created them yet from Previous liveProjects)
### 2. Create a new table or a view on `source.paypal_transaction_src` table.
### 3. Create a [Google Data Studio](https://datastudio.google.com) report template for **revenue reconciliation**.
#### Page 1. Recognised revenue from with totals
#### Page 2. Raw PayPal transaction data with totals
#### Page 3. Recognised revenue prepared for monthly reconciliation
#### Page 4. Recognised revenue prepared for daily upload into accounting system



### 1. Create source tables to work with (if you haven't created them yet from Previous liveProjects)

Go to [BigQuery ingest manager](https://github.com/mshakhomirov/BigQuery-ingest-manager) repository and download the code. It is a simple and reliable manager which allows you to load any data into **BigQuery** tables.
#### How it works
* When deployed as a Serverless Lambda function it can be triggered by S3objectCreate event from your data storage bucket. If you wnt to learn how to deploy it with Cloudformation stack there is a detailed tutorial in *liveProject 4*. 

* If you want to run it locally on your machine:
- adjust `./test/data.json` to emaulate your S3ObjectCreate event (replace `bucket` and `key` with your values).
- Upload your files (alternatively use sample files from this liveProject).
- In you rcommand line run:
```shell
npm run test
```

This will create a BiGQuery table from your file located in S3 bucket.

#### How to create all tables for this project with script

- copy all dataset files from `./data/` to your s3 bucket, i.e. 
```shell
aws s3 cp './data/paypal_transaction_raw.json' s3://bq-shakhomirov.bigquery.aws/reconcile/paypal_transaction/2021/10/03/paypal_transaction_raw
aws s3 cp './data/country_tax_codes.csv' s3://bq-shakhomirov.bigquery.aws/country_tax_codes.csv
aws s3 cp './data/payment_transaction_src' s3://bq-shakhomirov.bigquery.aws/payment_transaction_src
aws s3 cp './data/accounting_tax_type.csv' s3://bq-shakhomirov.bigquery.aws/accounting_tax_type.csv
```
Replace `bq-shakhomirov.bigquery.aws` with your bucket name.
This will emulate *Firehose* output with  prefix `reconcile/`.

- In your command line run: `npm run test-service`. This will generate a payload for tables in `source` schema of your BigQuery project.
- In your command line run: `npm run test-load`. This will load data from your bucket using final payload.


**Ultimatly you will need the following tables:**
- `reference.country_tax_codes`
- `reference.vat_rates`
- `source.payment_transaction`
- `source.paypal_transaction_src`: This table needs to be transformed into a new table or a view as your data flows into this source table in JSON format (VARIANT type). Check sample transaction for more info:
[Project 2/data/paypal_transaction]()

~~~JSON
{
    "transaction_info": {
        "paypal_account_id": "SomeAccount_1",
        "transaction_id": "0AE4SomeTransactionId1",
        "transaction_event_code": "T0007",
        ...
    "payer_info": {
        ...
    },
    "shipping_info": {
        ...
    },
  ...
}
~~~


### 2. Create a new table or a view on `source.paypal_transaction_src` table.

You would want to JSON_PARSE the values you need for reporting. 
*FAQ*: Why would I want to upload and save data in SRC/VARIANT format?
*Answer*: This approach proveds additional reliability in case extarnal data source schema changes. Data ingestion won't stop and your datawarehouse will be able to report on that schema change event. 

*FAQ*: I keep getting an error trying to load data into my dataset using **bigquery-ingest-manager**, i.e. `reference`.
*Answer*: Make sure your dataset exists and it s in the same location as other datasets. It is recommended that BigQuery tables must be in the same region to be able to query all of them in the same script.


### 3. Create a [Google Data Studio](https://datastudio.google.com) report template for **revenue reconciliation**:
- Go to [Data Studio](https://datastudio.google.com/reporting/f05459d2-01ef-4ca9-8e8e-436bbf42a043/page/nN2rB/preview) and copy one of the templates created in [Beginners tutorial](https://www.manning.com/liveproject/business-intelligence-with-BigQuery). Click *'Use tempalte'*.
- Modify the template. You would want to have the following:

#### Page 1. Recognised revenue from with totals:
* Total revenue according to **PayPal** for selected date range.
* Total revenue according to **your system** for selected date range.
* Missing transactions in your database for selected date range.
* Revenue aggregation per `country_of_sale`. This is an important step for accurate *Taxation*. 
- Add drill down into `country_of_sale`:
![img1](https://mydataschool.com/liveprojects/img/img-lp5-drill-down-1.png)

![img2](https://mydataschool.com/liveprojects/img/img-lp5-drill-down-2.png)
- Or try it without drill-down:
![img/img-lp5-no-drill-down.png](https://mydataschool.com/liveprojects/img/img-lp5-no-drill-down.png)
- Add Revenue breakdown by `country_of_sale`:
![img/img-lp5-no-drill-down.png](https://mydataschool.com/liveprojects/img/img-lp5-breakdown-by-country.png)

#### Page 2. Raw PayPal transaction data with totals:
* Table with  paypal transaction data:
~~~sql
    dt	                    STRING		-- stringified date in '%d/%m/%Y' format 
,   time	                STRING		
,   ts                      timestamp   -- UTC timestamp
,   tz	                    STRING			
,   type	                STRING		
,   status	                STRING		
,   currency	            STRING		
,   gross	                FLOAT64		
,   fee	                    FLOAT64		
,   net	                    FLOAT64	
,   end_balance_usd	        FLOAT64
,   balanceimpact           STRING
,   transactionid	        STRING
,   reftxnid                STRING
,   itemtitle	            STRING
,   product                 STRING  -- split itemtitle by '(ID' to get product name.
,   itemid	                STRING		
,   quantity	            STRING				
,   country	                STRING		
,   countrycode	            STRING		
,   row_number_asc_dt       int64   -- field to identify the first transaction on that date
,   row_number_desc_dt      int64   -- field to identify the last transaction on that date
,   transaction_dt          date    -- partition by this field
~~~

* PayPal aggregated sales data per `product`, `country of sale` and `currency of sale`.
* Must have `gross`,`fee`, `net` totals and `Openening` / `Closing balance` as a **score card** widget for selected date range.
![balances](https://mydataschool.com/liveprojects/img/img-lp5-start-end-balance.png)

* Adjust widgets accordingly:

![outcome](https://mydataschool.com/liveprojects/img/img-lp5-page_2_final.png)

* Your widgets should change dynamically with date range:
![dyanmic changes](https://mydataschool.com/liveprojects/img/img-lp5-start-end-balance_2.png)

#### Page 3. Recognised revenue prepared for monthly reconciliation:
* Must have fields:

- Account Reference     - `PAYPAL`
- Nominal A/C Reference - Accounting code number
- Date                  - `DD/MM/YYYY` formatted date
- Reference             - `start_date - end_date`; `DD/MM/YYYY` dates formatted 
- Narrative             - `Country_of_sale - Date_of_sale`; `YYYY-MM-DD` Date_of_sale formatted 
- VAT                   - VAT code, i.e. 'T67'
- Net Amount            - Revenue left after TAX in you account currency. In our case this would be USD.
- VAT Amount            - TAX amount  in your account currency (USD).

* Create a monthly upload table, i.e. `Reference` field equals to `2021-07-01 - 2021-07-31`:
![outcome](https://mydataschool.com/liveprojects/img/img-lp5-page3-monthly.png)
* It also should dusplay a drill down for missing transactions:
![missing](https://mydataschool.com/liveprojects/img/img-lp5-page3-monthly-drill_into_missing.png)

#### Page 4. Recognised revenue prepared for daily upload into accounting system:
* Create a Daily upload and write a script to populate it for each date within the date range needed.
This should reconcile with monthly totals on Page 3 in the end of the month.

## A few things to consider (as a dev spec).
**Here are the details for your project:**
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





**Deliverable**

The deliverable for this milestone is a working Google Data Studio template.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [Data Studio functions](https://support.google.com/datastudio/table/6379764)
* [About filters](https://support.google.com/datastudio/answer/6291066)
* [Calculated fields](https://support.google.com/datastudio/answer/9152828?hl=en)

*help*

* Hint for Step 1:

* Hint for Step 2:

*partial solution*
 
This is a Partial solution for app.js:

~~~js
~~~

*full solution*

