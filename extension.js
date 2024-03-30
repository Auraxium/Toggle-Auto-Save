const vscode = require('vscode');
let excludes = []
function log(s) { vscode.window.showInformationMessage(s) }

let debounce = function (cb, delay = 1000) {
	let timeout;

	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			cb(...args);
		}, delay);
	};
};

let bounceSave = debounce((s) => {
	let doc = vscode.window?.activeTextEditor?.document || null;
	if (!doc) return;
	if (doc.save && doc.isDirty && !excludes.find(e => e.toLowerCase() == doc.fileName.toLowerCase())) {
		vscode.window.activeTextEditor.document.save();
		// log((vscode.window.activeTextEditor?.document?.fileName || 'no file') + ' saved.')
	}
}, 1000);

function activate(context) {
	let get = context.globalState.get('excludes')
	if(get) excludes = JSON.parse(get) || []
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "Toggle Auto Save";
	statusBarItem.tooltip = "Toggle Auto Save";
	statusBarItem.command = "file";
	let c = 0;

	vscode.commands.registerCommand('file', () => {
		let fileName = vscode.window?.activeTextEditor?.document?.fileName || null;
		if (!fileName) return;
		let name = fileName.toLowerCase()
		let ind = excludes.indexOf(name)
		if(ind == -1) {
			excludes.push(name)
			log(`${fileName.split('\\').at(-1)} will no longer Auto Saving`)
			statusBarItem.text = `Auto Save: Off` 
		} else {
			excludes.splice(ind, 1);
			log(`${fileName.split('\\').at(-1)} will now Auto Save`)
			statusBarItem.text = `Auto Save: On` 
		}
		context.globalState.update('excludes', JSON.stringify(excludes));
});
	
	// Show the status bar item
	statusBarItem.show();

	vscode.workspace.onDidChangeTextDocument(bounceSave);
	vscode.window.onDidChangeActiveTextEditor(e => {
		let fileName = e?.document?.fileName || null;
		if (!fileName) return statusBarItem.text = '';
		statusBarItem.text = `Auto Save: ${excludes.includes(fileName.toLowerCase()) ? 'Off' : 'On'}` ;
	})
}

function deactivate(context) { context.globalState.update('excludes', JSON.stringify(excludes)); }

module.exports = {
	activate,	
	deactivate
}

// console.log('Congratulations, your extension "smart-save" is now active!');

// let disposable = vscode.commands.registerCommand('smart-save.helloWorld', function () {
// 	vscode.window.showInformationMessage("Hello VS Code");
// });

// let whatPath = vscode.commands.registerCommand('smart-save.whatPath', () => {
// 	vscode.window.showInformationMessage(vscode.window.activeTextEditor?.document?.fileName || 'no file')
// })

// vscode.commands.registerCommand('togHi', () => {
// 	interval = interval ? clearInterval(interval) : setInterval(() => vscode.commands.executeCommand('smart-save.helloWorld'), 2000);
// })

// vscode.commands.registerCommand('fix.it', () => {
//
//
//
//
// })

// interval = interval ? clearInterval(interval) : setInterval(() => vscode.commands.executeCommand('smart-save.helloWorld'), 2000);