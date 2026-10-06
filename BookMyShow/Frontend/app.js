/* =====================================================
   BOOKMYTICKET FRONTEND
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentUser = null;

let searchResults = [];

let selectedBus = null;

let selectedSeats = [];

let bookedSeats = [];


/*
   Your Java server
*/
const SERVER_URL =
    "http://localhost:8080";


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loggedInUser =
            localStorage.getItem(
                "bookMyTicketCurrentUser"
            );


        if (loggedInUser) {

            currentUser =
                loggedInUser;

            showApplication();

        }

        else {

            showAuthScreen();

        }

    }
);


/* =====================================================
   AUTH SCREEN
===================================================== */

function showAuthScreen() {

    document
        .getElementById("authScreen")
        .classList.remove("hidden");


    document
        .getElementById("app")
        .classList.add("hidden");

}


function showAuthChoice() {

    document
        .getElementById("authChoice")
        .classList.remove("hidden");


    document
        .getElementById("loginForm")
        .classList.add("hidden");


    document
        .getElementById("signupForm")
        .classList.add("hidden");

}


function showLogin() {

    document
        .getElementById("authChoice")
        .classList.add("hidden");


    document
        .getElementById("loginForm")
        .classList.remove("hidden");


    document
        .getElementById("signupForm")
        .classList.add("hidden");


    document
        .getElementById("loginUsername")
        .focus();

}


function showSignup() {

    document
        .getElementById("authChoice")
        .classList.add("hidden");


    document
        .getElementById("loginForm")
        .classList.add("hidden");


    document
        .getElementById("signupForm")
        .classList.remove("hidden");


    document
        .getElementById("signupUsername")
        .focus();

}


/* =====================================================
   SIGNUP
===================================================== */

function signupUser() {

    const username =
        document
            .getElementById("signupUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            .value;


    const confirmPassword =
        document
            .getElementById("signupConfirmPassword")
            .value;


    const message =
        document
            .getElementById("signupMessage");


    message.style.color =
        "#dc2626";


    if (!username || !password) {

        message.textContent =
            "Please enter username and password.";

        return;

    }


    if (password.length < 4) {

        message.textContent =
            "Password must contain at least 4 characters.";

        return;

    }


    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;

    }


    /*
       Browser-side account storage.

       This keeps the frontend working with
       your current Java server.

       Later we can connect this directly
       to users.txt through a Java endpoint.
    */

    const users =
        JSON.parse(
            localStorage.getItem(
                "bookMyTicketUsers"
            )
        ) || [];


    const existingUser =
        users.find(
            function (user) {

                return (
                    user.username.toLowerCase()
                    ===
                    username.toLowerCase()
                );

            }
        );


    if (existingUser) {

        message.textContent =
            "Username already exists.";

        return;

    }


    users.push({

        username: username,

        password: password

    });


    localStorage.setItem(
        "bookMyTicketUsers",
        JSON.stringify(users)
    );


    message.style.color =
        "#16a34a";


    message.textContent =
        "Account created successfully!";


    setTimeout(
        function () {

            showLogin();

            document
                .getElementById("loginUsername")
                .value =
                username;

        },
        700
    );

}


/* =====================================================
   LOGIN
===================================================== */

function loginUser() {

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    const message =
        document
            .getElementById("loginMessage");


    message.style.color =
        "#dc2626";


    if (!username || !password) {

        message.textContent =
            "Please enter username and password.";

        return;

    }


    const users =
        JSON.parse(
            localStorage.getItem(
                "bookMyTicketUsers"
            )
        ) || [];


    /*
       Demo account support.

       You can log in with:

       username: admin
       password: admin

       even before creating an account.
    */

    const demoLogin =
        username === "admin"
        &&
        password === "admin";


    const validUser =
        users.find(
            function (user) {

                return (
                    user.username.toLowerCase()
                    ===
                    username.toLowerCase()
                    &&
                    user.password === password
                );

            }
        );


    if (!demoLogin && !validUser) {

        message.textContent =
            "Invalid username or password.";

        return;

    }


    currentUser =
        username;


    localStorage.setItem(
        "bookMyTicketCurrentUser",
        username
    );


    showApplication();

}


/* =====================================================
   SHOW APPLICATION
===================================================== */

