import "async-tools";
import * as http from "http";
import * as request from "request-promise-native";
const { Agent } = http;
const agent = new Agent({
    maxSockets: 100
});
const date = new Date();
const stations = module.require("./stations_16.json").stations;
const dwdForecastApi = "http://opendata.dwd.de/weather/local_forecasts/poi";
const dwdReportsApi = "http://opendata.dwd.de/weather/weather_reports/poi";
export default async function main(parameters) {
    const weatherApi = parameters.api;
    const apiStations = await getStations(weatherApi);
    const capabilities = await getCapabilities(weatherApi);
    stations.forEach((station) => {
        station.id = apiStations.find((apiStation) => apiStation.name === station.name).id;
    });
    const reports = [];
    const forecasts = [];
    await stations.forEachAsync(async (station) => {
        forecasts.push(...await getForecast(station, capabilities));
        reports.push(...await getReport(station, capabilities));
    });
    await forecasts.forEachAsync(async (dataPoint) => {
        // try {
        await request({
            agent,
            body: {
                data: dataPoint
            },
            json: true,
            method: "POST",
            uri: `${weatherApi}/stations/${dataPoint.stationId}/forecasts`
        });
        /*} catch (e) {
            console.log(e.stack);
        }*/
    });
    await reports.forEachAsync(async (dataPoint) => {
        // try {
        await request({
            agent,
            body: {
                data: dataPoint
            },
            json: true,
            method: "POST",
            uri: `${weatherApi}/stations/${dataPoint.stationId}/reports`
        });
        /*} catch (e) {
            console.log(e.stack);
        }*/
    });
}
async function getForecast(station, capabilities) {
    let responseBuffer;
    try {
        responseBuffer = await request({
            agent,
            uri: `${dwdForecastApi}/${station.stationId}-MOSMIX.csv`
        });
    }
    catch (e) {
        return [];
    }
    let csv = responseBuffer.toString();
    if (csv.endsWith("\n")) {
        csv = csv.slice(0, csv.length - 2);
    }
    const csvRows = csv.split("\n");
    const table = csvRows.map((csvRow) => csvRow.split(";"));
    table.forEach((row) => {
        row.forEach((cell, index) => {
            const americanFormat = cell.replace(",", ".");
            const numberValue = Number(americanFormat);
            if (isNaN(numberValue)) {
                row[index] = americanFormat;
            }
            else {
                row[index] = numberValue;
            }
        });
    });
    const dateOfMeasure = new Date();
    dateOfMeasure.setUTCFullYear(date.getUTCFullYear());
    dateOfMeasure.setUTCMonth(date.getUTCMonth());
    dateOfMeasure.setUTCDate(date.getUTCDate());
    dateOfMeasure.setUTCHours(Number(table[1][0].match(/today (\d+) UTC/)[1]));
    dateOfMeasure.setUTCMinutes(0);
    dateOfMeasure.setUTCSeconds(0);
    dateOfMeasure.setUTCMilliseconds(0);
    table[1].forEach((unit, index) => {
        switch (unit) {
            case "km/h":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 3.6;
                });
                break;
            case "mm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 1000;
                });
                break;
            case "WW Code":
            case "CODE_TABLE":
                table.slice(3).forEach((row) => {
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
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 12.5;
                });
                break;
            case "hPa":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 100;
                });
                break;
            case "Stunden":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 3600;
                });
                break;
            case "kJ/qm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 1000;
                });
                break;
            case "cm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 100;
                });
                break;
            case "km":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 1000;
                });
                break;
            case "min":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 60;
                });
        }
    });
    return table.slice(4).map((row) => {
        return row.slice(3).map((value, index) => {
            const dateParts = row[0].split(".");
            const timeParts = row[1].split(":");
            const dataPointDate = new Date();
            dataPointDate.setUTCFullYear(2000 + Number(dateParts[2]));
            dataPointDate.setUTCMonth(Number(dateParts[1]));
            dataPointDate.setUTCDate(Number(dateParts[0]));
            dataPointDate.setUTCHours(Number(timeParts[0]));
            dataPointDate.setUTCSeconds(Number(timeParts[1]));
            dataPointDate.setUTCMilliseconds(0);
            return {
                capabilityId: capabilities.find((capability) => capability.name === table[2][index + 3]).id,
                date: dataPointDate.toUTCString(),
                dateOfMeasure: dateOfMeasure.toUTCString(),
                stationId: station.id,
                value
            };
        });
    }).reduce((a, b) => a.concat(b), []).filter((dataPoint) => dataPoint.value !== "---" && !isNaN(dataPoint.value));
}
async function getReport(station, capabilities) {
    let responseBuffer;
    try {
        responseBuffer = await request({
            agent,
            uri: `${dwdReportsApi}/${station.stationId}-BEOB.csv`
        });
    }
    catch (e) {
        return [];
    }
    let csv = responseBuffer.toString();
    if (csv.endsWith("\n")) {
        csv = csv.slice(0, csv.length - 2);
    }
    const csvRows = csv.split("\n");
    const table = csvRows.map((csvRow) => csvRow.split(";"));
    table.forEach((row) => {
        row.forEach((cell, index) => {
            const americanFormat = cell.replace(",", ".");
            const numberValue = Number(americanFormat);
            if (isNaN(numberValue)) {
                row[index] = americanFormat;
            }
            else {
                row[index] = numberValue;
            }
        });
    });
    // the reports don't have the record date saved with them so we take the date of import
    const dateOfMeasure = new Date(date.toUTCString());
    dateOfMeasure.setUTCMilliseconds(0);
    table[1].forEach((unit, index) => {
        switch (unit) {
            case "km/h":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 3.6;
                });
                break;
            case "mm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 1000;
                });
                break;
            case "WW Code":
            case "CODE_TABLE":
                table.slice(3).forEach((row) => {
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
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 12.5;
                });
                break;
            case "hPa":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 100;
                });
                break;
            case "Stunden":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 3600;
                });
                break;
            case "kJ/qm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 1000;
                });
                break;
            case "cm":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] / 100;
                });
                break;
            case "km":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 1000;
                });
                break;
            case "min":
                table.slice(3).forEach((row) => {
                    row[index] = row[index] * 60;
                });
        }
    });
    return table.slice(4).map((row) => {
        return row.slice(3).map((value, index) => {
            const dateParts = (row[0] + ";" + row[1]).match(/(\d{2})\.(\d{2})\.(\d{2});(\d{2}):(\d{2})/);
            const dataPointDate = new Date();
            dataPointDate.setUTCFullYear(2000 + Number(dateParts[3]));
            dataPointDate.setUTCMonth(Number(dateParts[2]));
            dataPointDate.setUTCDate(Number(dateParts[1]));
            dataPointDate.setUTCHours(Number(dateParts[4]));
            dataPointDate.setUTCSeconds(Number(dateParts[5]));
            dataPointDate.setUTCMilliseconds(0);
            const capability = capabilities.find((candidate) => candidate.name.replace("_", " ") === table[2][index + 3]);
            return {
                capabilityId: capability ? capability.id : null,
                date: dataPointDate.toUTCString(),
                dateOfMeasure: dateOfMeasure.toUTCString(),
                stationId: station.id,
                value
            };
        });
    }).reduce((a, b) => a.concat(b), []).filter((dataPoint) => dataPoint.value !== "---" && !isNaN(dataPoint.value) && dataPoint.capabilityId !== null);
}
async function getCapabilities(weatherApi) {
    const capabilitiesResponseBuffer = await request({
        agent,
        headers: {
            Accept: "Application/JSON"
        },
        uri: `${weatherApi}/capabilities`
    });
    return JSON.parse(capabilitiesResponseBuffer.toString()).data;
}
async function getStations(weatherApi) {
    const responseBuffer = await request({
        agent,
        headers: {
            Accept: "Application/JSON"
        },
        uri: weatherApi + "/stations"
    });
    return JSON.parse(responseBuffer.toString()).data;
}
