## Create your BigQuery project and connect to Dataform

**Objective**

* Create BigQuery project for `production` environment
* Create Google service account credentials and connect with [Dataform](dataform.com).


## **Why is this milestone important to the project?**

- You will learn how to create isolated environments for live and staging data in BigQuery. For example, I use `bq-shakhomirov` BigQuery project in `Production` and `bq-shakhomirov-staging` for `Staging` to run tests.
- You will connect your *github* account to Dataform and keep all BigQuery data transformation scripts in one repository.
- You will learn how to schedule dataset and table updates using [Dataform](dataform.co).


## **Workflow**

### **[1]. Create your BigQuery project and connect to Dataform**
#### [1.1] **Generating data warehouse credentials**

In order for Dataform to connect to your BigQuery warehouse you’ll need to use *Application Default Credentials* or a *service account and JSON key*.
You’ll need to create a service account from your **[Google Cloud Console](https://console.cloud.google.com/)** and assign it permissions to access **BigQuery**.

#### [1.2] **Connecting your data warehouse and Dataform**
- Go to [https://app.dataform.co/](https://app.dataform.co/) and create your **Dataform** project. You can choose to sign-up using your **Github** account for example and then create your first project:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-5.png)
- Give your project a name, i.e. `bq-shakhomirov`.
- You will need your BigQuery project ID to connect to Dataform. You can find it in your [BigQuery console](https://console.cloud.google.com/) by simply clicking your project:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-6.png)
- You will see a page like one below. Click `browse` and upload your JSON key:
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-7.png)
Click `test connection` and if everything's okay you will be set to go. Then Click `save connection`

**[2]. Create your tables using Dataform**
[2.1] Add new dataset called `analytics`. We will use it for our **Dataform** tables with enriched data.
- With files from`./data/` folder of this project create source tables and declare them in Dataform.
```shell
.
├── accounting_tax_type.csv
├── country_tax_codes.csv
├── payment_transaction_src
└── paypal_transaction_raw.json
```
- List of `source` tables you will need:
* `reference.country_tax_codes`
* `reference.custom_tax_type`
* `source.paypal_transaction_src`
* `production.payment_transaction`

- If you want to document your table source and other attributes and/or automate table creation and upload check [BigQuery ingest manager](https://github.com/mshakhomirov/BigQuery-ingest-manager).
It can create a table triggered by `S3objectCreate` event (if the file with country tax codes goes into S3 bucket) or if you run `npm run test` command with relevant payload manually. This **manager** is well explained in [live Project 2]()

[2.2] Using Dataform UI create a new table with revenue reconciliation data.
- Click on the `New Dataset` button in the left hand side bar.
- Choose whether you want your dataset to be a table, view, incremental table or operation. In this case we want to create a table or custom operation (SQL script):
- Use Dataform's **ref()** function to reference `payment_transaction` and `paypal table` as dependancies for `paypal_reconciliation` table.
- List of `analytics` tables generated by Dataform from `source` tables:
* `analytics.paypal_transaction_reconciliation_daily`
* `analytics.paypal_transaction_reconciliation_monthly`
- Dataform will automatically validate your query and check for any errors
- Once you see that the query is valid you can click Preview Results to check that the data looks correct.

- Click `Create Table` to create the table in your warehouse.
This will take the SQLX that we’ve written, compile it into the SQL syntax of your warehouse (in this case, BigQuery), and then execute that SQL in your warehouse with the correct boilerplate code to create a table. You will see that your new dataset has been successfully published to datawarehouse.

[2.3] You would want to publish our changes to `analytics` dataset into your `Production` BigQuery project (`bq-shakhomirov` project in my case). Adjust your dataform project settings accordingly.

### Your dependency tree
![outcome](https://mydataschool.com/liveprojects/img/LP3/dataform_dep_tree.png)

This resulting table in this example is quite complex and has few development requirements (below) but ultimately you would want to check your database data against PayPal by matching it using PayPal **itemId**, i.e.:
~~~sql
...
select * from
  production.paypal_transaction pp
left join  production.payment_transaction pt             
    on pp.itemId = pt.transaction_item_id
~~~

In case you want to try complete solution here is the development specification.
## Here are the details for your task (also explained in detail in liveProject5):
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


## **Deliverable**

The deliverable for this milestone is a new [Dataform](dataform.co) project connected to your BigQuery data warehouse. 
Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


## **Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*
* [Google Authentication](https://cloud.google.com/bigquery/docs/authentication)
* [Dataform docs](https://docs.dataform.co/warehouses/bigquery#service-account) : Exaplins how to create service account credentials.




### *Help for Step [1.1]:*
- Read **Dataform** [docs](https://docs.dataform.co/getting-started-tutorial/set-up)

### **To create a new service account in Google Cloud Console you need to:**

#### [1.1] Go to the [Services Account page](https://console.cloud.google.com/iam-admin/serviceaccounts)
- Make sure the new project you created is selected and click `Open`.
- Click on `Create Service Account` and give it a name.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-1.png)
- Grant the new account the **BigQuery Admin** role.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-2.png)

#### [1.2] Once you’ve done this you need to create a key for your new service account (in JSON format):
- On the Service Accounts page, find the row of the service account that you want to create a key for and click the `Actions` button.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-3.png)
- Then click `Manage keys`.
- Click `Create` and Select JSON key type.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-4.png)

**Now you've created a new **BigQuery** project and generated your warehouse credentials, you're ready to create your Dataform project!**

### *Hint for Step [2.2]*:
Your Data Warehouse project will depend on raw data stored in your warehouse, created by processes external to it. These external processes can change the structure of your tables over time (column names, column types…).
It is recommended to use `declarations` to define raw data tables.

- In scripts to populate `paypal_transaction_reconciliation` tables you would want to reference those **source** tables. You would want to use Dataform's **ref()** function to do so.
Read about Dataform [Best Practices](https://docs.dataform.co/best-practices/start-your-dataform-project) and try to find out how to use `declarations`.

- In your Dataform project create a folder `./definitions/source` and a file called `./definitions/source/payment_transaction.sqlx` with the following content:
~~~json
config {
  type: "declaration",
  schema: "production",
  name: "payment_transaction",
  description: "External table. For example, can be populated by Kinesis Firehose or AWS Lambda."
}
~~~
- Now you can update your `paypal_transaction_reconciliation_daily` table with `${ref("payment_transaction")}` instead of actual table name.

### *Hint for Step [2.3]*: 
- If you go to **Project Configuration** and change your **defaultSchema**.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-12.png)
- Output schema can be also be defined in you *.sqlx* file. Finish your `analytics` table definition.
- Click `Create`. This will create our table in `analytics` dataset in BigQuery.
- Click **View logs**


## *partial solution*
 
Here is the *partial solution script* for this milestone step [2.2]. Download this file, use it to develop your solution, and upload your deliverable. For complete solution you will need to add a final table with revenue reconciliation. 

### **Partial solution for step [2.2]**
* First you would want to declare external tables:
The code below shows how to use declarations.
- definitions/source/payment_transaction.sqlx
~~~sql

config {
  type: "declaration",
  schema: "production",
  name: "payment_transaction",
  description: "External table. For example, can be populated by Kinesis Firehose or AWS Lambda."
}
~~~
- definitions/source/country_tax_codes.sqlx
~~~sql

config {
  type: "declaration",
  schema: "reference",
  name: "country_tax_codes",
  description: "External table example. Countries and tax codes"
}

~~~

- definitions/source/custom_tax_type.sqlx
~~~sql
config {
  type: "declaration",
  schema: "reference",
  name: "custom_tax_type",
  description: "External table example. Country codes and custom tax codes used in accounting"
}
~~~

- definitions/source/paypal_transaction_src.sqlx
~~~sql
config {
  type: "declaration",
  schema: "reference",
  name: "paypal_transaction_src",
  description: "External table example. PayPal reporting transactions. Each row = individual JSON object representing a transaction."
}
~~~

- Create a new table or a view on `source.paypal_transaction_src` table.
* definitions/production/paypal_transaction.sqlx

~~~sql
config {
  type: "operations",
  hasOutput: true,
  schema: "analytics",
  disabled: false,
  tags: ["production", "daily", "paypal_transaction"],
  description: "Script to populate production.paypal_transaction table."
}

-- tag: paypal_transaction - tag ends/

DECLARE DS_START_DATE STRING;
DECLARE DS_END_DATE STRING;

SET DS_START_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 1 day) ));
SET DS_END_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 1 day) ));

