const fs = require('fs');
const readline = require('readline');
const parser = require('xml2json');
const _ = require('lodash');

class ScxmlBuilder{
	constructor(options){
		if(options != null && typeof options == "object"){
			this._options = options;
			this.initialize();
		}		
	}

	static createInstance(options){
		return new ScxmlBuilder(options);
	}

	set options(options){
		if (options != null && typeof options == "object") {
			this._options = options;
			this.initialize();
		};
	}

	initialize(){
		this.basePath = this._options.basePath;
		this.entry = this._options.entry;
		this.targetPath = this._options.targetPath;
		this.outputFileName = this._options.outputFileName;
		this.contentArr = [];
		this.readlocks = 0;
		
		this.destinationFileStream = fs.createWriteStream(this.targetPath+"/"+this.outputFileName);
	}

	build(){
		this.externalFileHandler(this.entry,0,"",this.contentArr);
	}

	externalFileHandler(filename,arrindex,space,targetContentArr){
		let rl = this.readLineGenerator(filename);
		let contentArr=[];
		let lineIndexInArray = 0;
  		this.readlocks++;

		rl.on('line', (line) => {
			let json;
			if (line.indexOf("<include")!=-1) {
				let _space = space;
				for (let i = 0; i < line.indexOf("<include"); i++) {
					_space+=" ";
				};
		  		json =parser.toJson(line.trim());
		  		json = JSON.parse(json);
		  		this.externalFileHandler(this.basePath+"/"+json.include.src,lineIndexInArray,_space,contentArr);
		  		lineIndexInArray++;
		  	}else{
		  		contentArr[lineIndexInArray] = space+line+"\n";
		  		lineIndexInArray++;
		  	}  
		});
		rl.on('close', () => {
			targetContentArr[arrindex] = contentArr;
			this.readlocks--;
			this.destinationWrite();
		});
	}

	readLineGenerator(path){
		let readStream = fs.createReadStream(path);
		let rl = readline.createInterface({
		  input: readStream
		});
		return rl;
	}

	destinationWrite(){
		if (this.readlocks==0) {
			const destinationFileStream = fs.createWriteStream(this.targetPath+"/"+this.outputFileName);
			destinationFileStream.write(_.flattenDeep(this.contentArr).join(''));
		};
	}
}

module.exports = ScxmlBuilder.createInstance