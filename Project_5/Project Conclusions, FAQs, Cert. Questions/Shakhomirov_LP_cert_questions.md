
LINK TO QUIZ QUESTION TYPES: https://livebook.manning.com/exercise-examples

## <div style="text-align: justify"> This certificate exam will give you a good idea of the skills learned while completing this liveProject. This exam is required in order to receive a certificate of completion.</div>

(We're looking for 3-5 questions that cover skills/concepts the liveProject as a whole.)

Under each question write:

Explain: [EXPLANATION OF THE ANSWER AND A RESOURCE (PREFERABLY MANNING) OR TWO TO HELP EXPLAIN THE FEATURED SKILL. REFERENCING A SPECIFIC MILESTONE WHEN THIS WAS LEARNED IS ALSO HELPFUL.] 


1. You need to share Google Data Studio report with users (limited access) and track the report usage. How would you do that? 

Invite user to view
Invite user to edit
Use​ owner’s credentials
Use viewer’s credentials _[CORRECT ANSWER]_


2. You were tasked to create a table that would be updated by a member of another team manually. You were given a link to Google sheet with sample data. How would you aproach this?

_[CORRECT ANSWER]_

[1]. Create a source table using the google sheet provided so it could be updated manually.
[2]. Schedule a daily extract into a production schema with added `updated_at` field.
[3]. Add an hourly schedule if more frequent update needed.

[WRONG ANSWER]
[1]. Create a table using the Google sheet provided.
[2]. Reference this table in your reports.

_[CORRECT ANSWER]_
[1]. Create a storage bucket and ask Marketing team to upload new files with updates into this bucket
[2]. Schedule a daily extract into a production schema with with Cloud function as soon as data file lands in this bucket.



3. You create an important report for your large team in Google Data Studio. The report uses Google BigQuery as its data source. You notice that visualizations are not showing data that is less than 1 hour old. What should you do?
A. Disable caching by editing the report settings.
B. Disable caching in BigQuery by editing table details.
C. Refresh your browser tab showing the visualizations.
D. Clear your browser history for the past hour then reload the tab showing the virtualizations.

Correct Answer: A
Reference:
https://support.google.com/datastudio/answer/7020039?hl=en



4. You regularly use prefetch caching with a Data Studio report to visualize the results of BigQuery queries. You want to minimize service costs. What should you do?

B. Set up the report to use the Owner's credentials to access the underlying data in BigQuery, and verify that the 'Enable cache' checkbox is selected for the report.
Feedback
B (Correct Answer) - B is correct because you must set Owner credentials to use the 'enable cache' option in BigQuery. It is also a Google best practice to use the 'enable cache' option when the business scenario calls for using prefetch caching.


5. You want to display aggregate view counts for your YouTube channel data in Data Studio. You want to see the video tiles and view counts summarized over the last 30 days. You also want to segment the data by the Country Code using the fewest possible steps. What should you do?

B. Set up a YouTube data source for your channel data for Data Studio. Set Views as the metric and set Video Title and Country Code as report dimensions.
Feedback
B (Correct Answer) - B is correct because there is no need to export; you can use the existing YouTube data source. Country Code is a dimension because it's a string and should be displayed as such, that is, showing all countries, instead of filtering.
A is not correct because you cannot produce a summarized report that meets your business requirements using the options listed.
