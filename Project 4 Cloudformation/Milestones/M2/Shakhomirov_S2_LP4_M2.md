## Deploy your data ingestion microservice and DynamoDB table with AWS Cloudformation

**Objective**

* You have already created a Cloudformation stack containing AWS Lambda function responsible for data extraction from your PayPal account.
* You would would to add your newly created `data ingestion manager` (*liveProject2* of this series) and deploy/update these microservices using AWS Cloudformation.
* Add IAM roles for these Lambdas and extra resources, i.e. as S3 bucket.


**Why is this milestone important to the project?**

- This is an intro to AWS Cloudformation and how you describe your resources (Lmbdas, etc.) with AWS Cloudformation. Adding the second Lambda shows how you can simplify deployment and scale your resources easily across multiple accounts if needed.
- You ave already added one resource (AWS Lambda function) 
- Now you would want to add another one (`ingestManager`).
- You will learn how to do it with other resources, i.e. RDS or *Dynamo*.


**Workflow**

# **[1]. Modify existing Cloudformation satck for PayPal data connector (your first Lambda)**

## [1.1].   Create your ingest manager solution (you can copy it from *liveProject2*)
* Go to repository [pipelineTools](https://github.com/mshakhomirov/pipelinetools/) and set up your ingest manager accordingly to run in your AWS account.
- in `./config.json` you will need to adjust your S3 bucket and Google service account credentials:
~~~json
...
    ],

    "bigQueryConfigS3": "bq-shakhomirov-b86071c11c27.json",
    "gcpClientEmail": "bq-777@bq-shakhomirov.iam.gserviceaccount.com",
    "gcpProjectId": "bq-shakhomirov",
    "key": "data/",
    "dataBucket": "bq-shakhomirov.bigquery.aws"
~~~
- chnage service account credentials to yours: `./bq-shakhomirov-b86071c11c27.json`

* When done your working folder should look like that:

~~~bash
data-services
.
└── stack
    ├── bq-ingest-manager
    │   ├── app.js
    │   ├── bq-shakhomirov-b86071c11c27.json
    │   ├── config.json
    │   ├── data
    │   │   ├── error
    │   │   │   └── simple_transaction0.csv
    │   │   └── simple_transaction0.csv
    │   ├── deploy.sh
    │   ├── loadTestGenerateData.js
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── test
    │   │   └── data.json
    │   └── tmp
    │       ├── payment_transaction
    │       ├── simple_transaction
    │       └── simple_transaction.csv
    ├── bq-paypal-revenue
    │   ├── app.js
    │   ├── config.json
    │   ├── deploy.sh
    │   ├── package.json
    │   ├── test
    │   │   └── data.json
    │   ├── tmp
    │   └── token_config.json
    ├── cf-config.yaml
    ├── cf-deploy.yaml
    ├── cf-install.sh
    └── readme.md

~~~


## [1.2].   Add ingestManager Lambda to your stack
* You would to add another `Resource` for your ingest manager Lambda, i.e.:
~~~yaml
  IngestManagerLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
~~~
* It can share the same `LambdaPolicy` but don't forget to add permissions for *DynamoDb*.
* you will have to change the trigger for your Lmabda. It must be the trigger from S3 when new S3 object is created.

# **[2.] Add DynamoDb table to your stack**
- Read about DynamoDb [here]()
- You would want to use free tier eligibale configuration for your Dynamodb tables
- Modify your stack file by adding this under `Resourses:`:

~~~yaml
  # stores successfull data ingestion events
 IngestManagerSuccessTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        -
          AttributeName: "source"
          AttributeType: "S"
      KeySchema:
        -
          AttributeName: "source"
          KeyType: "HASH"
        ProvisionedThroughput:
            ReadCapacityUnits: "*"
            WriteCapacityUnits: "*"
      TableName:
        Ref: IngestManagerSuccessTableName
~~~

