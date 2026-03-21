import dc from './globals.js'







 export default function getHarmonyDict() {


    initCsrf()

console.log("Sending JSON:", JSON.stringify({ cd_id: 1, cd_ts: 0 }));
const token = getCSRFToken()

// const url = "http://localhost:8000/"
const url = "http://127.0.0.1:8000/"

const data = fetch(`${url}ajax-harmonies/`, {
  method: "POST",
credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": getCSRFToken()
  },


  body: JSON.stringify({  
    "harmony_dict_id" : 1
 
  })

});





console.log("fetched data: ",data)
}



