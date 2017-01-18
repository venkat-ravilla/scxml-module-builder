const fs = require('fs');
const readline = require('readline');
const parser = require('xml2json');

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
		this.lineIndexInArray = 0;
		this.readlocks = 1;
		
		this.rl = this.readLineGenerator(this.entry);
		this.destinationFileStream = fs.createWriteStream(this.targetPath+"/"+this.outputFileName);
	}

	build(){
		this.rl.on('line', (line) => {
			let json;
			if (line.indexOf("<include")!=-1) {
				let space = "";
				for (let i = 0; i < line.indexOf("<include"); i++) {
					space+=" ";
				};
		  		json =parser.toJson(line.trim());
		  		json = JSON.parse(json);
		  		let tmprl = this.readLineGenerator(this.basePath+"/"+json.include.src+'.xml');
		  		this.readlocks++;
		  		((i,tmp,s)=>{
		  			let tmparr=[];
		  			tmp.on('line', (line) => {
						 tmparr.push(line+"\n");
					});
					tmp.on('close', () => {
						this.contentArr[i] = tmparr.join(s);
						this.contentArr[i] = s+this.contentArr[i];
						this.readlocks--;
						this.destinationWrite();
					});
		  		})(this.lineIndexInArray,tmprl,space);
		  		this.lineIndexInArray++;
		  	}else{
		  		this.contentArr[this.lineIndexInArray] = line+"\n";
		  		this.lineIndexInArray++;
		  	}  
		});

		this.rl.on('close', () => {
			this.readlocks--;
			this.destinationWrite();
		});
	}

	externalFileHandler(){

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
			this.destinationFileStream.write(this.contentArr.join(''));
		};
	}
}

let option = {
	basePath:"test/module/",
	entry:"test/index.scxml",
	targetPath:"dist/",
	outputFileName:"index.scxml"
}
let testinstance = ScxmlBuilder.createInstance();
testinstance.options = option;
testinstance.build();