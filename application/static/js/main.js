const store = new Vuex.Store({
    state: {
        deck_id: 0,
        deck_name: null
    },
    mutations: {
        chngdeck(state, value) {
            state.deck_id = value;
        },
        chngname(state, value) {
            state.deck_name = value;
        }
    },
    getters: {
        get_deck_id: function (state) {
            return state.deck_id;
        },
        get_deck_name: function (state) {
            return state.deck_name;
        }
    }
})


const play = Vue.component('play', {
    template: `
<div style="height: 100%;">

<link rel="stylesheet" href="/static/css/play.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">

<div class="parent">
    <div class="div1">
        <h6 style="position: relative;transform: translate(-15%,300%);left: 50%;">Hover over card to see the answer </h6>
        <div class="flip-card">
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <div class="front-content">
                    {{currcard.front}}           
                </div>
            </div>
            <div class="flip-card-back">
                <div class = "back-content">
                    {{currcard.back}}
                </div>
            </div>
        </div>
        </div>
    </div>
    <div class="div2" :key=componentKey>
        <h3> How hard was that? </h3>
        <div class="menu">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" value = "10" v-model="selectedOption" />
                <label class="form-check-label" for="flexRadioDefault1"> Very Easy </label>
            </div>
            <br>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" value = "7.5" v-model="selectedOption" />
                <label class="form-check-label" for="flexRadioDefault2"> Easy </label>
            </div>
            <br>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" value = "5" v-model="selectedOption" />
                <label class="form-check-label" for="flexRadioDefault3"> Medium </label>
            </div>
            <br>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" value = "2.5" v-model="selectedOption" />
                <label class="form-check-label" for="flexRadioDefault4"> Hard </label>
            </div>
            <br>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault5" value = "0" v-model="selectedOption" />
                <label class="form-check-label" for="flexRadioDefault5"> Very Hard/Could Not Solve </label>
            </div>
            <br><br>
        </div>
        
        <div class="twobuttons" style="display: flex;justify-content: space-around;">
        <button class="btn btn-primary" v-on:click="Qprev" v-show="pos > 0">Previous</button>
        <button class="btn btn-primary" v-on:click="Qnext" v-show="pos < clist.length - 1">Save and Next</button>
        <button class="btn btn-primary" v-on:click="Qnext" v-show="showsave">Save</button>
        </div>
        <br><br><br><br>
        <div class = "submit button" style="display: flex;justify-content: center;">
        <button class="btn btn-primary" v-on:click="Qsubmit" >End Review</button>
        </div>
        
    </div>
</div>

</div>
        `,
    data: function () {
        return {
            clist: [],
            finaloptions: {},
            pos: 0,
            selectedOption: null,
            componentKey: 0
        }
    },
    methods: {
        Qnext: function (name) {
            if (this.selectedOption) {
                this.finaloptions[this.currcard.card_id] = parseFloat(this.selectedOption);
                this.selectedOption = null;
            }
            if(this.pos != this.clist.length-1)
            {this.pos++;}
            this.selectedOption = this.finaloptions[this.currcard.card_id];
        },

        Qprev: function (name) {
            this.pos--;
            this.selectedOption = this.finaloptions[this.currcard.card_id];
        },

        Qsubmit: function (name) {
            fetch('http://localhost:8500/api/decks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "deck_id": this.$store.getters.get_deck_id,
                    "score": this.score,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            this.$router.push({ path: '/' });
        },
        
        
    },
    computed: {
        currcard: function () {
            if (this.pos < this.clist.length) { return this.clist[this.pos]; }
            else { return this.clist[this.clist.length - 1]; }
        },

        score: function () {
            let sum = 0;
            for (const key in this.finaloptions) {
                if (this.finaloptions[key] > 0)
                    sum += this.finaloptions[key]
            }
            return sum / this.clist.length;
        },
        
        showsave: function(){
            return this.pos == this.clist.length - 1 && (this.selectedOption != this.finaloptions[this.currcard.card_id] || this.finaloptions[this.currcard.card_id] == -1)
        }
    },

    mounted: async function () {
        fetch("http://localhost:8500/api/cards" + this.$store.getters.get_deck_id + "play")
            .then(response => response.json())
            .then(data => {
                this.clist = data;

                this.finaloptions = (function () {
                    arr = {};
                    for (let i = 0; i < data.length; i++) {
                        arr[data[i].card_id] = -1;
                    }
                    return arr
                })();

            })
            .catch((error) => {
                console.error('Error:', error);
            });
    },


})








const edit = Vue.component('edit', {
    props: ["title"],
    template: `
    <div>
    
    
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
    <link href="https://cdn.datatables.net/1.12.1/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="static/css/edit.css">
    
    <div class="modal fade" id="modalLoginForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header text-center">
                    <h4 class="modal-title w-100 font-weight-bold">Edit Card</h4>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close" data-bs-dismiss="modal"></button>
                </div>
                
                <div class="modal-body ">
                    <div class="md-form ">
                        <input type="text" id="defaultFormfront" class="form-control validate"  v-model="inputfront">
                        <label data-error="wrong" data-success="right" for="defaultFormfront">Front</label>
                    </div>
                    <br>
                    <div class="md-form ">
                        <input type="text" id="defaultFormback" class="form-control validate"  v-model="inputback">
                        <label data-error="wrong" data-success="right" for="defaultFormback">Back</label>
                    </div>
                </div>
                
                
                <div class="modal-footer d-flex justify-content-center">
                    <button class="btn btn-primary" v-on:click="editcard" data-bs-dismiss="modal" type = submit>UPDATE</button>
                </div> 
            </div>
        </div>
    </div>
    
    
    
    <div class="modal fade" id="modalLoginForm2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header text-center">
                    <h4 class="modal-title w-100 font-weight-bold">Edit Deck</h4>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close" data-bs-dismiss="modal"></button>
                </div>
                
                <div class="modal-body ">
                    <div class="md-form ">
                        <input type="text" id="defaultFormdname" class="form-control validate" >
                        <label data-error="wrong" data-success="right" for="defaultFormdname">Name</label>
                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-center">
                    <button class="btn btn-primary" v-on:click="editdeckname" data-bs-dismiss="modal">UPDATE</button>
                </div> 
            </div>
        </div>
    </div>
    
    <div class="modal fade" id="modalLoginForm3" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header text-center">
                    <h4 class="modal-title w-100 font-weight-bold">Add Card</h4>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close" data-bs-dismiss="modal"></button>
                </div>
                
                <div class="modal-body ">
                    <div class="md-form ">
                        <input type="text" id="defaultFormaddfront" class="form-control validate" v-model="inputfront">
                        <label data-error="wrong" data-success="right" for="defaultFormaddfront">Front</label>
                    </div>
                    <br>
                    <div class="md-form ">
                        <input type="text" id="defaultFormaddback" class="form-control validate" v-model="inputback">
                        <label data-error="wrong" data-success="right" for="defaultFormaddback">Back</label>
                    </div>
                </div>
                
                
                <div class="modal-footer d-flex justify-content-center">
                    <button class="btn btn-primary" v-on:click="addcard" data-bs-dismiss="modal">ADD</button>
                </div> 
            </div>
        </div>
    </div>
    
    <br>
    <div class="profile-pic">
    <h1 style="text-align: center">{{d_name}}</h1>
    <div class="edit" data-bs-toggle="modal" data-bs-target="#modalLoginForm2">
        <div>    
        <i class="bi bi-pencil-square"></i>
        </div>
    </div>
    </div>
    
    <div style="overflow:hidden;">
    <table id="cardstable" class="table table-striped" style="width:100%;">
        <thead>
            <tr>
                <th style="text-align:center">Sr. No.</th>
                <th style="text-align:center">Front</th>
                <th style="text-align:center">Back</th>
                <th style="text-align:center">Options</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(card, index) in clist" :key="card.front">
                <td style="text-align:center">{{index + 1}}</td>
                <td style="text-align:center">{{card.front}}</td>
                <td style="text-align:center">{{card.back}}</td>
                <td>
                    <div style="display: flex; justify-content: space-evenly">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalLoginForm" v-on:click="updatecurrcard(card)">Edit</button>
                        <button class="btn btn-danger" v-on:click="deletecard(card.card_id)">Delete</button>
                    </div>
                </td>
            </tr>
        </tbody>
        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modalLoginForm3" v-on:click="updatecurrcard()"><i class="bi bi-plus-circle"></i>ADD</button>
    </table>
    </div>
    
    
    </div>
        `,
    data: function () {
        return {
            clist: [],
            selectedcard: {},
            inputfront: null,
            inputback: null,
            allowed: true
        }
    },
    methods: {

        updatecurrcard: function (card) {
            if (!card) { this.selectedcard = {} }
            else { this.selectedcard = card; }
            if (this.selectedcard) {
                this.inputfront = this.selectedcard.front;
                this.inputback = this.selectedcard.back;
            }
            else {
                this.inputfront = null,
                    this.inputback = null
            }
        },

        editcard: function () {
            let filtered = this.clist.filter(data => data.card_id != this.selectedcard.card_id);
            for (let i = 0; i < filtered.length; i++) {
                if (filtered[i].front == this.inputfront) {
                    this.allowed = false;
                    break;
                }
            }



            if (this.allowed) {
                fetch('http://localhost:8500/api/cards' + this.$store.getters.get_deck_id, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "front": this.inputfront,
                        "back": this.inputback,
                        "c_id": this.selectedcard.card_id
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);

                        for (i = 0; i < this.clist.length; i++) {
                            if (this.clist[i].card_id == data.id) {
                                this.clist[i].front = data.front;
                                this.clist[i].back = data.back;
                            }
                        };

                        this.selectedOption = {};
                        this.inputfront = null;
                        this.inputback = null;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            else {
                window.alert("Card already exists!");
                $('#modalLoginForm').modal('show');
            }
        },

        deletecard: function (cid) {

            fetch('http://localhost:8500/api/cards' + this.$store.getters.get_deck_id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "id": cid
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    this.clist = this.clist.filter(data => data.card_id != cid);
                    this.selectedcard = {}
                    this.inputfront = null;
                    this.inputback = null;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },

        addcard: function (cid) {
            for (let i = 0; i < this.clist.length; i++) {
                if (this.clist[i].front == this.inputfront) {
                    this.allowed = false;
                    break;
                }
            }
            if (this.allowed) {
                fetch('http://localhost:8500/api/cards' + this.$store.getters.get_deck_id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "front": this.inputfront,
                        "back": this.inputback,
                        "deck_id": this.$store.getters.get_deck_id
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        this.clist.push({
                            "front": this.inputfront,
                            "back": this.inputback,
                            "card_id": data.id,
                            "deck_id": this.$store.getters.get_deck_id
                        });
                        this.inputfront = null;
                        this.inputback = null;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            else {
                window.alert("Card already exists!");
                $('#modalLoginForm3').modal('show');
            }
        },

        editdeckname: function (cid) {
            let newname = document.getElementById("defaultFormdname").value;
            document.getElementById("defaultFormdname").value = ""
            fetch('http://localhost:8500/api/decks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "deck_id": this.$store.getters.get_deck_id,
                    "name": newname
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    this.$store.commit('chngname', data.name);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
    },

    computed: {
        d_name: function () {
            return this.$store.getters.get_deck_name;
        },


    },

    mounted:
        function () {


            fetch("http://localhost:8500/api/cards" + this.$store.getters.get_deck_id)
                .then(response => response.json())
                .then(data => {
                    this.clist = data;

                    $(document).ready(function () {
                        $('#cardstable').DataTable({
                            language: {
                                "zeroRecords": " "
                            },
                            info: false,
                            paging: false,
                            "columnDefs": [

                                { "width": "20%", "targets": 0 },
                                { "width": "30%", "targets": 1 },
                                { "width": "30%", "targets": 2 },
                                { "width": "18%", "targets": 3 }
                            ]
                        });
                    });


                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
})










const decklist = Vue.component('deck-list', {
    props: ["title"],
    template: `
    <div>
    
    
    <link rel="stylesheet" href="/static/css/deckcard.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
    <br>
    
    <div class="modal fade" id="modalLoginForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header text-center">
                    <h4 class="modal-title w-100 font-weight-bold">New Deck</h4>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close" data-bs-dismiss="modal"></button>
                </div>
                
                
                <div class="modal-body ">
                    <div class="md-form ">
                        <input type="text" id="defaultForm-back" class="form-control validate">
                        <label data-error="wrong" data-success="right" for="defaultForm-back">Deck Name</label>
                    </div>
                </div>
                
                
                <div class="modal-footer d-flex justify-content-center">
                    <button class="btn btn-primary" v-on:click="adddeck" data-bs-dismiss="modal">ADD</button>
                </div> 
            </div>
        </div>
    </div>

    
    
    
    
    <div class="topBar">
      <h1>Decks:</h1>
      <button class="btn btn-primary btn-rounded mb-4" data-bs-toggle="modal" data-bs-target="#modalLoginForm">ADD
        DECK</button>
    </div>
    
    
    
    <div class="parent" >
      <div v-for="deck in dlist" :key="deck.id">
        <section>
          <div class="cardcontainer">
            <div class="card">
              <div class="content">
                <div class="imgBx">
                  <router-link to="/play"><img src="/static/images/favicon.png" v-on:click="updateglobaldeckid(deck.id, deck.deck_name)">
                  </router-link>
                </div>
                <div class="contentBx">
                  <h3>
                    {{deck["deck_name"]}}<br>
                    <span>Score: {{deck["score"]}}
                    </span><br>
                    <span>Last reviewed: {{deck["last_rev"]}}</span>
                  </h3>
                </div>
              </div>
              <ul class="sci">
                <li>
                  <router-link to="/edit"><button type="button" class="btn btn-primary btn-sm" v-on:click="updateglobaldeckid(deck.id, deck.deck_name)">
                  View/Edit</button>
                  </router-link>
                </li>
                <li>
                  <button type="button" class="btn btn-outline-success btn-sm" v-on:click="exportdeck(deck.id)">Export</button>
                </li>
                <li>
                  <button type="button" class="btn btn-danger btn-sm" v-on:click="deletedeck(deck.id)">Delete</button>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    
    
</div>
        `,
    data: function () {
        return {
            dlist: [],
        }
    },
    methods: {
        exportdeck:async function(d_id){
            // fetch('http://localhost:8500/api/export' + d_id)
            window.open('/api/export' + d_id);
        },
        
        updateglobaldeckid: function (d_id, d_name) {

            this.$store.commit('chngdeck', d_id);
            this.$store.commit('chngname', d_name);

        },

        adddeck: async function (name) {
            let d_name = document.getElementById("defaultForm-back").value;
            document.getElementById("defaultForm-back").value = ""
            console.log(d_name);
            fetch('http://localhost:8500/api/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "deck_name": d_name
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    this.dlist.push({
                        "id": data.id,
                        "deck_name": d_name,
                        "user_id": data.user_id,
                        "score": null,
                        "last_rev": null
                    });

                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        },

        deletedeck: async function (d_id) {
            window.alert("Are you sure you want to delete this deck?")
            fetch('http://localhost:8500/api/decks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "id": d_id
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    this.dlist = this.dlist.filter(data => data.id != d_id);

                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        },

    },
    computed: {

    },

    mounted: async function () {
        r = await fetch("http://localhost:8500/api/decks")
        this.dlist = await r.json()

    },

})










const routes = [{
    path: '/',
    component: decklist,
    name: 'decklist'
}, {
    path: '/play',
    component: play,
    name: 'play'
}, {
    path: '/edit',
    component: edit,
    name: 'edit'
}];


const router = new VueRouter({
    routes
})

var app = new Vue({
    el: '#app',
    router: router,
    store: store,
    data: {
        search_bar: null,
    },
    methods: {
        add_grand_total: function () {
            console.log("in grand_total");
            this.grand_total = this.grand_total + 1;
        }
    }
})