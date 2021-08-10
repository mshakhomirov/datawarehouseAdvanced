## Configure continuous integration/deployment workflows for your Dataform project

**Objective**

* Migrate your DataForm project to git provider
* Create CI/CD pipeline with Staging and Live environments for your data transformation pipelines.
* Enrich your source data (tables created in Milestone 1) with *fx rate*s and *geocoding* data. 


**Why is this milestone important to the project?**

* You will learn how to migrate your DataForm project to git provider and create live and staging environments for your BigQuery projects.
A clean and simple way to separate *staging* and *production* data is to use a different database for each environment.
We will use separate databases for development and production data. For staging environment we will create a separate project in BigQuery (database). So we could safely delete all staging resourcesin case we need to. Google's recommended best practice is to create a separate billing project to separate production and staging environments.
By default, Dataform runs all of your project code from your project's master Git branch. Configuring environments allows you to control this behaviour, enabling you to run multiple different versions of your project code.
A common use-case for environments is to run a staged release process. After testing code in a staging environment, the code is promoted to a stable production environment.


**Workflow**

[3.1] Migrate your DataForm project to git provider, i.e. **github**.
[3.2] Create a *Staging* BigQuery project.
- connect it to **Dataform**
- point your `staging` project to the same github repository but use a branch called `Staging`
[3.3] Create fx rates pipeline
- Using dataform declare `source.exchange_rates` table. Use **${self()}** function and make to create an output so you could reference it in other scripts with **${ref()}** function.
- Dataset and SQL script for `source.exchange_rates` table can be found here ``
* ![desired outcome](mydataschool.com/liveprojects/img/LP3/img-s2-lp3-m2-2_3_desired-outcome.png)

