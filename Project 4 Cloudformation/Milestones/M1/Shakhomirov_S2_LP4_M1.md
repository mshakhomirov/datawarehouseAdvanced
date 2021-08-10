## Deploy AWS Lambda for extraction pipes with AWS Cloudformation

**Objective**

* You would want to create a new Cloudformation stack containing two AWS Lambda functions for data extraction.
* You would would to deploy these microservices using AWS Cloudformation.
* Add IAM roles for these Lambdas and extra =esources, i.e. as S3 bucket.


**Why is this milestone important to the project?**

- This is an intro to AWS Cloudformation and how you describe your resources (Lmbdas, etc.) with AWS Cloudformation. Adding the second Lambda shows how you can simplify deployment and scale your resources easily across multiple accounts if needed.
- By adding just one resource (AWS Lambda function) you will learn how to do it with other resources, i.e. RDS or Dynamo.


**Workflow**

# **[1]. Create Cloudformation template for PayPal data connector (your first Lambda)**

## [1.1]. Create a new folder called `data-services`.

- copy solution for `PayPal data connector` from *liveProject1*
Your service folder structure must look like this:
~~~bash
Mikes-MBP:data-services
.
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

- You can also copy it from [pipelineTools repo](https://github.com/mshakhomirov/pipelinetools/). Check readme.md and follow the instructions.

## [1.2]. Create `./stack/cf-config.yaml`

- Create `./stack/cf-config.yaml` and add **AWS Lambda** as a resource to your *Cloudformation* template. Use this a template to begin with:

~~~yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  ServiceName:
    Description: Name of your module (e.g. data-services).
    Type: String
    MinLength: 1
    Default: data-services

Resources:
...
~~~


- Under **Resources:** add your Lambda function by adding this into your `cf-config.yaml`:
~~~yaml
Resources:
  PayPalLambda:
    Type: AWS::Serverless::Function
    DependsOn: # Try to think what dependencies are for this Lambda function.
    Properties:
      # see https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types
      Handler: paypal-data-connector/app.handler
      Runtime: nodejs12.x
      FunctionName: 
      Description: Microservice that updates BigQuery PayPal source table using schedule
      Environment:
        Variables:
          DEBUG: true
          TESTING:
          DB_BUCKET_TEST:
          DB_BUCKET:
      Role: # your Lambda role
      Timeout: # timeout in seconds
      MemorySize: 128
      Tags:
        Service: BigQuery
~~~



## [1.3] Add a LambdaPolicy which should `depend on` Lambda role for your service.

Use `!GetAtt` and `!Ref` operators to reference your **AWS Lambda role and a policy** as dependencies in `Cloudformation` stack file, i.e.

~~~yaml
Resources:
...
  LambdaPolicy:
    Type: AWS::IAM::Policy
    DependsOn: LambdaRole
    Properties:
      Roles:
        - !Ref LambdaRole
      PolicyName: 'bigquery-pipe-lambda-policy'
...  
  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
...
  PayPalLambda:
...
          DB_BUCKET:
      Role: !GetAtt # yourLambdaRole
      Timeout: 180
      MemorySize: 128
      Tags:
        Service: BigQuery
~~~


## [1.4] You might want to add a few more custom parameters to your microservice. 
Under **parameters** add parameters from your Lambda for `staging` and `live` environments as they exist in your `app.js`, i.e.

`.app.js:`
~~~js
...
const TESTING = process.env.TESTING || 'true';
...
~~~



## [1.5] Deploy your *Cloudformation* stack. 
- Run `npm run predeploy` that will remove unnecessary **node_modules**, i.e "aws-sdk": "2.804.0" as it is included in AWS.
- Use `aws cloudformation package` to create a package for your service deployment
- Use `aws cloudformation deploy` to deploy your stack
*You must have AWS CLI to run these commands*

[FAQ] My Lambda runs locally but after deployment it returns errors;
[Ansewr] Check your aws-sdk module version. it must match the version AWS use [default runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) one for node.js version you chose for your Lambda. 

## [1.6] Add a trigger to your Lambda using *Cloudformation* stack. 
- Add a trigger to invoke your Lambda every day at 06:00 am UTC
- Add a permission for this trigger to invoke your Lambda. Use `!GetAtt` to add  your `LambdaTrigger.Arn`

So you have a Lambda function. That trigger should depend on this Lambda. Permission should also depend on both Lambda and a trigger:
`./cf-config.yaml`
~~~yaml
...
Resources:
...
  LambdaPolicy:
...  
  LambdaRole:
...
  PayPalLambda:
...
  PayPalLambdaTrigger:
    Type: AWS::Events::Rule # You would want to create a Cloudwatch rule based on Cron expression
    DependsOn: PayPalLambda
    Properties:
      Description: ...
      ScheduleExpression: ...
      Targets:
       - { Arn: !GetAtt PayPalLambda.Arn, Input: '{}', Id: 'PayPalLambdaTrigger' }

  PermissionForEventsToInvokePayPalLambda:
    Type: "AWS::Lambda::Permission"
    DependsOn: [PayPalLambda, PayPalLambdaTrigger]
    Properties:
      FunctionName:
        Ref: PayPalLambda
      Action: "lambda:InvokeFunction"
      Principal: "events.amazonaws.com"
      SourceArn: ...

~~~


**Deliverable**

The deliverable for this milestone is...[WHAT IS THE DELIVERABLE FOR THIS MILESTONE]

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Hint for Steps [1.2]*
Your Lambda will depend on IAM access role as everything else in AWS.
Read about AWs serverless application model and check the properties *Lambda function* might have.
[Lambda Properties](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types)

[FAQ] What is SAM?
[Answer] The AWS Serverless Application Model [(SAM)](https://aws.amazon.com/serverless/sam/) is an open-source framework for building serverless applications. It provides shorthand syntax to express functions, APIs, databases, and event source mappings. With just a few lines per resource, you can define the application you want and model it using YAML.

~~~yaml
Resources:
  PayPalLambda:
    Type: AWS::Serverless::Function
    DependsOn: # Try to think what dependencies are for this Lambda function.
    Properties:
      Handler: paypal-data-connector/app.handler
      Runtime: nodejs12.x
      FunctionName: paypal-data-connector
      Description: Microservice that updates BigQuery PayPal source table using schedule
      Environment:
        Variables:
          DEBUG: true
          TESTING: 'true'
          DB_BUCKET_TEST: "data-staging.your-bucket.aws"
          DB_BUCKET: "data.your-bucket.aws"
      Role: #LambdaRole.Arn
      Timeout: 180           # timeout in seconds
      MemorySize: 128
      VpcConfig:
        SecurityGroupIds:
          - sg-somesecuritygroupId
        SubnetIds:
          - subnet-someSubnetId
          - subnet-someSubnetId
          - subnet-someSubnetId
      Tags:
        Service: BigQuery
~~~

*Hint for Step [1.3]*
- Read about [!GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html)

Add this to your `cf-config.yaml` 
~~~yaml
Resources:
...
          DB_BUCKET:
      Role: !GetAtt LambdaRole.Arn
...
      Tags:
        Service: BigQuery
~~~

- Read about creating IAM roles 
Add new **IAM policy** for your Lambda role to your `cf-config.yaml` as a resource:
~~~yaml
Resources:
...
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

~~~



*Hint for Step [1.4]*
Your parameters are string environment variables and can be either 'true' or 'false'. Add them to `.cf-config.yaml` like so:
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
...
~~~

*Hint for Step [1.5]*
Firstly create a bucket to store your microservice artifacts:
~~~bash
aws s3 mb s3://lambdas.bq-shakhomirov.aws
~~~

You would want to run these commands like so:

~~~bash
aws cloudformation package \
    --region eu-west-1 \
    --template-file cf-config.yaml \
    --output-template-file cf-deploy.yaml \
    --s3-bucket lambdas.bq-shakhomirov.aws
~~~

**and then another one:**

~~~bash
aws cloudformation deploy \
    --region eu-west-1 \
    --template-file cf-deploy.yaml \
    --stack-name data-services \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Testing="false"
~~~

You can also wrap them into shell script. Check it [here]("Project 4 Cloudformation/Milestones/M1/solution/data-services/stack/cf-install.sh")

*Hint for Step [1.6]*

Read about scheduled [cron expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)

./cf-config.yaml
~~~yaml
...
  PayPalLambdaTrigger:
    Type: AWS::Events::Rule # You would want to create a Cloudwatch rule based on Cron expression
    DependsOn: PayPalLambda
    Properties:
      Description: ...
      ScheduleExpression: ...
      Targets:
       - { Arn: !GetAtt PayPalLambda.Arn, Input: '{}', Id: 'PayPalLambdaTrigger' }

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



*Resources*

[Serverless Application model](https://aws.amazon.com/serverless/sam/)
[Lambda Properties](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#property-types)
[!GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html)
[!Ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html)
[cron expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)






*partial solution*
 
Here is the *partial solution script* for this milestone. Download this file, use it to develop your solution, and upload your deliverable.

./cf-config.yaml:
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
         ...
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
      Handler: ...
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
      ScheduleExpression: ...
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
      SourceArn: ...

~~~



*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.

For complete solution you would have these files including `cf-deployyaml` after you run `package` command:

.
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
    ├── cf-config.yaml
    ├── cf-deploy.yaml
    ├── cf-install.sh
    └── readme.md

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
![Result](mydataschool.com/liveprojects/img/img-s2-lp4-m1-desired-outcome-stack.png)