const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors');
const { append } = require('express/lib/response')

const PATH_FILE = path.join(__dirname, 'data', 'CPdescarga.txt')

let BUSCAR = ''
const PORT = 3001

const app = express()

app.use(cors({
    origin: '*'
}));

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const procesar_str = (str) => {
    str = removeAccents(str)
    str = str.toUpperCase()
    return str
}

const procesar_str_sin_uppercase = (str) => {
    return str
}

const procesar_int = (str) => {
    return str
}

app.get('/api/zip-codes/:code', (req, res) => {

    if (!req.params.code) return

    BUSCAR = req.params.code

    fs.readFile(PATH_FILE, { encoding: "binary" }, (err, data) => {
        if (!err) {

            const lines = data.split('\n')

            let arr = {};
            encontro = false;

            for (let i = 0; i < lines.length; i++) {

                parts = lines[i].split('|')

                if ((parts[0]) == BUSCAR) {

                    arr['zip_code'] = BUSCAR;
                    arr['locality'] = procesar_str(parts[5]);

                    federal_entity = [];
                    federal_entity['key'] = procesar_int(parts[7]);
                    federal_entity['name'] = procesar_str(parts[4]);
                    federal_entity['code'] = procesar_int(parts[9]);

                    arr['federal_entity'] = federal_entity;

                    let j = i;

                    parts_2 = lines[j].split('|')
                    let settlements = [];
                    while (j < lines.length && (parts_2[0]) == BUSCAR) {

                        data = {};
                        data['key'] = procesar_int(parts_2[12]);
                        data['name'] = procesar_str(parts_2[1]);
                        data['zone_type'] = procesar_str(parts_2[13]);


                        settlement_type = {};
                        settlement_type['name'] = procesar_str_sin_uppercase(parts_2[2]);
                        data['settlement_type'] = settlement_type;

                        settlements.push(data)
                        j++;

                        parts_2 = lines[j].split('|')

                    }

                    arr['settlements'] = settlements;

                    municipality = [];
                    municipality['key'] = procesar_int(parts[11]);
                    municipality['name'] = procesar_str(parts[3]);

                    arr['municipality'] = municipality;

                    encontro = true;
                    break;
                }
            }

            if (!encontro) {

                res.status(500)
                console.log('no esta')
            }


            res.send(arr)

        }
    })



})

app.listen(PORT, () => {
    console.log('in line')
})