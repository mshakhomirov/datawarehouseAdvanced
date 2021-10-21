# FAQs


**[QUESTION]**
I've created a dataform operation which has two queries one after another. First one to create a table and the second one to INSERT data. Dataform RUN is successfull but nothing happens in data warehouse.
[Answer] Read this [document](https://docs.dataform.co/guides/operations). Dataform transforms *sqlx* files. You need to make sure your script runs as it is.



**[QUESTION]**
Why do I need to use Dataform or any other templating engine for my SQL queris?
[ANSWER]
You don't. You can schedule your dataset updates with built-in BigQuery scheduler. However, using templating provides several benefits:
- Online data catalog and lineage, can easily search both objects and code
- Built in testing of code and data checks
- Typically integrated with code repo
- Web UI gives opportuity for a team to collaborate
- Implicit lineage DAG and being able to run full model, just the node, everything preceding the node, every dependent table after the node, or both

**[Question]**
Can I run unit tests with Dataform?
[ANSWER]
You can run simple unit test with Dataform and compare **Expected** vs. **actual** output.
A unit test fails if the actual output from the dataset is not equal to the expected output. This means that:

the number of output rows must match
the number of output columns and their names must match
the contents of each row must match
Read Dataform docs [here](https://docs.dataform.co/guides/tests).

**[Question]**
How do I run data and quality checks with Dataform?
[ANSWER]
You can create your own assertion in BigQuery. For example, this will raise an error if some data is missing in your table:
~~~sql
with m as (
    select 
         count(*)                 as missing_country_codes
        ,array_to_string( array_agg(distinct cast(ip as string)) , ',') as ips
    from `analytics.payment_geocoded` 
    WHERE DATE(payment_date) = PARSE_DATE('%Y%m%d', DS_START_DATE) 
        and
        country_code is null
)

select
  if(missing_country_codes > 0
    ,   ERROR(FORMAT('ERROR: `analytics.payment_geocoded` has missing country codes: %t for partition date %t.', ips, cast(PARSE_DATE('%Y%m%d', DS_START_DATE)  as STRING) ))
    ,   'all good' 
  ) missing
  
from m
;
~~~
However, Dataform assertions look more intuitive.
[Read](https://docs.dataform.co/guides/assertions) more here. They are well documented and can be used as dependency.

