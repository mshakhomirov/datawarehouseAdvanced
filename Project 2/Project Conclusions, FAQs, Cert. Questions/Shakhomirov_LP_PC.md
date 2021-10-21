## Project conclusions

You ahve learned how to create Simple and reliable ingest manager for BigQuery written in Node.JS

- Serverless design and *AWS Lambda functions*.
- Cost effectiveness. Optimised for **batch load jobs** which means you don't need to pay for data loading. Basically it's free but check BigQuery load job limits.
- Can use *streaming* inserts (BigQuery streaming loading).
- Tailored for **AWS** but can be easily migrated to GCP, Azure.
- Architecture as code built with AWS Cloudformation. Deploy in one click in any other AWS account.
- Effective load job monitoring and file duplicates handling with AWS Dynamo.
- Custom BigQuery job ids. Another way to prevent duplication attempts if you don't want to use Dynamo.
- Support for unit and integration tests.

# Solution overview
![img](https://mydataschool.com/liveprojects/img/ingestManager.drawio.png)