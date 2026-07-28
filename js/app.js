const foodsDiv = document.getElementById("foods");
const dogsDiv = document.getElementById("dogs");
function hidePdfButton() {
    const btn = document.getElementById("exportPdf");

    if (btn) {
        btn.style.display = "none";
    }
}
function updateDogFoodInputs() {

    const foods = [...document.querySelectorAll(".food")].map(f =>
        f.querySelector(".foodName").value || "Alimento"
    );

    document.querySelectorAll(".dog").forEach(dog => {

        const container = dog.querySelector(".foodInputs");

        const values = {};

        container.querySelectorAll("input").forEach(i => {
            values[i.dataset.food] = i.value;
        });

        container.innerHTML = "";

        foods.forEach(food => {

            const wrapper = document.createElement("div");

            wrapper.innerHTML = `
                <label>${food} (Dose gr. crudo)</label>
                <input
                    type="number"
                    data-food="${food}"
                    value="${values[food] || ''}">
            `;

            container.appendChild(wrapper);
        });
    });
}

function addFood() {

    const div = document.createElement("div");

    div.className = "food";

div.innerHTML = `
    <div class="row">
        <input class="foodName" placeholder="Nome alimento">
        <input class="foodRaw" type="number" placeholder="gr. crudo">
        <input class="foodCooked" type="number" placeholder="gr. cotto">
    </div>

    <button onclick="this.parentElement.remove(); updateDogFoodInputs();">
        Rimuovi
    </button>
`;

    foodsDiv.appendChild(div);
div.addEventListener("input", hidePdfButton);
div.addEventListener("change", hidePdfButton);
div.querySelector(".foodName")
   .addEventListener("input", updateDogFoodInputs);

    updateDogFoodInputs();
}

function addDog() {

    const div = document.createElement("div");

    div.className = "dog";

    div.innerHTML = `
        <input class="dogName" placeholder="Nome cane">

        <div class="foodInputs"></div>

        <button onclick="this.parentElement.remove()">
            Rimuovi
        </button>
    `;

    dogsDiv.appendChild(div);
div.addEventListener("input", hidePdfButton);
div.addEventListener("change", hidePdfButton);
    updateDogFoodInputs();
}

document.getElementById("addFood").onclick = addFood;
document.getElementById("addDog").onclick = addDog;

document.getElementById("calc").onclick = () => {

    const foods = [...document.querySelectorAll(".food")];

    const dogs = [...document.querySelectorAll(".dog")];

    if (!foods.length || !dogs.length) {
        alert("Inserisci almeno un alimento e un cane");
        return;
    }

    let html = `
        <table>
        <tr>
            <th>Cane</th>
            <th>Dettaglio</th>
            <th>Totale Cotto</th>
        </tr>
    `;

    for (const dog of dogs) {

        const dogName =
            dog.querySelector(".dogName").value || "Cane";

        let totaleCotto = 0;

        let dettaglio = [];

        const inputs = dog.querySelectorAll(".foodInputs input");

        foods.forEach((food, index) => {

            const nome =
                food.querySelector(".foodName").value || "Alimento";

            const crudoTot =
                parseFloat(food.querySelector(".foodRaw").value);

            const cottoTot =
                parseFloat(food.querySelector(".foodCooked").value);

            const doseCruda =
                parseFloat(inputs[index]?.value || 0);

            if (!crudoTot || !cottoTot) return;

            const doseCotta =
                doseCruda * (cottoTot / crudoTot);

            totaleCotto += doseCotta;

            dettaglio.push(
                `${nome}: ${doseCotta.toFixed(1)} g`
            );
        });

        html += `
            <tr>
                <td>${dogName}</td>
                <td>${dettaglio.join("<br>")}</td>
                <td><b>${totaleCotto.toFixed(1)} g</b></td>
            </tr>
        `;
    }

    html += "</table>";

    out.innerHTML = html;
    document.getElementById("exportPdf").style.display = "block";
};

document.getElementById("exportPdf").addEventListener("click", () => {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let y = 20;

    pdf.setFontSize(18);
    pdf.text("MealSplit - Dosi Alimenti", 15, y);

    y += 10;

    pdf.setFontSize(10);

    pdf.text(
        "Data: " + new Date().toLocaleDateString("it-IT"),
        15,
        y
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.text("Alimenti", 15, y);

    y += 10;

    document.querySelectorAll(".food").forEach(food => {

        const nome =
            food.querySelector(".foodName").value;

        const crudo =
            food.querySelector(".foodRaw").value || 0;

        const cotto =
            food.querySelector(".foodCooked").value || 0;

        pdf.setFontSize(10);

        pdf.text(
            `${nome}: ${crudo} g crudo -> ${cotto} g cotto`,
            15,
            y
        );

        y += 7;
    });

    y += 5;

    pdf.setFontSize(14);
    pdf.text("Razioni per Cane", 15, y);

    y += 10;

    document.querySelectorAll(".dog").forEach(dog => {

        const nomeCane =
            dog.querySelector(".dogName").value || "Cane";

        pdf.setFontSize(12);
        pdf.text(nomeCane, 15, y);

        y += 7;

        let totale = 0;

        const foods =
            document.querySelectorAll(".food");

        const inputs =
            dog.querySelectorAll(".foodInputs input");

        foods.forEach((food, index) => {

            const nome =
                food.querySelector(".foodName").value;

            const crudoTot =
                parseFloat(food.querySelector(".foodRaw").value || 0);

            const cottoTot =
                parseFloat(food.querySelector(".foodCooked").value || 0);

            const doseCruda =
                parseFloat(inputs[index]?.value || 0);

            if (!crudoTot || !cottoTot) return;

            const doseCotta =
                doseCruda * (cottoTot / crudoTot);

            totale += doseCotta;

            pdf.setFontSize(10);

            pdf.text(
                `${nome}: ${doseCotta.toFixed(1)} g`,
                20,
                y
            );

            y += 6;
        });

        pdf.setFontSize(11);

        pdf.text(
            `Totale: ${totale.toFixed(1)} g`,
            20,
            y
        );

        y += 12;

        if (y > 260) {
            pdf.addPage();
            y = 20;
        }
    });

    pdf.save("MealSplit.pdf");
});
