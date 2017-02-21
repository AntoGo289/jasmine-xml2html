var xmlDocument = require('xmldoc');

function TestObject(testSuite) {
    this.name = testSuite.attr.name;
    this.short_name = shortenName(this.name);
    this.errors = parseInt(testSuite.attr.errors);
    this.total_tests = parseInt(testSuite.attr.tests);
    this.skipped_tests = parseInt(testSuite.attr.skipped);
    this.failed_tests = parseInt(testSuite.attr.failures);
    this.passed_tests = this.total_tests - this.errors - this.skipped_tests - this.failed_tests;
    this.time = parseFloat(testSuite.attr.time);
    this.asArray = [this.short_name, this.passed_tests, this.failed_tests, this.skipped_tests];
    this.asStringifiedArray = '["' + this.short_name + '",' + this.passed_tests + ',' + this.failed_tests + ',' +
        this.skipped_tests + ']';
    this.testcases = getTestCases(testSuite.childrenNamed('testcase'));
};

function shortenName(name) {
    var temp_name = '';
    var name_array = name;
    name_array = name_array.split(' ');
    /*for(var j = 0; j < name_array.length; j++){
        if(name_array[j].indexOf(':') > - 1){
            if(name_array[j].indexOf(':') == name_array[j].length - 1) temp_name += name_array[j].substring(0, name_array[j].length - 1);
        }
        else{
            temp_name += name_array[j];
        }
        if(j < name_array.length - 1) temp_name += ' ';
    }*/
    temp_name = toTitleCase(name_array[0].replace(':', '')) + ' ' + toTitleCase(name_array[1].replace(':', ''));
    if(name.indexOf('with flavour equal to') > -1){
        temp_name = temp_name + '\\n' +  toTitleCase(name_array[name_array.length - 1].replace(')', ''));
    }
    return temp_name;
}

function getTestCases(testcases) {
    var casesToBeReturned = [];
    for(var j in testcases){
        var testcase = {name: '', result: '', details: ''}
        var testFailed = testcases[j].childNamed('failure');
        var testSkipped = testcases[j].childNamed('skipped');
        var testError = testcases[j].childNamed('error');
        testcase.name = testcases[j].attr.name;
        if(testFailed) {
            testcase.result = 'Failed';
            testcase.details = testFailed;
        }
        else if(testSkipped) {
            testcase.result = 'Skipped';
            testcase.details = testSkipped;
        }
        else if(testError) {
            testcase.result = 'Error';
            testcase.details = testError;
        }
        else{
            testcase.result = 'Passed';
        }
        casesToBeReturned.push(testcase);
    }
    return casesToBeReturned;
}

TestObject.prototype.generateTable = function (suiteNumber) {
    var tempTestDetailsTable = '';
    var summary = this.getSummary();

    if(this.skipped_tests > 0 || this.failed_tests > 0){
        if(this.skipped_tests > this.failed_tests){
            tempTestDetailsTable += '<div class="panel panel-warning">' ;
            tempTestDetailsTable += '<div class="panel-heading" >' +
                '<h4 class="panel-title">' +
                '<a data-toggle="collapse" href="#collapse'+suiteNumber+'">'+this.name  + '</a> <div class="pull-right">' +summary +'</div></h4></div>';
        }
        else{
            tempTestDetailsTable += '<div class="panel panel-danger">';
            tempTestDetailsTable += '<div class="panel-heading" >' +
                '<h4 class="panel-title">' +
                '<a data-toggle="collapse" href="#collapse'+suiteNumber+'">'+this.name  + '</a> <div class="pull-right">' +summary +'</div></h4></div>';
        }
    }
    else{
        tempTestDetailsTable += '<div class="panel panel-success">';
        tempTestDetailsTable += '<div class="panel-heading" >' +
            '<h4 class="panel-title">' +
            '<a data-toggle="collapse" href="#collapse'+suiteNumber+'">'+this.name  + '</a> <div class="pull-right">' +summary +'</div></h4></div>';
    }
    tempTestDetailsTable += '<div id="' +'collapse'+suiteNumber +'" class="panel-collapse collapse"><div class="panel-body">';
    tempTestDetailsTable += '<table class="table table-bordered tableFix" style="">';
    tempTestDetailsTable += '<tr><th class="col-lg-2">Test</th><th class="col-lg-1">Status</th>';
    tempTestDetailsTable += '<th class="col-lg-8">Details</th><th class="col-lg-1"></th></tr>';
    for(var j in this.testcases) {
        if(this.testcases[j].result == 'Failed') {
            tempTestDetailsTable += '<tr class="danger" id="'+this.short_name +'"><td>'+this.testcases[j].name +'</td>';
            tempTestDetailsTable += '<td id="td-table-test-fail" class="text-center tdFix">Failed</td><td class="less tdFix">' + '<div class="cellContents">'
                + this.testcases[j].details + '</div></td><td class="text-center"><button class="btn btn-danger" >More Details</button></td></tr>';
        }
        else if(this.testcases[j].result == 'Skipped') {
            tempTestDetailsTable += '<tr class="warning"><td>'+this.testcases[j].name +'</td>';
            tempTestDetailsTable += '<td class="text-center">Skipped</td><td class="less tdFix"><div class="cellContents">'
                + this.testcases[j].details + '</div></td><td class="text-center"><button class="btn btn-danger" >More Details</button></td></tr>';
        }
        else if(this.testcases[j].result == 'Error') {
            tempTestDetailsTable += '<tr class="warning"><td>'+this.testcases[j].name +'</td>';
            tempTestDetailsTable += '<td class="text-center">Error</td><td class="less tdFix"><div class="cellContents">'
                + this.testcases[j].details + '</div></td><td class="text-center"><button class="btn btn-danger" >More Details</button></td></tr>';
        }
        else{
            tempTestDetailsTable += '<tr class="success"><td>'+this.testcases[j].name+'</td>';
            tempTestDetailsTable += '<td id="td-table-test-pass" class="text-center">Passed</td><td> </td><td> </td></tr>'
        }
    }
    tempTestDetailsTable += '</table></div></div></div>';
    return tempTestDetailsTable;
}

TestObject.prototype.getSummary = function () {
    var summary = '';
    if(this.passed_tests == 1){ summary += '1 Success, '}
    else {summary += this.passed_tests + ' Successes, '}
    if(this.failed_tests == 1){ summary += '1 Failure, '}
    else {summary += this.failed_tests + ' Failures, '}
    if(this.skipped_tests == 1){ summary += '1 Skipped'}
    else {summary += this.skipped_tests + ' Skipped'}

    return summary;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = TestObject;