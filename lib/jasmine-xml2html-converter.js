// @protractor-helper-template

// @imports
var xmlDocument = require('xmldoc');
var fileSystem = require('fs');
var filePath = require('path');
var DailyData = require('./dailydata.js');

// @class
var HTMLReport = function() {

// stacked bar chart & execution details data gets captured during input xml parsing
    var dailyData = [];
    var dataSeries = '';

// html report file headers
    var reportTitle = '<title>Protractor Test Report</title>';
    var reportCss = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.6/paper/bootstrap.css"> \
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">\
    <style> \
        .tableFix{\
            table-layout:fixed; \
            width: 100%; \
        }\
        .inlineDiv{\
            display: inline-block;\
        }\
        .tdFix{\
            position: relative;\
            overflow: hidden !important;\
        }\
        .cellContents{\
            /*position: absolute;\
            margin-right: 35px;*/\
            \
        }\
        #compare-chart{\
            margin-top: 550px;\
        }\
        #title{\
            background-color: #bbbbbb;\
            outline: thin solid;\
        }\
        .less{\
            height: 100px;\
        }\
        .more{\
            height: auto;\
        }\
        .buttonMargin{\
            margin-left: 25px;\
        }\
    </style>';

    var reportScript = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script> \
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>\
    <script type="text/javascript" src="https://www.google.com/jsapi"></script> \
    <script type="text/javascript"> \
        var dataSeriesComplete = <dataSeriesComplete>;\
        var last = "";\
        google.load("visualization", "1.1", {packages:["corechart", "bar"]}); \
        google.setOnLoadCallback(drawCharts); \
        function drawCharts() { \
            drawTodaysChart();\
            drawCompareChart();\
         }\
        function drawTodaysChart() { \
            var data = google.visualization.arrayToDataTable([ \
                 ["Genre", "Passed", "Failed", "Skipped"], <dataSeries>]); \
            var barOptions = { \
                title: "Today\'s Results",\
                width: 900, \
                height: 600, \
                legend: { position: "top", maxLines: 3 },\
                bar:{\
                    0: {axis: "Passed"},\
                    1: {axis: "Failed"},\
                    2: {axis: "Skipped"}\
                },\
                bar: { groupWidth: "75%" }, \
                isStacked: true, \
                colors: [ "#4CAF50", "#F44336", "#FFEB3B"] \
            }; \
            var barChart = new google.visualization.BarChart(document.getElementById("stacked-bar-chart")); \
            barChart.draw(data, barOptions);\
            google.visualization.events.addListener(barChart, "select", function() { \
                var selected = barChart.getSelection();\
                \
                try{\
                    selected =  JSON.stringify(selected[0].row);\
                    $("#collapse"+selected).collapse("show");\
                    last = selected;\
                }catch (e){\
                    $("#collapse"+last).collapse("show");\
                }\
                 $("html, body").animate({\
                        scrollTop: $("#collapse"+last).offset().top\
                 }, 1000);\
            });\
        } \
        function drawCompareChart() { \
            var data = new google.visualization.DataTable();\
            data.addColumn("string", "Test");\
            data.addColumn("number", "Passes Yesterday");\
            data.addColumn("number", "Fails Yesterday");\
            data.addColumn("number", "Skips Yesterday");\
            data.addColumn("number", "Passes Today");\
            data.addColumn("number", "Fails Today");\
            data.addColumn("number", "Skips Today");\
            data.addRows(<dataSeriesCompare>);\
            var options = {\
                title: "Today\'s Results vs Yesterday\'s Results",\
                isStacked: true,\
                legend: {\
                    position: "top",\
                    maxLines: 3\
                },\
                \
                width: 1850,\
                height: 600,\
                series: {\
                    0: {\
                        color: "#7FC782",\
                        targetAxisIndex: 0\
                    },\
                    1: {\
                        color: "#F88077",\
                        targetAxisIndex: 0\
                    },\
                    2: {\
                        color: "#FFF599",\
                        targetAxisIndex: 0\
                    },\
                    3: {\
                        color: "#4CAF50",\
                        targetAxisIndex: 1\
                    },\
                    4: {\
                        color: "#F44336",\
                        targetAxisIndex: 1\
                    },\
                    5: {\
                        color: "#FFEB3B",\
                        targetAxisIndex: 1\
                    }\
                }\
            };\
            var x = new google.charts.Bar(document.getElementById("compare-chart"));\
            x.draw(data, google.charts.Bar.convertOptions(options));\
            \
            google.visualization.events.addListener(x, "select", function (){\
                var selected = x.getSelection();\
                var htmlToAdd =  "";\
                try {\
                    selected = JSON.stringify(selected[0].row);\
                    last2 = selected;\
                } catch (e) {}\
                document.getElementById("modal-body").innerHTML = "";\
                htmlToAdd = "<table><tr><th></th><th>Yesterday</th><th>Today</th></tr>";\
                for (var j = 0; j < dataSeriesComplete[0].testSuites[last2].testcases.length; j++) {\
                    var testcases1;\
                    var testcases2;\
                    if (dataSeriesComplete[1].testSuites[last2].testcases[j].result === "Passed") {\
                        testcases1 = "<i class=\'fa fa-check\' aria-hidden=\'true\' style=\'color: green\'></i>";\
                    } else {\
                        testcases1 = "<i class=\'fa fa-times\' aria-hidden=\'true\' style=\'color: red\'></i>";\
                    }\
                    if (dataSeriesComplete[0].testSuites[last2].testcases[j].result === "Passed") {\
                        testcases2 = "<i class=\'fa fa-check\' aria-hidden=\'true\' style=\'color: green\'></i>";\
                    } else {\
                        testcases2 = "<i class=\'fa fa-times\' aria-hidden=\'true\' style=\'color: red\'></i>";\
                    }\
                    htmlToAdd += "<tr><td>" + dataSeriesComplete[0].testSuites[last2].testcases[j].name + "</td><td>" + testcases1 + "</td><td>" + testcases2 + "</td></tr>";\
                }\
                htmlToAdd += "</table>";\
                $("#modal-body").append(htmlToAdd);\
                $("#myModal").modal();\
            });\
        }\
  </script>';