- Adjust  `ProvisionedThroughput`:
Looking at [The Dynamo cost page](https://aws.amazon.com/blogs/aws/dynamodb-price-reduction-and-new-reserved-capacity-model/), this means you are paying $0.0065 per throughput-hour each table exists per month, minus the free-tier hours.

Cost Breakdown
The default is 5 provisioned read/write units, and there are 720 hours in a 30-day month

`$0.0065 * 5 * 720 = $24.37 a month per table`

The free tier generally allows one table for free a month.

Per [AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html) you must have at least 1 provisioned unit.

- you would want to add your DynamoDb table to environment variables for your Lambda function, i.e.:
* ./app.js:
~~~js
...
const DYNAMO_SUCCESS = process.env.DYNAMO_SUCCESS || 'ingest-manager-success';
...
~~~
* ./cf-config.yaml:
* check your ./app.js code to make sure DynamoDb table name is correct.


**Deliverable**

The deliverable for this milestone is...[WHAT IS THE DELIVERABLE FOR THIS MILESTONE]

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Hint for Step [2.]*
How to Save
Make sure you're following the best practice of using [1 de-normalized table](https://www.alexdebrie.com/posts/dynamodb-single-table/#downsides-of-a-single-table-design)

For any dev work, make sure both read and write provisions are set to 1 ($0.0065 * 1 * 720 = $4.68 a month per table)

If you know you're going to be away for a while, remove the stack from AWS. You're only charged while the table(s) exists.

By limiting read/write units you should be able to bring the cost down to ~$5.00 a table per dev.

## DO NOT TURN ON AUTO-SCALING

If you choose auto-scaling. Per [docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/switching.capacitymode.html), you'll be charged for at least 5 units

[Read this AWS Forum](https://forums.aws.amazon.com/thread.jspa?threadID=88319)


*Hint for Step [1.2]*
Simply following the pattern below add an extra Lambda function for your ingest amanger:

~~~yaml
...
Resources:
  PayPalLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
...
  IngetManagerLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
~~~

After you S3 trigger and a bucket your desired outcome would be a succesffully deployed changes in your stack. Run:
~~~bash
aws cloudformation deploy     --region eu-west-1     --template-file cf-deploy.yaml     --stack-name data-services     --capabilities CAPABILITY_IAM
~~~
**Outcome:**

![Outcome](https://mydataschool.com/liveprojects/img/img-s2-lp4-m2-desired-outcome-stack-part1.png)

and check your Lambda:
![Outcome](https://mydataschool.com/liveprojects/img/img-s2-lp4-m2-desired-outcome-stack-part2.png)

*Hint for Step [1.2]*
If you want to know how to add S3 trigger check this `yaml` below:

~~~yaml
...
  DataBucket:
      Type: AWS::S3::Bucket
      DependsOn:
        - PermissionForEventsToInvokeIngestManagerLambda
      Properties:
        BucketName: !Ref BucketName
        NotificationConfiguration:
          LambdaConfigurations:
            - Event: s3:ObjectCreated:*
              Function: !GetAtt IngestManagerLambda.Arn
...
~~~

You will only need to add a permission for to invoke your `bq-ingest-manager` lambda, i.e.:

~~~yaml
...
  PermissionForEventsToInvokeIngestManagerLambda:
    Type: "AWS::Lambda::Permission"
    Properties:
      FunctionName:
        Ref: ...
      Action: ...
      Principal: s3.amazonaws.com
      SourceArn: ...
...
~~~

*Hint for Step [1.2]*
To add DynamoDb permissions add this to your Lambda policy in your stack definition:
[Read AWS Article: How to Create an AWS IAM Policy to Grant AWS Lambda Access to an Amazon DynamoDB Table](https://aws.amazon.com/blogs/security/how-to-create-an-aws-iam-policy-to-grant-aws-lambda-access-to-an-amazon-dynamodb-table/)
~~~yaml
Resources:

  LambdaPolicy:
    Type: AWS::IAM::Policy
    DependsOn: LambdaRole
    Properties:
      Roles:
        - !Ref LambdaRole
      PolicyName: 'bigquery-pipe-lambda-policy'
      PolicyDocument:
        {
          "Version": "2012-10-17",
            "Statement": [

...

,
                {
                    "Sid": "DynamoDBAccess",
                    "Effect": "Allow",
                    "Action": [
                         "dynamodb:*"
                        ],
                    "Resource": "arn:aws:dynamodb:eu-west-1:yourAccountNumber:table/ingestMAnager"
                }
            ]
        }
~~~

[FAQ] What if I want only specific file names to trigger my ingest manager?
[Answer] You can use S3 filter in your DataBucket definition inside your Cloudformation stack:
~~~yaml
  DataBucket:
      Type: AWS::S3::Bucket
      DependsOn:
        - PermissionForEventsToInvokeIngestManagerLambda
      Properties:
        BucketName: !Ref BucketName
        NotificationConfiguration:
          LambdaConfigurations:
            - Event: s3:ObjectCreated:*
              Function: !GetAtt IngestManagerLambda.Arn
              # Filter:
                # S3Key:
                #   Rules:
                #   - Name: suffix
                #     Value: .txt
~~~


*Resources*

[Serverless Application model](https://aws.amazon.com/serverless/sam/)
[Lambda Properties](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types)
[!GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html)
[!Ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html)
[cron expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)


Here is the *partial solution script* for this milestone. Download this file, use it to develop your solution, and upload your deliverable.

For  *partial solution* you would need to complete a Cloudformation stack template by adding the following:
- one extra Lambda function for *ingest manager*
- relevant trigger for ingest manager in your Cloudformation stack, i.e. **S3**
- modified Lambda policy to include permissions to access **DynamoDb** for your Lambdas

* ./M2/solution/data-services/stack/cf-config.yaml:
~~~yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  ServiceName:
    Description: Name of your module (e.g. data-services).
    Type: String
    MinLength: 1
    Default: data-services
  Testing:
    Type: String
    AllowedValues: ['true','false']
    Default: 'true'
  BucketName:
    Type: String
    Default: 'bq-shakhomirov.bigquery.aws'

Resources:

  LambdaPolicy:
    Type: AWS::IAM::Policy
    DependsOn: LambdaRole
    Properties:
      Roles:
        - !Ref LambdaRole
      PolicyName: 'bigquery-pipe-lambda-policy'
      PolicyDocument:
        {
          "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Action": "s3:*",
                    "Resource": "*"
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "lambda:*"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "ec2:CreateNetworkInterface",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DeleteNetworkInterface",
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Sid": "",
                  "Effect": "Allow",
                  "Action": [
                      "logs:*"
                  ],
                  "Resource": [
                      "arn:aws:logs:*:log-group:/aws/lambda/*:*"
                  ]
                },
                {
                    "Sid": "CloudWatchEventsFullAccess",
                    "Effect": "Allow",
                    "Action": "events:*",
                    "Resource": ["*"]
                },
                {
                    "Sid": "IAMPassRoleForCloudWatchEvents",
                    "Effect": "Allow",
                    "Action": "iam:PassRole",
                    "Resource": ["arn:aws:iam::*:role/AWS_Events_Invoke_Targets"]
                },
                {
                  "Action": [
                      "rds:Describe*",
                      "rds:ListTagsForResource",
                      "ec2:DescribeAccountAttributes",
                      "ec2:DescribeAvailabilityZones",
                      "ec2:DescribeInternetGateways",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcAttribute",
                      "ec2:DescribeVpcs"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
              },
              {
                  "Action": [
                      "cloudwatch:GetMetricStatistics",
                      "logs:DescribeLogStreams",
                      "logs:GetLogEvents"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
              },
              {
                    "Sid": "DynamoDBAccess",
                    "Effect": "Allow",
                    "Action": [
                         "dynamodb:*"
                        ],
                    "Resource": "*"
              }
  
            ]
        }

  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          -
            Effect: Allow
            Principal:
              Service:
                - "lambda.amazonaws.com"
            Action:
              - "sts:AssumeRole"


  ####  PayPal Lambda ####

  PayPalLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
    Properties:
      # see https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types
      Handler: bq-paypal-revenue/app.handler
      Runtime: nodejs12.x
      FunctionName: bq-paypal-revenue
      Description: Microservice that updates BigQuery PayPal source table using schedule
      Environment:
        Variables:
          DEBUG: true
          TESTING: 'false' #!Ref Testing
          DB_BUCKET_TEST: "bq-shakhomirov.bigquery.aws"
          DB_BUCKET: "data.your-bucket.aws"
      Role: !GetAtt LambdaRole.Arn
      Timeout: 180           # timeout in seconds
      MemorySize: 128
      Tags:
        Service: BigQuery

  PayPalLambdaTrigger:
    Type: AWS::Events::Rule
    DependsOn: PayPalLambda
    Properties:
      Description: Triggers the lambda 'bq-paypal-revenue' to extract data from API.
      # https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html 
      ScheduleExpression: 'cron(00 6 * * ? *)'
      Targets:
       - { Arn: !GetAtt PayPalLambda.Arn, Input: '{}', Id: 'BigQueryPayPalTrigger' }

  PermissionForEventsToInvokePayPalLambda:
    Type: "AWS::Lambda::Permission"
    DependsOn: [PayPalLambda, PayPalLambdaTrigger]
    Properties:
      FunctionName:
        Ref: PayPalLambda
      Action: "lambda:InvokeFunction"
      Principal: "events.amazonaws.com"
      SourceArn: !GetAtt PayPalLambdaTrigger.Arn

  IngestManagerLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
    Properties:
      # see https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types
      Handler: bq-ingest-manager/app.handler
      Runtime: nodejs12.x
      FunctionName: bq-ingest-manager
      Description: Microservice that loads data into BigQuery
      Environment:
        Variables:
          DEBUG: true
          TESTING: 'false' #!Ref Testing
          DB_BUCKET_TEST: "bq-shakhomirov.bigquery.aws"
          DB_BUCKET: "data.your-bucket.aws"
      Role: !GetAtt LambdaRole.Arn
      Timeout: 180           # timeout in seconds
      MemorySize: 128
      Tags:
        Service: BigQuery

  DataBucket:
      Type: AWS::S3::Bucket
      DependsOn:
        - PermissionForEventsToInvokeIngestManagerLambda
      Properties:
        BucketName: !Ref BucketName
        NotificationConfiguration:
          LambdaConfigurations:
            - Event: s3:ObjectCreated:*
              Function: !GetAtt IngestManagerLambda.Arn
              # Filter:
                # S3Key:
                #   Rules:
                #   - Name: suffix
                #     Value: .txt

  PermissionForEventsToInvokeIngestManagerLambda:
    Type: "AWS::Lambda::Permission"
    Properties:
      FunctionName:
        Ref: IngestManagerLambda
      Action: "lambda:InvokeFunction"
      Principal: s3.amazonaws.com
      SourceArn: !Sub 'arn:aws:s3:::${BucketName}'

~~~
* after that when you ran:
$ `npm run predeploy`
$ aws cloudformation package \
    --region eu-west-1 \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.bq-shakhomirov.aws
$ aws cloudformation deploy \
    --region eu-west-1 \
    --template-file cf-deploy.yaml \
    --stack-name data-services \
    --capabilities CAPABILITY_IAM

Your Lambda functstack must be successfully deployed:
~~~bash
...
(base) Mikes-MBP:stack mikeshakhomirov$ aws cloudformation deploy \
>     --region eu-west-1 \
>     --template-file cf-deploy.yaml \
>     --stack-name data-services \
>     --capabilities CAPABILITY_IAM

Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - data-services
~~~

* Now if you test your solution by runnning:
~~~bash
aws s3 cp ./data/simple_transaction0.csv s3://bq-shakhomirov.bigquery.aws
~~~
If this file name contains any of table names you mentioned in ./config.json it will be uploaded into BigQuery into relevant table.

If you check logs you should see a successfull upload into your BigQuery table.

![Result](https://mydataschool.com/liveprojects/img/img-s2-lp4-m2-desired-outcome-stack-part3.png)






*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.

Your SF stack with added Dynamo table must be this:
* ./M2/solution/data-services/stack/cf-config.yaml:
~~~yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  ServiceName:
    Description: Name of your module (e.g. data-services).
    Type: String
    MinLength: 1
    Default: data-services
  Testing:
    Type: String
    AllowedValues: ['true','false']
    Default: 'true'
  BucketName:
    Type: String
    Default: 'bq-shakhomirov.bigquery.aws'
  IngestManagerSuccessTableName:
    Type: String
    Default: 'ingest-manager-success'

Resources:
  # stores successfull data ingestion events
  IngestManagerSuccessTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        -
          AttributeName: "fileKey"
          AttributeType: "S"
      KeySchema:
        -
          AttributeName: "fileKey"
          KeyType: "HASH"
      ProvisionedThroughput:
            ReadCapacityUnits: "1"
            WriteCapacityUnits: "1"
      TableName:
        Ref: IngestManagerSuccessTableName

  LambdaPolicy:
    Type: AWS::IAM::Policy
    DependsOn: LambdaRole
    Properties:
      Roles:
        - !Ref LambdaRole
      PolicyName: 'bigquery-pipe-lambda-policy'
      PolicyDocument:
        {
          "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Action": "s3:*",
                    "Resource": "*"
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "lambda:*"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Effect": "Allow",
                  "Action": [
                    "ec2:CreateNetworkInterface",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DeleteNetworkInterface",
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Sid": "",
                  "Effect": "Allow",
                  "Action": [
                      "logs:*"
                  ],
                  "Resource": [
                      "arn:aws:logs:*:log-group:/aws/lambda/*:*"
                  ]
                },
                {
                    "Sid": "CloudWatchEventsFullAccess",
                    "Effect": "Allow",
                    "Action": "events:*",
                    "Resource": ["*"]
                },
                {
                    "Sid": "IAMPassRoleForCloudWatchEvents",
                    "Effect": "Allow",
                    "Action": "iam:PassRole",
                    "Resource": ["arn:aws:iam::*:role/AWS_Events_Invoke_Targets"]
                },
                {
                  "Action": [
                      "rds:Describe*",
                      "rds:ListTagsForResource",
                      "ec2:DescribeAccountAttributes",
                      "ec2:DescribeAvailabilityZones",
                      "ec2:DescribeInternetGateways",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcAttribute",
                      "ec2:DescribeVpcs"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
              },
              {
                  "Action": [
                      "cloudwatch:GetMetricStatistics",
                      "logs:DescribeLogStreams",
                      "logs:GetLogEvents"
                  ],
                  "Effect": "Allow",
                  "Resource": "*"
              },
              {
                    "Sid": "DynamoDBAccess",
                    "Effect": "Allow",
                    "Action": [
                         "dynamodb:*"
                        ],
                    "Resource": "*"
              }
  
            ]
        }

  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          -
            Effect: Allow
            Principal:
              Service:
                - "lambda.amazonaws.com"
            Action:
              - "sts:AssumeRole"


  ####  PayPal Lambda ####

  PayPalLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
    Properties:
      # see https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types
      Handler: bq-paypal-revenue/app.handler
      Runtime: nodejs12.x
      FunctionName: bq-paypal-revenue
      Description: Microservice that updates BigQuery PayPal source table using schedule
      Environment:
        Variables:
          DEBUG: true
          TESTING: 'false' #!Ref Testing
          DB_BUCKET_TEST: "bq-shakhomirov.bigquery.aws"
          DB_BUCKET: "data.your-bucket.aws"
      Role: !GetAtt LambdaRole.Arn
      Timeout: 180           # timeout in seconds
      MemorySize: 128
      Tags:
        Service: BigQuery

  PayPalLambdaTrigger:
    Type: AWS::Events::Rule
    DependsOn: PayPalLambda
    Properties:
      Description: Triggers the lambda 'bq-paypal-revenue' to extract data from API.
      # https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html 
      ScheduleExpression: 'cron(00 6 * * ? *)'
      Targets:
       - { Arn: !GetAtt PayPalLambda.Arn, Input: '{}', Id: 'BigQueryPayPalTrigger' }

  PermissionForEventsToInvokePayPalLambda:
    Type: "AWS::Lambda::Permission"
    DependsOn: [PayPalLambda, PayPalLambdaTrigger]
    Properties:
      FunctionName:
        Ref: PayPalLambda
      Action: "lambda:InvokeFunction"
      Principal: "events.amazonaws.com"
      SourceArn: !GetAtt PayPalLambdaTrigger.Arn

####  IngestManager Lambda ####
  IngestManagerLambda:
    Type: AWS::Serverless::Function
    DependsOn: LambdaPolicy
    Properties:
      # see https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types
      Handler: bq-ingest-manager/app.handler
      Runtime: nodejs12.x
      FunctionName: bq-ingest-manager
      Description: Microservice that loads data into BigQuery
      Environment:
        Variables:
          DEBUG: true
          TESTING: 'false' #!Ref Testing
          DB_BUCKET_TEST: "bq-shakhomirov.bigquery.aws"
          DB_BUCKET: "data.your-bucket.aws"
          DYNAMO_SUCCESS: "ingest-manager-success"
      Role: !GetAtt LambdaRole.Arn
      Timeout: 180           # timeout in seconds
      MemorySize: 128
      Tags:
        Service: BigQuery

  DataBucket:
      Type: AWS::S3::Bucket
      DependsOn:
        - PermissionForEventsToInvokeIngestManagerLambda
      Properties:
        BucketName: !Ref BucketName
        NotificationConfiguration:
          LambdaConfigurations:
            - Event: s3:ObjectCreated:*
              Function: !GetAtt IngestManagerLambda.Arn
              # Filter:
                # S3Key:
                #   Rules:
                #   - Name: suffix
                #     Value: .txt

  PermissionForEventsToInvokeIngestManagerLambda:
    Type: "AWS::Lambda::Permission"
    Properties:
      FunctionName:
        Ref: IngestManagerLambda
      Action: "lambda:InvokeFunction"
      Principal: s3.amazonaws.com
      SourceArn: !Sub 'arn:aws:s3:::${BucketName}'

~~~

Your app must be able to:
- `npm run predeploy`
- create a package
~~~bash
aws cloudformation package \
    --region eu-west-1 \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.bq-shakhomirov.aws
~~~
- deploy a package:
~~~bash
aws cloudformation deploy \
    --region eu-west-1 \
    --template-file cf-deploy.yaml \
    --stack-name data-services \
    --capabilities CAPABILITY_IAM
~~~
- on new S3 object analyse it and if schema exists in ./config.json upload it into BigQuery.
~~~bash
aws s3 cp ./data/simple_transaction0.csv s3://bq-shakhomirov.bigquery.aws
~~~

If this file name contains any of table names you mentioned in ./config.json it will be uploaded into BigQuery into relevant table.

[Full solution](LP4/Milestones/M2/solution/data-services/stack) and has the following services:

.
├── bq-ingest-manager
│   ├── data
│   ├── node_modules
│   ├── test
│   ├── tmp
│   ├── app.js
│   ├── bq-shakhomirov-b86071c11c27.json
│   ├── config.json
│   ├── deploy.sh
│   ├── loadTestGenerateData.js
│   ├── package-lock.json
│   └── package.json
├── bq-paypal-revenue
│   ├── test
│   ├── tmp
│   ├── app.js
│   ├── config.json
│   ├── deploy.sh
│   ├── package.json
│   └── token_config.json
├── cf-config.yaml
├── cf-deploy.yaml
├── cf-install.sh
└── readme.md

