<div align=center>
<h1>Mongoose Key Set Pagination</h1>

Key Set pagination mongoose plugin developed for data pagination

[![npm version](https://badge.fury.io/js/mongoose-keyset-paginate.svg)](https://www.npmjs.com/package/mongoose-keyset-paginate)

</div>

# Installation

Use the package manager [npm](npmjs.com/package/mongoose-keyset-paginate) to install:
```bash
npm i mongoose-keyset-paginate
```

# Usage
For example User Mongoose Model
```javascript
const {Schema, model} = require("mongoose");

const UserSchema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  }
}, { timestamps: true });


const User = model('user', UserSchema)

module.exports = User
```
You two option to use this plugin:
* Applying plugin globally for all models
* Applying plugin only for specific model

### Applying plugin globally for all models:
```javascript
const mongoose = require("mongoose");
const {paginate} = require("mongoose-keyset-paginate");
mongoose.plugin(paginate);
```
### Applying plugin only for specific model:
```javascript
const {Schema, model} = require("mongoose");
const {paginate} = require("mongoose-keyset-paginate");

const UserSchema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  }
}, { timestamps: true });

UserSchema.plugin(paginate)

const User = model('user', UserSchema)

module.exports = User
```
### How to get first page:
Getting First Page
#### Code:
```javascript
const results = User.cursorPaginate({}, {});
console.log(results)
```
#### Output:
```json
{
  "currentCursorResultsCount": 0,
  "results": [],
  "hasNext": false,
  "next": null,
  "hasPrevious": false,
  "previous": null,
  "limit": 10
}
```
* currentCursorResultsCount: field contains count of docs present in current page
* results: field contains docs in current page
* hasNext: field is "true" if next page is present
* next: field contains next page token if its available otherwise null
* hasPrevious: field is "true" if previous page is present
* previous: field contains previous page token if its available otherwise null

### How to get next page:
Getting Next Page
#### Code:
```javascript
const nextResults = User.cursorPaginate({}, {
  next: "token retirved from last results inside next field"
});
console.log(nextResults)
```

### How to get previous page:
Getting Previous Page
#### Code:
```javascript
const previousResults = User.cursorPaginate({}, {
  previous: "token retirved from last results inside previous field"
});
console.log(previousResults)
```

### What if any error is thrown from library and what is error format
Let's see above example
```
Error: [{"field":"name","error":"name field doesn't exist inside model."}]
at /home/universe/WebstormProjects/test-socket/node_modules/mongoose-keyset-paginate/dist/pagination/functions/paginateByKeySet.js:62:19
at Generator.next (<anonymous>)
at /home/universe/WebstormProjects/test-socket/node_modules/mongoose-keyset-paginate/dist/pagination/functions/paginateByKeySet.js:8:71
at new Promise (<anonymous>)
at __awaiter (/home/universe/WebstormProjects/test-socket/node_modules/mongoose-keyset-paginate/dist/pagination/functions/paginateByKeySet.js:4:12)
at paginateByKeySet (/home/universe/WebstormProjects/test-socket/node_modules/mongoose-keyset-paginate/dist/pagination/functions/paginateByKeySet.js:22:79)
at Function.schema.statics.cursorPaginate (/home/universe/WebstormProjects/test-socket/node_modules/mongoose-keyset-paginate/dist/pagination/functions/paginate.js:10:54)
at Object.findAll (/home/universe/WebstormProjects/test-socket/services/user.service.js:11:15)
at /home/universe/WebstormProjects/test-socket/controllers/auth.controller.js:8:37
at /home/universe/WebstormProjects/test-socket/utils/catchAsync.js:2:19
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate (if applicable).

## License

[MIT](https://choosealicense.com/licenses/mit/)