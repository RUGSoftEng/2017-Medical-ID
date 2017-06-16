# 2017-Medical-ID

Running project: [VIEW](https://medid.herokuapp.com/)

Client-side documentation: [VIEW](https://htmlpreview.github.io/?https://raw.githubusercontent.com/RUGSoftEng/2017-Medical-ID/develop/doc/index.html)

**Install and run instructions:**   
Ensure you have Python2.7 and NodeJS installed on your machine.

In config.js, you will find some authentication information. You will need to set the values to the details you will use for the account for sending emails, the database link and the key you want to use to encrypt the data.

Once the above has been done, run the following commands from the terminal:

```sh
$ npm install
```

```sh
$ npm start
```
### cmd Reminders ###

**Obtaining files:**   
git clone -b develop https://github.com/RUGSoftEng/2017-Medical-ID.git  
git pull origin develop

**Creating a new local branch:**   
git checkout -b newBranch develop  
note: must push origin branchName 

**Before a push:**   
git status  
git add folderName/* (or: git add -A)  
(remove file:) git rm fileName  
git commit -m "I just did some change"   
git push origin branchName 

**Add tag:**  
git tag -a tagName hashofCommit -m "tagging message"  
git push --follow-tags  

**Delete tag:**  
git tag -d tagName  
git push --delete origin tagName
