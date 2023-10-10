/// LICENCE -----------------------------------------------------------------------------
//
// Copyright 2018 - Cédric Batailler
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// OVERVIEW -----------------------------------------------------------------------------
//
// TODO:
// 
// dirty hack to lock scrolling ---------------------------------------------------------
// note that jquery needs to be loaded.
/*
$('body').css({ 'overflow': 'hidden' });
$(document).bind('scroll', function () {
  window.scrollTo(0, 0);
});
*/
// safari & ie exclusion ----------------------------------------------------------------
var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var is_ie = /*@cc_on!@*/false || !!document.documentMode;

var is_compatible = !(is_safari || is_ie);


if (!is_compatible) {

  var safari_exclusion = {
    type: "html-keyboard-response",
    stimulus:
      "<p>Sorry, this study is not compatible with your browser.</p>" +
      "<p>Please try again with a compatible browser (e.g., Chrome or Firefox).</p>",
    choices: jsPsych.NO_KEYS
  };

  var timeline_safari = [];

  timeline_safari.push(safari_exclusion);
  jsPsych.init({ timeline: timeline_safari });

}

// firebase initialization ---------------------------------------------------------------
var firebase_config = {
  apiKey: "AIzaSyBwDr8n-RNCbBOk1lKIxw7AFgslXGcnQzM",
  databaseURL: "https://postdocgent.firebaseio.com/"
};

firebase.initializeApp(firebase_config);
var database = firebase.database();

// id variables
var prolificID = jsPsych.data.getURLVariable("prolificID");
if(prolificID == null) {prolificID = "999";}

var id = jsPsych.randomization.randomID(15)

// Preload images
var preloadimages = [];

// connection status ---------------------------------------------------------------------
// This section ensure that we don't lose data. Anytime the 
// client is disconnected, an alert appears onscreen
var connectedRef = firebase.database().ref(".info/connected");
var connection = firebase.database().ref("VAAST_AAT3_sensory/" + id + "/")
var dialog = undefined;
var first_connection = true;

connectedRef.on("value", function (snap) {
  if (snap.val() === true) {
    connection
      .push()
      .set({
        status: "connection",
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })

    connection
      .push()
      .onDisconnect()
      .set({
        status: "disconnection",
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })

    if (!first_connection) {
      dialog.modal('hide');
    }
    first_connection = false;
  } else {
    if (!first_connection) {
      dialog = bootbox.dialog({
        title: 'Connection lost',
        message: '<p><i class="fa fa-spin fa-spinner"></i> Please wait while we try to reconnect.</p>',
        closeButton: false
      });
    }
  }
});

// counter variables
var vaast_trial_n = 1;
var browser_events_n = 1;

// Variable input -----------------------------------------------------------------------
// Variable used to define experimental condition : approached color and group associated with the color

// Instruction vs. instruction+sensory conditions
var training_cond = jsPsych.data.getURLVariable("training_cond");
if(training_cond == null) {training_cond = jsPsych.randomization.sampleWithoutReplacement(["cont_instr_vis_G1Y", "cont_instr_vis_G1B"], 1)[0];}

// for the AAT, randomization of which group is approached and which is avoided
var approached_grp = jsPsych.randomization.sampleWithoutReplacement(["approach_blue", "approach_yellow"], 1)[0];

// cursor helper functions
var hide_cursor = function () {
  document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="cursor-toggle"> html { cursor: none; } </style>');
}
var show_cursor = function () {
  document.querySelector('#cursor-toggle').remove();
}

var hiding_cursor = {
  type: 'call-function',
  func: hide_cursor
}

var showing_cursor = {
  type: 'call-function',
  func: show_cursor
}

// Preload faces
var faces = [
      "stimuli/Face19_B.png",
      "stimuli/Face28_B.png",
      "stimuli/Face55_B.png",
      "stimuli/Face95_B.png",
      "stimuli/Face104_B.png",
      "stimuli/Face115_B.png",
      "stimuli/Face119_B.png",
      "stimuli/Face142_B.png",
      "stimuli/Face10_J.png",
      "stimuli/Face16_J.png",
      "stimuli/Face17_J.png",
      "stimuli/Face45_J.png",
      "stimuli/Face85_J.png",
      "stimuli/Face103_J.png",
      "stimuli/Face116_J.png",
      "stimuli/Face132_J.png",
      "stimuli/Face19_J.png",
      "stimuli/Face28_J.png",
      "stimuli/Face55_J.png",
      "stimuli/Face95_J.png",
      "stimuli/Face104_J.png",
      "stimuli/Face115_J.png",
      "stimuli/Face119_J.png",
      "stimuli/Face142_J.png",
      "stimuli/Face10_B.png",
      "stimuli/Face16_B.png",
      "stimuli/Face17_B.png",
      "stimuli/Face45_B.png",
      "stimuli/Face85_B.png",
      "stimuli/Face103_B.png",
      "stimuli/Face116_B.png",
];


