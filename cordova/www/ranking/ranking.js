 import {BASE_URL_API} from "../util/frontPath.js";
 import {API_URL, STATS_API} from "../util/path.js";



let ranking = document.getElementById("ranking-table-body");
fetch(BASE_URL_API + API_URL + STATS_API + `getAllElo/`, {
    method: "get", headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}).then((response) => {
    if (!response.ok) {
        console.log("Error while retrieving users from back", response.status);
    }
    return response.json();
}).then(data => {
    // table : <th>Position</th> <th>Pseudo</th> <th>ELO</th>
    let tbody = document.getElementById("ranking-table-body");

    let counter = 1;
    data.forEach(userInDb => {
        let tr = document.createElement("tr");
        let tdPosition = document.createElement("td");
        let tdPseudo = document.createElement("td");
        let tdElo = document.createElement("td");

        tdPosition.innerText = counter++;
        tdPseudo.innerText = userInDb.username;
        tdElo.innerText = userInDb.elo;

        tr.appendChild(tdPosition);
        tr.appendChild(tdPseudo);
        tr.appendChild(tdElo);
        tbody.appendChild(tr);

    })
})
