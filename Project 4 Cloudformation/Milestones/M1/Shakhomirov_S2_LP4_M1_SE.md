# Solution explanation

For complete solution you would have these files including `cf-deployyaml` after you run `package` command:
~~~bash
.
├── cf-config.yaml
├── cf-deploy.yaml
├── cf-install.sh
└── stack
    ├── bq-paypal-revenue
    │   ├── app.js
    │   ├── config.json
    │   ├── deploy.sh
    │   ├── package.json
    │   ├── test
    │   │   └── data.json
    │   ├── tmp
    │   └── token_config.json
    └── readme.md
~~~
- your `cf-config.yaml` must look like this:

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

~~~

After you run your `deploy` command outcome should be a successfully deployed stack:

~~~bash
(base) Mikes-MBP:data-services mikeshakhomirov$ aws cloudformation deploy \>     --region eu-west-1 \
>     --template-file cf-deploy.yaml \
>     --stack-name data-services \
>     --capabilities CAPABILITY_IAM

Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - data-services
~~~

## Result
![Result](https://mydataschool.com/liveprojects/img/img-s2-lp4-m1-desired-outcome-stack.png)