let db; 
const request = indexedDB.open("budget",1);
// new db request for a "budget" database.

request.onupgradeneeded = function(event) {
  //object store called "pending" set to autoIncrement 
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });

};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  // if error log error 
  if (err) throw err;
};

function saveRecord(record) {
  
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  // a transaction on the pending db with readwrite access
  // access pending object store
  // add record to store 
  pendingStore.add(record);
}

function checkDatabase() {
  
  const transaction = db.transaction(["pending"], "readwrite");
  // transaction on pending db
  // access pending object store
  const pendingStore = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = pendingStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
          // if successful, open a transaction on the pending db
          const transaction = db.transaction(["pending"], "readwrite");
          // access the pending object store
          const pendingStore = transaction.objectStore("pending");
          // clear all items in store
          pendingStore.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);