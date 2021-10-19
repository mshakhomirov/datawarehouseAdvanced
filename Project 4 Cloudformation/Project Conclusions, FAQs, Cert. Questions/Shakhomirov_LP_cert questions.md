
LINK TO QUIZ QUESTION TYPES: https://livebook.manning.com/exercise-examples

## <div style="text-align: justify"> This certificate exam will give you a good idea of the skills learned while completing this liveProject. This exam is required in order to receive a certificate of completion.</div>

(We're looking for 3-5 questions that cover skills/concepts the liveProject as a whole.)

Under each question write:

Explain: [EXPLANATION OF THE ANSWER AND A RESOURCE (PREFERABLY MANNING) OR TWO TO HELP EXPLAIN THE FEATURED SKILL. REFERENCING A SPECIFIC MILESTONE WHEN THIS WAS LEARNED IS ALSO HELPFUL.] 


1. A company wants to setup a template for deploying resources to AWS. They want this to be dynamic in nature so that the template can pick up parameters and then spin up resources based on those parameters. Which of the following AWS services would be ideal for this requirement?

A. AWS Beanstalk

B. AWS CloudFormation _[Correct answer]_

C. AWS CodeBuild

D. AWS CodeDeploy

Explaination:
B. AWS CloudFormation
The AWS Documentation mentions the below on AWS CloudFormation. This supplements the requirement in the question about consultants using their architecture diagrams to construct CloudFormation templates.
AWS CloudFormation is a service that helps you model and set up your Amazon Web Service resources so that you can spend less time managing those resources and more time focusing on your applications that run in AWS. You create a template that describes all the AWS resources that you want (like Amazon EC2 instances or Amazon RDS DB instances), and AWS CloudFormation takes care of provisioning and configuring those resources for you.
For more information on AWS CloudFormation, please visit the following URL:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html


2. Your company’s management team has asked you to devise a disaster recovery strategy for the current resources hosted in AWS. They want to minimize costs, but be able to spin up the infrastructure when needed in another region. How could you accomplish this with the LEAST costs in mind?

A. Create a duplicate of the entire infrastructure in another region.

B. Create a Pilot Light infrastructure in another region.

C. Use Elastic Beanstalk to create another copy of the infrastructure in anotherregion if a disaster occurs in the primary region.

D. Use CloudFormation to spin up resources in another region if a disaster occurs inthe primary region. _[Correct answer]_

D. Use CloudFormation to spin up resources in another region if a disaster occurs inthe primary region.
Since cost is a factor, both options A and B are invalid.
The best and most cost effective option is to create CloudFormation templates which can be used to spin up resources in another region during disaster recovery.
For more information on CloudFormation, please visit the below URL:
https://aws.amazon.com/cloudformation/



3. A company wants to create standard templates for deployment of their Infrastructure. These would also be used to provision resources in another region during disaster recovery scenarios. Which AWS service can be used in this regard?

A. Amazon Simple Workflow Service

B. AWS Elastic Beanstalk

C. AWS CloudFormation _[Correct answer]_

D. AWS OpsWorks

_[Explanation]_:
C. AWS CloudFormation
AWS CloudFormation gives developers and systems administrators an easy way to create and manage a collection of related AWS resources, provisioning and updating them in an orderly and predictable fashion.
You can use AWS CloudFormation’ssample templatesor create your own templates to describe the AWS resources, and any associated dependencies or runtime parameters, required to run your application. You don’t need to figure out the order for provisioning AWS services or the subtleties of making those dependencies work. CloudFormation takes care of this for you. After the AWS resources are deployed, you can modify and update them in a controlled and predictable way, in effect applying version control to your AWS infrastructure the same way you do with your software. You can also visualize your templates as diagrams and edit them using a drag-and-drop interface with theAWS CloudFormation Designer.
For more information on AWS CloudFormation, please visit the following URL:
https://aws.amazon.com/cloudformation/



4. A company requires to provision test environments in a short duration. Also required is an ability to tear them down easily for cost optimization. How can this be achieved?

A. Use CloudFormation templates to provision the resources accordingly.

B. Use a custom script to create and tear down the resources.

C. Use IAM Policies for provisioning the resources and tearing them downaccordingly.

D. Use Auto Scaling groups to provision the resources on demand.

_[Correct answer]_
A. Use CloudFormation templates to provision the resources accordingly.
The Cost optimization Whitepaper from AWS mentions the following:
“AWS CloudFormation provides templates that you can use to create AWS resources and provision them in an orderly and predictable fashion. This can be useful for creating short-lived environments, such as test environments.”Also as per AWS cost optimization white paper, “You can leverage the AWS APIs and AWS CloudFormation to automatically provision and decommission entire environments as you need them. This approach is well suited for development or test environments that run only in defined business hours or periods of time.”But you can’t handle the test environments by using the Autoscaling group. You can provide the list of resources which requires to build a test environment and it’s pretty easy. For more information on the Whitepaper, please visit the following URL:
https://d1.awsstatic.com/whitepapers/architecture/AWS-Cost-Optimization-Pillar.pdf



5. A consulting firm repeatedly builds large architectures for their customers using AWS resources from several AWS services including IAM, Amazon EC2, Amazon RDS, DynamoDB and Amazon VPC. The consultants have architecture diagrams for each of their architectures, and are frustrated that they cannot use them to automatically create their resources.
Which service should provide immediate benefits to the organization?

A. AWS Beanstalk

B. AWS CloudFormation

C. AWS CodeBuild

D. AWS CodeDeploy

_[Correct answer]_
B. AWS CloudFormation
AWS CloudFormation: This supplements the requirement in the question and enables consultants to use their architecture diagrams to construct CloudFormation templates.

AWS Documentation mentions the following on AWS CloudFormation:

AWS CloudFormation is a service that helps you model and set up your Amazon Web Service resources so that you can spend less time managing those resources and more time focusing on your applications that run in AWS. You create a template that describes all the AWS resources that you want (like Amazon EC2 instances or Amazon RDS DB instances), and AWS CloudFormation takes care of provisioning and configuring those resources for you.

For more information on AWS Cloudformation, please visit the following URL:

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html

6. There is a website hosted in AWS that might get a lot of traffic over the next couple of weeks. If the application experiences a natural disaster in the future, which of the following can be used to reduce potential disruption to users?

A. Use an ELB to divert traffic to an Infrastructure hosted in another region.

B. Use an ELB to divert traffic to an Infrastructure hosted in another AZ.

C. Use CloudFormation to create backup resources in another AZ.

_[Correct answer]_
C. Use CloudFormation to create backup resources in another AZ.
In a disaster recovery scenario, the best choice out of all given options is to divert the traffic to a static web site.

Option A is wrong because ELB can only balance traffic in one region and not across multiple regions.

Options B and C are incorrect because using backups across AZ’s is not enough for disaster recovery purposes.

For more information on disaster recovery in AWS, please visit the following URL:

https://aws.amazon.com/premiumsupport/knowledge-center/fail-over-s3-r53/
https://aws.amazon.com/disaster-recovery/
The wordings “to reduce the potential disruption in case of issues” is pointing to a disaster recovery situation. There is more than 1 way to manage this situation. However we need to choose the best option from the list given here. Out of this the most suitable one is Option D.

Note:
Usually when we discuss about a disaster recovery scenario we assume that the entire region is affected due to some disaster. So we need the service to be provided from yet another region. So in that case setting up a solution in another AZ will not work as it is in the same region. Option A is incorrect though it mentions yet another region because ELB’s cannot span across regions. So out of the options provided Option D is the suitable solution.


7. A company has an entire infrastructure hosted on AWS. It wants to create code templates used to provision the same set of resources in another region in case of a disaster in the primary region. Which of the following services can help in this regard?

A. AWS Beanstalk

B. AWS CloudFormation

C. AWS CodeBuild

D. AWS CodeDeploy

_[Correct answer]_
B. AWS CloudFormation
AWS Documentation provides the following information to support this requirement:
AWS CloudFormation provisions your resources in a safe, repeatable manner, allowing you to build and rebuild your infrastructure and applications, without having to perform manual actions or write custom scripts. CloudFormation takes care of determining the right operations to perform when managing your stack, and rolls back changes automatically if errors are detected.
For more information on AWS CloudFormation, please visit the following URL:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html

