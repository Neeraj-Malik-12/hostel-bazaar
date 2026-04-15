import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//FireBase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCKGWk9xVvsx49ojIkamr23qnd14ruKLRI",
    authDomain: "hostel-bazaar-qu.firebaseapp.com",
    projectId: "hostel-bazaar-qu",
    storageBucket: "hostel-bazaar-qu.firebasestorage.app",
    messagingSenderId: "672949319352",
    appId: "1:672949319352:web:384c2c26c4bc7cc6e5a64d"
  };

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// CREATE UNIQUE USER ID FOR EACH DEVICE

let userId = localStorage.getItem("hostelUserId");
if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("hostelUserId", userId);
}


// ADD ITEM

document.getElementById("itemForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submit pressed");

    try {
        const item = {
            seller: document.getElementById("sellerName").value,
            name: document.getElementById("itemName").value,
            price: document.getElementById("itemPrice").value,
            desc: document.getElementById("itemDesc").value,
            contact: document.getElementById("itemContact").value,
            image: document.getElementById("itemImage").value,
            ownerId: userId,
            isSold: false,
            createdAt: Date.now()
        };

        await addDoc(collection(db, "items"), item);

        alert("Item added successfully!");

        document.getElementById("itemForm").reset();

        loadItems();

    } catch (error) {
        console.error("ERROR:", error);
        alert("Error: " + error.message);
    }
});


// DISPLAY ITEMS

async function loadItems() {
    const querySnapshot = await getDocs(collection(db, "items"));
    const itemsList = document.getElementById("itemsList");

    itemsList.innerHTML = "";

    querySnapshot.forEach((document) => {
        const item = document.data();
        const itemId = document.id;

        let actionButtons = "";

        if (item.ownerId === userId) {
            // Owner can mark as sold or delete
            if (!item.isSold) {
                actionButtons += `
                    <button class="sold-btn" onclick="markSold('${itemId}')">
                        Mark as Sold
                    </button>
                `;
            }

            actionButtons += `
                <button class="delete-btn" onclick="deleteItem('${itemId}')">
                    Delete
                </button>
            `;
        }

        let soldBadge = item.isSold 
            ? `<div class="sold-badge"> SOLD </div>` 
            : "";

        let contactButton = item.isSold
            ? `<button class="contact-btn disabled">Sold Out</button>`
            : `<a class="contact-btn" href="tel:${item.contact}">Call: ${item.contact}</a>`;

        let card = `
            <div class="item-card">
                ${soldBadge}
                <img src="${item.image}" alt="Item">
                <h2>Item : ${item.name}</h2>
                <h3>Owner : ${item.seller}</h3>
                <p><strong>Price:</strong> ${item.price ? "₹" + item.price : ""}</p>
                <p>${item.desc}</p>
                ${contactButton}
                ${actionButtons}
            </div>
        `;

        itemsList.innerHTML += card;
    });
}


// DELETE ITEM

window.deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    await deleteDoc(doc(db, "items", itemId));
    alert("Item deleted!");
    loadItems();
};


// MARK AS SOLD

window.markSold = async (itemId) => {
    await updateDoc(doc(db, "items", itemId), {
        isSold: true
    });

    alert("Item marked as SOLD!");
    loadItems();
};

// Load items when page opens
loadItems();
