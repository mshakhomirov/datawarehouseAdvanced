## Adding monitoring and alarms with AWS Cloudformation

## **Objective**

* You have already created a Cloudformation stack with AWS Lambda function responsible for data extraction from your PayPal account.
* You have already added `data ingest manager` to your stack file and deployed these microservices using AWS Cloudformation.
* Added IAM roles for these Lambdas and extra resources, i.e. as S3 bucket.

- Now you would want to set up alarms and notifications to monitor your data pipelines.
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-confirm-alarm2.png)

## **Why is this milestone important to the project?**

- This is an intro to AWS Cloudformation and how you describe your resources (Lmbdas, etc.) with AWS Cloudformation. Adding the second Lambda shows how you can simplify deployment and scale your resources easily across multiple accounts if needed.
- You ave already added one resources (AWS Lambda function, S3 bucket, DynamoDb) 
- Now you would want to monitor your data ingestion process using *Cloudwatch logs* and deploy it with *Cloudformation*.


# **Workflow**

# **[1]. Modify your stack file and add Alarm Notification Topic (SNS)**
- Add a `resource` called *AlarmNotificationTopic*
- Add a `subscription` with email endpoint (`Protocol: email`) to receive email notification in case of any `ERROR` events in your microservices.
- Add an Email parameter in your stack, add:
~~~yaml
  Email:
    Type: 
    Description: 
    Default:
~~~

# [2]. Create an ERROR metric alarms for your services using AWS Cloudformation
## [2.1]. Explicitly define a *log group* for each Lambda in your stack
- You have probably noticed that we have AWS Lambda permissions to create log groups itself:
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-logGroup.png)
- Now you would want to delete it and add to Cloudformation file because other resources would depend on it.
- Set log retention policy to 7 days (Properites).
- Set LogGroupName to the same name as it used.

## [2.2]. Add *ERROR metric filter* which should depend on log group resource for each Lambda
Metric filter describes how CloudWatch Logs extracts information from logs and transforms it into Amazon CloudWatch metrics.
You would want to create one for your log group to filter our `ERROR` events.
Add a metric name called `ERRORCount`
## [2.3]. Add *ERROR metric alarm* (depends on ERROR metric filter) which would send notifications to your *Alarm topic*.
Create 
## [2.4]. Test your solution


# **Deliverable**

The deliverable for this milestone is a serverless application package (usually happens after `aws cloudformation package` command). But feel free to simply zip your application folder and include stack files.
Alternatively you can create your own repository and share it.

When your solution is ready after you run:

~~~bash
aws cloudformation package \
    --region eu-west-1 \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.bq-shakhomirov.aws


aws cloudformation deploy \
    --region eu-west-1 \
    --template-file cf-deploy.yaml \
    --stack-name data-services \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides
~~~

The desired outcome must be successfully deployed resources:

~~~bash
...

>     --capabilities CAPABILITY_IAM

Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - data-services
~~~

![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-outcome_1.png?raw=true)

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


## **Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

### *Hint for Step [1].*
[Read AWS Cloudformation Log Groups documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-loggroup.html)

You would want to add this to your stack file:
~~~yaml
  IngestManagerLogGroup:
    Type: 'AWS::Logs::LogGroup'
    Properties:
      RetentionInDays: 7
      LogGroupName: /aws/lambda/bq-ingest-manager
~~~
- Go to AWS console and delete log group first.
- Deploy your solution with AWS Cloudformation and check if that LogGroup was created.

### *Hint for Step [2.2].*
Read AWS [Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-metricfilter.html)
Think which properties do you need and what metric value should be.

This would do the job:
~~~yaml
  IngestManagerERRORMetricFilter:
    Type: 'AWS::Logs::MetricFilter'
    DependsOn: IngestManagerLogGroup
    Properties:
      LogGroupName: /aws/lambda/bq-ingest-manager
      FilterPattern: ERROR
      MetricTransformations:
        - MetricValue: '1'
          MetricNamespace: /aws/lambda/bq-ingest-manager
          MetricName: ERRORCount
~~~

### *Hint for Step [2.3].*
Read [AWS::CloudWatch::Alarm](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cw-alarm.html)
Read [Alarm data points to alert on](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudwatch-alarm-metricstat.html)
`Alarm` type resource specifies an alarm and associates it with the specified metric or metric math expression.
Try to think which Properties it should have.
Probably you wouls want to trigger alarm when ERRORCount is greater than 0 over any 5 minutes period.