preloadimages.push(faces);

// VAAST --------------------------------------------------------------------------------
// VAAST variables ----------------------------------------------------------------------

var group_to_approach = undefined;
var group_to_avoid    = undefined;

switch (training_cond) {
  case "cont_instr_vis_G1Y":
    {if (approached_grp == "approach_blue"){
    group_to_approach = "<span style='color:#2a57ea'><b>BLUE</b></span>";
    group_to_avoid    = "<span style='color:#b5a21b'><b>YELLOW</b></span>";
    } else if (approached_grp == "approach_yellow"){
    group_to_approach = "<span style='color:#b5a21b'><b>YELLOW</b></span>";
    group_to_avoid    = "<span style='color:#2a57ea'><b>BLUE</b></span>";
    }};
    break;
  case "cont_instr_vis_G1B":
    {if (approached_grp == "approach_blue"){
    group_to_approach = "<span style='color:#2a57ea'><b>BLUE</b></span>";
    group_to_avoid    = "<span style='color:#b5a21b'><b>YELLOW</b></span>";
    } else if (approached_grp == "approach_yellow"){
    group_to_approach = "<span style='color:#b5a21b'><b>YELLOW</b></span>";
    group_to_avoid    = "<span style='color:#2a57ea'><b>BLUE</b></span>";
    }};
    break;
}

// VAAST stimuli ------------------------------------------------------------------------
// vaast image stimuli ------------------------------------------------------------------

// random selection so that in the approach and avoidance groups there are  50/50 of group 1 and group 2 faces

  var group1 = [
  "stimuli_AA/Face19.png", 
  "stimuli_AA/Face28.png",
  "stimuli_AA/Face55.png",
  "stimuli_AA/Face95.png",
  "stimuli_AA/Face104.png",
  "stimuli_AA/Face115.png",
  "stimuli_AA/Face119.png",
  "stimuli_AA/Face142.png"
  ];

  var group2 = [
  "stimuli_AA/Face10.png", 
  "stimuli_AA/Face16.png",
  "stimuli_AA/Face17.png",
  "stimuli_AA/Face45.png",
  "stimuli_AA/Face85.png",
  "stimuli_AA/Face103.png",
  "stimuli_AA/Face116.png",
  "stimuli_AA/Face132.png"
  ];

  preloadimages.push(group1);
  preloadimages.push(group2);

  group1 = _.shuffle(group1);
  group2 = _.shuffle(group2);

  var Selection_app_gp1 = ([group1[0],group1[1],group1[2], group1[3]]);
  var Selection_app_gp2 = ([group2[0],group2[1],group2[2], group2[3]]);
  var Selection_av_gp1 = ([group1[4],group1[5],group1[6], group1[7]]);
  var Selection_av_gp2 = ([group2[4],group2[5],group2[6], group2[7]]);

  var app_list = _.flattenDeep([Selection_app_gp1, Selection_app_gp2]);
  var av_list = _.flattenDeep([Selection_av_gp1, Selection_av_gp2]);

  var vaast_stim_training = [
  {movement: "approach",  prime: "approach",  stimulus: app_list[0]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[1]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[2]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[3]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[4]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[5]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[6]},
  {movement: "approach",  prime: "approach",  stimulus: app_list[7]},

  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[0]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[1]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[2]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[3]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[4]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[5]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[6]},
  {movement: "avoidance",  prime: "avoid",  stimulus: av_list[7]},
  ]


// vaast background images --------------------------------------------------------------,

var background = [
  "background/1.jpg",
  "background/2.jpg",
  "background/3.jpg",
  "background/4.jpg",
  "background/5.jpg",
  "background/6.jpg",
  "background/7.jpg"
];

// vaast stimuli sizes -------------------------------------------------------------------

