const fs = require('fs');
const data = require("fs").readFileSync("./tmp/simple_transaction.csv", "utf8")
for (let i = 5; i < 300; i++) {
    fs.writeFileSync(`./data/simple_transaction${i}.csv`, data);
  } 

//   aws s3 cp ./data s3://bq-shakhomirov.bigquery.aws --recursive
// aws s3 cp ./data/error s3://bq-shakhomirov.bigquery.aws --recursive
// aws s3 cp ./img s3://mydataschool.com/liveprojects/img --recursive --profile mds
// aws s3 cp ./data/error/simple_transaction0.csv s3://bq-shakhomirov.bigquery.aws/simple_transaction_error.csv

(img/
(mydataschool.com/liveprojects/img/