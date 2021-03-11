/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6858638743455497, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7102803738317757, 500, 1500, "Main_Page-3"], "isController": false}, {"data": [0.5545023696682464, 500, 1500, "Items_Page"], "isController": true}, {"data": [0.7377049180327869, 500, 1500, "Computers_Page-25"], "isController": false}, {"data": [0.6503067484662577, 500, 1500, "/build-your-own-computer"], "isController": false}, {"data": [0.5849056603773585, 500, 1500, "Desktops_Page-27"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5036231884057971, 500, 1500, "/digital-storm-vanquish-3-custom-performance-pc"], "isController": false}, {"data": [0.5849056603773585, 500, 1500, "Desktops_Page"], "isController": true}, {"data": [0.4834710743801653, 500, 1500, "/lenovo-ideacentre-600-all-in-one-pc"], "isController": false}, {"data": [0.7377049180327869, 500, 1500, "Computers_Page"], "isController": true}, {"data": [0.7102803738317757, 500, 1500, "Main_Page"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2119, 0, 0.0, 563.6177442189721, 0, 4019, 509.0, 1083.0, 1451.0, 3237.400000000007, 17.50039229289, 111.17913596716716, 10.158401803927884], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Main_Page-3", 428, 0, 0.0, 710.3411214953275, 323, 4019, 502.0, 1388.8000000000002, 1671.3999999999978, 3858.7999999999965, 3.5683318882145, 23.907576139698527, 2.4771814086156874], "isController": false}, {"data": ["Items_Page", 422, 0, 0.0, 763.6777251184833, 366, 3796, 623.0, 1399.1, 1621.6999999999994, 3119.2499999999995, 3.6559586928648162, 35.77668208212046, 2.750615508152268], "isController": true}, {"data": ["Computers_Page-25", 427, 0, 0.0, 623.0163934426234, 331, 3380, 506.0, 1199.6, 1326.3999999999996, 2625.479999999991, 3.6751099520600414, 20.9597039013616, 2.643368018797284], "isController": false}, {"data": ["/build-your-own-computer", 163, 0, 0.0, 680.8650306748466, 366, 3408, 540.0, 1356.3999999999999, 1463.9999999999995, 3226.879999999996, 1.4231209128927769, 11.649432197674113, 1.0515928395409344], "isController": false}, {"data": ["Desktops_Page-27", 424, 0, 0.0, 712.0801886792452, 369, 3620, 581.5, 1265.5, 1539.75, 3235.5, 3.659873458148829, 23.1479224256804, 2.6608632802047456], "isController": false}, {"data": ["Debug Sampler", 418, 0, 0.0, 0.1411483253588517, 0, 2, 0.0, 1.0, 1.0, 1.0, 3.6854495278568846, 11.882903837209815, 0.0], "isController": false}, {"data": ["/digital-storm-vanquish-3-custom-performance-pc", 138, 0, 0.0, 803.8260869565215, 412, 3474, 662.5, 1449.6000000000006, 1674.25, 3223.2299999999905, 1.2087661825762486, 13.027280109117426, 0.9276770639901547], "isController": false}, {"data": ["Desktops_Page", 424, 0, 0.0, 712.0801886792452, 369, 3620, 581.5, 1265.5, 1539.75, 3235.5, 3.6598418672098885, 23.147722619700133, 2.6608403124244724], "isController": true}, {"data": ["/lenovo-ideacentre-600-all-in-one-pc", 121, 0, 0.0, 829.4380165289256, 467, 3796, 674.0, 1518.1999999999998, 1745.4999999999998, 3642.880000000001, 1.080646601768331, 11.682302248928284, 0.8139910522907922], "isController": false}, {"data": ["Computers_Page", 427, 0, 0.0, 623.0163934426234, 331, 3380, 506.0, 1199.6, 1326.3999999999996, 2625.479999999991, 3.675046691166978, 20.959343114989373, 2.6433225176221504], "isController": true}, {"data": ["Main_Page", 428, 0, 0.0, 710.3411214953275, 323, 4019, 502.0, 1388.8000000000002, 1671.3999999999978, 3858.7999999999965, 3.5640827067043057, 23.879106918317554, 2.4742315727347672], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2119, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