var stim_sizes = [
  34,
  38,
  42,
  46,
  52,
  60,
  70
];

var resize_factor = 7;
var image_sizes = stim_sizes.map(function (x) { return x * resize_factor; });

// Helper functions ---------------------------------------------------------------------
// next_position():
// Compute next position as function of current position and correct movement. Because
// participant have to press the correct response key, it always shows the correct
// position.
var next_position_training = function () {
  var current_position = jsPsych.data.getLastTrialData().values()[0].position;
  var current_movement = jsPsych.data.getLastTrialData().values()[0].movement;
  var position = current_position;

  if (current_movement == "approach") {
    position = position + 1;
  }

  if (current_movement == "avoidance") {
    position = position - 1;
  }

  return (position)
}

// Saving blocks ------------------------------------------------------------------------
// Every function here send the data to keen.io. Because data sent is different according
// to trial type, there are differents function definition.

// init ---------------------------------------------------------------------------------
var saving_id = function () {
  database
    .ref("participant_id_AAT3_Ghent/")
    .push()
    .set({
      id: id,
      prolificID: prolificID,
      training_cond : training_cond,
      approached_grp : approached_grp,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    })
}

// vaast trial --------------------------------------------------------------------------
var saving_vaast_trial = function () {
  database
    .ref("vaast_trial_AAT3_Ghent/").
    push()
    .set({
      id: id,
      prolificID: prolificID,
      training_cond : training_cond, 
      approached_grp : approached_grp,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      vaast_trial_data: jsPsych.data.get().last(4).json()
    })
}


// demographic logging ------------------------------------------------------------------

var saving_browser_events = function (completion) {
  database
    .ref("browser_event_AAT3_Ghent/")
    .push()
    .set({
      id: id,
      prolificID: prolificID,
      training_cond : training_cond,
      approached_grp : approached_grp,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      completion: completion,
      event_data: jsPsych.data.getInteractionData().json()
    })
}


// saving blocks ------------------------------------------------------------------------
var save_id = {
  type: 'call-function',
  func: saving_id
}

var save_vaast_trial = {
  type: 'call-function',
  func: saving_vaast_trial
}

// EXPERIMENT ---------------------------------------------------------------------------
// Consent --------------------------------------------------------------
  var check_consent = function(elem) {
    if (document.getElementById('info').checked 
      & document.getElementById('volunt').checked 
      & document.getElementById('anony').checked 
      & document.getElementById('end').checked 
      & document.getElementById('consqc').checked 
      & document.getElementById('summ').checked 
      & document.getElementById('participate').checked ) {
      return true;
    }
    else {
      alert("If you wish to participate, you must check all the boxes.");
      return false;
    }
    return false;
  };


  var consent = {
    type:'external-html',
    url: "https://marinerougier.github.io/Ugent_1/external_page_consent.html",
    cont_btn: "start",
    check_fn: check_consent,
        on_load: function() {
          window.scrollTo(0, 0)
        },
  };

// Switching to fullscreen --------------------------------------------------------------
var fullscreen_trial = {
  type: 'fullscreen',
  message: 'To start the study, please switch to fullscreen </br></br>',
  button_label: 'Switch to fullscreen',
  fullscreen_mode: true
}


// VAAST --------------------------------------------------------------------------------

