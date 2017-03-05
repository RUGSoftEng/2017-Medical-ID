# 2017-Medical-ID
[VIEW](http://htmlpreview.github.io/?https://github.com/RUGSoftEng/2017-Medical-ID/blob/beta-0.1/index.html)

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
