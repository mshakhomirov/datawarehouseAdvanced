# Solution Explanation


In full solution you would want to have two extra declarations for source tables:
1. ${ref("paypal_transaction")} t --`bq-shakhomirov.source.paypal_transaction` 
2. ${ref("payment_transaction")} t --`bq-shakhomirov.source.payment_transaction`
3. a view for raw paypal data:
~~~sql
config {
  type: "view"
}
WITH data AS
   CAST(JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_initiation_date')      AS timestamp)          as ts
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
                                                                                                    as Net
    , JSON_EXTRACT_SCALAR(src, '$.transaction_info.transaction_id')                                 as transaction_id
    , JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_name')                             as item_title
    , JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_code')                             as item_id
    , JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].item_quantity')                         as item_quantity
    , JSON_EXTRACT_SCALAR(src, '$.cart_info.item_details[0].invoice_number')                        as invoice_number
    , JSON_EXTRACT_ARRAY(src, '$.cart_info.item_details')                                           as item_details
    , JSON_EXTRACT_SCALAR(src, '$.payer_info.country_code')                                         as country
    , ARRAY_LENGTH(JSON_EXTRACT_ARRAY(src, '$.cart_info.item_details') )                            as item_count 

from 
    ${ref("paypal_transaction")} t --`bq-shakhomirov.source.paypal_transaction` 
)

select * from data;
~~~
4. and your table in `analytics` dataset which you would want to update with new records daily:
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