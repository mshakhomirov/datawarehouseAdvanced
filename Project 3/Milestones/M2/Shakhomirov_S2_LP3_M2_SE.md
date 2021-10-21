# Solution Explanation

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