var Gene_Instr = {
  type: "html-keyboard-response",
  stimulus:
    "<h1 class ='custom-title'> Study on face categorization</h1>" +
    "<br>" +
    "<p class='instructions'><center> In this study, we are interested in the way people categorize " +
    "others as a function of their face. <br>You will " +
    "perform several tasks and answer a few questions. </p></center>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

// vaast cond instructions

var vaast_instructions_1 = {
  type: "html-keyboard-response",
  stimulus:
    "<h1 class ='custom-title'>Video Game task</h1>" +
    "<p class='instructions'>This task is much like a video game. You will be " +
    "in a virtual environment (displayed below) in which you will be able to move forward or to move backward. </p>" +
    "<br>" +
    "<img src = 'media/vaast-background.png'>" +
    "<br><br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_instructions_2_G1Y = {
  type: "html-keyboard-response",
  stimulus:
    "<h1 class ='custom-title'>Video Game task</h1>" +
    "<center><p class='instructions'>Two groups of faces will be displayed in this environment. <br></p>" +
    "<center><p class='instructions'> Faces of the <b><span style='color:#2a57ea'><b>BLUE</b></span> group:</b></p>" +
    "<img src = 'stimuli/Face19_B.png'>" +
    "<img src = 'stimuli/Face28_B.png'>" +
    "<img src = 'stimuli/Face55_B.png'>" +
    "<img src = 'stimuli/Face95_B.png'>" +
    "<img src = 'stimuli/Face104_B.png'>" +
    "<img src = 'stimuli/Face115_B.png'>" +
    "<img src = 'stimuli/Face119_B.png'>" +
    "<img src = 'stimuli/Face142_B.png'><br><br>" +
    "                              " +
    "<center><p class='instructions'> Faces of the <b><span style='color:#b5a21b'><b>YELLOW</b></span> group:</b></p>" +
    "<img src = 'stimuli/Face10_J.png'>" +
    "<img src = 'stimuli/Face16_J.png'>" +
    "<img src = 'stimuli/Face17_J.png'>" +
    "<img src = 'stimuli/Face45_J.png'>" +
    "<img src = 'stimuli/Face85_J.png'>" +
    "<img src = 'stimuli/Face103_J.png'>" +
    "<img src = 'stimuli/Face116_J.png'>" +
    "<img src = 'stimuli/Face132_J.png'>" +
    "<br>" +
    "<br>" +
    "<p class='instructions'><b>Please, take a few moments to look at the faces. </b><br><br>"+
    "Your task will be to <b>approach (by moving forward) one group and to avoid (by moving backward) the other group.</b> " +
    "<u>More specific instructions will follow</u>. <br><br></p></center>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_instructions_2_G1B = {
  type: "html-keyboard-response",
  stimulus:
    "<h1 class ='custom-title'>Video Game task</h1>" +
    "<center><p class='instructions'>Two groups of faces will be displayed in this environment. <br></p>" +
    "<center><p class='instructions'> Faces of the <b><span style='color:#b5a21b'><b>YELLOW</b></span> group:</b></p>" +
    "<center><img src = 'stimuli/Face19_J.png'>" +
    "<img src = 'stimuli/Face28_J.png'>" +
    "<img src = 'stimuli/Face55_J.png'>" +
    "<img src = 'stimuli/Face95_J.png'>" +
    "<img src = 'stimuli/Face104_J.png'>" +
    "<img src = 'stimuli/Face115_J.png'>" +
    "<img src = 'stimuli/Face119_J.png'>" +
    "<img src = 'stimuli/Face142_J.png'><br><br>" +
    "                              " +
    "<center><p class='instructions'> Faces of the <b><span style='color:#2a57ea'><b>BLUE</b></span> group:</b></p>" +
    "<img src = 'stimuli/Face10_B.png'>" +
    "<img src = 'stimuli/Face16_B.png'>" +
    "<img src = 'stimuli/Face17_B.png'>" +
    "<img src = 'stimuli/Face45_B.png'>" +
    "<img src = 'stimuli/Face85_B.png'>" +
    "<img src = 'stimuli/Face103_B.png'>" +
    "<img src = 'stimuli/Face116_B.png'>" +
    "<img src = 'stimuli/Face132_B.png'></center>" +
    "<br>" +
    "<br>" +
    "<p class='instructions'><b>Please, take a few moments to look at the faces. </b><br><br>"+
    "Your task will be to <b>approach (by moving forward) one group and to avoid (by moving backward) the other group.</b> " +
    "<u>More specific instructions will follow</u>. <br><br></p></center>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};


var vaast_instructions_3 = {
  type: "html-keyboard-response",
  stimulus:
    "<h1 class ='custom-title'>Video Game task</h1>" +
    "<p class='instructions'>You will use the following keys of your keyboard:" +
    "<br>" +
    "<br>" +
    "<center><img src = 'media/keyboard-vaastt.png'></center>" +
    "<br>" +
    "<p class='instructions'>The 'O' symbol that will be presented at the beginning of each trial indicates that you should press the START key (namely, the <b>D key</b>). </p>" +
    "<p class='instructions'>Then, you will see a fixation cross '+' followed by the 'approach' or the 'avoid' word. "+
    "After the word, a face will appear. If you saw the word 'approach' your should press the MOVE FORWARD key (namely, the <b>E key</b>) to approach the face "+
    "and if you saw the word 'avoid' you should press the MOVE BACKWARD key (namely, the <b>C key</b>) to avoid the face. "+
    "<p class='instructions'>You will need to press the keys <b><u>three times</b></u> for a complete approach or avoidance movement. After the key presses, the face will disappear and you should " +
    "press again the START key (D key). " +
    "<p class='instructions'><b>Please <u>use only the index finger</u> of your favorite hand for all these actions. </b></p>" +
    "<p class='instructions'><strong>Also, note that is it EXTREMELY IMPORTANT that you try to be as fast and accurate as you can. </strong>" +
    "A red cross will appear if your response is incorrect. </p>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_instructions_4 = {
  type: "html-keyboard-response",
  stimulus:
   "<h1 class ='custom-title'>Video Game task</h1>" +
    "<p class='instructions'>Before you begin, note that <b>we blurred the faces you previously saw and we removed the background color "+
    "to make the task more challenging.</b><br><br> "+ 
    "However, you should know that: </p>" +
    "<ul class='instructions'>" +
    "<li><strong>Faces you will approach are always those of the " + group_to_approach + " group</strong></li>" +
    "<br>" +
    "<li><strong>Faces you will avoid are always those of the " + group_to_avoid + " group</strong></li>" +
    "</ul>" +
    "<p class='instructions'>Read carefully and make sure that you memorize the instructions above. </p>" +
    "<br>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_remember_instr_1 = {
  type: "html-keyboard-response",
  stimulus:
   "<h1 class ='custom-title'>Video Game task</h1>" +
	"<p class='instructions'>You just completed 1/3 of the task. Please, keep in mind that:</b><br><br></p>" +
    "<ul class='instructions'>" +
    "<li><strong>Faces you are approaching are those of the " + group_to_approach + " group</strong></li>" +
    "<br>" +
    "<li><strong>Faces you are avoiding are those of the " + group_to_avoid + " group</strong></li>" +
    "</ul>" +
    "<br>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_remember_instr_2 = {
  type: "html-keyboard-response",
  stimulus:
   "<h1 class ='custom-title'>Video Game task</h1>" +
	"<p class='instructions'>You just completed 2/3 of the task. Please, keep in mind that:</b><br><br></p>" +
    "<ul class='instructions'>" +
    "<li><strong>Faces you are approaching are those of the " + group_to_approach + " group</strong></li>" +
    "<br>" +
    "<li><strong>Faces you are avoiding are those of the " + group_to_avoid + " group</strong></li>" +
    "</ul>" +
    "<br>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

var vaast_instructions_5 = {
  type: "html-keyboard-response",
  stimulus:
    "<p class='instructions'><center>The Video Game task is now over.</center></b></p>" +
    "Again, remember that: </p><br>" +
    "<ul class='instructions'>" +
    "<li><strong>Faces you approached were always those of the " + group_to_approach + " group</strong></li>" +
    "<br>" +
    "<li><strong>Faces you avoided were always those of the " + group_to_avoid + " group</strong></li>" +
    "</ul>" +
    "<br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to" +
    " continue.</p>",
  choices: [32]
};

// Creating a trial for the VAAST  ---------------------------------------------------------------------
var vaast_start = {
  type: 'vaast-text',
  stimulus: "o",
  position: 3,
  background_images: background,
  font_sizes:  stim_sizes,
  approach_key: "d",
  stim_movement: "approach",
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: true,
  display_feedback: true,
  response_ends_trial: true
}

var vaast_fixation = {
  type: 'vaast-fixation',
  fixation: "+",
  font_size:  46,
  position: 3,
  background_images: background
}

var vaast_prime = {
  type: 'vaast-text',
  stimulus: "prime",
  stimulus: jsPsych.timelineVariable('prime'),
  position: 3,
  background_images: background,
  font_sizes:  stim_sizes,
  //stim_movement: jsPsych.timelineVariable('movement'),
  response_ends_trial: false,
  trial_duration: 200
}

var vaast_blank = {
  type: 'vaast-text',
  stimulus: " ",
  stimulus: jsPsych.timelineVariable('prime'),
  position: 3,
  background_images: background,
  font_sizes:  stim_sizes,
  //stim_movement: jsPsych.timelineVariable('movement'),
  response_ends_trial: false,
  trial_duration: 100
}

var vaast_first_step_training_1 = {
  type: 'vaast-image',
  stimulus: jsPsych.timelineVariable('stimulus'),
  position: 3,
  background_images: background,
  font_sizes:  image_sizes,
  approach_key: "e",
  avoidance_key: "c",
  stim_movement: jsPsych.timelineVariable('movement'),
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: false,
  display_feedback: true,
  feedback_duration: 500, 
  response_ends_trial: true
}

var vaast_second_step_1 = {
  type: 'vaast-image',
  stimulus: jsPsych.timelineVariable('stimulus'),
  position: next_position_training,
  background_images: background,
  font_sizes:  image_sizes,
  approach_key: "e",
  avoidance_key: "c",
  stim_movement: jsPsych.timelineVariable('movement'),
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: false,
  display_feedback: true,
  feedback_duration: 500, 
  response_ends_trial: true
}

var vaast_second_step_training_1 = {
  chunk_type: "if",
  timeline: [vaast_second_step_1],
  conditional_function: function(){
    var data = jsPsych.data.getLastTrialData().values()[0];
    return data.correct;
  }
}

var vaast_third_step_1 = {
  type: 'vaast-image',
  stimulus: jsPsych.timelineVariable('stimulus'),
  position: next_position_training,
  background_images: background,
  font_sizes:  image_sizes,
  approach_key: "e",
  avoidance_key: "c",
  stim_movement: jsPsych.timelineVariable('movement'),
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: false,
  display_feedback: true,
  feedback_duration: 500, 
  response_ends_trial: true
}

var vaast_third_step_training_1 = {
  chunk_type: "if",
  timeline: [vaast_third_step_1],
  conditional_function: function(){
    var data = jsPsych.data.getLastTrialData().values()[0];
    return data.correct;
  }
}

var vaast_fourth_step_1 = {
  type: 'vaast-image',
  position: next_position_training,
  stimulus: jsPsych.timelineVariable('stimulus'),
  background_images: background,
  font_sizes:  image_sizes,
  stim_movement: jsPsych.timelineVariable('movement'),
  response_ends_trial: false,
  trial_duration: 650
}

var vaast_fourth_step_training_1 = {
  chunk_type: "if",
  timeline: [vaast_fourth_step_1],
  conditional_function: function(){
    var data = jsPsych.data.getLastTrialData().values()[0];
    return data.correct;
  }
}

// VAAST training block -----------------------------------------------------------------
var vaast_training = {
  timeline: [
    vaast_start,
    vaast_fixation,
    vaast_prime,
    vaast_blank,
    vaast_first_step_training_1,
    vaast_second_step_training_1,
    vaast_third_step_training_1,
    vaast_fourth_step_training_1,
    save_vaast_trial
  ],
  timeline_variables: vaast_stim_training,
  repetitions: 1, //6
  randomize_order: true,
  data: {
    phase: "training",
    prime: jsPsych.timelineVariable('prime'),
    stimulus: jsPsych.timelineVariable('stimulus'),
    movement: jsPsych.timelineVariable('movement'),
  }
};

// Final questions -----------------------------------------------------------------------

// Liking/positivity
	var likertPreamble = '<p class = "justify"><br><br>Please indicate your degree of (dis)agreement with the statements listed below. ' +
        'To do so, use the following scale: ' +
        'from 1 = “Totally disagree” to 7 = “Totally agree”</p>';

    var likertScale = ["1</br>Totally disagree", "2", "3", "4", "5", "6", "7</br>Totally agree"];


    var likingGrpItems = [
        'I like the ' + group_to_approach + ' group.',
        'I like the ' + group_to_avoid + ' group.',
        'Please answer 4 to this statement.',
        'The ' + group_to_approach + ' group is positive.',
        'The ' + group_to_avoid + ' group is positive.',
    ];

    var questionsLikingGrp = [];
    likingGrpItems.map(function (item) { questionsLikingGrp.push({ prompt: '<i>' + item + '</i>', labels: likertScale, required: true }); });

    var likingGrp = {
        type: 'survey-likert',
        preamble: likertPreamble,
        questions: questionsLikingGrp,
        post_trial_gap: 300,
        on_load: function () {
            $(".jspsych-content-wrapper").css("height", "700px");
            $(".jspsych-content-wrapper").css("width", "700px");
            $(".jspsych-content-wrapper").scrollTop(0);
        },
        on_finish: function (data) {
            $(".jspsych-content-wrapper").css("height", "700px");
            var parsed_response = JSON.parse(data.responses);
            jsPsych.data.addProperties({
                likingApproached1: parsed_response.Q0,
                likingAvoided1: parsed_response.Q1,
                AttentionCheck: parsed_response.Q2,
                likingApproached2: parsed_response.Q3,
                likingAvoided2: parsed_response.Q4,
            });
        },
    };


// Memory of instructions
   var appGrpOptions = ['approach blue-background and avoid yellow-background faces&nbsp', 'approach yellow-background and avoid blue-background faces&nbsp', 'I do not remember&nbsp'];
    var reportedAppGrp = {
        type: 'survey-multi-choice',
        questions: [{ prompt: "Please indicate which group you approached and avoided in the Video Game task: (if you do not remember, select the 'I do not remember' option)", options: appGrpOptions, required: true }],
        button_label: "continue",
        on_finish: function (data) {
            jsPsych.data.addProperties({
                reportedAppGrp: JSON.parse(data.responses).Q0,
            });
            console.log(data);
        },
    };

// Believability of contingencies

    var believeScale = ["0%</br>Not certain at all", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%</br>Absolutely certain"];
    
    var believeConting = {
      type: 'survey-likert',
      questions: [
        {prompt: "How certain are you (from 0% = not certain at all to 100% = absolutely certain) that you approached the " + group_to_approach + " group and that you avoided the " + group_to_avoid + " group? <br><br>", name: 'believabilityconting', labels: believeScale},
      ],
      post_trial_gap: 300,
        on_load: function () {
            $(".jspsych-content-wrapper").css("height", "700px");
            $(".jspsych-content-wrapper").css("width", "700px");
            $(".jspsych-content-wrapper").scrollTop(0);
        },
        on_finish: function (data) {
            $(".jspsych-content-wrapper").css("height", "700px");
            var parsed_response = JSON.parse(data.responses);
            jsPsych.data.addProperties({
                believabilityconting: parsed_response.Q0,
            });
        },
    };

//Gender
   var genderOptions = ['Male&nbsp', 'Female&nbsp', 'Other&nbsp'];
    var gender = {
        type: 'survey-multi-choice',
        questions: [{ prompt: "Please indicate your gender:", options: genderOptions, required: true }],
        button_label: "continue",
        on_finish: function (data) {
            jsPsych.data.addProperties({
                gender: JSON.parse(data.responses).Q0,
            });
            console.log(data);
        },
    };

//Age
    var age = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: "Please indicate your age:", rows: 1, columns: 10 }],
            button_label: "continue",
        }],
        loop_function: function (data) {
            var res = data.values()[0].responses;
            var res = JSON.parse(res).Q0;
            if (res == "") {
                alert("Please answer the question");
                return true;
            }
        },
        on_finish: function (data) {
            jsPsych.data.addProperties({
                age: JSON.parse(data.responses).Q0,
            });
        },
    };

