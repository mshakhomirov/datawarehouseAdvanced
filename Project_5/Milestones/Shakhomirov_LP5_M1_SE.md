# Solution Explanation
Scripts to create source tables can be found below.
Sharable  Link to Data Studio template is [here](https://datastudio.google.com/reporting/37f4b07b-f8cd-436b-9a7b-0ee37cdfafe4)
[Preview](https://datastudio.google.com/u/0/reporting/37f4b07b-f8cd-436b-9a7b-0ee37cdfafe4/page/p_n9jv47i9nc/preview)

## 1. Run the following in your command line to Create `reference.country_tax_codes` table:


This will create `reference.country_tax_codes` table with scheam as described in your `stack/bq-ingest-manager/config/staging.yaml`:
~~~yaml
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
      - name: "sage_code"
        type: "STRING"
        mode: "NULLABLE"
~~~
* check `stack/bq-ingest-manager/test/integration/loadTestPipelines.json` and make sure your csv exists in s3:
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



## 2. To create `reference.custom_tax_type` add this pipe definition to your config file:
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
* check `stack/bq-ingest-manager/test/integration/loadTestPipelines.json` and make sure your csv exists in s3:
~~~json
{
    "Records": [
      {
        "pipeName": "accounting_tax_type",
        "enabled": true,
        "bucket": {
          "name": "bq-shakhomirov.bigquery.aws"
        },
        "object": {
          "key": ""
        },
        "datePrefix": "",
        "example": "accounting_tax_type.csv"
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
  result: { table: 'custom_tax_type', rowsInserted: '31' },
  pass: true
}
{"passed":[{"table":"custom_tax_type","rowsInserted":"31"}],"failed":[]}
~~~

![custom_tax_codes table](https://mydataschool.com/liveprojects/img/img-lp5-custom_tax_codes.png)


## 3. Create a new table or a view on `source.paypal_transaction_src` table.
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

### 3. Create table `production.payment_transaction` by parsing the source file from `./data`:
This will create `production.payment_transaction` table with schema as you add it to your `stack/bq-ingest-manager/config/staging.yaml`:
~~~yaml
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
    notes: Some notes on your payment data pipeline
~~~
- Change your `stack/bq-ingest-manager/test/integration/loadTestPipelines.json` and run:

```shell
$ npm run test-service
$ npm run test-load
```
As a result you will see:
```shell
{
  result: { table: 'payment_transaction', rowsInserted: '9' },
  pass: true
}
{"passed":[{"table":"payment_transaction_src","rowsInserted":"9"}],"failed":[]}
```



99. To create the final table with revenue reconciliation use this script:

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


---- In Data Studio use these columns for groupings:
-- group by
--         account_reference
--     ,   payment_date
--     ,   accounting_narrative
--     ,   paypal_tax_code
--     ,   paypal_country
--     ,   reference
--     ,   report_start_dt
--     ,   report_end_dt
-- ;

---- Alternative solution in case your resulting dataset is more than 1 mln records. Pre-aggregate your results in SQL:
-- select
--         account_reference
--     ,   payment_date
--     ,   accounting_narrative
--     ,   paypal_tax_code
--     ,   sum(paypal_revenue_usd)     as paypal_revenue_usd
--     ,   sum(paypal_net_usd)         as paypal_net_usd
--     ,   sum(vat_amount_usd)         as vat_amount_usd
--     ,   count(paypal_item_id)       as paypal_item_id_ctd
--     ,   sum(paypal_item_quantity)   as paypal_item_quantity
--     ,   paypal_country
--     ,   reference
--     ,   report_start_dt
--     ,   report_end_dt
-- from d
-- group by
--         account_reference
--     ,   payment_date
--     ,   accounting_narrative
--     ,   paypal_tax_code
--     ,   paypal_country
--     ,   reference
--     ,   report_start_dt
--     ,   report_end_dt

-- ;
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
**FAQ** What are the benefits of scripting in BigQuery? Why can't I just use `paypal_transaction_dt` for grouping and `WHERE`, i.e.
~~~sql
where
 paypal_transaction_dt >= '2021-07-01' 
 and paypal_transaction_dt >= '2021-07-31'
~~~

**Answer** Scripts allow you to run multiple SQL queries with `LOOP` operator so you don't need to run them manually. This approach also guarantees that results are being materialised (preserved, in case you want to preserver them) maintaining your analytics data integrity in case data changes over time, i.e. late transactions finally settled in your database. In this case your results in analytics schema will always stay consistent and won't mutate. Otherwise this might cause confusion when results are being revisited by someone from Finance department, i.e. they will see different values in report when review data for same date but later. This upload page MUST saty consistent as it is used for daily upload into accounting system. Remember? From the other side you can always explain why that particular report had missing transactions on that particular date.


**FAQ** What is Google Data Studio - Max Record Limit?
**Answer** Currently (October 2021), there's a limit of ~1m rows when fetching data from BigQuery. GDS is mostly suitable for medium-sized data analysis projects and unsuitable for large data projects.

By medium-sized projects, I mean analysis which involves data sets with up to 2M rows.
There is a way to increase this limit to 2 Bln. [Read](https://analyticscanvas.com/how-to-get-all-your-data-and-exceptional-performance-in-google-data-studio/)
[Read about BigQuery data connectos](https://support.google.com/datastudio/answer/6370296?hl=en&ref_topic=10587734#zippy=%2Cin-this-article)

Read more about [Limits of data extracts](https://support.google.com/datastudio/answer/9019969)

[Help](https://support.google.com/datastudio/?hl=en#topic=6267740)

[https://developers.google.com/datastudio/connector/reference#getschema](https://developers.google.com/datastudio/connector/reference#getschema)

[Read more](https://support.google.com/datastudio/answer/6268208?ref_topic=6268199#zippy=%2Cin-this-article)

**FAQ** What is the main benefit of using Data Studio with BigQuery?
**Answer** 
If you have a dataset stored in BigQuery, Data Studio should have no problem handing it - through BigQuery. Size shouldn't really be a problem.

**FAQ** How many rows can DS display?
**Answer** 
[Docs](https://support.google.com/datastudio/answer/7189044?hl=en#zippy=%2Cin-this-article)
There are some othe limitations related to certain widgets, i.e. [Pivot tables](https://support.google.com/datastudio/answer/7516660#zippy=%2Cin-this-article) Pivot tables can process up to 50,000 rows of data, however, depending on the data set and dimensions and metrics involved in the table, performance may degrade. You can apply a filter to the pivot table to reduce the amount of data being processed.

### If you need to drop and reload all tables:

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
