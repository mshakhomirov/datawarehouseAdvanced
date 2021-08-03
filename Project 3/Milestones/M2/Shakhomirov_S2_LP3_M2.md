## Configure continuous integration/deployment workflows for your Dataform project

**Objective**

* Migrate your DataForm project to git provider
* Create CI/CD pipeline with Staging and Live environments for your data transformation pipelines.


**Why is this milestone important to the project?**

* You will learn how to migrate your DataForm project to git provider and create live and staging environments for your BigQuery projects.
A clean and simple way to separate *staging* and *production* data is to use a different database for each environment.
We will use separate databases for development and production data. For staging environment we will create a separate project in BigQuery (database). So we could safely delete all staging resourcesin case we need to. Google's recommended best practice is to create a separate billing project to separate production and staging environments.
By default, Dataform runs all of your project code from your project's master Git branch. Configuring environments allows you to control this behaviour, enabling you to run multiple different versions of your project code.
A common use-case for environments is to run a staged release process. After testing code in a staging environment, the code is promoted to a stable production environment.


**Workflow**

[3.1] Migrate your DataForm project to git provider, i.e. **github**.
[3.2] Create a *Staging* BigQuery project.
- connect it to **Dataform**
- point your `staging` project to the same github repository but use a branch called `Staging`


**Deliverable**

The deliverable for this milestone is a GitHub repository with branches connected to your **BigQuery** projects.

Upload a link to your deliverable in the Submit Your Work section and click submit. After submitting, the Author's solution and peer solutions will appear on the page for you to examine.


**Help**

Feeling stuck? Use as little or as much help as you need to reach the solution!

*Resources*

[Dataform docs](https://docs.dataform.co/dataform-web/scheduling/environments)
[Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365)


*help*
*Hint for Step 3.1:*
Read this [Author's Medium article here:](https://towardsdatascience.com/easy-way-to-create-live-and-staging-environments-for-your-data-e4f03eb73365) to learn how to connect your dataform project to github.

*Hint for Step 3.2:*
- Read the [docs](https://docs.dataform.co/dataform-web/scheduling/environments)

- Create a staging project:
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-20.png)

- Remember we created a service account? We supplied these credentials to dataform. Now we would want that service account to be able to access our staging project.
Go to [IAM](https://console.cloud.google.com/iam-admin/iam) and enable access to **..-staging** project for the service account you created in Step 1.
![Like so](mydataschool.com/liveprojects/img/img-M3-21-2.png)
[Enable API here if needed for your staging project](https://console.cloud.google.com/apis/api/bigquerydatatransfer.googleapis.com/overview)

- So after you run the deployment in `staging` you will see all enriched tables created:
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-24.png)
![Desired outcome](mydataschool.com/liveprojects/img/img-M3-25.png)


*partial solution*
 
There is no partial solution for this Milestone.



*full solution*

If you are unable to complete the project, you can download the full solution here. We hope that before you do this you try your best to complete the project on your own.


[GitHub repo](https://github.com/mshakhomirov/dataform)

