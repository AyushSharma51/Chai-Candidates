import {
    db,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    doc,
    deleteDoc
} from "./firebase.js";

let currentSession = "morning";

let unsubscribeOrders = null;


// =============================
// SCREEN NAVIGATION
// =============================

window.showScreen = function (screenId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

};


// =============================
// OPEN MORNING / EVENING CHAI
// =============================

window.openChai = function (session) {

    currentSession = session;

    if (session === "morning") {

        document.getElementById("session-label").textContent =
            "SAVERE DI CHA";

        document.getElementById("session-title").textContent =
            "Morning Chai";

    } else {

        document.getElementById("session-label").textContent =
            "SHAAM DI CHA";

        document.getElementById("session-title").textContent =
            "Evening Chai";

    }

    showScreen("orders");

    subscribeToOrders();

};


// =============================
// GET TODAY'S DATE
// =============================

function getToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =============================
// DISPLAY DATE
// =============================

function displayDate() {

    const today = new Date();

    document.getElementById("today-date").textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}


// =============================
// FIRESTORE REAL-TIME LISTENER
// =============================

function subscribeToOrders() {

    // Remove previous listener

    if (unsubscribeOrders) {

        unsubscribeOrders();

    }


    const today = getToday();


    const ordersRef =
        collection(db, "orders");


    const ordersQuery = query(

        ordersRef,

        where("date", "==", today),

        where("session", "==", currentSession)

    );


    unsubscribeOrders = onSnapshot(

        ordersQuery,

        (snapshot) => {

            const orders = [];


            snapshot.forEach(doc => {

                orders.push({
                    id: doc.id,
                    ...doc.data()
                });

            });


            renderOrders(orders);

        },

        (error) => {

            console.error(
                "Firestore error:",
                error
            );

        }

    );

}


// =============================
// RENDER ORDER LIST
// =============================

function renderOrders(orders) {

    const list =
        document.getElementById("order-list");

    list.innerHTML = "";

    orders.forEach((person, index) => {

        const row =
            document.createElement("div");

        row.className = "person-row";

        const status =
            person.payment === "paid"
                ? "PAID"
                : "UNPAID";

        const statusClass =
            person.payment === "paid"
                ? "paid"
                : "unpaid";

        row.innerHTML = `

            <div class="person-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="person-name">
                ${escapeHTML(person.name)}
            </div>

            <div class="person-actions">

                <button
                    class="payment-status ${statusClass}"
                    data-id="${person.id}"
                >
                    ${status}
                </button>

                <button
                    class="remove-button"
                    data-id="${person.id}"
                    title="Remove from chai list"
                >
                    ×
                </button>

            </div>

        `;

        // Payment button

        const paymentButton =
            row.querySelector(".payment-status");

        paymentButton.addEventListener(
            "click",
            () => togglePayment(person)
        );


        // Remove button

        const removeButton =
            row.querySelector(".remove-button");

        removeButton.addEventListener(
            "click",
            () => removePerson(person)
        );


        list.appendChild(row);

    });


    document.getElementById("people-count").textContent =
        `${orders.length} ${
            orders.length === 1
                ? "PERSON"
                : "PEOPLE"
        }`;

}

// =============================
// TOGGLE PAYMENT
// =============================

async function togglePayment(person) {

    try {

        const newPayment =
            person.payment === "paid"
                ? "unpaid"
                : "paid";

        await updateDoc(

            // Get the specific Firestore document
            doc(db, "orders", person.id),

            {
                payment: newPayment
            }

        );

    } catch (error) {

        console.error(
            "Error updating payment:",
            error
        );

    }

}

// =============================
// REMOVE PERSON
// =============================
async function removePerson(person) {

    const confirmed = confirm(
        `Remove ${person.name} from the chai list?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "orders", person.id)
        );

    } catch (error) {

        console.error(
            "Error removing person:",
            error
        );

        alert(
            "Couldn't remove the person."
        );

    }

}
// =============================
// ADD PERSON
// =============================

window.addPerson = async function () {

    const input =
        document.getElementById("name-input");


    const payment =
        document.getElementById("payment-input");


    const name =
        input.value.trim();


    if (!name) {

        input.focus();

        return;

    }


    try {

        await addDoc(

            collection(db, "orders"),

            {

                name: name,

                payment: payment.value,

                session: currentSession,

                date: getToday(),

                createdAt: serverTimestamp()

            }

        );


        input.value = "";

        payment.value = "unpaid";


    } catch (error) {

        console.error(
            "Error adding chai order:",
            error
        );

        alert(
            "Couldn't add your chai order."
        );

    }

};


// =============================
// ESCAPE USER INPUT
// =============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// =============================
// INITIALIZE
// =============================

displayDate();

// =============================
// COPY UPI ID
// =============================

document
    .getElementById("copy-upi-button")
    .addEventListener("click", async function () {

        const upiId =
            document.getElementById("collector-upi").textContent.trim();

        try {

            await navigator.clipboard.writeText(upiId);

            this.textContent = "COPIED ✓";

            setTimeout(() => {

                this.textContent = "COPY UPI ID";

            }, 1500);

        } catch (error) {

            console.error(
                "Failed to copy UPI ID:",
                error
            );

        }

    });