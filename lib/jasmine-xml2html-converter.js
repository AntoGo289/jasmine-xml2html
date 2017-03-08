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
    var reportTitle = '<title>Protractor Test Report</title><meta content="text/html; charset=UTF-8" http-equiv="content-type" />';
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
            position: absolute;\
        }\
        #comparison-container{\
            padding-bottom: 10px;\
            padding-left: 10px;\
        }\
        #compare-chart-title{\
            margin-top: 670px;\
            text-align: center;\
        }\
        .shadow{\
            box-shadow: 0px 0px 5px #888888;\
        }\
        #title{\
            background-color: #3367D6;\
            border: 1px solid black;\
            margin-top: 15px;\
            margin-bottom: 25px;\
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
        .panel-heading{\
            cursor: pointer;\
        }\
    </style>';

    var reportScript = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script> \
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>\
    <script type="text/javascript" src="https://www.google.com/jsapi"></script> \
    <script type="text/javascript"> \
        var dataSeriesComplete = <dataSeriesComplete>;\
        var last = "";\
        var numDisplayed = 2;\
        var last2;\
        google.load("visualization", "1.1", {packages:["corechart", "bar"]}); \
        google.setOnLoadCallback(drawCharts); \
        function drawCharts() { \
            drawTodaysChart();\
            drawCompareChart(<dataSeriesCompare>);\
         }\
        function drawTodaysChart() { \
            var data = google.visualization.arrayToDataTable([ \
                 ["Genre", "Passed", "Failed", "Skipped"], <dataSeries>]); \
            var barOptions = { \
                title: "Today\'s Results",\
                width: 1200, \
                height: 650, \
                legend: { position: "top", maxLines: 3 },\
                bar:{\
                    0: {axis: "Passed"},\
                    1: {axis: "Failed"},\
                    2: {axis: "Skipped"}\
                },\
                vAxis: {\
                    textStyle: {\
                        fontSize: 13\
                    },\
                    maxTextLines: 3\
                },\
                bar: { groupWidth: "55%" }, \
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
                        scrollTop: $("#collapse"+last).offset().top - 40\
                 }, 600);\
            });\
        } \
        function drawCompareChart(dataSeriesCompare) { \
            var data = new google.visualization.DataTable();\
            var colors = ["#81c784", "#ef5350", "#fff176", "#66bb6a", "#E63E30", "#ffee58", "#4caf50",  "#e53935",	"#ffeb3b", "#43a047", "#d32f2f", "#fdd835", "#388e3c", "#c62828", "#fbc02d", "#2e7d32", "#b71c1c", "#f9a825", "#1b5e20", "#d50000", "#f57f17"];\
            data.addColumn("string", "");\
            var vAxes = {};\
            for(var j = dataSeriesCompare[0].length - 1; j > 0; j = j - 3){\
                var numDays = j/3 - 1;\
                if(numDays == 1){\
                    data.addColumn("number", "Passes " +numDays +" Day Ago");\
                    data.addColumn("number", "Fails " +numDays +" Day Ago");\
                    data.addColumn("number", "Skips " +numDays +" Day Ago");\
                }else{\
                    data.addColumn("number", "Passes " +numDays +" Days Ago");\
                    data.addColumn("number", "Fails " +numDays +" Days Ago");\
                    data.addColumn("number", "Skips " +numDays +" Days Ago");\
                }\
                if(Math.floor(j / 3) > 0){\
                    vAxes[Math.floor(j / 3)] = {\
                        textStyle: {\
                            color: "white",\
                            fontSize: 0\
                        },\
                    }\
                }\
                else{\
                    title: "Number of Tests"\
                }\
            }\
            data.addRows(dataSeriesCompare);\
            var series = {};\
            for (var i = 0; i < dataSeriesCompare[0].length - 1; i++) {\
                series[i] = {\
                    color: colors[i % colors.length],\
                    targetAxisIndex: Math.floor(i / 3),\
                    opacity: 0.5\
                }\
            }\
            var options = {\
                title: "",\
                isStacked: true,\
                legend: {\
                    position: "left"\
                },\
                hAxis: {\
                    textStyle: {\
                        fontSize: 11\
                    },\
                    maxTextLines: 3\
                },\
                vAxes: vAxes,\
                titlePosition: "none",\
                width: 1830,\
                height: 600,\
                series: series\
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
                htmlToAdd = "<table class=\'table\'><tr><th></th>";\
                for(var i = numDisplayed - 1; i >= 0; i--){\
                    htmlToAdd += "<th class=\'text-center\'>"+i+" Day";\
                    if(i != 1){ htmlToAdd += "s";}\
                    htmlToAdd += " Ago</th>";\
                }\
                htmlToAdd += "</tr>";\
                for (var j = 0; j < dataSeriesComplete[0].testSuites[last2].testcases.length; j++) {\
                    htmlToAdd += "<tr ><td>" + dataSeriesComplete[0].testSuites[last2].testcases[j].name +\
                        "</td>";\
                    for(var k = numDisplayed - 1; k >= 0; k--){\
                        htmlToAdd += "<td class=\'text-center\'>";\
                        try{\
                            if (dataSeriesComplete[k].testSuites[last2].testcases[j].result === "Passed") {\
                                htmlToAdd += "<i class=\'fa fa-check\' aria-hidden=\'true\' style=\'color: green\'></i>";\
                            } else {\
                                htmlToAdd += "<i class=\'fa fa-times\' aria-hidden=\'true\' style=\'color: red\'></i>";\
                            }\
                        }catch (e){\
                            htmlToAdd += "<i class=\'fa fa-times\' aria-hidden=\'true\' style=\'color: red\'></i>";\
                        }\
                        htmlToAdd += "</td>";\
                    }\
                    htmlToAdd += "</tr>";\
                }\
                htmlToAdd += "</table>";\
                $("#modal-body").append(htmlToAdd);\
                $("#myModal").modal();\
            });\
        }' +
        '$(document).ready(function() {\
            $(".btn-danger").click(function() {\
                if ($(this).parent().siblings(".less").children().first().hasClass("cellContents")) {\
                    $(this).parent().siblings(".less").children().first().removeClass("cellContents");\
                    $(this).text("Less Details");\
                } else {\
                    $(this).parent().siblings(".less").children().first().addClass("cellContents");\
                    $(this).text("More Details");\
                }\
            });\
            $(".panel-heading").click(function(){\
                $(this).siblings().first().collapse("toggle");\
            });\
            $(".dropdown-option").click(function() {\
                var toSend = [];\
                numDisplayed = parseInt($(this).text());\
                for (var i = 1; i < numDisplayed; i++) {\
                    toSend.push(dataSeriesComplete[i]);\
                }\
                toSend = (combineDataSeries(dataSeriesComplete[0], toSend));\
                drawCompareChart(toSend);\
            });' +
        "function combineDataSeries(today, toCombineWith) {\
                var dataSeriesComplete = '';\
                for(var i = 0; i < today.dataSeries.length; i++){\
                    dataSeriesComplete += '[\"' +today.dataSeries[i][0] + '\" ,';\
                    for(var j = toCombineWith.length - 1; j > -1 ; j--){\
                        dataSeriesComplete += toCombineWith[j].dataSeries[i][1] + ', ' + toCombineWith[j].dataSeries[i][2] + ', ' +\
                            toCombineWith[j].dataSeries[i][3] + ', ';\
                    }\
                    dataSeriesComplete += today.dataSeries[i][1] + ', ' +today.dataSeries[i][2] + ', ' +today.dataSeries[i][3] + ']';\
                    dataSeriesComplete = (i == today.dataSeries.length - 1) ? dataSeriesComplete : dataSeriesComplete + ',';\
                }\
                dataSeriesComplete = '[' + dataSeriesComplete + ']';\
                dataSeriesComplete = JSON.parse(dataSeriesComplete);\
                return dataSeriesComplete;\
            }\
        });\
  </script>";

    // @private-function
    var generateTDTables = function(reportXml) {
        var testDetailsTable = '';
        testDetailsTable += dailyData[0].generateAccordion();
        return testDetailsTable;
    };

    //@private-function
    function generateDailyData(folder) {
        var files = fileSystem.readdirSync(folder);
        for (var i = 0; i < 5; i++) {
            var index = files.length - (i + 1);
            var filename = files[index];
            dailyData.push(new DailyData(folder + filename));
        }
    }
    // @private-function
    var generateTSTable = function(testConfig) {
        var testSummaryTable = '';
        var testReportTitle = testConfig['reportTitle'] == undefined ? 'Test Execution Report' : testConfig['reportTitle'];
        testSummaryTable += '<div class="text-center"  id="title"><h3 style="color: white">' + testReportTitle + '</h3><h4 style="color: white">' + dailyData[0].testStartedOn + '</h4></div>';
        testSummaryTable += '<div class="clearfix col-lg-12"><div id="stacked-bar-chart" class="col-lg-8 inlineDiv shadow"></div>';
        testSummaryTable += '<div id="details-pane" class="col-lg-4 inlineDiv">';
        testSummaryTable += '<h4><ul><br><br><br><br><br>';
        testSummaryTable += '<li><b>Total Passed:</b> ' + dailyData[0].totalPassed + '</li><br>';
        testSummaryTable += '<li><b>Total Failures:</b> ' + dailyData[0].totalFailed + '</li><br>';
        testSummaryTable += '<li><b>Total Skips:</b> ' + dailyData[0].totalSkips + '</li><br>';
        testSummaryTable += '<li><b>Total Tests:</b> ' + dailyData[0].totalTests + '</li><br>';
        testSummaryTable += '<li><b>Pass Rate:</b> ' + dailyData[0].passRate + '%</li><br>';
        testSummaryTable += '<li><b>Execution Duration:</b> ' + dailyData[0].totalTime + 's</li><br>';
        testSummaryTable += '</ul></h4></div>';
        testSummaryTable += '<div id="comparison-container" class="shadow"><div id="compare-chart-title"><div class="inlineDiv"><h4 style="white-space: pre;">Comparison Chart  </h4></div>' + '<div class="dropdown inlineDiv">\
              <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">Number of Days\
            <span class="caret"></span></button>\
            <ul class="dropdown-menu">\
            <li class="dropdown-option"><a href="#/" role="button">2</a></li>\
            <li class="dropdown-option"><a href="#/" role="button">3</a></li>\
            <li class="dropdown-option"><a href="#/" role="button">4</a></li>\
            <li class="dropdown-option"><a href="#/" role="button">5</a></li>\
            </ul>\
            </div></div><div id="compare-chart"></div></div>';
        return testSummaryTable;
    }

    // @private-function
    var concatDataSeries = function() {
        var dataSeriesComplete = '';
        dataSeriesComplete = dailyData[0].combineDataSeries([dailyData[1]]);
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
        var oneDayChart = dailyData[0].dataSeriesString.replace(/\\n/g, " ");
        reportScript = reportScript.replace('<dataSeries>', oneDayChart);
        reportScript = reportScript.replace('<dataSeriesComplete>', dailyDataComplete);
        compareData = concatDataSeries();
        reportScript = reportScript.replace('<dataSeriesCompare>', '[' + compareData + ']');

        // Prepare for html file content
        var htmlReport = '<html><head>' + reportTitle + reportCss + reportScript + '</head>';
        htmlReport += '<body>' + '<div class="col-lg-12">' + testSummary + '</div>';
        htmlReport += '<div class="col-lg-12">' + testDetails + '</div>';

        var testOutputPath = './test_output';
        if (testConfig['outputPath']) {
            testOutputPath = testConfig['outputPath'];
        } else {
            if (!fileSystem.existsSync(testOutputPath)) {
                fileSystem.mkdirSync(testOutputPath);
            }
        }
        htmlReport += '<!-- Modal -->\
            <div id="myModal" class="modal fade" role="dialog">\
                <div class="modal-dialog" style="width: 55%">\
                    <div class="modal-content">\
                        <div class="modal-header" style="padding-bottom: 0px">\
                            <button type="button" class="close" data-dismiss="modal">x</button>\
                            <h4 class="modal-title">Result Breakdown</h4>\
                        </div>\
                        <div class="modal-body" id="modal-body" style="padding-top: 0px;">\
                            <p>Some text in the modal.</p>\
                        </div>\
                        <div class="modal-footer">\
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                        </div>\
                    </div>\
                </div>\
            </div>'
        htmlReport += '</body></html>';
        // Write report
        fileSystem.writeFileSync(path.join(testOutputPath, '/test-html-report.html'), htmlReport);
    }
};

// @exports
module.exports = HTMLReport;