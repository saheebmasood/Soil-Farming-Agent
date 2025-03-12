import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDTgycLAAlMbV0k9R9tr46orEN8T-eYvg4",
    authDomain: "agro-f03d1.firebaseapp.com",
    projectId: "agro-f03d1",
    storageBucket: "agro-f03d1.appspot.com",
    messagingSenderId: "1016051279743",
    appId: "1:1016051279743:web:67d42c22d89d18562f5c4a",
    measurementId: "G-V691WMRLST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let isAdmin = false;

// ✅ Register User & Assign Role (Admin/User)
window.register = async function () {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let role = document.getElementById('role').value; // Admin or User

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Store user role in Firestore
        await setDoc(doc(db, "users", userId), {
            email: email,
            role: role
        });

        alert("Registration Successful as " + role);
    } catch (error) {
        alert(error.message);
    }
};

// ✅ Login & Show Relevant Sections
window.login = async function () {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Get User Role from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));
        let userRole = userDoc.exists() ? userDoc.data().role : "User"; // Default: User
        isAdmin = userRole === "Admin"; // Store admin status

        alert("Login Successful as " + userRole);

        // Show User Section (for both Admin & Users)
        document.getElementById("user-section").style.display = "block";

        // Show Admin Section (only for Admins)
        if (isAdmin) {
            document.getElementById("admin-section").style.display = "block";
        }

        document.getElementById("logout-btn").style.display = "inline";
        viewSoilDetails();
        viewDistributorDetails();
    } catch (error) {
        alert(error.message);
    }
};

// ✅ Logout Function
window.logout = async function () {
    try {
        await signOut(auth);
        alert("Logged out");

        document.getElementById("user-section").style.display = "none";
        document.getElementById("admin-section").style.display = "none";
        document.getElementById("logout-btn").style.display = "none";
    } catch (error) {
        console.error("Logout Error: ", error);
    }
};

// ✅ Admin: Post Soil Details
window.postSoilDetails = async function () {
    let soilName = document.getElementById('soil-name').value;
    let cropType = document.getElementById('crop-type').value;

    try {
        await addDoc(collection(db, "soils"), {
            name: soilName,
            bestFor: cropType
        });
        alert("Soil data added successfully!");
        viewSoilDetails();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

// ✅ Admin: Post Distributor Details
window.postDistributorDetails = async function () {
    let distributorName = document.getElementById('distributor-name').value;
    let location = document.getElementById('location').value;
    let phone = document.getElementById('distributor-phone').value;
    let email = document.getElementById('distributor-email').value;

    try {
        await addDoc(collection(db, "distributors"), {
            name: distributorName,
            location: location,
            phone: phone,
            email: email
        });
        alert("Distributor added successfully!");
        viewDistributorDetails();
    } catch (error) {
        console.error("Error adding distributor: ", error);
    }
};

// ✅ User/Admin: View Soil Details (Admin sees delete buttons)
window.viewSoilDetails = async function () {
    let soilList = document.getElementById("soil-list");
    soilList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "soils"));
        querySnapshot.forEach(doc => {
            let data = doc.data();
            let listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${data.name}</strong> - Best for: ${data.bestFor}`;

            // Show delete button for Admins only
            if (isAdmin) {
                let deleteButton = document.createElement("button");
                deleteButton.innerText = "🗑 Delete";
                deleteButton.onclick = () => deleteSoil(doc.id);
                listItem.appendChild(deleteButton);
            }

            soilList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading soil data: ", error);
    }
};

// ✅ User/Admin: View Distributor Details (Admin sees delete buttons)
window.viewDistributorDetails = async function () {
    let distributorList = document.getElementById("distributor-list");
    distributorList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "distributors"));
        querySnapshot.forEach(doc => {
            let data = doc.data();
            let listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${data.name}</strong> <br>
                                  Location: ${data.location} <br>
                                  📞 Phone: ${data.phone} <br>
                                  📧 Email: <a href="mailto:${data.email}">${data.email}</a>`;

            // Show delete button for Admins only
            if (isAdmin) {
                let deleteButton = document.createElement("button");
                deleteButton.innerText = "🗑 Delete";
                deleteButton.onclick = () => deleteDistributor(doc.id);
                listItem.appendChild(deleteButton);
            }

            distributorList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading distributor data: ", error);
    }
};

// ✅ Admin: Delete Soil
async function deleteSoil(id) {
    await deleteDoc(doc(db, "soils", id));
    alert("Soil deleted successfully!");
    viewSoilDetails();
}

// ✅ Admin: Delete Distributor
async function deleteDistributor(id) {
    await deleteDoc(doc(db, "distributors", id));
    alert("Distributor deleted successfully!");
    viewDistributorDetails();
}