//Language
    var languageOptions = ['Native speaker&nbsp', 'Very well&nbsp', 'Well&nbsp', 'Average&nbsp', 'Badly&nbsp', 'Very badly&nbsp'];
    var language = {
        type: 'survey-multi-choice',
        questions: [{ prompt: "How well do you speak english?", options: languageOptions, required: true }],
        button_label: "continue",
        on_finish: function (data) {
            jsPsych.data.addProperties({
                language: JSON.parse(data.responses).Q0,
            });
            console.log(data);
        },
    };

// Prolific number
    var Prolific_reported = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: 'Please indicate your Prolific ID:', rows: 3, columns: 60 }],
            button_label: "continue",
        }],
        loop_function: function (data) {
            var res = data.values()[0].responses;
            var res = JSON.parse(res).Q0;
            if (res == "") {
                alert("Please answer the question");
                return true;
            }
        },
        on_finish: function (data) {
            jsPsych.data.addProperties({
                Prolific_reported: JSON.parse(data.responses).Q0,
            });
        },
    };
  
//Comments 
    var Comments = {
        timeline: [{
            type: 'survey-text',
            questions: [{ prompt: 'Do you have any comments regarding the present study? [Optional]', rows: 3, columns: 60 }],
            button_label: "continue",
        }],
        on_finish: function (data) {
            jsPsych.data.addProperties({
                comment: JSON.parse(data.responses).Q0,
            });
        },
    };


  // end insctruction ---------------------------------------------------------------------

  var ending = {
    type: "html-keyboard-response",
    stimulus:
      "<p class='instructions'>Debriefing and survey validation.<p>" +
      "<p class='instructions'>Thank you for your participation! " +
      "First of all, you should know that you did not specifically approached/avoided the blue/yellow groups Video Game task. " +
      "In this experiment, we were more interested in the effect of the instructions you received. " +
      "The aim of this experiment was to test whether the first part of the experiment " +
      "(i.e., the instructions you received in the video game task) " +
      "influenced your responses to the second part. Specifically, we wanted to test to what extent you believed that you approached one group and avoided another group. " +
      "We conducted this study because we would like to make sure that our procedure is credible enough for future research. </br></br>"+
      "If you have any questions / remarks regarding this experiment, please contact me at:</br>marine.rougier@ugent.be</br></br>" +
      "<p class = 'continue-instructions'>Press <strong>space</strong> to continue.</p>",
    choices: [32]
  };

  var ending_2 = {
    type: "html-keyboard-response",
    trial_duration: 2000,
    stimulus:
      "<p class='instructions'>You will now be redirected to Prolific Academic's website " +
      "within seconds.<p>" +
      "<p class='instructions'>If you are not redirected, please click <a href='https://app.prolific.ac/submissions/complete?cc=MEMHX5XQ'>here</a>.<p>",
    choices: jsPsych.NO_KEYS
  };

