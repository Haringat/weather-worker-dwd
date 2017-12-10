"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("async-tools");
var http = require("http");
var request = require("request-promise-native");
var Agent = http.Agent;
var agent = new Agent({
    maxSockets: 100
});
var date = new Date();
var stations = module.require("./stations_16.json").stations;
var dwdForecastApi = "http://opendata.dwd.de/weather/local_forecasts/poi";
var dwdReportsApi = "http://opendata.dwd.de/weather/weather_reports/poi";
function main(parameters) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var weatherApi, apiStations, capabilities, reports, forecasts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    weatherApi = parameters.api;
                    return [4 /*yield*/, getStations(weatherApi)];
                case 1:
                    apiStations = _a.sent();
                    return [4 /*yield*/, getCapabilities(weatherApi)];
                case 2:
                    capabilities = _a.sent();
                    stations.forEach(function (station) {
                        station.id = apiStations.find(function (apiStation) { return apiStation.name === station.name; }).id;
                    });
                    reports = [];
                    forecasts = [];
                    return [4 /*yield*/, stations.forEachAsync(function (station) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        _b = (_a = forecasts.push).apply;
                                        _c = [forecasts];
                                        return [4 /*yield*/, getForecast(station, capabilities)];
                                    case 1:
                                        _b.apply(_a, _c.concat([_g.sent()]));
                                        _e = (_d = reports.push).apply;
                                        _f = [reports];
                                        return [4 /*yield*/, getReport(station, capabilities)];
                                    case 2:
                                        _e.apply(_d, _f.concat([_g.sent()]));
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, forecasts.forEachAsync(function (dataPoint) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // try {
                                    return [4 /*yield*/, request({
                                            agent: agent,
                                            body: {
                                                data: dataPoint
                                            },
                                            json: true,
                                            method: "POST",
                                            uri: weatherApi + "/stations/" + dataPoint.stationId + "/forecasts"
                                        })];
                                    case 1:
                                        // try {
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, reports.forEachAsync(function (dataPoint) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // try {
                                    return [4 /*yield*/, request({
                                            agent: agent,
                                            body: {
                                                data: dataPoint
                                            },
                                            json: true,
                                            method: "POST",
                                            uri: weatherApi + "/stations/" + dataPoint.stationId + "/reports"
                                        })];
                                    case 1:
                                        // try {
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = main;
function getForecast(station, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var responseBuffer, e_1, csv, csvRows, table, dateOfMeasure;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, request({
                            agent: agent,
                            uri: dwdForecastApi + "/" + station.stationId + "-MOSMIX.csv"
                        })];
                case 1:
                    responseBuffer = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, []];
                case 3:
                    csv = responseBuffer.toString();
                    if (csv.endsWith("\n")) {
                        csv = csv.slice(0, csv.length - 2);
                    }
                    csvRows = csv.split("\n");
                    table = csvRows.map(function (csvRow) { return csvRow.split(";"); });
                    table.forEach(function (row) {
                        row.forEach(function (cell, index) {
                            var americanFormat = cell.replace(",", ".");
                            var numberValue = Number(americanFormat);
                            if (isNaN(numberValue)) {
                                row[index] = americanFormat;
                            }
                            else {
                                row[index] = numberValue;
                            }
                        });
                    });
                    dateOfMeasure = new Date();
                    dateOfMeasure.setUTCFullYear(date.getUTCFullYear());
                    dateOfMeasure.setUTCMonth(date.getUTCMonth());
                    dateOfMeasure.setUTCDate(date.getUTCDate());
                    dateOfMeasure.setUTCHours(Number(table[1][0].match(/today (\d+) UTC/)[1]));
                    dateOfMeasure.setUTCMinutes(0);
                    dateOfMeasure.setUTCSeconds(0);
                    dateOfMeasure.setUTCMilliseconds(0);
                    table[1].forEach(function (unit, index) {
                        switch (unit) {
                            case "km/h":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 3.6;
                                });
                                break;
                            case "mm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 1000;
                                });
                                break;
                            case "WW Code":
                            case "CODE_TABLE":
                                table.slice(3).forEach(function (row) {
                                    switch (row[index]) {
                                        case 1:
                                            row[index] = "clear";
                                            break;
                                        case 2:
                                            row[index] = "bright";
                                            break;
                                        case 3:
                                        case 4:
                                            row[index] = "clouded";
                                            break;
                                        case 5:
                                        case 6:
                                            row[index] = "fog";
                                            break;
                                        case 7:
                                        case 8:
                                        case 9:
                                            row[index] = "rain";
                                            break;
                                        case 10:
                                        case 11:
                                        case 12:
                                        case 13:
                                            row[index] = "sleet";
                                            break;
                                        case 14:
                                        case 15:
                                        case 16:
                                        case 17:
                                            row[index] = "snow";
                                            break;
                                        case 18:
                                        case 19:
                                        case 20:
                                        case 21:
                                        case 22:
                                        case 23:
                                        case 24:
                                        case 25:
                                            row[index] = "shower";
                                            break;
                                        case 26:
                                        case 27:
                                        case 28:
                                        case 29:
                                            row[index] = "thunderstorm";
                                            break;
                                        case 30:
                                            row[index] = "storm";
                                    }
                                });
                                break;
                            case "Achtel":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 12.5;
                                });
                                break;
                            case "hPa":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 100;
                                });
                                break;
                            case "Stunden":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 3600;
                                });
                                break;
                            case "kJ/qm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 1000;
                                });
                                break;
                            case "cm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 100;
                                });
                                break;
                            case "km":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 1000;
                                });
                                break;
                            case "min":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 60;
                                });
                        }
                    });
                    return [2 /*return*/, table.slice(4).map(function (row) {
                            return row.slice(3).map(function (value, index) {
                                var dateParts = row[0].split(".");
                                var timeParts = row[1].split(":");
                                var dataPointDate = new Date();
                                dataPointDate.setUTCFullYear(2000 + Number(dateParts[2]));
                                dataPointDate.setUTCMonth(Number(dateParts[1]));
                                dataPointDate.setUTCDate(Number(dateParts[0]));
                                dataPointDate.setUTCHours(Number(timeParts[0]));
                                dataPointDate.setUTCSeconds(Number(timeParts[1]));
                                dataPointDate.setUTCMilliseconds(0);
                                return {
                                    capabilityId: capabilities.find(function (capability) { return capability.name === table[2][index + 3]; }).id,
                                    date: dataPointDate.toUTCString(),
                                    dateOfMeasure: dateOfMeasure.toUTCString(),
                                    stationId: station.id,
                                    value: value
                                };
                            });
                        }).reduce(function (a, b) { return a.concat(b); }, []).filter(function (dataPoint) { return dataPoint.value !== "---" && !isNaN(dataPoint.value); })];
            }
        });
    });
}
function getReport(station, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var responseBuffer, e_2, csv, csvRows, table, dateOfMeasure;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, request({
                            agent: agent,
                            uri: dwdReportsApi + "/" + station.stationId + "-BEOB.csv"
                        })];
                case 1:
                    responseBuffer = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    return [2 /*return*/, []];
                case 3:
                    csv = responseBuffer.toString();
                    if (csv.endsWith("\n")) {
                        csv = csv.slice(0, csv.length - 2);
                    }
                    csvRows = csv.split("\n");
                    table = csvRows.map(function (csvRow) { return csvRow.split(";"); });
                    table.forEach(function (row) {
                        row.forEach(function (cell, index) {
                            var americanFormat = cell.replace(",", ".");
                            var numberValue = Number(americanFormat);
                            if (isNaN(numberValue)) {
                                row[index] = americanFormat;
                            }
                            else {
                                row[index] = numberValue;
                            }
                        });
                    });
                    dateOfMeasure = new Date(date.toUTCString());
                    dateOfMeasure.setUTCMilliseconds(0);
                    table[1].forEach(function (unit, index) {
                        switch (unit) {
                            case "km/h":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 3.6;
                                });
                                break;
                            case "mm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 1000;
                                });
                                break;
                            case "WW Code":
                            case "CODE_TABLE":
                                table.slice(3).forEach(function (row) {
                                    switch (row[index]) {
                                        case 1:
                                            row[index] = "clear";
                                            break;
                                        case 2:
                                            row[index] = "bright";
                                            break;
                                        case 3:
                                        case 4:
                                            row[index] = "clouded";
                                            break;
                                        case 5:
                                        case 6:
                                            row[index] = "fog";
                                            break;
                                        case 7:
                                        case 8:
                                        case 9:
                                            row[index] = "rain";
                                            break;
                                        case 10:
                                        case 11:
                                        case 12:
                                        case 13:
                                            row[index] = "sleet";
                                            break;
                                        case 14:
                                        case 15:
                                        case 16:
                                        case 17:
                                            row[index] = "snow";
                                            break;
                                        case 18:
                                        case 19:
                                        case 20:
                                        case 21:
                                        case 22:
                                        case 23:
                                        case 24:
                                        case 25:
                                            row[index] = "shower";
                                            break;
                                        case 26:
                                        case 27:
                                        case 28:
                                        case 29:
                                            row[index] = "thunderstorm";
                                            break;
                                        case 30:
                                            row[index] = "storm";
                                    }
                                });
                                break;
                            case "Achtel":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 12.5;
                                });
                                break;
                            case "hPa":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 100;
                                });
                                break;
                            case "Stunden":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 3600;
                                });
                                break;
                            case "kJ/qm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 1000;
                                });
                                break;
                            case "cm":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] / 100;
                                });
                                break;
                            case "km":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 1000;
                                });
                                break;
                            case "min":
                                table.slice(3).forEach(function (row) {
                                    row[index] = row[index] * 60;
                                });
                        }
                    });
                    return [2 /*return*/, table.slice(4).map(function (row) {
                            return row.slice(3).map(function (value, index) {
                                var dateParts = (row[0] + ";" + row[1]).match(/(\d{2})\.(\d{2})\.(\d{2});(\d{2}):(\d{2})/);
                                var dataPointDate = new Date();
                                dataPointDate.setUTCFullYear(2000 + Number(dateParts[3]));
                                dataPointDate.setUTCMonth(Number(dateParts[2]));
                                dataPointDate.setUTCDate(Number(dateParts[1]));
                                dataPointDate.setUTCHours(Number(dateParts[4]));
                                dataPointDate.setUTCSeconds(Number(dateParts[5]));
                                dataPointDate.setUTCMilliseconds(0);
                                var capability = capabilities.find(function (candidate) { return candidate.name.replace("_", " ") === table[2][index + 3]; });
                                return {
                                    capabilityId: capability ? capability.id : null,
                                    date: dataPointDate.toUTCString(),
                                    dateOfMeasure: dateOfMeasure.toUTCString(),
                                    stationId: station.id,
                                    value: value
                                };
                            });
                        }).reduce(function (a, b) { return a.concat(b); }, []).filter(function (dataPoint) { return dataPoint.value !== "---" && !isNaN(dataPoint.value) && dataPoint.capabilityId !== null; })];
            }
        });
    });
}
function getCapabilities(weatherApi) {
    return __awaiter(this, void 0, void 0, function () {
        var capabilitiesResponseBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request({
                        agent: agent,
                        headers: {
                            Accept: "Application/JSON"
                        },
                        uri: weatherApi + "/capabilities"
                    })];
                case 1:
                    capabilitiesResponseBuffer = _a.sent();
                    return [2 /*return*/, JSON.parse(capabilitiesResponseBuffer.toString()).data];
            }
        });
    });
}
function getStations(weatherApi) {
    return __awaiter(this, void 0, void 0, function () {
        var responseBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request({
                        agent: agent,
                        headers: {
                            Accept: "Application/JSON"
                        },
                        uri: weatherApi + "/stations"
                    })];
                case 1:
                    responseBuffer = _a.sent();
                    return [2 /*return*/, JSON.parse(responseBuffer.toString()).data];
            }
        });
    });
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFLENBQUMsQ0FBQyxJQUFJLEVBQUM7Ozs7Q0FDakU7QUFFRCxxQkFBMkIsVUFBVTs7Ozs7d0JBQ1YscUJBQU0sT0FBTyxDQUFDO3dCQUNqQyxLQUFLLE9BQUE7d0JBQ0wsT0FBTyxFQUFFOzRCQUNMLE1BQU0sRUFBRSxrQkFBa0I7eUJBQzdCO3dCQUNELEdBQUcsRUFBRSxVQUFVLEdBQUcsV0FBVztxQkFDaEMsQ0FBQyxFQUFBOztvQkFOSSxjQUFjLEdBQUcsU0FNckI7b0JBQ0Ysc0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUM7Ozs7Q0FDckQiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJhc3luYy10b29sc1wiO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0ICogYXMgcmVxdWVzdCBmcm9tIFwicmVxdWVzdC1wcm9taXNlLW5hdGl2ZVwiO1xuXG5jb25zdCB7XG4gICAgQWdlbnRcbn0gPSBodHRwO1xuXG5jb25zdCBhZ2VudCA9IG5ldyBBZ2VudCh7XG4gICAgbWF4U29ja2V0czogMTAwXG59KTtcblxuY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cbmNvbnN0IHN0YXRpb25zID0gbW9kdWxlLnJlcXVpcmUoXCIuL3N0YXRpb25zXzE2Lmpzb25cIikuc3RhdGlvbnM7XG5cbmNvbnN0IGR3ZEZvcmVjYXN0QXBpID0gXCJodHRwOi8vb3BlbmRhdGEuZHdkLmRlL3dlYXRoZXIvbG9jYWxfZm9yZWNhc3RzL3BvaVwiO1xuY29uc3QgZHdkUmVwb3J0c0FwaSA9IFwiaHR0cDovL29wZW5kYXRhLmR3ZC5kZS93ZWF0aGVyL3dlYXRoZXJfcmVwb3J0cy9wb2lcIjtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gbWFpbihwYXJhbWV0ZXJzOiBhbnkpIHtcbiAgICBjb25zdCB3ZWF0aGVyQXBpOiBzdHJpbmcgPSBwYXJhbWV0ZXJzLmFwaTtcbiAgICBjb25zdCBhcGlTdGF0aW9ucyA9IGF3YWl0IGdldFN0YXRpb25zKHdlYXRoZXJBcGkpO1xuICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGF3YWl0IGdldENhcGFiaWxpdGllcyh3ZWF0aGVyQXBpKTtcbiAgICBzdGF0aW9ucy5mb3JFYWNoKChzdGF0aW9uKSA9PiB7XG4gICAgICAgIHN0YXRpb24uaWQgPSBhcGlTdGF0aW9ucy5maW5kKChhcGlTdGF0aW9uKSA9PiBhcGlTdGF0aW9uLm5hbWUgPT09IHN0YXRpb24ubmFtZSkuaWQ7XG4gICAgfSk7XG4gICAgY29uc3QgcmVwb3J0cyA9IFtdO1xuICAgIGNvbnN0IGZvcmVjYXN0cyA9IFtdO1xuICAgIGF3YWl0IHN0YXRpb25zLmZvckVhY2hBc3luYyhhc3luYyAoc3RhdGlvbikgPT4ge1xuICAgICAgICBmb3JlY2FzdHMucHVzaCguLi5hd2FpdCBnZXRGb3JlY2FzdChzdGF0aW9uLCBjYXBhYmlsaXRpZXMpKTtcbiAgICAgICAgcmVwb3J0cy5wdXNoKC4uLmF3YWl0IGdldFJlcG9ydChzdGF0aW9uLCBjYXBhYmlsaXRpZXMpKTtcbiAgICB9KTtcbiAgICBhd2FpdCBmb3JlY2FzdHMuZm9yRWFjaEFzeW5jKGFzeW5jIChkYXRhUG9pbnQpID0+IHtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIGFnZW50LFxuICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVBvaW50XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgdXJpOiBgJHt3ZWF0aGVyQXBpfS9zdGF0aW9ucy8ke2RhdGFQb2ludC5zdGF0aW9uSWR9L2ZvcmVjYXN0c2BcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvKn0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgICAgICB9Ki9cbiAgICB9KTtcbiAgICBhd2FpdCByZXBvcnRzLmZvckVhY2hBc3luYyhhc3luYyAoZGF0YVBvaW50KSA9PiB7XG4gICAgICAgIC8vIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCByZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICBhZ2VudCxcbiAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFQb2ludFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIHVyaTogYCR7d2VhdGhlckFwaX0vc3RhdGlvbnMvJHtkYXRhUG9pbnQuc3RhdGlvbklkfS9yZXBvcnRzYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8qfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICAgIH0qL1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JlY2FzdChzdGF0aW9uLCBjYXBhYmlsaXRpZXMpIHtcbiAgICBsZXQgcmVzcG9uc2VCdWZmZXI7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2VCdWZmZXIgPSBhd2FpdCByZXF1ZXN0KHtcbiAgICAgICAgICAgIGFnZW50LFxuICAgICAgICAgICAgdXJpOiBgJHtkd2RGb3JlY2FzdEFwaX0vJHtzdGF0aW9uLnN0YXRpb25JZH0tTU9TTUlYLmNzdmBcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBjc3YgPSByZXNwb25zZUJ1ZmZlci50b1N0cmluZygpO1xuICAgIGlmIChjc3YuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgICAgY3N2ID0gY3N2LnNsaWNlKDAsIGNzdi5sZW5ndGggLSAyKTtcbiAgICB9XG4gICAgY29uc3QgY3N2Um93cyA9IGNzdi5zcGxpdChcIlxcblwiKTtcbiAgICBjb25zdCB0YWJsZSA9IGNzdlJvd3MubWFwKChjc3ZSb3cpID0+IGNzdlJvdy5zcGxpdChcIjtcIikpO1xuICAgIHRhYmxlLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICByb3cuZm9yRWFjaCgoY2VsbCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFtZXJpY2FuRm9ybWF0ID0gY2VsbC5yZXBsYWNlKFwiLFwiLCBcIi5cIik7XG4gICAgICAgICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcihhbWVyaWNhbkZvcm1hdCk7XG4gICAgICAgICAgICBpZiAoaXNOYU4obnVtYmVyVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IGFtZXJpY2FuRm9ybWF0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gbnVtYmVyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnN0IGRhdGVPZk1lYXN1cmUgPSBuZXcgRGF0ZSgpO1xuICAgIGRhdGVPZk1lYXN1cmUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpKTtcbiAgICBkYXRlT2ZNZWFzdXJlLnNldFVUQ01vbnRoKGRhdGUuZ2V0VVRDTW9udGgoKSk7XG4gICAgZGF0ZU9mTWVhc3VyZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpKTtcbiAgICBkYXRlT2ZNZWFzdXJlLnNldFVUQ0hvdXJzKE51bWJlcih0YWJsZVsxXVswXS5tYXRjaCgvdG9kYXkgKFxcZCspIFVUQy8pWzFdKSk7XG4gICAgZGF0ZU9mTWVhc3VyZS5zZXRVVENNaW51dGVzKDApO1xuICAgIGRhdGVPZk1lYXN1cmUuc2V0VVRDU2Vjb25kcygwKTtcbiAgICBkYXRlT2ZNZWFzdXJlLnNldFVUQ01pbGxpc2Vjb25kcygwKTtcbiAgICB0YWJsZVsxXS5mb3JFYWNoKCh1bml0LCBpbmRleCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcbiAgICAgICAgICAgIGNhc2UgXCJrbS9oXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdIC8gMy42O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm1tXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdIC8gMTAwMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJXVyBDb2RlXCI6XG4gICAgICAgICAgICBjYXNlIFwiQ09ERV9UQUJMRVwiOlxuICAgICAgICAgICAgICAgIHRhYmxlLnNsaWNlKDMpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHJvd1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gXCJjbGVhclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcImJyaWdodFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcImNsb3VkZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gXCJmb2dcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gXCJyYWluXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcInNsZWV0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcInNub3dcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcInNob3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gXCJ0aHVuZGVyc3Rvcm1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwic3Rvcm1cIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkFjaHRlbFwiOlxuICAgICAgICAgICAgICAgIHRhYmxlLnNsaWNlKDMpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gcm93W2luZGV4XSAqIDEyLjU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaFBhXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdIC8gMTAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlN0dW5kZW5cIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gKiAzNjAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImtKL3FtXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdICogMTAwMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjbVwiOlxuICAgICAgICAgICAgICAgIHRhYmxlLnNsaWNlKDMpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gcm93W2luZGV4XSAvIDEwMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJrbVwiOlxuICAgICAgICAgICAgICAgIHRhYmxlLnNsaWNlKDMpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gcm93W2luZGV4XSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibWluXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdICogNjA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGFibGUuc2xpY2UoNCkubWFwKChyb3cpID0+IHtcbiAgICAgICAgcmV0dXJuIHJvdy5zbGljZSgzKS5tYXAoKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0ZVBhcnRzID0gcm93WzBdLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVQYXJ0cyA9IHJvd1sxXS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICBjb25zdCBkYXRhUG9pbnREYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGRhdGFQb2ludERhdGUuc2V0VVRDRnVsbFllYXIoMjAwMCArIE51bWJlcihkYXRlUGFydHNbMl0pKTtcbiAgICAgICAgICAgIGRhdGFQb2ludERhdGUuc2V0VVRDTW9udGgoTnVtYmVyKGRhdGVQYXJ0c1sxXSkpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENEYXRlKE51bWJlcihkYXRlUGFydHNbMF0pKTtcbiAgICAgICAgICAgIGRhdGFQb2ludERhdGUuc2V0VVRDSG91cnMoTnVtYmVyKHRpbWVQYXJ0c1swXSkpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENTZWNvbmRzKE51bWJlcih0aW1lUGFydHNbMV0pKTtcbiAgICAgICAgICAgIGRhdGFQb2ludERhdGUuc2V0VVRDTWlsbGlzZWNvbmRzKDApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjYXBhYmlsaXR5SWQ6IGNhcGFiaWxpdGllcy5maW5kKChjYXBhYmlsaXR5KSA9PiBjYXBhYmlsaXR5Lm5hbWUgPT09IHRhYmxlWzJdW2luZGV4ICsgM10pLmlkLFxuICAgICAgICAgICAgICAgIGRhdGU6IGRhdGFQb2ludERhdGUudG9VVENTdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBkYXRlT2ZNZWFzdXJlOiBkYXRlT2ZNZWFzdXJlLnRvVVRDU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgc3RhdGlvbklkOiBzdGF0aW9uLmlkLFxuICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KS5yZWR1Y2UoKGEsIGIpID0+IGEuY29uY2F0KGIpLCBbXSkuZmlsdGVyKChkYXRhUG9pbnQpID0+IGRhdGFQb2ludC52YWx1ZSAhPT0gXCItLS1cIiAmJiAhaXNOYU4oZGF0YVBvaW50LnZhbHVlKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJlcG9ydChzdGF0aW9uLCBjYXBhYmlsaXRpZXMpIHtcbiAgICBsZXQgcmVzcG9uc2VCdWZmZXI7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzcG9uc2VCdWZmZXIgPSBhd2FpdCByZXF1ZXN0KHtcbiAgICAgICAgICAgIGFnZW50LFxuICAgICAgICAgICAgdXJpOiBgJHtkd2RSZXBvcnRzQXBpfS8ke3N0YXRpb24uc3RhdGlvbklkfS1CRU9CLmNzdmBcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBjc3YgPSByZXNwb25zZUJ1ZmZlci50b1N0cmluZygpO1xuICAgIGlmIChjc3YuZW5kc1dpdGgoXCJcXG5cIikpIHtcbiAgICAgICAgY3N2ID0gY3N2LnNsaWNlKDAsIGNzdi5sZW5ndGggLSAyKTtcbiAgICB9XG4gICAgY29uc3QgY3N2Um93cyA9IGNzdi5zcGxpdChcIlxcblwiKTtcbiAgICBjb25zdCB0YWJsZSA9IGNzdlJvd3MubWFwKChjc3ZSb3cpID0+IGNzdlJvdy5zcGxpdChcIjtcIikpO1xuICAgIHRhYmxlLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICByb3cuZm9yRWFjaCgoY2VsbCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFtZXJpY2FuRm9ybWF0ID0gY2VsbC5yZXBsYWNlKFwiLFwiLCBcIi5cIik7XG4gICAgICAgICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcihhbWVyaWNhbkZvcm1hdCk7XG4gICAgICAgICAgICBpZiAoaXNOYU4obnVtYmVyVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IGFtZXJpY2FuRm9ybWF0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gbnVtYmVyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vIHRoZSByZXBvcnRzIGRvbid0IGhhdmUgdGhlIHJlY29yZCBkYXRlIHNhdmVkIHdpdGggdGhlbSBzbyB3ZSB0YWtlIHRoZSBkYXRlIG9mIGltcG9ydFxuICAgIGNvbnN0IGRhdGVPZk1lYXN1cmUgPSBuZXcgRGF0ZShkYXRlLnRvVVRDU3RyaW5nKCkpO1xuICAgIGRhdGVPZk1lYXN1cmUuc2V0VVRDTWlsbGlzZWNvbmRzKDApO1xuICAgIHRhYmxlWzFdLmZvckVhY2goKHVuaXQsIGluZGV4KSA9PiB7XG4gICAgICAgIHN3aXRjaCAodW5pdCkge1xuICAgICAgICAgICAgY2FzZSBcImttL2hcIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gLyAzLjY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibW1cIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gLyAxMDAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIldXIENvZGVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJDT0RFX1RBQkxFXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocm93W2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcImNsZWFyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwiYnJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwiY2xvdWRlZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcImZvZ1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcInJhaW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwic2xlZXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwic25vd1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IFwic2hvd2VyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSBcInRodW5kZXJzdG9ybVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gXCJzdG9ybVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiQWNodGVsXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdICogMTIuNTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJoUGFcIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gLyAxMDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU3R1bmRlblwiOlxuICAgICAgICAgICAgICAgIHRhYmxlLnNsaWNlKDMpLmZvckVhY2goKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByb3dbaW5kZXhdID0gcm93W2luZGV4XSAqIDM2MDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwia0ovcW1cIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gKiAxMDAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNtXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdIC8gMTAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImttXCI6XG4gICAgICAgICAgICAgICAgdGFibGUuc2xpY2UoMykuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1tpbmRleF0gPSByb3dbaW5kZXhdICogMTAwMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJtaW5cIjpcbiAgICAgICAgICAgICAgICB0YWJsZS5zbGljZSgzKS5mb3JFYWNoKChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcm93W2luZGV4XSA9IHJvd1tpbmRleF0gKiA2MDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0YWJsZS5zbGljZSg0KS5tYXAoKHJvdykgPT4ge1xuICAgICAgICByZXR1cm4gcm93LnNsaWNlKDMpLm1hcCgodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRlUGFydHMgPSAocm93WzBdICsgXCI7XCIgKyByb3dbMV0pLm1hdGNoKC8oXFxkezJ9KVxcLihcXGR7Mn0pXFwuKFxcZHsyfSk7KFxcZHsyfSk6KFxcZHsyfSkvKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFQb2ludERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENGdWxsWWVhcigyMDAwICsgTnVtYmVyKGRhdGVQYXJ0c1szXSkpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENNb250aChOdW1iZXIoZGF0ZVBhcnRzWzJdKSk7XG4gICAgICAgICAgICBkYXRhUG9pbnREYXRlLnNldFVUQ0RhdGUoTnVtYmVyKGRhdGVQYXJ0c1sxXSkpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENIb3VycyhOdW1iZXIoZGF0ZVBhcnRzWzRdKSk7XG4gICAgICAgICAgICBkYXRhUG9pbnREYXRlLnNldFVUQ1NlY29uZHMoTnVtYmVyKGRhdGVQYXJ0c1s1XSkpO1xuICAgICAgICAgICAgZGF0YVBvaW50RGF0ZS5zZXRVVENNaWxsaXNlY29uZHMoMCk7XG4gICAgICAgICAgICBjb25zdCBjYXBhYmlsaXR5ID0gY2FwYWJpbGl0aWVzLmZpbmQoXG4gICAgICAgICAgICAgICAgKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLm5hbWUucmVwbGFjZShcIl9cIiwgXCIgXCIpID09PSB0YWJsZVsyXVtpbmRleCArIDNdXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjYXBhYmlsaXR5SWQ6IGNhcGFiaWxpdHkgPyBjYXBhYmlsaXR5LmlkIDogbnVsbCxcbiAgICAgICAgICAgICAgICBkYXRlOiBkYXRhUG9pbnREYXRlLnRvVVRDU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgZGF0ZU9mTWVhc3VyZTogZGF0ZU9mTWVhc3VyZS50b1VUQ1N0cmluZygpLFxuICAgICAgICAgICAgICAgIHN0YXRpb25JZDogc3RhdGlvbi5pZCxcbiAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSkucmVkdWNlKFxuICAgICAgICAoYSwgYikgPT4gYS5jb25jYXQoYiksXG4gICAgICAgIFtdXG4gICAgKS5maWx0ZXIoXG4gICAgICAgIChkYXRhUG9pbnQpID0+IGRhdGFQb2ludC52YWx1ZSAhPT0gXCItLS1cIiAmJiAhaXNOYU4oZGF0YVBvaW50LnZhbHVlKSAmJiBkYXRhUG9pbnQuY2FwYWJpbGl0eUlkICE9PSBudWxsXG4gICAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q2FwYWJpbGl0aWVzKHdlYXRoZXJBcGkpOiBQcm9taXNlPEFycmF5PHtpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmd9Pj4ge1xuICAgIGNvbnN0IGNhcGFiaWxpdGllc1Jlc3BvbnNlQnVmZmVyID0gYXdhaXQgcmVxdWVzdCh7XG4gICAgICAgIGFnZW50LFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBY2NlcHQ6IFwiQXBwbGljYXRpb24vSlNPTlwiXG4gICAgICAgIH0sXG4gICAgICAgIHVyaTogYCR7d2VhdGhlckFwaX0vY2FwYWJpbGl0aWVzYFxuICAgIH0pO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGNhcGFiaWxpdGllc1Jlc3BvbnNlQnVmZmVyLnRvU3RyaW5nKCkpLmRhdGE7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0YXRpb25zKHdlYXRoZXJBcGkpOiBQcm9taXNlPEFycmF5PHtpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmd9Pj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlQnVmZmVyID0gYXdhaXQgcmVxdWVzdCh7XG4gICAgICAgIGFnZW50LFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBY2NlcHQ6IFwiQXBwbGljYXRpb24vSlNPTlwiXG4gICAgICAgIH0sXG4gICAgICAgIHVyaTogd2VhdGhlckFwaSArIFwiL3N0YXRpb25zXCJcbiAgICB9KTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZUJ1ZmZlci50b1N0cmluZygpKS5kYXRhO1xufVxuIl19
