# Solution Explanation

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