- Create an `operation` (using dataform) consisting of two parts [1] to create another tabel for fx rates with the follwoing scema:
~~~sql
create table if not exists ${self()} ( --production.fx_rates (
  dt                date  ,
  Base_currency     string,
  pair              string,
  rate_currency     string,
  rate              float64
)
PARTITION BY dt
;
~~~
and [2] to *insert* daily  update for this table for all currencies.
- Create a view on top of this table just for one corrency (use schema above).
- You would to have this as diseried outcome for this Step:
* ![desired outcome](mydataschool.com/liveprojects/img/LP3/img-s2-lp3-m2-2_3_desired-outcome2.png)

[FAQ] I've created a dataform operation which has two queries one after another. First one to create a table and the second one to INSERT data. Dataform RUN is successfull but nothing happens in data warehouse.
[Answer] Read this [document](https://docs.dataform.co/guides/operations). Dataform transforms *sqlx* files. You need to make sure your script runs as it is. To ensure this ultiple statements can be separated with a single line containing only 3 dashes --- .


[3.4] Create geocoding pipeline

**Deliverable**

The deliverable for this milestone is a GitHub repository with branches connected to your **BigQuery** projects.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [Dataform docs](https://docs.dataform.co/dataform-web/scheduling/environments)
* [Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365)
* [Outside resource 4. Google Dataform](https://docs.dataform.co/guides/)
* [Outside resource 5. Google Dataform API](https://docs.dataform.co/reference#IDeclarationConfig)
* [Dataform operations](https://docs.dataform.co/guides/operations)

*help*
*Hint for Step 3.1:*
Read this [Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365) to learn how to connect your dataform project to github.

*Hint for Step 3.2:*
- Read the [docs](https://docs.dataform.co/dataform-web/scheduling/environments)

- Create a staging project:
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-20.png)

- Remember we created a service account? We supplied these credentials to dataform. Now we would want that service account to be able to access our staging project.
Go to [IAM](https://console.cloud.google.com/iam-admin/iam) and enable access to **..-staging** project for the service account you created in Step 1.
![Like so](mydataschool.com/liveprojects/img/img-M3-21-2.png)
[Enable API here if needed for your staging project](https://console.cloud.google.com/apis/api/bigquerydatatransfer.googleapis.com/overview)

- So after you run the deployment in `staging` you will see all enriched tables created:
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-24.png)
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-25.png)


*partial solution*

- source/exchange_rates.sql
~~~sql

config {
  type: "operations",
  hasOutput: true,
  schema: "source",
  disabled: false,
  tags: ["source", "fx_rates", "run_once"],
  description: "External data coming from gcp-bigquery-etl/functions/bq-exchange-rates Lambda and being ingested by functions/bigqueryImport."
}
-- tag: fx_rates - scheduled daily update - tag ends/
-- This needs to be run only once. It is a schema declaration for external table
create table if not exists ${self()} ( --production.fx_rates (
  src     string
)
PARTITION BY DATE(_PARTITIONTIME)
;
---
INSERT ${self()} (src)
VALUES (
 
)
;

 
- production/fx_rates.sqlx:
~~~sql
config {
  type: "operations",
  hasOutput: true,
  schema: "production",
  disabled: false,
  tags: ["production", "fx_rates"],
  description: "Script to populate fx_rates table."
}
-- tag: fx_rates - scheduled daily update - tag ends/
create table if not exists ${self()} ( --production.fx_rates (
  dt                date  ,
  Base_currency     string,
  pair              string,
  rate_currency     string,
  rate              float64
)
PARTITION BY dt
;
---

insert ${self()} --production.fx_rates
WITH object AS
    (SELECT  
        date(timestamp_seconds(CAST(JSON_EXTRACT(src, '$.timestamp') as int64))) as dt
        , JSON_EXTRACT_SCALAR(src, '$.base') as base
        , JSON_EXTRACT(src, '$.rates')       as rates
    FROM ${ref("exchange_rates")} er --`your_project-client.production.exchange_rates` er
    WHERE 
    DATE(_PARTITIONTIME) = current_date()  -- that would be fx_rate date 

    AND
    JSON_EXTRACT_SCALAR(src, '$.base') in  ('USD', 'GBP') -- select any currencies you need as base ones.
)

, data as (
...
;
~~~



*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.

- source/exchange_rates.sql
~~~sql

config {
  type: "operations",
  hasOutput: true,
  schema: "source",
  disabled: false,
  tags: ["source", "fx_rates", "run_once"],
  description: "External data coming from gcp-bigquery-etl/functions/bq-exchange-rates Lambda and being ingested by functions/bigqueryImport."
}
-- tag: fx_rates - scheduled daily update - tag ends/
-- This needs to be run only once. It is a schema declaration for external table
create table if not exists ${self()} ( --production.fx_rates (
  src     string
)
PARTITION BY DATE(_PARTITIONTIME)
;
---
INSERT ${self()} (src)
VALUES (
  '{"disclaimer": "Usage subject to terms: https://openexchangerates.org/terms", "license": "https://openexchangerates.org/license", "timestamp": 1604718017, "base": "USD", "rates": {"AED": 3.673, "AFN": 76.899997, "ALL": 104.2, "AMD": 481.616228, "ANG": 1.794205, "AOA": 665.11, "ARS": 79.037671, "AUD": 1.37779, "AWG": 1.8, "AZN": 1.7025, "BAM": 1.656038, "BBD": 2, "BDT": 84.70399, "BGN": 1.647444, "BHD": 0.377031, "BIF": 1940, "BMD": 1, "BND": 1.35351, "BOB": 6.892152, "BRL": 5.3648, "BSD": 1, "BTC": 6.4085476e-05, "BTN": 74.100337, "BWP": 11.247714, "BYN": 2.61912, "BZD": 2.014845, "CAD": 1.306201, "CDF": 1966, "CHF": 0.900247, "CLF": 0.027235, "CLP": 751.498904, "CNH": 6.601, "CNY": 6.6114, "COP": 3755.072631, "CRC": 611.186197, "CUC": 0.999773, "CUP": 25.75, "CVE": 93.525, "CZK": 22.37795, "DJF": 178.05, "DKK": 6.27577, "DOP": 58.45, "DZD": 128.996566, "EGP": 15.68928, "ERN": 15.000416, "ETB": 37.6, "EUR": 0.842151, "FJD": 2.1435, "FKP": 0.760023, "GBP": 0.760023, "GEL": 3.37, "GGP": 0.760023, "GHS": 5.83, "GIP": 0.760023, "GMD": 51.7875, "GNF": 9760, "GTQ": 7.781733, "GYD": 209.021699, "HKD": 7.7536, "HNL": 24.5505, "HRK": 6.366095, "HTG": 63.347578, "HUF": 302.108, "IDR": 14214.837, "ILS": 3.37496, "IMP": 0.760023, "INR": 73.98115, "IQD": 1190.5, "IRR": 42105, "ISK": 137.69, "JEP": 0.760023, "JMD": 146.93799, "JOD": 0.709, "JPY": 103.36702745, "KES": 109.050171, "KGS": 82.8082, "KHR": 4070, "KMF": 414.399971, "KPW": 900, "KRW": 1121.898663, "KWD": 0.30544, "KYD": 0.832976, "KZT": 432.294249, "LAK": 9275, "LBP": 1513.246905, "LKR": 184.398077, "LRD": 176.499989, "LSL": 15.8, "LYD": 1.37, "MAD": 9.12, "MDL": 17.116052, "MGA": 3900, "MKD": 51.947669, "MMK": 1287.464876, "MNT": 2843.736939, "MOP": 7.982293, "MRO": 357, "MRU": 37.16, "MUR": 39.951661, "MVR": 15.4, "MWK": 760, "MXN": 20.601151, "MYR": 4.1285, "MZN": 73.1, "NAD": 15.8, "NGN": 382, "NIO": 34.835224, "NOK": 9.16327, "NPR": 118.561614, "NZD": 1.477203, "OMR": 0.384989, "PAB": 1, "PEN": 3.592, "PGK": 3.505, "PHP": 48.178643, "PKR": 159.15, "PLN": 3.79109, "PYG": 7023.670936, "QAR": 3.641, "RON": 4.099, "RSD": 99.02, "RUB": 77.4317, "RWF": 982.5, "SAR": 3.750464, "SBD": 8.101947, "SCR": 19.839401, "SDG": 55.3, "SEK": 8.642515, "SGD": 1.348505, "SHP": 0.760023, "SLL": 9993.999938, "SOS": 582.5, "SRD": 14.154, "SSP": 130.26, "STD": 21040.953008, "STN": 21.05, "SVC": 8.745414, "SYP": 513.016884, "SZL": 15.8, "THB": 30.559051, "TJS": 11.322298, "TMT": 3.5, "TND": 2.7375, "TOP": 2.303174, "TRY": 8.525, "TTD": 6.783812, "TWD": 28.5815, "TZS": 2318.017, "UAH": 28.24013, "UGX": 3739.888605, "USD": 1, "UYU": 42.750083, "UZS": 10366, "VEF": 248487.642241, "VES": 517886.857513, "VND": 23182.52148, "VUV": 113.119273, "WST": 2.610639, "XAF": 552.415073, "XAG": 0.03905491, "XAU": 0.00051244, "XCD": 2.70255, "XDR": 0.704284, "XOF": 552.415073, "XPD": 0.00040063, "XPF": 100.495388, "XPT": 0.00111733, "YER": 250.349961, "ZAR": 15.58855, "ZMW": 20.616101, "ZWL": 322}}'
)
;

~~~
[FAQ] Why is this just one record? I thought this pipeline needs to be automated and scheduled to load data into the table daily?
[Answer] This `sqlx` file is a dataform declaration for your table. The most important is the first part where you declare the schema. Second part is just a sample data if you don't want to create an extraction pipeline from `openexchangerates.com` API. This is often called a `data connector` and can be easily implemented using microservice architecture. Learn more about it in *Milestone 1* of this series. TODO: add link. add link to pipeline tools github repo.

- production/exchange_rates_v.sqlx
~~~sql
config {
  type: "view",
  schema: "production",
  tags: ["production", "view", "fx_rates"],
  description: "Columnar version of the raw exchange_rates table for the latest date known."
}
WITH object AS
(SELECT  JSON_EXTRACT(src, '$.rates') as rates
  FROM ${ref("exchange_rates")} er --`your_project.production.exchange_rates` er
WHERE 
DATE(_PARTITIONTIME) = current_date() 

and JSON_EXTRACT_SCALAR(src, '$.base') = 'USD'
)

, data as (
SELECT "USD" AS Base_currency,
  REGEXP_EXTRACT_ALL(rates, r'"[^"]+":\d+\.?\d*') AS pair
FROM object
)
, splits as (
select Base_currency, pair, SPLIT(pair, ':') positions 
FROM data CROSS JOIN UNNEST (pair) as pair
)
select Base_currency, pair,  positions[offset(0)] AS rate_currency,  positions[offset(1)] AS rate
FROM splits

~~~

- production/fx_rates.sqlx:
~~~sql
config {
  type: "operations",
  hasOutput: true,
  schema: "production",
  disabled: false,
  tags: ["production", "fx_rates"],
  description: "Script to populate fx_rates table."
}
-- tag: fx_rates - scheduled daily update - tag ends/
create table if not exists ${self()} ( --production.fx_rates (
  dt                date  ,
  Base_currency     string,
  pair              string,
  rate_currency     string,
  rate              float64
)
PARTITION BY dt
;
---

insert ${self()} --production.fx_rates
WITH object AS
    (SELECT  
        date(timestamp_seconds(CAST(JSON_EXTRACT(src, '$.timestamp') as int64))) as dt
        , JSON_EXTRACT_SCALAR(src, '$.base') as base
        , JSON_EXTRACT(src, '$.rates')       as rates
    FROM ${ref("exchange_rates")} er --`your_project-client.production.exchange_rates` er
    WHERE 
    DATE(_PARTITIONTIME) = current_date()  -- that would be fx_rate date 

    AND
    JSON_EXTRACT_SCALAR(src, '$.base') in  ('USD', 'GBP')
)

, data as (
SELECT dt, base AS Base_currency,
  REGEXP_EXTRACT_ALL(rates, r'"[^"]+":\d+\.?\d*') AS pair
FROM object
)
, splits as (
select dt, Base_currency, pair, SPLIT(pair, ':') positions 
FROM data 
CROSS JOIN UNNEST (pair) as pair
)
select distinct dt, Base_currency, pair,  positions[offset(0)] AS rate_currency,  cast(positions[offset(1)] as float64) AS rate
FROM splits
;
~~~



[GitHub repo](https://github.com/mshakhomirov/dataform)