To add metric alarm use this yaml:
~~~yaml
  IngestManagerERRORMetricAlarm:
    Type: 'AWS::CloudWatch::Alarm'
    DependsOn: IngestManagerERRORMetricFilter
    Properties:
      AlarmDescription: Trigger a the number ERROR greater than 5 for 5 consecutive minutes.
      Namespace: /aws/lambda/bq-ingest-manager #or  !Ref ServiceName but must be the same as MetricNamespace in filter
      MetricName: ERRORCount
      Statistic: Sum
      Period: '60'
      EvaluationPeriods: '5'
      ComparisonOperator: GreaterThanThreshold
      Threshold: '0'
      AlarmActions:
        - !Ref AlarmNotificationTopic 
~~~
### [FAQ] 
After I deployed the solution I don't see any error notifications even though my files with incorrect data caused errors.
### [Answer] 
After you successfully deployed your updated stack you will need to confirm your email SNS subscription. If you go to SNS service and click your topic you need to check if subscription status is still pending and then check your email.
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-confirm-subscription2.png)
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-confirm-subscription.png)
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-confirm-alarm.png)

### [FAQ]
I've sent an error file to ingest but didn't get a notification.
### [Answer] 
Check your data points to alert on. It might be that it was specified `Trigger a the number ERROR greater than 5 for 5 consecutive minutes.`
Change `EvaluationPeriods: '5'` to `EvaluationPeriods: '1'`  to alert on 1 data point.
Read more [here](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudwatch-alarm-metricstat.html)

### *Hint for Step [2.4]*
When you test your solution by uploading some files with error data you will receive an email notification:
~~~bash
aws s3 cp ./data/error s3://bq-shakhomirov.bigquery.aws --recursive
~~~

In this example we have a schema mismatch and value `d` won't fit into `int64` field causing error:
~~~csv
transaction_id,user_id,dt
101,'d',2021-08-013
102,777,2021-08-013
103,777,2021-08-013
~~~
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-error-test.png)



## *Resources*
[AWS::Logs::LogGroup](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-loggroup.html)
[aws logs metricfilter](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-metricfilter.html)
[AWS::CloudWatch::Alarm](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cw-alarm.html)

