# Simple-Instagram

<!-- The content below is an example project proposal / requirements document.  -->

# NU Course Study Material forum --- NU Course Hero

## Team Decent:
Qingyuan Yao
Haoyang yuan
Xuewei Jiang
Yidi Li

## Overview

This site is about a forum for NU course material discuession. Users can create and log into their account. They can post the study matrials they want to discuss on the web for certain class, and others can add likes on it via registered users.


## Configuration
```
Use AWS S3 to store the materials (pdf)
Use AWS RDS (MySql) to store the Data Model
Use AWS Elastic Beanstalk to deploy web service as an instance of EC2
Use Express as server side RUSTful API
Use Python as front end side
```

## Data Model

The application will store Users, Materials, Reviews

```SQL
CREATE TABLE users
(
    userid       int not null AUTO_INCREMENT,
    username     varchar(64) not null,
    pwdhash      varchar(256) not null,
    PRIMARY KEY  (userid),
    UNIQUE       (username)
);

ALTER TABLE users AUTO_INCREMENT = 80001;  -- starting value

CREATE TABLE jobs
(
    jobid             int not null AUTO_INCREMENT,
    userid            int not null,
    courseid          varchar(256) not null,  -- Ex: cs310
    status            varchar(256) not null,  -- pending, completed, error msg
    originaldatafile  varchar(256) not null,  -- original name from user
    datafilekey       varchar(256) not null,  -- filename in the bucket
    resultsfilekey    varchar(256) not null,  -- results filename in bucket
    PRIMARY KEY (jobid),
    FOREIGN KEY (userid) REFERENCES users(userid)

);

ALTER TABLE jobs AUTO_INCREMENT = 1001;  -- starting value

CREATE TABLE likes
(
    likeid            int not null AUTO_INCREMENT,
    jobid             int not null,
    number            int not null, DEFAULT 0,
    PRIMARY KEY (likeid),
    FOREIGN KEY (jobid) REFERENCES jobs(jobid)
);

```

## Features
```
1. User authentication (Login and Register)
2. User upload/download (Can only upload as User!)
3. Like certain materials
4. View statistics about materials
```

## Server-side API

## Student register
```
app.post('/regis', regis.register);  
    req.body = {username: "xxx", password: xxxxx }
    sent back success if successfully register
```
## Student login
```
app.post('/login', login.login);
    req.body = {username: "xxx", password: xxxxx }
    sent back access token if success (contain userid, username, secret)
```
## Student list show
```
app.get('/users', users.get_users);
    list all the users
```
## This is upload api
```
app.post('/pdf/:userid', upload.single('file'), post_pdf);
    upload a pdf to the S3 and store it in the database
```
## Course Materials list show
```
app.get('/jobs', getAllJobs);
    list all the jobs
```
## Student download a course material
```
app.get('/download/:jobid', download.download_file);
    download certain pdf file
```
## Analyze the course material
```
app.get('/compute/:jobid', compute.compute_file);
```
## Student gives a like tag to a course material
```
app.get('/like/:jobid', like.like_func);
```
## All course materials' number of like show
```
app.get('/likelist', alllikes.alllikesfunc);
```