create table if not exists ${self()} ( --`bq-shakhomirov-staging.production.paypal_transaction` (

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

insert ${self()} ( --`bq-shakhomirov-staging.production.paypal_transaction` (
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
    ${ref("paypal_transaction_src")} -- `bq-shakhomirov-staging.source.paypal_transaction_src` 

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
LEFT JOIN ${ref("country_tax_codes")} iso3 --`bq-shakhomirov-staging.reference.country_tax_codes` iso3 
  ON iso3.iso_2_code = d.country_code
-- where date(ts) >= date_sub(current_date(), interval 2 day) -- Optional if you want to schedule for daily updates.
;
~~~


- Add a data check for unique transactions in `payment_transaction` table:

~~~sql
config {
  type: "table",
  assertions: {
    uniqueKey: ["transaction_id"]
  }
}
  SELECT
   *
  FROM ${ref("payment_transaction")} t --`bq-shakhomirov.production.payment_transaction`  t

~~~



## *full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.

Using `source` tables you would want to schedule scripts/operations to generate `analytics.tables`.
- List of `analytics` tables generated by Dataform from `source` tables:
* `analytics.paypal_transaction_reconciliation_daily`
* `analytics.paypal_transaction_reconciliation_monthly`
* your final definitions in dataform must look like this:
![](https://mydataschool.com/liveprojects/img/LP3/dataform_definitions.png)

### To create the final *monthly* table with revenue reconciliation use this script:

- definitions/analytics.paypal_transaction_reconciliation_monthly.sqlx

~~~sql
config {
  type: "operations",
  hasOutput: true,
  schema: "analytics",
  disabled: false,
  tags: ["analytics", "monthly", "paypal_transaction_reconciliation_monthly"],
  description: "Script to populate analytics.paypal_transaction_reconciliation_monthly table."
}

-- declare PayPal dates for revenue reconciliation:
DECLARE DS_START_DATE STRING;
DECLARE DS_END_DATE STRING;
---- Use this to schedule daily calculation:
-- SET DS_START_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));
-- SET DS_END_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));

SET DS_START_DATE   = '20210701';
SET DS_END_DATE     = '20210731';



-- Now create PayPal revenue reconciliation table. This table (SQL) will define the logic.
create table if not exists ${self()} ( --`bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_monthly` ( -- This of course could be a shorter name.
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
    ,labels=[("schedule", "monthly")]
)
;

insert ${self()} --`bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_monthly`
with 
-- First find out if we had any reversal transactions:
pp as (
    select 
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

    from  ${ref("paypal_transaction")} pp --production.paypal_transaction      pp
    -- need all time data here to find reversals if any exist:
    left join ${ref("paypal_transaction")} rt --production.paypal_transaction rt 
      on pp.reftxnid = rt.transactionId and lower(pp.type) = 'payment reversal' 
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
    left join ${ref("country_tax_codes")} ct --reference.country_tax_codes   ct 
      on ct.iso_2_code = pp.countrycode
    left join ${ref("custom_tax_type")} vr --reference.custom_tax_type     vr 
      on vr.tax_code   = ct.tax_code
    left join ${ref("payment_transaction")} pt -- production.payment_transaction pt             
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
* Add this script to ./definitions/analytics and click "Run":
![](https://mydataschool.com/liveprojects/img/LP3/pp_recon_monthly_create_1.png)
* The script above will produce a new table in `analytics` schema:
![](https://mydataschool.com/liveprojects/img/LP3/pp_recon_monthly_create_2_success.png)
* Check this table in your BigQuery project:
![](https://mydataschool.com/liveprojects/img/LP3/pp_recon_monthly_create_3.png)


### To create final *daily* table with revenue reconciliation use this script:
- As an example this script below will run daily calculation prepared for upload into accounting software.
- Follow the comments inside that script to check the logic.
- Scripting is a powerful tool in BigQuery. This example script shows how to *LOOP* and generate analytics output for each `date` within the month required.
- it can be also scheduled to populate your table daily (one inout date)
- when run from *dataform* it will repeatadly run each SQL statement for each date.
![](https://mydataschool.com/liveprojects/img/LP3/pp_recon_daily_create_1_success.png)
- After running the script below check your BigQuery project:
![](https://mydataschool.com/liveprojects/img/LP3/pp_recon_daily_create_2_success.png)

~~~sql
config {
  type: "operations",
  hasOutput: true,
  schema: "analytics",
  disabled: false,
  tags: ["analytics", "daily", "paypal_transaction_reconciliation_daily"],
  description: "Script to populate analytics.paypal_transaction_reconciliation_daily table."
}

-- declare dates and other variables for revenue reconciliation:
DECLARE dates ARRAY<DATE>;
DECLARE query STRING DEFAULT 'SELECT ';
DECLARE dt STRING DEFAULT ' ';
DECLARE i INT64 DEFAULT 0;
DECLARE DS_START_DATE STRING;
DECLARE DS_END_DATE STRING;
-- We have data only for July 2021 so let's override these params for training purposes:
-- SET DS_START_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));
-- SET DS_END_DATE = (select FORMAT_DATE("%Y%m%d", date_sub(current_date(), interval 2 day) ));

SET DS_START_DATE   = '20210701';
SET DS_END_DATE     = '20210731';

-- SET dates = GENERATE_DATE_ARRAY('2021-07-03', '2021-07-31', INTERVAL 1 DAY);
SET dates = GENERATE_DATE_ARRAY(parse_date('%Y%m%d', DS_START_DATE), parse_date('%Y%m%d', DS_END_DATE), INTERVAL 1 DAY);



-- Now create PayPal revenue reconciliation table. This table (SQL) will define the logic.
create table if not exists ${self()} ( --`bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_daily` ( -- This of course could be a shorter name.
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
insert ${self()} --`bq-shakhomirov-staging.analytics.paypal_transaction_reconciliation_daily`

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

    from ${ref("paypal_transaction")} pp --production.paypal_transaction      pp
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
    left join ${ref("country_tax_codes")} ct --reference.country_tax_codes   ct 
        on ct.iso_2_code = pp.countrycode
    left join ${ref("custom_tax_type")} vr --reference.custom_tax_type     vr 
        on vr.tax_code   = ct.tax_code
    left join ${ref("payment_transaction")} pt -- production.payment_transaction pt             
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