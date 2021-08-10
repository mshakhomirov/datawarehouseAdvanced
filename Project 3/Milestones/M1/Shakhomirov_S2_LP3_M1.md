## Create your BigQuery project and connect to Dataform

**Objective**

* [OBJECTIVE]


**Why is this milestone important to the project?**

- create separate environments in BigQuery (Staging and Live)
- connect your *github* account and keep all data transformation scripts in one repo.
- schedule dataset and table updates using [Dataform](dataform.co).


**Workflow**

**[1]. Create your BigQuery project and connect to Dataform**
[1.1] **Generating data warehouse credentials**

In order for Dataform to connect to your BigQuery warehouse you’ll need to use *Application Default Credentials* or a *service account and JSON key*.
You’ll need to create a service account from your **[Google Cloud Console](https://console.cloud.google.com/)** and assign it permissions to access **BigQuery**.

[1.2] **Connecting your data warehouse and Dataform**
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
[2.2] Using Dataform UI create a new table with our revenue reconciliation data.
- Click on the `New Dataset` button in the left hand side bar.
- Choose whether you want your dataset to be a table, view or incremental table. In this case we want to create a table:
- Name the table `paypal_reconciliation` and click **Create Table**:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-9.png) **TODO** replace an image and point to correct table.
- Insert your table definition SQL right after `config` block:
~~~sql
-- Place your SQL here: TODO
~~~
- Use Dataform's **ref()** function to reference `payment_transaction` and `paypal table` as dependancies for `paypal_reconciliation` table.
- Dataform will automatically validate your query and check for any errors
- Once you see that the query is valid you can click Preview Results to check that the data looks correct:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-10.png) **TODO** Add image
- Click `Create Table` to create the table in your warehouse
This will take the SQLX that we’ve written, compile it into the SQL syntax of your warehouse (in this case, BigQuery), and then execute that SQL in your warehouse with the correct boilerplate code to create a table. You will see that your new dataset has been successfully published to datawarehouse:
![outcome](https://mydataschool.com/liveprojects/img/img-M3-11.png) **TODO** Add image

[2.3] This is great. However, we need to publish our changes to `analytics` dataset inside `bq-shakhomirov` project. Adjust your dataform project settings accordingly.



**Deliverable**

The deliverable for this milestone is...[WHAT IS THE DELIVERABLE FOR THIS MILESTONE]

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [INSERT A TARGETED READING FROM MANNING RESOURCES, POINTING THE LEARNER TO A FEW PARAGRAPHS, A SECTION, OR A LISTING THAT DESCRIBES WHAT THE LEARNER IS SUPPOSED TO DO TO FIND THE SOLUTION. TELL THE READER WHY THEY ARE READING THIS SELECTION-DON'T JUST LIST THE RESOURCE]
* [INSERT EXTERNAL RESOURCE THAT DESCRIBES WHAT THE LEARNER IS SUPPOSED TO DO TO FIND THE SOLUTION-TELL THE READER WHY THEY ARE READING THIS SELECTION-DON'T JUST LIST THE RESOURCE]



*help*


*Help for Step [1.1]:*
- Read **Dataform** [docs](https://docs.dataform.co/getting-started-tutorial/set-up)

**To create a new service account in Google Cloud Console you need to:**

[1.1] Go to the [Services Account page](https://console.cloud.google.com/iam-admin/serviceaccounts)
- Make sure the new project you created is selected and click `Open`.
- Click on `Create Service Account` and give it a name.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-1.png)
- Grant the new account the **BigQuery Admin** role.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-2.png)

[1.2] Once you’ve done this you need to create a key for your new service account (in JSON format):
- On the Service Accounts page, find the row of the service account that you want to create a key for and click the `Actions` button.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-3.png)
- Then click `Manage keys`.
- Click `Create` and Select JSON key type.
![outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-4.png)

Now you've created a new **BigQuery** project and generated your warehouse credentials, you're ready to create your Dataform project!

*Hint for Step [2.2]*:
Your Data Warehouse project will depend on raw data stored in your warehouse, created by processes external to it. These external processes can change the structure of your tables over time (column names, column types…).
It is recommended to use `declarations` to define raw data tables.

- In our `paypal_reconciliation` table query you would want to have two **source** tables. You would want to use Dataform's **ref()** function to reference them.
Read about Dataform [Best Practices](https://docs.dataform.co/best-practices/start-your-dataform-project) and try t0 find out how to use `declarations`.

- In your Dataform project create a folder `./definitions/source` and a file called `./definitions/source/payment_transaction.sqlx` with the following content:
~~~json
config {
  type: "declaration",
  database: "bq-shakhomirov",
  schema: "source",
  name: "payment_transaction",
}
~~~
- Now you can update your `paypal_reconciliation` table with `${ref("payment_transaction")}` instead of actual table name.
![outcome] **TODO** Add image

*Hint for Step [2.3]*: 
- Go to **Project Configuration** and change your **defaultSchema**.
![outcome](https://mydataschool.com/liveprojects/img/img-M3-12.png)
- Click `Create`. This will create our table in `analytics` dataset in BigQuery.
![outcome](https://mydataschool.com/liveprojects/img/img-M3-13.png) **TODO** Add image

- Click [View logs:](https://mydataschool.com/liveprojects/img/img-M3-14.png) **TODO** Add image


*partial solution*
 
Here is the *partial solution script* for this milestone step [2.2]. Download this file, use it to develop your solution, and upload your deliverable.

**Partial solution for step [2.2]**
The code below shows how to use declarations.
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



*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.


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
