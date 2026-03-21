import jQuery from 'jquery';
/* 
only one tuning loaded at a time 
for tuning, as only one object loaded, it is not more efficient to check the timestamp in localstorage
for persistence, the tuning id is stored in cookie*/

$(document).ready(function(){


class Tuning {
constructor() {

        this.active_tuning_id;
        this.dict;
    }
init() {
    this.load_tuning()
        
    }
get name (){
    return this.dict.name
    }
    
get notes() {
return this.dict.notes   
}
get numberOfStrings() {
    return length(this.notes)
}

/* first check in the local storage */
load_tuning() {
    let self = this;
    const baseURL = window.location.protocol + "//" + window.location.host;
    const myURL = baseURL + "/ajax-tuning/";
    $.post(myURL,
        {
            csrfmiddlewaretoken: dc.CSRF_TOKEN,
        }) // .post
        .done(function (response, status) {

            //const cd_json = JSON.parse( response['data'] )
            if (response.status === "OK") { 

                self.dict = response.tuning
                $("#tuning-name").text(self.name)
                $("#tuning-notes").text(self.notes)
              //  $(".my-fretboard-js").trigger('dropchords:chords-loaded');
            }
         }) // .done

        .fail(function (xhr, status, error) {
            console.log("-------- fail get chord data': " + status + " " + error + " " + xhr.status + " " + xhr.statusText + "----------");
        }); // load activity bar .fail

    }



} // class tuning 



dc.TUNING = new Tuning().init()


}) // document.ready