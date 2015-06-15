(function() {
	"use strict";
	/* eslint-env node */

	/* imported node modules */
	var fs = require("fs");
	var path = require("path");
	var mkdirp = require("mkdirp");
	var rimraf = require("rimraf");

	/* imported modules */
	var downloader = require("./modules/DokuWikiDownloader.js")(fs);
	var emailer = require("./modules/Emailer.js")();

	/* imported config  object */
	var config = require("./config.json");

	var studentQueue;

	function clearTmpFolder() {
		rimraf(config.tmpFolder, function() {
			console.log("Finished - temporary folder deleted");
		});
	}

	function onMailSend(attachment, callback) {
		console.log("Did send " + attachment + " to " + config.email.recipient);
		callback();
	}

	function onTimeSheetDownloaded(targetFile, user, callback) {
		emailer.sendEmail({
			from: config.email.sender,
			to: config.email.recipient,
			subject: config.email.subject + user,
			text: config.email.text + user,
			attachments: [{
				path: targetFile
			}]
		}, onMailSend.bind(this, targetFile, callback));
	}

	function downloadTimeSheetForStudent(student, callback) {
		var targetFile = config.tmpFolder + path.sep + student.file;
		console.log("Downloading timesheets for " + student.name + " to " + targetFile);
		downloader.download({
			url: student.url,
			type: "pdf",
			filename: targetFile
		}, onTimeSheetDownloaded.bind(this, targetFile, student.name, callback));
	}

	function processNextStudent(onLastStudentProcessed) {
		var student = studentQueue.pop();
		if(student === undefined || student === null) {
			onLastStudentProcessed();
		} else {
			downloadTimeSheetForStudent(student, processNextStudent.bind(this, onLastStudentProcessed));
		}
	}

	function startProcessingStudentQueue() {
		processNextStudent(clearTmpFolder);
	}

	function loginIntoWiki(onLoggedIn) {
		downloader.login({
			url: config.wiki.loginURL,
			user: config.wiki.user,
			password: config.wiki.password
		}, onLoggedIn);
	}

	function initTmpFolder() {
		mkdirp(config.tmpFolder);
		console.log("Created temporary folder " + config.tmpFolder);
	}

	function initStudentQueue() {
		studentQueue = config.students;
		console.log("Getting timesheets for " + studentQueue.length + " students.");
	}

	function run() {
		initTmpFolder();
		initStudentQueue();
		loginIntoWiki(startProcessingStudentQueue);
	}

	return {
		run: run
	};

}().run());