// end fullscreen -----------------------------------------------------------------------

var fullscreen_trial_exit = {
  type: 'fullscreen',
  fullscreen_mode: false
}


// procedure ----------------------------------------------------------------------------
// Initialize timeline ------------------------------------------------------------------

var timeline = [];

// fullscreen
timeline.push(
  consent,
  fullscreen_trial,
  hiding_cursor);

// prolific verification
timeline.push(save_id);

switch(training_cond) {
  case "cont_instr_vis_G1Y":
    timeline.push(Gene_Instr,
                  vaast_instructions_1,
                  vaast_instructions_2_G1Y,
                  vaast_instructions_3,
                  vaast_instructions_4,
                  vaast_training,
                  vaast_remember_instr_1,
                  vaast_training,
                  vaast_remember_instr_2,
                  vaast_training,
                  vaast_instructions_5,
                  showing_cursor,
                  //likingGrp,
                  reportedAppGrp,
                  believeConting,
                  gender,
                  age,
                  language,
                  Prolific_reported,
                  Comments);
    break;
  case "cont_instr_vis_G1B":
    timeline.push(Gene_Instr,
                  vaast_instructions_1,
                  vaast_instructions_2_G1B,
                  vaast_instructions_3,
                  vaast_instructions_4,
                  vaast_training,
                  vaast_remember_instr_1,
                  vaast_training,
                  vaast_remember_instr_2,
                  vaast_training,
                  vaast_instructions_5,
                  showing_cursor,
                  //likingGrp,
                  reportedAppGrp,
                  believeConting,
                  gender,
                  age,
                  language,
                  Prolific_reported,
                  Comments);
    break;
}


