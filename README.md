# 2017-Medical-ID

Running project: [VIEW](https://medid.herokuapp.com/)

Client-side documentation: [VIEW](https://htmlpreview.github.io/?https://raw.githubusercontent.com/RUGSoftEng/2017-Medical-ID/develop/doc/index.html)

**Install and run instructions:**   
Ensure you have Python2.7 and NodeJS installed on your machine.

In app.js, you can find the mongoose.connect() function. In here, you will find the address of the Mongo database. Replace this with the address of the Mongo database you would like to use.

In forgot.js, there are two sections as such:

```sh
auth: {
    user: 'medicalid17@gmail.com',
    pass: 'enterpasswordhere'
}
```

Here, you should enter the username and password of the account you would like to send the password reset emails.

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
