# Configure continuous integration/deployment workflows for your Dataform project

## **Objective**

* Migrate your DataForm project to git provider
* Create CI/CD pipeline with Staging and Live environments for your data transformation pipelines.
* Enrich your source data (tables created in Milestone 1) with analytics and run on a schedule, i.e. daily. 


## **Why is this milestone important to the project?**

* You will learn how to migrate your DataForm project to git provider and create live and staging environments for your BigQuery projects.
A clean and simple way to separate *staging* and *production* data is to use a different database (BigQuery project) for each environment.
* We will use separate databases for development and production data. For staging environment we will create a separate project in BigQuery (database). So we could safely delete all staging resources in case we need to. Google's recommended best practice is to create a separate billing project to separate **production** and **staging** environments.
* By default, Dataform runs all of your project code from your project's `master` Git branch. Configuring environments allows you to **control** this behaviour, enabling you to run multiple different versions of your project code.
A common use-case for environments is to run a staged release process. After testing code in a **staging** environment, the code is promoted to a stable **production** environment.


## **Workflow**

### [3.1] Migrate your DataForm project to git provider, i.e. **github**.
### [3.2] Create a *Staging* and *Production* BigQuery project.
- connect it to **Dataform**
- point your `Staging` BigQuery project to the same github repository but use a branch called `staging`
### [3.3] Create a schedule for each environment
- Schedule daily updates for one of the `analytics` tables.


## **Deliverable**

The deliverable for this milestone is a GitHub repository with branches connected to your **BigQuery** projects.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


## **Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

* [Dataform docs](https://docs.dataform.co/dataform-web/scheduling/environments)
* [Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365)
* [Outside resource 4. Google Dataform](https://docs.dataform.co/guides/)
* [Outside resource 5. Google Dataform API](https://docs.dataform.co/reference#IDeclarationConfig)
* [Dataform operations](https://docs.dataform.co/guides/operations)


### *Hint for Step 3.1:*
Read this [Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365) to learn how to connect your dataform project to github.

### *Hint for Step 3.2:*
- Read the [docs](https://docs.dataform.co/dataform-web/scheduling/environments)

- Create a **staging** / **production** project:
![Desired outcome](https://mydataschool.com/liveprojects/img/LP3/img-M3-20.png)

- We previously created a service account and supplied these credentials to **dataform**. Now we would want that service account to be able to access our **production** BigQuery project.
Go to [IAM](https://console.cloud.google.com/iam-admin/iam) and enable access to **production** project (bq-shakhomirov) for the service account you created before. Add **BigQuery Admin** role to an email address associated with your staging service account, i.e.:
![](https://mydataschool.com/liveprojects/img/LP3/iamdataform_iam.png)

- [Enable API here if needed for your staging project](https://console.cloud.google.com/apis/api/bigquerydatatransfer.googleapis.com/overview)

- Now you can create two environments in Dataform, i.e. `Staging` and `Production` operating on code from these two git branches of your repository retrospectively (staging and master).

### *Hint for Step 3.2:*
After you've done your dev changes on your personal branch you can commit it to `staging` (staging) branch so these changes start running on a schedule. Create a Pull Request:

![](https://mydataschool.com/liveprojects/img/LP3/dataform_branch_1.png)

* After a merge you can go to your dataform project, hit refresh and you will see the changes you've just made:
![](https://mydataschool.com/liveprojects/img/LP3/dataform_branch_2.png)

* After you merge `staging` into `master` branch you will see the changes in dataform's `Production` environment when selected:
![](https://mydataschool.com/liveprojects/img/LP3/dataform_branch_3.png)
![](https://mydataschool.com/liveprojects/img/LP3/dataform_branch_4.png)





## *partial solution*

* Go to ./dataform.json and enable deafultDatabase as now your dataform project can access both `staging` and `production` BigQuery projects.

~~~json
{
    "warehouse": "bigquery",
    "defaultSchema": "analytics",
    "assertionSchema": "dataform_assertions",
    "defaultDatabase": "bq-shakhomirov-staging"
}
~~~

* In this case my defaultWarehouse is `bq-shakhomirov-staging` which means that every test I run from dataform development branch i.e. `mshakhomirov_dev` would execute SQL transformation code in that particular BigQuery proejct.

* Go to ./environments.json and add `configOverride` for each to use a relevant BigQuery project and relevant git branch, i.e.
~~~json
{
  "environments": [
    {
      "name": "production",
      "configOverride": {
        "defaultDatabase": "bq-shakhomirov"
      },
      "schedules": [
        {
         ...
          
        },
        {
          ...
        }
      ],
      "gitRef": "master"
    },
    ...

~~~


## *full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.
### Full solution:
[GitHub repo](https://github.com/mshakhomirov/dataform)

### Explanation

* In this example my defaultWarehouse is `bq-shakhomirov-staging` which means that every test I run from dataform development branch i.e. `mshakhomirov_dev` would execute SQL transformation code in that particular BigQuery proejct:

- ./dataform.json
~~~json
{
    "warehouse": "bigquery",
    "defaultSchema": "analytics",
    "assertionSchema": "dataform_assertions",
    "defaultDatabase": "bq-shakhomirov-staging"
}
~~~

- In ./environments.json I added `configOverride` for each to use a relevant BigQuery project and relevant git branch

- I also added schedule to execute pipelines with tag `daily_14_35` at 14:35 UTC:

~~~json
{
  "environments": [
    {
      "name": "production",
      "configOverride": {
        "defaultDatabase": "bq-shakhomirov"
      },
      "schedules": [
        {
          "name": "35 14 * * *",
          "cron": "35 14 * * *",
          "disabled": true,
            "tags": [
              "daily_14_35"
            ],
            "options": {
              "includeDependencies": false
            },
          "notify": [
            {
              "channel": "mikes_email",
              "statuses": [
                "FAILURE"
              ]
            }
          ]
        },
        {
          "name": "35 * * * *",
          "cron": "35 * * * *"
        }
      ],
      "gitRef": "master"
    },
    {
      "name": "staging",
      
      "schedules": [
        {
          "name": "35 14 * * *",
          "cron": "35 14 * * *",
          "disabled": false,
            "tags": [
              "daily_14_35"
            ],
            "options": {
              "includeDependencies": false
            },
          "notify": [
            {
              "channel": "mikes_email",
              "statuses": [
                "SUCCESS",
                "FAILURE"
              ]
            }
          ]
        }
      ],
      "gitRef": "staging"
    }
  ],
  "notificationChannels": [
    {
      "name": "mikes_email",
      "email": {
        "to": [
          "mike.shakhomirov@gmail.com"
        ]
      }
    }
  ]
}

~~~


