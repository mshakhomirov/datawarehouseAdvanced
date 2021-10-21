# FAQs


**[QUESTION]**
I've created a dataform operation which has two queries one after another. First one to create a table and the second one to INSERT data. Dataform RUN is successfull but nothing happens in data warehouse.
[Answer] Read this [document](https://docs.dataform.co/guides/operations). Dataform transforms *sqlx* files. You need to make sure your script runs as it is. To ensure this ultiple statements can be separated with a single line containing only 3 dashes --- .

[ANSWER]



**[QUESTION]**

[ANSWER]