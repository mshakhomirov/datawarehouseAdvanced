# Create a BI report with Google Data Studio

## **Objective**

You will learn how to *create a business intelligence reports* using data in your Data warehouse. You will deploy a revenue reconciliation report using [Google Data Studio](https://datastudio.google.com).


## **Why is this milestone important to the project?**
This live project explains how to transform your data into a final dataset ready for further *Business Intelligence*. 
You will use **Data Studio** [template](https://datastudio.google.com/reporting/37f4b07b-f8cd-436b-9a7b-0ee37cdfafe4) and connect it to your data warehouse.
In your `analytics` dataset your data has been checked, cleansed, validated and prepared for reporting.
This approach gives you an easy way to deliver your data models to your final customers as reports. 
In this *liveProject* I will be using **BigQuery** as a central part of this diagram.

Modern data stack tools (not a complete list of course):
* Ingestion: **Fivetran, Stitch**
* Warehousing: Snowflake, Bigquery, Redshift
* Transformation: dbt, Dataflow, APIs.
* BI: Looker, Mode, Periscope, Chartio, Metabase, Redash

![Modern Data Stack](https://mydataschool.com/liveprojects/img/modernDataStack.png)

**In previous liveProjects we have built a complete data pipeline using *Serverless* which scales well.** It follows the ELT (Extract - Load - Transform) pattern, well documented, easily scalable and can be easily reproduced in any other environment. It is also very cost effective due to full control over partitioning in **BigQuery**.

Reporting tools for Data Visualisation can be expensive if you want to share datasources with your users, control their access priviliges and also let users to define metrics and give them freedom to create their own reports. 

In this *liveProject* you will learn how to achieve these goals using a completely free community solution such as [**Google Data Studio**](https://datastudio.google.com/).




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

## Hint for Step 1:
* Learn about [loading data in BigQuery](https://cloud.google.com/bigquery/docs/loading-data) and try to create `reference.country_tax_codes` using the source file.
* If you want to document your table source and other attributes and/or automate table creation and upload check [BigQuery ingest manager](https://github.com/mshakhomirov/BigQuery-ingest-manager).
It can create a table triggered by `S3objectCreate` event (if the file with country tax codes goes into S3 bucket) or if you run `npm run test` command with relevant payload manually.



## Hint for Step 2:
If you chose to use automated upload with [BigQuery ingest manager](https://github.com/mshakhomirov/BigQuery-ingest-manager) you can create table definitions like so:
~~~yaml
Tables:
  -
    pipeName: accounting_tax_type
    bigqueryName: custom_tax_type 
    datasetId: reference
    schema:
      - name: "country"
        type: "STRING"
        mode: "NULLABLE"
      - name: "tax_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "vat_rate"
        type: "FLOAT64"
        mode: "NULLABLE"
      - name: "custom_name"
        type: "STRING"
        mode: "NULLABLE"
      - name: "iso_2_code"
        type: "STRING"
        mode: "NULLABLE"

    fileFormat:
      load: CSV
      writeDisposition: WRITE_TRUNCATE
      skipLeadingRows: 1
      delimiter: '\t'
      allowJaggedRows: true
      transform:
        from:
      compression: none
    dryRun: false
    notes: a table with custom accounting tax names and tax codes. One off upload from s3.
~~~

*   After that you would want to adjust the payload and run `npm run test` or `npm run test-load` command.

## *partial solution*
 
This is a Partial solution for `stack/bq-ingest-manager/config/staging.yaml` with required table definitions to upload all data from `./data/` folder:

~~~yaml
# Emulate s3ObjectCreate events from this bucket. Copy your test files here.
dataBucket: bq-shakhomirov.bigquery.aws       # your staging s3 bucket. Replace with your bucket name.
key: data/                                    # optional folder key.

gcp:
  gcpProjectId: bq-shakhomirov-staging        # your gcp project used as staging env for BigQuery.

Tables:
  -
    pipeName: accounting_tax_type
    bigqueryName: custom_tax_type 
    datasetId: reference
    schema:
      - name: "country"
        type: "STRING"
        mode: "NULLABLE"
      - name: "tax_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "vat_rate"
        type: "FLOAT64"
        mode: "NULLABLE"
      - name: "custom_name"
        type: "STRING"
        mode: "NULLABLE"
      - name: "iso_2_code"
        type: "STRING"
        mode: "NULLABLE"

    fileFormat:
      load: CSV
      writeDisposition: WRITE_TRUNCATE
      skipLeadingRows: 1
      delimiter: '\t'
      allowJaggedRows: true
      transform:
        from:
      compression: none
    dryRun: false
    notes: a table with custom accounting tax names and tax codes. One off upload from s3.
  
  -
    pipeName: country_tax_codes
    bigqueryName: country_tax_codes 
    datasetId: reference
    schema:
      - name: "geoname_id"
        type: "STRING"
        mode: "NULLABLE"
      - name: "continent_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "continent_name"
        type: "STRING"
        mode: "NULLABLE"
      - name: "is_in_european_union"
        type: "INT64"
        mode: "NULLABLE"
      - name: "iso_2_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "iso_3_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "country_name"
        type: "STRING"
        mode: "NULLABLE"
      - name: "tax_code"
        type: "STRING"
        mode: "NULLABLE"

    fileFormat:
      load: CSV
      writeDisposition: WRITE_TRUNCATE
      skipLeadingRows: 1
      delimiter: ','
      allowJaggedRows: true
      transform:
        from:
      compression: none
    dryRun: false
    notes: a table with country_iso_3 codes and names enriched with tax codes. One off upload from s3://bq-shakhomirov.bigquery.aws/country_tax_codes.csv

  -
    pipeName: payment_transaction_src
    bigqueryName: payment_transaction
    datasetId: production
    schema:
      - name: "transaction_id"
        type: "INT64"
        mode: "NULLABLE"
      - name: "payment_merchant_id"
        type: "INT64"
        mode: "NULLABLE"
      - name: "merchant_invoice_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "merchant_invoice_code_id"
        type: "INT64"
        mode: "NULLABLE"
      - name: "user_id"
        type: "INT64"
        mode: "NULLABLE"
      - name: "total_cost"
        type: "FLOAT64"
        mode: "NULLABLE"
      - name: "currency_code"
        type: "STRING"
        mode: "NULLABLE"
      - name: "payer_email"
        type: "STRING"
        mode: "NULLABLE"
      - name: "country_code"
        type: "STRING"
        mode: "NULLABLE"  
      - name: "payment_date"
        type: "TIMESTAMP"
        mode: "NULLABLE"
      - name: "transaction_status"
        type: "STRING"
        mode: "NULLABLE"            
      - name: "ip_address"
        type: "STRING"
        mode: "NULLABLE"                    
      - name: "created_at"
        type: "TIMESTAMP"
        mode: "NULLABLE"
      - name: "transaction_item_id"
        type: "INT64"
        mode: "NULLABLE"  
      - name: "product_id"
        type: "INT64"
        mode: "NULLABLE" 
      - name: "item_count"
        type: "INT64"
        mode: "NULLABLE"                       

    partitionField: created_at
    fileFormat: 
      load: NLDJ
      transform: 
        from: OBJECT_STRING                   # from OBJECT_STRING to NLDJ, i.e. {....}{....}{....}
      compression: none
    dryRun: false
    notes: Firehose subscriber_actions

  -
    pipeName: paypal_transaction              # pick all files which have this in file key.
    bigqueryName: paypal_transaction_src      # BigQuery table name to insert data.
    datasetId: source
    schema:
      - name: "src"
        type: "STRING"
        mode: "NULLABLE"
    # partitionField: created_at              # if empty use date(ingestion time) as partition. Default.
    fileFormat:
      load: CSV                               # load as.
      delimiter: 'þ'                          # hacky way of loading as one row
      transform:                              # Transform from this into load format accepted by BigQuery.
        from: OUTER_ARRAY_JSON                # Array of individual JSON objects to SRC, i.e. [{...},{...},{...}] >>> '{...}'\n'{...}'\n'{...}'\n
      compression: none
    dryRun: false                             # If true then don't insert into a table.
    notes: Daily extract from PayPal API by bq-data-connectors/paypal-revenue AWS Lambda
~~~

## *full solution*
### Creating source tables
* Go to [BigQuery ingest manager](https://github.com/mshakhomirov/BigQuery-ingest-manager), branch `liveProject`.
* Supply your data warehouse credentials in `./config/` folder
* Run `$ npm i`
* Upload files from `./data/` to your S3 bucket. Add this bucket name to `./config/staging.yaml`.
* check `stack/bq-ingest-manager/test/integration/loadTestPipelines.json` and make sure your csv exists in s3. For example, replace bucket name with yours:
~~~json
{
    "Records": [
      {
        "pipeName": "country_tax_codes",
        "enabled": true,
        "bucket": {
          "name": "bq-shakhomirov.bigquery.aws"
        },
        "object": {
          "key": ""
        },
        "datePrefix": "",
        "example": "country_tax_codes.csv"
      },
      ...
~~~
* then in your command line run:
```shell
$ npm run test-service
$ npm run test-load
```

As a result in your terminal you will see:
~~~bash
{
  result: { table: 'country_tax_codes', rowsInserted: '251' },
  pass: true
}
{"passed":[{"table":"country_tax_codes","rowsInserted":"251"}],"failed":[]}
~~~
![custom_tax_codes table](https://mydataschool.com/liveprojects/img/img-lp5-custom_tax_codes.png)

### Creating the report in Data Studio
Create a new table or a view on `source.paypal_transaction_src` table.
* replace `bq-shakhomirov-staging` with your BigQuery project name:

~~~sql
create table if not exists `bq-shakhomirov-staging.production.paypal_transaction` (

    dt	      STRING		
,   time	    STRING
,   ts        timestamp	
,   tz	      STRING			
,   type	    STRING		
,   status	  STRING		
,   currency	STRING		
,   gross	          FLOAT64		
,   fee	            FLOAT64		
,   net	            FLOAT64	
,   end_balance_usd	FLOAT64
,   balanceimpact STRING
,   transactionid	STRING
,   reftxnid      STRING
,   itemtitle	    STRING
,   product       STRING  -- split itemtitle by '(ID' to get product name.
,   itemid	      STRING		
,   quantity	    STRING				
,   country	      STRING		
,   countrycode	  STRING		
,   row_number_asc_dt     int64
,   row_number_desc_dt    int64
,   transaction_dt        date
)
PARTITION BY transaction_dt
OPTIONS(
    description="daily PayPal data enriched with dates and parsed values for balances, updates daily cron(00 6 * * ? *) by scheduled query: paypal_transaction"
    ,labels=[("schedule", "daily")]
)
;

insert `bq-shakhomirov-staging.production.paypal_transaction` (
    -- you probably don't need all fields. Select only:
      dt	    		
  ,   time
  ,   ts  		
  ,   tz	    			
  ,   type	  		
  ,   status			
  ,   currency			
  ,   gross	  		
  ,   fee	    		
  ,   net	    	
  ,   end_balance_usd	
  ,   balanceimpact 
  ,   transactionid
  ,   reftxnid		
  ,   itemtitle
  ,   product	
  ,   itemid			
  ,   quantity					
  ,   country			
  ,   countrycode			
  ,   row_number_asc_dt 
  ,   row_number_desc_dt   
  ,   transaction_dt
)

with d as (
select
   
  CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_initiation_date')      AS timestamp)        as ts
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_event_code')                                     as type
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_status')                                         as status
, CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.ending_balance.value')      AS FLOAT64)     as end_balance_usd
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_amount.currency_code')               as currency
, CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_amount.value')  AS FLOAT64)     as gross
, CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.fee_amount.value')          AS FLOAT64)     as fee
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.fee_amount.currency_code')                       as fee_currency
, CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_amount.value')  AS FLOAT64)
    +
  CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.fee_amount.value')          AS FLOAT64) 
                                                                                                as net
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_id')                                 as transaction_id
, JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_name')                             as item_title
, JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_code')                             as item_id
, JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_quantity')                         as item_quantity
, JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].invoice_number')                        as invoice_number
, JSON_EXTRACT_ARRAY(src, '$.cart_info.item_details')                                           as item_details
, JSON_EXTRACT_SCALAR(src, '$.payer_info.country_code')                                         as country_code
-- this item_count must be 1 always. Needs data check or alert if not:
, ARRAY_LENGTH(JSON_EXTRACT_ARRAY(src, '$.cart_info.item_details') )                            as item_count
, JSON_EXTRACT_SCALAR(src, '$.transaction_info.paypal_reference_id')                            as reftxnid

from 
    `bq-shakhomirov-staging.source.paypal_transaction_src` 

)

-- (dt, time, tz, type, status, currency, gross, fee, net, transactionid, itemId, itemtitle, currency, countrycode, country, reftxnid)
select distinct
FORMAT_DATE('%d/%m/%Y', date(d.ts))     as dt -- your Finance department used to download that report from Web and dt column was in that format.
, cast(d.ts as STRING)                  as time
, d.ts                                  as ts
, 'UTC'                                 as tz
, case  
    when d.type = 'T0007' then 'Website Payment'
    when d.type = 'T1201' then 'Chargeback'         --  Adjustment
    when d.type = 'T1106' then 'Payment reversal'   --  Completion of a chargeback.
    when d.type = 'T0114' then 'Dispute Fee'
    when d.type = 'T0006' then 'Express Checkout Payment'
    when d.type = 'T0200' then 'General Currency Conversion'
    when d.type = 'T0000' then 'General Payment' -- https://developer.paypal.com/docs/integration/direct/transaction-search/transaction-event-codes/
    when d.type = 'T0400' then 'General Withdrawal'
    when d.type = 'T2105' then 'Payment Review Hold'
    when d.type = 'T2106' then 'Payment Review Release'
    when d.type = 'T0400' then 'Settlement withdrawal or user-initiated.'
    else d.type
    end 
                        as type

, case  
    when d.status = 'S' then 'Completed'
    when d.status = 'R' then 'Reversed'
    when d.status = 'P' then 'Pending'
    else d.status
    end 
                        as status
, d.currency            as currency
, d.gross
, d.fee
, d.net
, d.end_balance_usd                 as end_balance_usd
, if(d.gross < 0, 'Debit','Credit') as balanceimpact
, d.transaction_id      as transactionid
, d.reftxnid            as reftxnid
, d.item_title          as itemtitle
, (split(d.item_title,' ('))[offset(0)] as product
, d.item_id             as itemId
, d.item_quantity       as quantity
, iso3.country_name     as country
, d.country_code        as countrycode

, row_number() over(partition by date(d.ts) order by d.ts )       as  row_number_asc_dt
, row_number() over(partition by date(d.ts) order by d.ts desc)   as  row_number_desc_dt
, date(d.ts)            as transaction_dt
from d     
LEFT JOIN `bq-shakhomirov-staging.reference.country_tax_codes` iso3 ON iso3.iso_2_code = d.country_code
-- where date(ts) >= date_sub(current_date(), interval 2 day) -- Optional if you want to schedule for daily updates.
;
~~~

### Page 2. Raw PayPal transaction data with totals:
Create a custom dataset in Data Studio.
~~~sql
select 
  * except(row_number_asc_dt,row_number_desc_dt)
  , row_number() over( order by d.ts )       as  row_number_asc_dt    -- This will give you a marker for start balance within selected dat range in Data Studio report.
  , row_number() over( order by d.ts desc)   as  row_number_desc_dt   -- This will give you a marker for end balance within selected dat range in Data Studio report.

from
  `bq-shakhomirov-staging.production.paypal_transaction` d
where
  transaction_dt >= PARSE_DATE('%Y%m%d', @DS_START_DATE)
  and transaction_dt <= PARSE_DATE('%Y%m%d', @DS_END_DATE)
~~~
* Adjust widgets accordingly:

![outcome](https://mydataschool.com/liveprojects/img/img-lp5-page_2_final.png)


#### As a result you will see that 10 transactions have been inserted successfully:
![paypal_transaction](https://mydataschool.com/liveprojects/img/img-lp5-paypal_transaction_1.png)

### To create the final table with revenue reconciliation use this script:

~~~sql
-- declare PayPal dates for revenue reconciliation:
DECLARE DS_START_DATE STRING;
DECLARE DS_END_DATE STRING;
---- Use this to schedule daily calculation:
-- SET DS_START_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));
-- SET DS_END_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));

SET DS_START_DATE   = '20210701';
SET DS_END_DATE     = '20210731';



-- Now create PayPal revenue reconciliation table. This table (SQL) will define the logic.
create table if not exists `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_monthly` ( -- This of course could be a shorter name.
        paypal_item_id          int64 
    ,   paypal_settled_dt       date	 	
    ,   transaction_item_id     int64
    ,   total_cost              float64 	 	
    ,   paypal_type             string 	 	
    ,   paypal_item_quantity    int64
    ,   paypal_country          string 	 	
    ,   paypal_currency         string 	 	
    ,   paypal_country_code     string 	 	
    ,   paypal_revenue_usd      float64 	 	
    ,   paypal_net_usd  	    float64 	 	
    ,   paypal_end_balance_usd	float64 	 	
    ,   payment_date	        string 	 	
    ,   vat_amount_usd	        float64 	 	
    ,   paypal_tax_code	        string 	 	
    ,   vat_rate	            float64 	 	
    ,   custom_name             string 	 	
    ,   accounting_narrative	string 	 	
    ,   account_reference       string
    ,   reference               string
    ,   report_start_dt           date
    ,   report_end_dt             date
    ,   settled_time_latest     int64

)
PARTITION BY paypal_settled_dt
CLUSTER BY paypal_country_code
OPTIONS(
    description="daily revenue reconciliation table for PayPal settled transactions settled DAY minus 2 days, updates daily cron(30 6 * * ? *) by scheduled query: paypal_transaction_reconciliation"
    ,labels=[("schedule", "daily")]
)
;

insert `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_monthly`
            -- todo: dataCheck: check for duplicates in results.
with 
-- First find out if we had any reversal transactions:
pp as (
    select 
            -- todo: dataCheck: you would want to have a dataCheck here in case PP starts sending 0 length data for reversals instead of null:
            cast(coalesce(pp.itemId, rt.itemId)  as int64)                          as itemId
        ,   pp.type                                                                 as type
        ,   cast(pp.quantity    as int64)                                           as quantity
        ,   pp.currency                                                             as currency
        ,   coalesce(pp.countrycode, rt.countrycode)                                as countrycode
        ,   pp.gross                                                                as gross
        ,   coalesce(pp.country, rt.country)                                        as country
        ,   coalesce(pp.end_balance_usd, rt.end_balance_usd)                        as end_balance_usd
        ,   coalesce(parse_date('%d/%m/%Y', pp.dt), parse_date('%d/%m/%Y', rt.dt))  as settled_dt
        ,   coalesce(pp.time,rt.time)                                               as time

    from production.paypal_transaction      pp
    -- need all time data here to find reversals if any exist:
    left join production.paypal_transaction rt on pp.reftxnid = rt.transactionId and lower(pp.type) = 'payment reversal' 
    where
            pp.type in ('Express Checkout Payment', 'Website Payment', 'Payment reversal', 'Chargeback')
        and
            parse_date('%d/%m/%Y', pp.dt) >= parse_date('%Y%m%d', DS_START_DATE) 
        and
            parse_date('%d/%m/%Y', pp.dt) <=  parse_date('%Y%m%d', DS_END_DATE)
)

-- Now enrich data with geocodes and tax rates:
,   e as (
    select 
            -- todo: dataCheck: you would want to have a dataCheck here in case PP starts sending 0 length data for reversals instead of null:
            pp.itemId                                                       as paypal_item_id
        ,   pp.settled_dt                                                   as paypal_settled_dt
        ,   row_number() over(partition by date(cast(time as timestamp)) 
                order by cast(time as timestamp) desc)                      as settled_time_latest
        ,   pt.transaction_item_id                                          as transaction_item_id
        ,   pt.total_cost                                                   as total_cost_usd
        ,   pp.type                                                         as paypal_type
        ,   pp.quantity                                                     as paypal_item_quantity
        ,   ifnull(pp.country, 'MISSING TRANSACTIONS/COUNTRY UNKNOWN')      as paypal_country
        ,   pp.currency                                                     as paypal_currency
        ,   pp.countrycode                                                  as paypal_country_code
        ,   round(pp.gross, 3)                                              as paypal_revenue_usd
        ,   round(pp.gross  / (1+ vr.vat_rate), 3)                          as paypal_net_usd
        ,   ifnull(
              format_datetime('%d/%m/%Y', DATETIME( pt.payment_date , "UTC"))
            , 'MISSING TRANSACTIONS'
            )                                                               as payment_date
        ,   pp.end_balance_usd                                              as paypal_end_balance_usd
        ,   round(pp.gross -  (pp.gross  / (1+ vr.vat_rate)),3)             as vat_amount_usd
        ,   ct.tax_code                                                     as paypal_tax_code
        ,   vr.vat_rate
        ,   vr.custom_name
        ,   concat(
                ifnull(pp.country, 'MISSING TRANSACTIONS/COUNTRY UNKNOWN'),
                ' - ',
                cast(date(payment_date) AS string)
            )                                                               as accounting_narrative
        ,   'PAYPAL'                                                        as account_reference

        ,   concat( 
                cast(parse_date('%Y%m%d', ds_start_date) as string)
            ,   ' - '
            ,   cast(parse_date('%Y%m%d', ds_end_date) as string)
            )                                                               as reference
        

        ,   parse_date('%Y%m%d', DS_START_DATE)                             as report_start_dt
        ,   parse_date('%Y%m%d', DS_END_DATE)                               as report_end_dt

    from pp
    left join reference.country_tax_codes   ct on ct.iso_2_code = pp.countrycode
    left join reference.custom_tax_type     vr on vr.tax_code   = ct.tax_code
    left join  production.payment_transaction pt             
        on pp.itemId = pt.transaction_item_id
        and lower(pp.type) != 'payment reversal' -- your database can't handle reversed transactions yet.
    
    and 
      date(pt.payment_date) >= parse_date('%Y%m%d', DS_START_DATE) 
      and
      date(pt.payment_date) <= parse_date('%Y%m%d', DS_END_DATE)
    
)

-- Prepare everything in deterministic order for Data Studio
select
        paypal_item_id
    ,   paypal_settled_dt
    , 	transaction_item_id
    ,   total_cost_usd
    , 	paypal_type
    , 	paypal_item_quantity
    , 	paypal_country
    , 	paypal_currency
    , 	paypal_country_code
    , 	paypal_revenue_usd
    , 	paypal_net_usd
    ,   paypal_end_balance_usd
    , 	payment_date
    , 	vat_amount_usd
    , 	paypal_tax_code
    , 	vat_rate
    , 	custom_name
    , 	accounting_narrative
    , 	account_reference
    ,   reference              
    ,   report_start_dt
    ,   report_end_dt
    ,   settled_time_latest

from e
;
~~~

### Page 4. Recognised revenue prepared for daily upload into accounting system.

Here is the script that will reload each day's data:

~~~sql
-- declare dates and other variables for revenue reconciliation:
DECLARE dates ARRAY<DATE>;
DECLARE query STRING DEFAULT 'SELECT ';
DECLARE dt STRING DEFAULT ' ';
DECLARE i INT64 DEFAULT 0;

SET dates = GENERATE_DATE_ARRAY('2021-07-03', '2021-07-31', INTERVAL 1 DAY);



-- Now create PayPal revenue reconciliation table. This table (SQL) will define the logic.
create table if not exists `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_daily` ( -- This of course could be a shorter name.
        paypal_item_id          int64 
    ,   paypal_settled_dt       date	 	
    ,   transaction_item_id     int64
    ,   total_cost              float64 	 	
    ,   paypal_type             string 	 	
    ,   paypal_item_quantity    int64
    ,   paypal_country          string 	 	
    ,   paypal_currency         string 	 	
    ,   paypal_country_code     string 	 	
    ,   paypal_revenue_usd      float64 	 	
    ,   paypal_net_usd  	    float64 	 	
    ,   paypal_end_balance_usd	float64 	 	
    ,   payment_date	        string 	 	
    ,   vat_amount_usd	        float64 	 	
    ,   paypal_tax_code	        string 	 	
    ,   vat_rate	            float64 	 	
    ,   custom_name             string 	 	
    ,   accounting_narrative	string 	 	
    ,   account_reference       string
    ,   reference               string
    ,   report_start_dt           date
    ,   report_end_dt             date
    ,   settled_time_latest     int64

)
PARTITION BY paypal_settled_dt
CLUSTER BY paypal_country_code
OPTIONS(
    description="daily revenue reconciliation table for PayPal settled transactions settled DAY minus 2 days, updates daily cron(30 6 * * ? *) by scheduled query: paypal_transaction_reconciliation"
    ,labels=[("schedule", "daily")]
)
;

SET query = """
insert `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_daily`
            -- todo: dataCheck: check for duplicates in results.
with 
-- First find out if we had any reversal transactions:
pp as (
    select 
            -- todo: dataCheck: you would want to have a dataCheck here in case PP starts sending 0 length data for reversals instead of null:
            cast(coalesce(pp.itemId, rt.itemId)  as int64)                          as itemId
        ,   pp.type                                                                 as type
        ,   cast(pp.quantity    as int64)                                           as quantity
        ,   pp.currency                                                             as currency
        ,   coalesce(pp.countrycode, rt.countrycode)                                as countrycode
        ,   pp.gross                                                                as gross
        ,   coalesce(pp.country, rt.country)                                        as country
        ,   coalesce(pp.end_balance_usd, rt.end_balance_usd)                        as end_balance_usd
        ,   coalesce(parse_date('%d/%m/%Y', pp.dt), parse_date('%d/%m/%Y', rt.dt))  as settled_dt
        ,   coalesce(pp.time,rt.time)                                               as time

    from production.paypal_transaction      pp
    -- need all time data here to find reversals if any exist:
    left join production.paypal_transaction rt on pp.reftxnid = rt.transactionId and lower(pp.type) = 'payment reversal' 
    where
            pp.type in ('Express Checkout Payment', 'Website Payment', 'Payment reversal', 'Chargeback')
        and
            parse_date('%d/%m/%Y', pp.dt) >= parse_date('%Y%m%d', @a) 
        and
            parse_date('%d/%m/%Y', pp.dt) <=  parse_date('%Y%m%d', @a)
)

-- Now enrich data with geocodes and tax rates:
,   e as (
    select 
            -- todo: dataCheck: you would want to have a dataCheck here in case PP starts sending 0 length data for reversals instead of null:
            pp.itemId                                                       as paypal_item_id
        ,   pp.settled_dt                                                   as paypal_settled_dt
        ,   row_number() over(partition by date(cast(time as timestamp)) 
                order by cast(time as timestamp) desc)                      as settled_time_latest
        ,   pt.transaction_item_id                                          as transaction_item_id
        ,   pt.total_cost                                                   as total_cost_usd
        ,   pp.type                                                         as paypal_type
        ,   pp.quantity                                                     as paypal_item_quantity
        ,   ifnull(pp.country, 'MISSING TRANSACTIONS/COUNTRY UNKNOWN')      as paypal_country
        ,   pp.currency                                                     as paypal_currency
        ,   pp.countrycode                                                  as paypal_country_code
        ,   round(pp.gross, 3)                                              as paypal_revenue_usd
        ,   round(pp.gross  / (1+ vr.vat_rate), 3)                          as paypal_net_usd
        ,   ifnull(
              format_datetime('%d/%m/%Y', DATETIME( pt.payment_date , "UTC"))
            , 'MISSING TRANSACTIONS'
            )                                                               as payment_date
        ,   pp.end_balance_usd                                              as paypal_end_balance_usd
        ,   round(pp.gross -  (pp.gross  / (1+ vr.vat_rate)),3)             as vat_amount_usd
        ,   ct.tax_code                                                     as paypal_tax_code
        ,   vr.vat_rate
        ,   vr.custom_name
        ,   concat(
                ifnull(pp.country, 'MISSING TRANSACTIONS/COUNTRY UNKNOWN'),
                ' - ',
                cast(date(payment_date) AS string)
            )                                                               as accounting_narrative
        ,   'PAYPAL'                                                        as account_reference

        ,   concat( 
                cast(parse_date('%Y%m%d', @a) as string)
            ,   ' - '
            ,   cast(parse_date('%Y%m%d', @a) as string)
            )                                                               as reference
        

        ,   parse_date('%Y%m%d', @a)                                        as report_start_dt
        ,   parse_date('%Y%m%d', @a)                                        as report_end_dt

    from pp
    left join reference.country_tax_codes   ct on ct.iso_2_code = pp.countrycode
    left join reference.custom_tax_type     vr on vr.tax_code   = ct.tax_code
    left join  production.payment_transaction pt             
        on pp.itemId = pt.transaction_item_id
        and lower(pp.type) != 'payment reversal' -- your database can't handle reversed transactions yet.
    and 
        date(pt.payment_date) >= parse_date('%Y%m%d', @a) 
        and
        date(pt.payment_date) <= parse_date('%Y%m%d', @a)
    
)

-- Prepare everything in deterministic order for Data Studio
select
        paypal_item_id
    ,   paypal_settled_dt
    , 	transaction_item_id
    ,   total_cost_usd
    , 	paypal_type
    , 	paypal_item_quantity
    , 	paypal_country
    , 	paypal_currency
    , 	paypal_country_code
    , 	paypal_revenue_usd
    , 	paypal_net_usd
    ,   paypal_end_balance_usd
    , 	payment_date
    , 	vat_amount_usd
    , 	paypal_tax_code
    , 	vat_rate
    , 	custom_name
    , 	accounting_narrative
    , 	account_reference
    ,   reference              
    ,   report_start_dt
    ,   report_end_dt
    ,   settled_time_latest

from e
;
"""
;

LOOP
    SET i = i + 1;
    
    IF i > ARRAY_LENGTH(dates) THEN 
    LEAVE;
    END IF;
    set dt = FORMAT_DATE("%Y%m%d",  dates[ORDINAL(i)]);
    EXECUTE IMMEDIATE query USING dt as a;

END LOOP;

~~~

## If you need to drop and reload all tables:

Sometimes you might want to update your raw data files or maybe add some extra data.
Change your files. Then drop your tables. Reload.
1. Drop tables
~~~sql
drop table `bq-shakhomirov-staging.source.paypal_transaction_src`
;
drop table `bq-shakhomirov-staging.production.paypal_transaction`
;
drop table `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_daily`
;
drop table `bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_monthly`
;
drop table `bq-shakhomirov-staging.production.payment_transaction`
;
drop table `bq-shakhomirov-staging.reference.country_tax_codes`
;
drop table `bq-shakhomirov-staging.reference.country_tax_codes`
;

~~~

2. Check that loadTestPipelines.json containes the pipes you need, i.e.
~~~json
{
        "pipeName": "paypal_transaction_raw",
        "enabled": true,
        "bucket": {
            ...
~~~

3. In your command line run:
```shell
$ npm run test-load
```

4. Run data transformation scripts you need. i.e. `paypal_transaction`.
