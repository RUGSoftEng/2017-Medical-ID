# 2017-Medical-ID

Running project: [VIEW](https://medid.herokuapp.com/)

Client-side documentation: [VIEW](https://htmlpreview.github.io/?https://raw.githubusercontent.com/RUGSoftEng/2017-Medical-ID/develop/doc/index.html)

### cmd Reminders ###

**Obtaining files:**   
git clone -b develop https://github.com/RUGSoftEng/2017-Medical-ID.git  
git pull origin develop

**Creating a new branch:**   
git checkout -b newBranch develop

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

**Install and run instructions:**
```sh
$ npm install
```

```sh
$ npm start
```