timeline.push(fullscreen_trial_exit);

// ending
  timeline.push(ending,
                ending_2);

// Launch experiment --------------------------------------------------------------------
// preloading ---------------------------------------------------------------------------
// Preloading. For some reason, it appears auto-preloading fails, so using it manually.
// In principle, it should have ended when participants starts VAAST procedure (which)
// contains most of the image that have to be pre-loaded.
var loading_gif = ["media/loading.gif"]
var vaast_instructions_images = ["media/vaast-background.png", "media/keyboard-vaastt.png"];
var vaast_bg_filename = background;

jsPsych.pluginAPI.preloadImages(loading_gif);
jsPsych.pluginAPI.preloadImages(vaast_instructions_images);
jsPsych.pluginAPI.preloadImages(vaast_bg_filename);

// timeline initiaization ---------------------------------------------------------------
https://marinerougier.github.io/Expe6_RC_3appuis/RCmarine2.html


if (is_compatible) {
  jsPsych.init({
    timeline: timeline,
    preload_images: preloadimages,
    max_load_time: 1000 * 500,
    exclusions: {
      min_width: 900,
      min_height: 600,
    },
    on_interaction_data_update: function () {
      saving_browser_events(completion = false);
    },
    on_finish: function() {
          saving_browser_events(completion = true);
          window.location.href = "https://app.prolific.ac/submissions/complete?cc=MEMHX5XQ";
    }
  });
}


