import fs from "fs";
import { parse } from "csv-parse";

const parseCSVFile = (filePath) => {
    if (!filePath) return nulll;
    return new Promise((resolve, reject) => {
        const data = [];

        fs.createReadStream(filePath)
            .pipe(parse())
            .on("data", (row) => {
                data.push(row);
            })
            .on("end", () => {
                fs.unlinkSync(filePath, (error) => {
                    if (error) {
                        console.error("Error removing file:", error);
                    }
                });

                if (data.length > 0) {
                    data.shift();
                }

                resolve(data);
            })
            .on("error", (error) => {
                fs.unlinkSync(filePath, () => {
                    reject(error);
                });
            });
    });
};

export default parseCSVFile;
