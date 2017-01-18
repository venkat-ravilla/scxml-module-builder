# scxml-module-builder
Building a single scxml file from different sub modules

# Build
1. Import SCXML Module
2. Create an object with below keys
	1. basePath: location of external xml files.
	2. entry: base scxml file path.
	3. targetPath: output file location.
	4. outputFileName: name of the output file.
3. Pass the object in the constructor of the module.  
4. Call build function from the module instance. 


Example:
```
const builder = require("scxml-module-builder");

let option = {
	basePath:"test/module/",
	entry:"index.scxml",
	targetPath:"dist/",
	outputFileName:"index.scxml"
}
let testinstance = builder(option);
testinstance.build();
```