## *More resources*
[Serverless Application model](https://aws.amazon.com/serverless/sam/)
[Lambda Properties](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types)
[!GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html)
[!Ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html)
[cron expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)

## *partial solution*
Here is the *partial solution script* for this milestone. Download this file, use it to develop your solution, and upload your deliverable.

In  *partial solution* you would need to add `Log Group`, `metric filter` and `Metric Alarm` to the second Lambda in your stack:



- cf-config.yaml
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
  Email:
    Type: String
    Description: Email address to notify when Lambda has triggered an alarm
    Default: 'yourEmail@mail.com' #or create an sns topic to share with wider team: 'arn:aws:sns:eu-west-1:yourAccountId:Alerts'

Resources:

  AlarmNotificationTopic:
    Type: 'AWS::SNS::Topic'
    Properties:
      Subscription:
        - Endpoint: !Ref Email
          Protocol: email



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
          DB_BUCKET_TEST: "data-staging.your-bucket.aws"
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

  BqPayPalLogGroup:
    Type: 'AWS::Logs::LogGroup'
    # Add your code here

  BqPayPalERRORMetricFilter:
    Type: 'AWS::Logs::MetricFilter'
    # Add your code here
  
  BqPayPalERRORMetricAlarm:
    Type: 'AWS::CloudWatch::Alarm'
    # Add your code here

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

  IngestManagerLogGroup:
    Type: 'AWS::Logs::LogGroup'
    Properties:
      RetentionInDays: 7
      LogGroupName: /aws/lambda/bq-ingest-manager

  IngestManagerERRORMetricFilter:
    Type: 'AWS::Logs::MetricFilter'
    DependsOn: IngestManagerLogGroup
    Properties:
      LogGroupName: /aws/lambda/bq-ingest-manager
      FilterPattern: ERROR
      MetricTransformations:
        - MetricValue: '1'
          MetricNamespace: /aws/lambda/bq-ingest-manager
          MetricName: ERRORCount

  IngestManagerERRORMetricAlarm:
    Type: 'AWS::CloudWatch::Alarm'
    DependsOn: IngestManagerERRORMetricFilter
    Properties:
      AlarmDescription: Trigger a the number ERROR greater than 5 for 5 consecutive minutes.
      Namespace: bq-ingest-manager # !Ref ServiceName
      MetricName: ERRORCount
      Statistic: Sum
      Period: '60'
      EvaluationPeriods: '5'
      ComparisonOperator: GreaterThanThreshold
      Threshold: '0'
      AlarmActions:
        - !Ref AlarmNotificationTopic

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


## *full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.
After you run:

~~~bash
aws cloudformation package \
    --region eu-west-1 \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.bq-shakhomirov.aws


aws cloudformation deploy \
    --region eu-west-1 \
    --template-file cf-deploy.yaml \
    --stack-name data-services \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides
~~~

The desired outcome must be successfully deployed resources:

~~~bash
...

>     --capabilities CAPABILITY_IAM

Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - data-services
~~~

![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-outcome_1.png)


Your SF stack with added resources must be this:
* ./M3/solution/data-services/stack/cf-config.yaml:
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
  Email:
    Type: String
    Description: Email address to notify when Lambda has triggered an alarm
    Default: 'yourEmail@mail.com' #or create an sns topic to share with wider team: 'arn:aws:sns:eu-west-1:yourAccountId:Alerts'

Resources:

  AlarmNotificationTopic:
    Type: 'AWS::SNS::Topic'
    Properties:
      Subscription:
        - Endpoint: !Ref Email
          Protocol: email



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
          DB_BUCKET_TEST: "data-staging.your-bucket.aws"
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

  BqPayPalLogGroup:
    Type: 'AWS::Logs::LogGroup'
    Properties:
      RetentionInDays: 7
      LogGroupName: /aws/lambda/bq-paypal-revenue

  BqPayPalERRORMetricFilter:
    Type: 'AWS::Logs::MetricFilter'
    DependsOn: BqPayPalLogGroup
    Properties:
      LogGroupName: /aws/lambda/bq-paypal-revenue
      FilterPattern: ERROR
      MetricTransformations:
        - MetricValue: '1'
          MetricNamespace: bq-paypal-revenue # !Ref ServiceName 
          MetricName: ERRORCount
  
  BqPayPalERRORMetricAlarm:
    Type: 'AWS::CloudWatch::Alarm'
    DependsOn: BqPayPalERRORMetricFilter
    Properties:
      AlarmDescription: Trigger a the number ERROR greater than 5 for 5 consecutive minutes.
      Namespace: bq-paypal-revenue # !Ref ServiceName
      MetricName: ERRORCount
      Statistic: Sum
      Period: '60'
      EvaluationPeriods: '5'
      ComparisonOperator: GreaterThanThreshold
      Threshold: '0'
      AlarmActions:
        - !Ref AlarmNotificationTopic 

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

  IngestManagerLogGroup:
    Type: 'AWS::Logs::LogGroup'
    Properties:
      RetentionInDays: 7
      LogGroupName: /aws/lambda/bq-ingest-manager

  IngestManagerERRORMetricFilter:
    Type: 'AWS::Logs::MetricFilter'
    DependsOn: IngestManagerLogGroup
    Properties:
      LogGroupName: /aws/lambda/bq-ingest-manager
      FilterPattern: ERROR
      MetricTransformations:
        - MetricValue: '1'
          MetricNamespace: /aws/lambda/bq-ingest-manager
          MetricName: ERRORCount

  IngestManagerERRORMetricAlarm:
    Type: 'AWS::CloudWatch::Alarm'
    DependsOn: IngestManagerERRORMetricFilter
    Properties:
      AlarmDescription: Trigger a the number ERROR greater than 5 for 5 consecutive minutes.
      Namespace: bq-ingest-manager # !Ref ServiceName
      MetricName: ERRORCount
      Statistic: Sum
      Period: '60'
      EvaluationPeriods: '5'
      ComparisonOperator: GreaterThanThreshold
      Threshold: '0'
      AlarmActions:
        - !Ref AlarmNotificationTopic

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


- **on error event log this event record under relevant log group and send a notification either to SNS topic or to your email.**
- So when you test your solution by uploading some files with error data you will receive an email notification:
~~~bash
aws s3 cp ./data/error s3://bq-shakhomirov.bigquery.aws --recursive
~~~

In this example we have a schema mismatch and value `d` won't fit into `int64` field causing error:
~~~csv
transaction_id,user_id,dt
101,'d',2021-08-013
102,777,2021-08-013
103,777,2021-08-013
~~~
![img](https://mydataschool.com/liveprojects/img/img-s2-lp4-m3-error-test.png)

[Full solution](LP4/Milestones/M3/solution/data-services/stack) and has the following services:
~~~bash
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

~~~