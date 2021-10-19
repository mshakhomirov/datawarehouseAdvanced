# FAQs


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