function showApplication() {

    document
        .getElementById("authScreen")
        .classList.add("hidden");


    document
        .getElementById("app")
        .classList.remove("hidden");


    document
        .getElementById("welcomeUser")
        .textContent =
        "Hi, " + currentUser;


    loadLocalLocations();

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    localStorage.removeItem(
        "bookMyTicketCurrentUser"
    );


    currentUser = null;


    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("authScreen")
        .classList.remove("hidden");


    showAuthChoice();

}


/* =====================================================
   GO TO SEARCH
===================================================== */

function goToSearch() {

    document
        .getElementById("search")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   SEARCH BUSES
===================================================== */

async function searchBuses() {

    const from =
        document
            .getElementById("from")
            .value
            .trim();


    const to =
        document
            .getElementById("to")
            .value
            .trim();


    const results =
        document
            .getElementById("results");


    if (!from || !to) {

        results.innerHTML = `

            <div class="bus">

                <h3>
                    ⚠️ Enter both locations
                </h3>

                <p>
                    Please enter your boarding
                    point and destination.
                </p>

            </div>

        `;

        return;

    }


    results.innerHTML = `

        <div class="bus">

            <h3>
                🔄 Searching...
            </h3>

            <p>
                Looking for available buses.
            </p>

        </div>

    `;


    try {

        /*
           Get locations from your Java server.
        */

        const response =
            await fetch(
                SERVER_URL +
                "/locations"
            );


        if (!response.ok) {

            throw new Error(
                "Server returned " +
                response.status
            );

        }


        const buses =
            await response.json();


        const serverMatches =
            buses.filter(
                function (bus) {

                    return (

                        bus.from
                            .trim()
                            .toLowerCase()
                        ===
                        from
                            .trim()
                            .toLowerCase()

                        &&

                        bus.to
                            .trim()
                            .toLowerCase()
                        ===
                        to
                            .trim()
                            .toLowerCase()

                    );

                }
            );


        /*
           Also check locations added
           through the frontend.
        */

        const localLocations =
            getLocalLocations();


        const localMatches =
            localLocations.filter(
                function (bus) {

                    return (

                        bus.from
                            .trim()
                            .toLowerCase()
                        ===
                        from
                            .trim()
                            .toLowerCase()

                        &&

                        bus.to
                            .trim()
                            .toLowerCase()
                        ===
                        to
                            .trim()
                            .toLowerCase()

                    );

                }
            );


        searchResults =
            [
                ...serverMatches,
                ...localMatches
            ];


        displayBuses(
            searchResults
        );


    }

    catch (error) {

        console.error(error);


        /*
           If the server is not available,
           still allow locally added routes.
        */

        const localLocations =
            getLocalLocations();


        const localMatches =
            localLocations.filter(
                function (bus) {

                    return (

                        bus.from
                            .toLowerCase()
                        ===
                        from.toLowerCase()

                        &&

                        bus.to
                            .toLowerCase()
                        ===
                        to.toLowerCase()

                    );

                }
            );


        if (localMatches.length > 0) {

            searchResults =
                localMatches;

            displayBuses(
                localMatches
            );

        }

        else {

            results.innerHTML = `

                <div class="bus">

                    <h3>
                        ❌ Cannot connect to Java server
                    </h3>

                    <p>
                        Make sure
                        BookMyTicketServer.java
                        is running in Eclipse.
                    </p>

                    <p>
                        Server:
                        ${SERVER_URL}
                    </p>

                </div>

            `;

        }

    }

}


/* =====================================================
   DISPLAY BUSES
===================================================== */

function displayBuses(buses) {

    const results =
        document
            .getElementById("results");


    results.innerHTML = "";


    if (buses.length === 0) {

        results.innerHTML = `

            <div class="bus">

                <h3>
                    ❌ No buses found
                </h3>

                <p>
                    No bus is available for this route.
                </p>

            </div>

        `;

        return;

    }


    buses.forEach(
        function (bus, index) {

            results.innerHTML += `

                <div class="bus">

                    <h3>
                        🚌 Bus ${escapeHTML(
                            bus.busId
                        )}
                    </h3>

                    <p>
                        <b>From:</b>
                        ${escapeHTML(bus.from)}
                    </p>

                    <p>
                        <b>To:</b>
                        ${escapeHTML(bus.to)}
                    </p>

                    <p>
                        <b>Bus Type:</b>
                        ${escapeHTML(bus.type)}
                    </p>

                    <p>
                        <b>Departure:</b>
                        ${escapeHTML(
                            bus.departure
                        )}
                    </p>

                    <p>
                        <b>Distance:</b>
                        ${escapeHTML(
                            bus.distance
                        )} KM
                    </p>

                    <p>
                        <b>Adult Fare:</b>
                        ₹${escapeHTML(
                            bus.adultFare
                        )}
                    </p>

                    <p>
                        <b>Child Fare:</b>
                        ₹${escapeHTML(
                            bus.childFare
                        )}
                    </p>

                    <br>

                    <button
                        type="button"
                        onclick="selectBus(${index})">

                        Select Bus →

                    </button>

                </div>

            `;

        }
    );

}


/* =====================================================
   SELECT BUS
===================================================== */

function selectBus(index) {

    selectedBus =
        searchResults[index];


    selectedSeats = [];


    document
        .getElementById("summaryFrom")
        .textContent =
        selectedBus.from;


    document
        .getElementById("summaryTo")
        .textContent =
        selectedBus.to;


    document
        .getElementById("summaryBus")
        .textContent =
        selectedBus.busId;


    loadBookedSeats();


    generateSeats();


    updateSummary();


    const section =
        document
            .getElementById("booking");


    section.classList.remove(
        "hidden"
    );


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   SEAT GENERATION
===================================================== */

function generateSeats() {

    const container =
        document
            .getElementById("seats");


    container.innerHTML = "";


    for (
        let i = 1;
        i <= 40;
        i++
    ) {

        const seat =
            document.createElement("div");


        seat.className =
            "seat";


        seat.textContent =
            i;


        if (
            bookedSeats.includes(i)
        ) {

            seat.classList.add(
                "booked"
            );

        }

        else {

            seat.onclick =
                function () {

                    toggleSeat(
                        i,
                        seat
                    );

                };

        }


        container.appendChild(
            seat
        );

    }

}


/* =====================================================
   SEAT SELECTION
===================================================== */

function toggleSeat(
    seatNumber,
    element
) {

    if (
        bookedSeats.includes(
            seatNumber
        )
    ) {

        return;

    }


    if (
        selectedSeats.includes(
            seatNumber
        )
    ) {

        selectedSeats =
            selectedSeats.filter(
                function (seat) {

                    return seat !== seatNumber;

                }
            );


        element.classList.remove(
            "selected"
        );

    }

    else {

        if (
            selectedSeats.length >= 5
        ) {

            alert(
                "You can select maximum 5 seats."
            );

            return;

        }


        selectedSeats.push(
            seatNumber
        );


        element.classList.add(
            "selected"
        );

    }


    updateSummary();

}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary() {

    const seats =
        document
            .getElementById("summarySeats");


    const ticketPrice =
        document
            .getElementById("ticketPrice");


    const convenienceFee =
        document
            .getElementById("convenienceFee");


    const total =
        document
            .getElementById("summaryTotal");


    if (
        selectedSeats.length === 0
    ) {

        seats.textContent =
            "-";

    }

    else {

        seats.textContent =
            selectedSeats
                .sort(
                    function (a, b) {
                        return a - b;
                    }
                )
                .join(", ");

    }


    if (!selectedBus) {

        ticketPrice.textContent =
            "0";

        convenienceFee.textContent =
            "0";

        total.textContent =
            "0";

        return;

    }


    const fare =
        Number(
            selectedBus.adultFare
        ) || 0;


    const tickets =
        fare *
        selectedSeats.length;


    const convenience =
        12 *
        selectedSeats.length;


    const finalAmount =
        tickets +
        convenience;


    ticketPrice.textContent =
        tickets;


    convenienceFee.textContent =
        convenience;


    total.textContent =
        finalAmount;

}


/* =====================================================
   CONFIRM BOOKING
===================================================== */

function confirmBooking() {

    if (!selectedBus) {

        alert(
            "Please select a bus."
        );

        return;

    }


    if (
        selectedSeats.length === 0
    ) {

        alert(
            "Please select at least one seat."
        );

        return;

    }


    /*
       Save seats locally for this frontend.

       Later this can be replaced by
       a Java /seats API endpoint.
    */

    const bookings =
        JSON.parse(
            localStorage.getItem(
                "bookMyTicketBookings"
            )
        ) || [];


    bookings.push({

        username:
            currentUser,

        busId:
            selectedBus.busId,

        from:
            selectedBus.from,

        to:
            selectedBus.to,

        seats:
            selectedSeats,

        total:
            calculateTotal(),

        date:
            new Date().toISOString()

    });


    localStorage.setItem(
        "bookMyTicketBookings",
        JSON.stringify(bookings)
    );


    showTicket();

}


/* =====================================================
   SHOW TICKET
===================================================== */

function showTicket() {

    document
        .getElementById("ticketPassenger")
        .textContent =
        currentUser;


    document
        .getElementById("ticketBus")
        .textContent =
        selectedBus.busId;


    document
        .getElementById("ticketRoute")
        .textContent =
        selectedBus.from
        +
        " → "
        +
        selectedBus.to;


    document
        .getElementById("ticketSeats")
        .textContent =
        selectedSeats.join(", ");


    document
        .getElementById("ticketTotal")
        .textContent =
        "₹" +
        calculateTotal();


    document
        .getElementById("ticketSection")
        .classList.remove(
            "hidden"
        );


    document
        .getElementById("booking")
        .classList.add(
            "hidden"
        );


    document
        .getElementById("ticketSection")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   CALCULATE TOTAL
===================================================== */

function calculateTotal() {

    if (!selectedBus) {

        return 0;

    }


    const fare =
        Number(
            selectedBus.adultFare
        ) || 0;


    const ticketPrice =
        fare *
        selectedSeats.length;


    const convenience =
        12 *
        selectedSeats.length;


    return (
        ticketPrice +
        convenience
    );

}


/* =====================================================
   BOOKED SEATS
===================================================== */

function loadBookedSeats() {

    bookedSeats = [];


    const bookings =
        JSON.parse(
            localStorage.getItem(
                "bookMyTicketBookings"
            )
        ) || [];


    bookings.forEach(
        function (booking) {

            if (
                booking.busId
                ===
                selectedBus.busId
            ) {

                bookedSeats =
                    bookedSeats.concat(
                        booking.seats
                    );

            }

        }
    );

}


/* =====================================================
   NEW BOOKING
===================================================== */

function startNewBooking() {

    selectedBus = null;

    selectedSeats = [];

    bookedSeats = [];


    document
        .getElementById("ticketSection")
        .classList.add(
            "hidden"
        );


    document
        .getElementById("from")
        .value = "";


    document
        .getElementById("to")
        .value = "";


    document
        .getElementById("results")
        .innerHTML = "";


    document
        .getElementById("search")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   ADD LOCATION MODAL
===================================================== */

function showAddLocation() {

    document
        .getElementById("addLocationModal")
        .classList.remove(
            "hidden"
        );

}


function closeAddLocation() {

    document
        .getElementById("addLocationModal")
        .classList.add(
            "hidden"
        );

}


/* =====================================================
   ADD LOCATION
===================================================== */

function addLocation() {

    const bus = {

        busId:
            document
                .getElementById("newBusId")
                .value
                .trim(),

        from:
            document
                .getElementById("newFrom")
                .value
                .trim(),

        to:
            document
                .getElementById("newTo")
                .value
                .trim(),

        type:
            document
                .getElementById("newServiceType")
                .value
                .trim(),

        departure:
            document
                .getElementById("newDeparture")
                .value
                .trim(),

        distance:
            document
                .getElementById("newDistance")
                .value
                .trim(),

        adultFare:
            document
                .getElementById("newAdultFare")
                .value
                .trim(),

        childFare:
            document
                .getElementById("newChildFare")
                .value
                .trim()

    };


    if (
        !bus.busId ||
        !bus.from ||
        !bus.to ||
        !bus.type ||
        !bus.departure ||
        !bus.distance ||
        !bus.adultFare ||
        !bus.childFare
    ) {

        alert(
            "Please fill all location fields."
        );

        return;

    }


    const locations =
        getLocalLocations();


    locations.push(bus);


    localStorage.setItem(
        "bookMyTicketLocations",
        JSON.stringify(locations)
    );


    alert(
        "Location added successfully!"
    );


    closeAddLocation();


    clearLocationForm();

}


/* =====================================================
   LOCAL LOCATIONS
===================================================== */

function getLocalLocations() {

    return JSON.parse(
        localStorage.getItem(
            "bookMyTicketLocations"
        )
    ) || [];

}


function loadLocalLocations() {

    /*
       Nothing needs to be displayed here.

       Local locations are automatically
       included when searching.
    */

}


/* =====================================================
   CLEAR LOCATION FORM
===================================================== */

function clearLocationForm() {

    const ids = [

        "newBusId",

        "newFrom",

        "newTo",

        "newServiceType",

        "newDeparture",

        "newDistance",

        "newAdultFare",

        "newChildFare"

    ];


    ids.forEach(
        function (id) {

            document
                .getElementById(id)
                .value = "";

        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
