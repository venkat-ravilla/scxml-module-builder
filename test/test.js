const builder = require("../index.js");

let option = {
	basePath:"test/module/",
	entry:"test/index.scxml",
	targetPath:"dist/",
	outputFileName:"index.scxml"
}

let testinstance = builder(option);
testinstance.build();