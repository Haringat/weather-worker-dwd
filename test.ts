import run from "./index";

run({
    api: "http://localhost:8080/v1"
}).catch((e) => {
    console.log(e.stack);
    process.exit(-1);
});
