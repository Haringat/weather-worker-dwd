import "async-tools";
import * as http from "http";
import * as request from "request-promise-native";

const {
    Agent
} = http;

const agent = new Agent({
    maxSockets: 100
});

const date = new Date();

const stations = module.require("./stations_16.json").stations;

const dwdForecastApi = "http://opendata.dwd.de/weather/local_forecasts/poi";
const dwdReportsApi = "http://opendata.dwd.de/weather/weather_reports/poi";

export default async function main(parameters: any) {
    const weatherApi: string = parameters.api;
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
    console.log(`got ${reports.length} report datapoints and ${forecasts.length} forecast datapoints`);
    await forecasts.forEachAsync(async (dataPoint) => {
        try {
            await request({
                agent,
                body: {
                    data: dataPoint
                },
                json: true,
                method: "POST",
                uri: `${weatherApi}/stations/${dataPoint.stationId}/forecasts`
            });
        } catch (e) {
            console.log(e.stack);
        }
    });
    await reports.forEachAsync(async (dataPoint) => {
        try {
            await request({
                agent,
                body: {
                    data: dataPoint
                },
                json: true,
                method: "POST",
                uri: `${weatherApi}/stations/${dataPoint.stationId}/reports`
            });
        } catch (e) {
            console.log(e.stack);
        }
    });
}

