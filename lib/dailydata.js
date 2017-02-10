var xmlDocument = require('xmldoc');
var TestObject = require('./testobject.js');
var fileSystem = require('fs');

function DailyData(filename) {
    this.testSuites = [];
    this.dataSeries = [];
    this.dataSeriesString = '';
    this.totalTests = 0;
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.totalSkips = 0;
    this.totalErrors = 0;
    this.totalTime = 0;
    var xmlData = fileSystem.readFileSync(filename, 'utf8');
    var testResultXml = new xmlDocument.XmlDocument(xmlData);
    var fileFromDisc = testResultXml.childrenNamed('testsuite');
    for(var j = 0; j < fileFromDisc.length; j++){
        this.testSuites.push(new TestObject(fileFromDisc[j]));
        this.dataSeries.push(this.testSuites[j].asArray);
        this.dataSeriesString += this.testSuites[j].asStringifiedArray;
        this.dataSeriesString = (j == fileFromDisc.length - 1) ? this.dataSeriesString : this.dataSeriesString + ',';
        this.totalTests += this.testSuites[j].total_tests;
        this.totalPassed += this.testSuites[j].passed_tests;
        this.totalSkips += this.testSuites[j].skipped_tests;
        this.totalFailed += this.testSuites[j].failed_tests;
        this.totalErrors += this.testSuites[j].errors;
        this.totalTime += this.testSuites[j].time;
    }
    this.totalTime = this.totalTime.toFixed(3);
    this.passRate = ((this.totalTests - this.totalErrors - this.totalFailed) * 100 / this.totalTests).toFixed(1);
    this.testStartedOn = fileFromDisc[0].attr.timestamp;
};

DailyData.prototype.combineDataSeries = function (toCombineWith) {
    var dataSeriesComplete = '';
    for(var i = 0; i < this.dataSeries.length; i++){
        dataSeriesComplete += '["' +this.dataSeries[i][0] + '" ,' + this.dataSeries[i][1] + ', ' +this.dataSeries[i][2] + ', '
            +this.dataSeries[i][3] + ', ' +toCombineWith.dataSeries[i][1]
            + ', ' +toCombineWith.dataSeries[i][2] + ', ' + toCombineWith.dataSeries[i][3] + ']';
        dataSeriesComplete = (i == this.dataSeries.length - 1) ? dataSeriesComplete : dataSeriesComplete + ',';
    }
    return dataSeriesComplete;
}

DailyData.prototype.generateAccordion = function () {
    var htmlCode = '';
    htmlCode += '<div class="panel-group" id="jasAccordion">';

    for(var i = 0; i <this.testSuites.length; i++){
        htmlCode += this.testSuites[i].generateTable(i);
    }
    htmlCode += '</div>';//close accordion
    return htmlCode;
}

module.exports = DailyData;