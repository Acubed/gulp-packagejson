#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

// 1. Check 'index.js' symlink, save as "main" key
// 2. Check doap.ttl, save as various keys
// 3. Read .gitmodules, store as "dependencies"

module.exports.parseDir = parseDir;
function parseDir(dir, options, callback){
	dir = dir || '.';
	try{
		var stat = fs.statSync(path.resolve(dir, '.git'));
		if(!stat.isDirectory()) throw new Error('.git not a directory');
	}catch(e){
		console.error('Must be a Git repository: '+ e.toString());
		process.exit(1);
		return;
	}

	function readMain(cb){
		var files = ['main.node', 'main.js', 'index.node', 'index.js', 'index.json'];
		var main = null;
		for(var i=0; i<files.length; i++){
			var file = files[i];
			try{
				var stat = fs.lstatSync(path.resolve(dir, file));
			}catch(e){
				continue;
			}
			if(stat.isSymbolicLink()){
				files.push(fs.readlinkSync(path.resolve(dir, file)));
			}else if(stat.isFile()){
				main = file;
				break;
			}
		}

		cb(null, main);
	}

	function readVersion(cb){
		//var process = require('child_process').spawn('git', ['describe', '--match', '^v']);
		// FIXME set CWD
		var git = require('child_process').spawn('git', ['describe']);
		var version = '';
		git.stdout.on('data', function(x){
			version += x.toString();
		});
		var err = '';
		git.stderr.on('data', function(x){
			err += x.toString();
		});
		git.on('close', function(){
			if(err) var error = new Error(err);
			cb(err, version.trim());
		});
	}

	function readSubmodules(cb){
		try {
			var lines = fs.readFileSync(path.resolve(dir, '.gitmodules')).toString('utf8').split(/\r\n|\r|\n/);
		}catch(e){
			cb(null, {}, {});
			return;
		}
		var section = null;
		var submodules = {};
		lines.forEach(function(line){
			if(line.match(/^\s*;/)){
				return;
			}
			var match = line.match(/^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/);
			if(match){
				if(section){
					submodules[section][match[1]] = match[2];
				}else{
					submodules[match[1]] = match[2];
				}
				return;
			}
			var match = line.match(/^\s*\[\s*(submodule "node_modules\/([^\]]+)")\s*\]\s*$/);
			if(match){
				submodules[match[2]] = {};
				section = match[2];
				return;
			}
		});
		var deps = {devDependencies:{}, peerDependencies:{}};
		for(var path in submodules){
			if(submodules[path].semver){
				var source = submodules[path].semver || submodules[path].url;
				if(!source) continue;
				var target = submodules[path].npm || path;
				switch(submodules[path].type){
					case 'dev':
					case 'test':
					case 'build':
						deps.devDependencies[target] = source;
						break;
					default:
						deps.peerDependencies[target] = source;
						break;
				}
			}else if(submodules[path].semver){

			}
		}
		cb(null, deps, submodules);
	}

	function readGitHead(cb){
		// FIXME set CWD
		var git = require('child_process').spawn('git', ['rev-parse', 'HEAD']);
		var commit = '';
		git.stdout.on('data', function(x){
			commit += x.toString();
		});
		var err = '';
		git.stderr.on('data', function(x){
			err += x.toString();
		});
		git.on('close', function(){
			if(err) var error = new Error(err);
			cb(err, commit.trim());
		});
	}

	var remain = 5;
	var packagejson =
		{ name: ""
		, version: "0"
		, main: "index.js"
		, 'private': true
		};

	readMain(function(err, main){
		packagejson.main = main;
		if(!packagejson.main) delete packagejson.main;
		finished();
	});

	readVersion(function(err, version){
		packagejson.version = version;
		finished();
	});

	readSubmodules(function(err, deps){
		packagejson.devDependencies = deps.devDependencies;
		packagejson.peerDependencies = deps.peerDependencies;
		finished();
	});

	readGitHead(function(err, commit){
		packagejson.gitHead = commit;
		finished();
	});

	finished();

	function finished(){
		if(remain===null) return;
		if(--remain>0) return;
		remain = null;
		callback(null, packagejson);
	}
}
