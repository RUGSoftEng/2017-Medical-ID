## 2017-Medical-ID client-side documentation

This documentation is about the client-side JavaScript modules, which are mainly used for the document creators.
The [creator module](module-creator.html) is at the core of this structure, with the [card](module-MIDCard.html) and [document](module-MIDDocument.html) modules for generating the specific medical documents.

### Generate this documentation yourself
**Install JSDoc globally on your machine:**
```sh
$ sudo npm install -g jsdoc
```

**Compile the documents:**
```sh
$ jsdoc -d doc -R jsdoc.md -r public/js/medid
```