async function getForecast(station, capabilities) {
    let responseBuffer;
    try {
        responseBuffer = await request({
            agent,
            uri: `${dwdForecastApi}/${station.stationId}-MOSMIX.csv`
        });
    } catch (e) {
        console.log(e.stack);
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
            } else {
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
    } catch (e) {
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
            } else {
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
    const allData = table.slice(4).map((row) => {
        return row.slice(3).map((value, index) => {
            const dateParts = (row[0] + ";" + row[1]).match(/(\d{2})\.(\d{2})\.(\d{2});(\d{2}):(\d{2})/);
            const dataPointDate = new Date();
            dataPointDate.setUTCFullYear(2000 + Number(dateParts[3]));
            dataPointDate.setUTCMonth(Number(dateParts[2]));
            dataPointDate.setUTCDate(Number(dateParts[1]));
            dataPointDate.setUTCHours(Number(dateParts[4]));
            dataPointDate.setUTCSeconds(Number(dateParts[5]));
            dataPointDate.setUTCMilliseconds(0);
            switch (table[2][index + 3]) {
                case "mittlere Temperatur (vergangener Tag. 2m)":
                    table[2][index + 3] = "daily mean of temperature previous day";
                    break;
                case "Sonnenscheindauer (vergangener Tag)":
                    table[2][index + 3] = "total time of sunshine past day";
                    break;
                case "Sonnenscheindauer (letzte Stunde)":
                    table[2][index + 3] = "total time of sunshine during last hour";
                    break;
                case "Schneehoehe":
                    table[2][index + 3] = "total snow depth";
                    break;
                case "Temperatur (5cm)":
                    table[2][index + 3] = "temperature at 5 cm above ground";
                    break;
                case "Wassertemperatur":
                    table[2][index + 3] = "sea/water temperature";
                    break;
                case "Relative Feuchte":
                    table[2][index + 3] = "relative humidity";
                    break;
                case "Druck (auf Meereshoehe)":
                    table[2][index + 3] = "pressure reduced to mean sea level";
                    break;
                case "aktuelles Wetter":
                    table[2][index + 3] = "present weather";
                    break;
                case "Niederschlag (letzte Stunde)":
                    table[2][index + 3] = "precipitation amount last hour";
                    break;
                case "Niederschlag (letzte 3 Stunden)":
                    table[2][index + 3] = "precipitation amount last 3 hours";
                    break;
                case "Niederschlag (letzte 6 Stunden)":
                    table[2][index + 3] = "precipitation amount last 6 hours";
                    break;
                case "Niederschlag (letzte 12 Stunden)":
                    table[2][index + 3] = "precipitation amount last 12 hours";
                    break;
                case "Niederschlag (letzte 24 Stunden)":
                    table[2][index + 3] = "precipitation amount last 24 hours";
                    break;
                case "vergangenes Wetter 1":
                    table[2][index + 3] = "past weather 1";
                    break;
                case "vergangenes Wetter 2":
                    table[2][index + 3] = "past weather 2";
                    break;
                case "Minimumtemperatur (letzte 12 Stunden. 5cm)":
                    table[2][index + 3] = "minimum temperature at 5 cm above ground last 12h";
                    break;
                case "Minimumtemperatur (letzte 12 Stunden. 2m)":
                    table[2][index + 3] = "minimum temperature last 12 hours 2 meters above ground";
                    break;
                case "Minimumtemperatur (vergangener Tag. 2m)":
                    table[2][index + 3] = "minimum of temperature for previous day";
                    break;
                case "Minimumtemperatur (vergangener Tag. 5cm)":
                    table[2][index + 3] = "minimum of temperature at 5 cm above ground for previous day";
                    break;
                case "Windgeschwindigkeit":
                    table[2][index + 3] = "mean wind speed during last 10 min. at 10 meters above ground";
                    break;
                case "Windrichtung":
                    table[2][index + 3] = "mean wind direction during last 10 min. at 10 meters above ground";
                    break;
                case "Windboen (letzte Stunde)":
                    table[2][index + 3] = "";
                    break;
                case "Windboen (vergangener Tag)":
                    table[2][index + 3] = "";
                    break;
                case "Windboen (letzte 6 Stunden)":
                    table[2][index + 3] = "";
                    break;
                case "Maximalwind (letzte Stunde)":
                    table[2][index + 3] = "";
                    break;
                case "Maximumtemperatur (letzte 12 Stunden. 2m)":
                    table[2][index + 3] = "maximum temperature last 12 hours 2 meters above ground";
                    break;
                case "Maximumtemperatur (vergangener Tag. 2m)":
                    table[2][index + 3] = "";
                    break;
                case "Maximalwind (vergangener Tag)":
                    table[2][index + 3] = "maximum wind speed for previous day";
                    break;
                case "Sichtweite":
                    table[2][index + 3] = "horizontal visibility";
                    break;
                case "Wolkenuntergrenze":
                    table[2][index + 3] = "height of base of lowest cloud above station";
                    break;
                case "Globalstrahlung (vergangene 24 Stunden)":
                    table[2][index + 3] = "global radiation past 24 hours";
                    break;
                case "Globalstrahlung (letzte Stunde)":
                    table[2][index + 3] = "global radiation last hour";
                    break;
                case "Evaporation (vergangene 24 Stunden)":
                    table[2][index + 3] = "evaporation/evapotranspiration last 24 hours";
                    break;
                case "Temperatur (2m)":
                    table[2][index + 3] = "dry bulb temperature at 2 meter above ground";
                    break;
                case "Direkte Strahlung (letzte Stunde)":
                    table[2][index + 3] = "direct solar radiation last hour";
                    break;
                case "Direkte Strahlung (vergangene 24 Stunden)":
                    table[2][index + 3] = "direct solar radiation last 24 hours";
                    break;
                case "Diffuse Strahlung (letzte Stunde)":
                    table[2][index + 3] = "diffuse solar radiation last hour";
                    break;
                case "Taupunkttemperatur (2m)":
                    table[2][index + 3] = "dew point temperature at 2 meter above ground";
                    break;
                case "Neuschneehoehe":
                    table[2][index + 3] = "depth of new snow";
                    break;
            }
            const capability = capabilities.find(
                (candidate) => candidate.name.replace("_", " ") === table[2][index + 3]
            );
            return {
                capabilityId: capability ? capability.id : null,
                date: dataPointDate.toUTCString(),
                dateOfMeasure: dateOfMeasure.toUTCString(),
                stationId: station.id,
                value
            };
        });
    }).reduce(
        (a, b) => a.concat(b),
        []
    );

    return allData.filter(
        (dataPoint) => dataPoint.value !== "---" && !isNaN(dataPoint.value) && dataPoint.capabilityId !== null
    );
}

async function getCapabilities(weatherApi): Promise<Array<{id: string, name: string}>> {
    const capabilitiesResponseBuffer = await request({
        agent,
        headers: {
            Accept: "Application/JSON"
        },
        uri: `${weatherApi}/capabilities`
    });
    return JSON.parse(capabilitiesResponseBuffer.toString()).data;
}

async function getStations(weatherApi): Promise<Array<{id: string, name: string}>> {
    const responseBuffer = await request({
        agent,
        headers: {
            Accept: "Application/JSON"
        },
        uri: weatherApi + "/stations"
    });
    return JSON.parse(responseBuffer.toString()).data;
}