// @private-function
    var generateTDTables = function (reportXml) {
        var testDetailsTable = '';
        testDetailsTable += dailyData[0].generateAccordion();
        return testDetailsTable;
    };

//@private-function
    function generateDailyData(folder) {
        var files = fileSystem.readdirSync(folder);
        for(var i = 0; i < 2;i++){
            var index = files.length - (i + 1);
            var filename = files[index];
            dailyData.push(new DailyData(folder + filename));
        }
    }
// @private-function
    var generateTSTable = function(testConfig) {
        var testSummaryTable = '';
        var testReportTitle = testConfig['reportTitle'] == undefined ? 'Test Execution Report' : testConfig['reportTitle'];
        testSummaryTable += '<div class="text-center"  id="title"><h3>' +testReportTitle +'</h3><h4>'+dailyData[0].testStartedOn+'</h4></div>';
        testSummaryTable += '<div class="clearfix col-lg-12"><div id="stacked-bar-chart" class="col-lg-6 inlineDiv"></div>';
        testSummaryTable += '<div id="details-pane" class="col-lg-6 inlineDiv">';
        testSummaryTable += '<h4><ul><br><br><br><br><br>';
        testSummaryTable += '<li><b>Total Passed:</b> ' + dailyData[0].totalPassed +'</li><br>';
        testSummaryTable += '<li><b>Total Failures:</b> ' + dailyData[0].totalFailed +'</li><br>';
        testSummaryTable += '<li><b>Total Skips:</b> ' + dailyData[0].totalSkips +'</li><br>';
        testSummaryTable += '<li><b>Total Tests:</b> ' + dailyData[0].totalTests +'</li><br>';
        testSummaryTable += '<li><b>Pass Rate:</b> ' + dailyData[0].passRate +'%</li><br>';
        testSummaryTable += '<li><b>Execution Duration:</b> ' + dailyData[0].totalTime +'s</li><br>';
        testSummaryTable += '</ul></h4></div>';
        testSummaryTable += '<div id="compare-chart"></div>';
        return testSummaryTable;
    }

// @private-function
    var concatDataSeries = function () {
        var dataSeriesComplete = '';
        dataSeriesComplete = dailyData[1].combineDataSeries(dailyData[0]);
        return dataSeriesComplete;
    }

// @public-function
    this.from = function(reportXml, testConfig) {
        var path = require("path");
        generateDailyData(testConfig['outputPath']);
        var testDetails = generateTDTables(reportXml);
        var testSummary = generateTSTable(testConfig);
        var compareData = '';
        var dailyDataComplete = JSON.stringify(dailyData);
        // Feed data to stacked bar chart
        reportScript = reportScript.replace('<dataSeries>', dailyData[0].dataSeriesString);
        reportScript = reportScript.replace('<dataSeriesComplete>', dailyDataComplete);
        compareData = concatDataSeries();
        reportScript = reportScript.replace('<dataSeriesCompare>', '['+compareData+']');

        // Prepare for html file content
        var htmlReport = '<html><head>' + reportTitle + reportCss + reportScript + '</head>';
        htmlReport += '<body>' + '<div class="col-lg-12">' + testSummary + '</div>';
        htmlReport += '<div class="col-lg-12">' +testDetails +'</div>';

        var testOutputPath = './test_output';
        if(testConfig['outputPath']) {
            testOutputPath = testConfig['outputPath'];
        } else {
            if (!fileSystem.existsSync(testOutputPath)) {
                fileSystem.mkdirSync(testOutputPath);
            }
        }
        htmlReport +=  '<!-- Modal -->\
            <div id="myModal" class="modal fade" role="dialog">\
                <div class="modal-dialog">\
                    <div class="modal-content">\
                        <div class="modal-header">\
                            <button type="button" class="close" data-dismiss="modal">x</button>\
                            <h4 class="modal-title">Modal Header</h4>\
                        </div>\
                        <div class="modal-body" id="modal-body">\
                            <p>Some text in the modal.</p>\
                        </div>\
                        <div class="modal-footer">\
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                        </div>\
                    </div>\
                </div>\
            </div></body></html>';
        // Write report
        fileSystem.writeFileSync(path.join(testOutputPath, '/test-html-report.html'), htmlReport);
    }

};

// @exports
module.exports = HTMLReport;