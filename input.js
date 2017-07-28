// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList

// === Helper Functions ===
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// === Main ===
// Loop through each tag element, add button and even handling
var speechEls = document.getElementsByClassName('speech-input');
[].forEach.call(speechEls, function(speechEl) {

  // --- Style ---
  var nextNode = speechEl.nextSibling;
  var parentNode = speechEl.parentNode;

  // Create mic button if not present
//  var micBtn = parentNode.querySelector('.si-btn');
//  if (!micBtn) {
  var micBtn = document.createElement('button');
  micBtn.type = 'button';
  micBtn.classList.add('si-btn');

  var faMicIcon = document.createElement('span');
  faMicIcon.classList.add('fa')
  faMicIcon.classList.add('fa-microphone')

  micBtn.appendChild(faMicIcon);
  parentNode.appendChild(micBtn);

// ADD SOME CSS for following
      // size and position mic and input
//      micBtn.style.cursor = 'pointer';
//      micBtn.style.top = 0.125 * buttonSize + 'px';
//      micBtn.style.height = micBtn.style.width = buttonSize + 'px';
//      speechEl.style.paddingRight = buttonSize - inputRightBorder + 'px';


  // --- Speech Recognition ---
  // Defaults
  var isSentence;
  var timeout;
  var patience = 10;  // seconds
  var recognizing = false;
  var oldPlaceholder = null;
  var finalTranscript = '';
  var defaultListeningPlaceholder = 'Speak now, or forever hold you peace!'

  var recognition = new webkitSpeechRecognition();

//  recognition.continuous = true;
//  recognition.interimResults = true;
//  recognition.continuous = false;
//  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.interimResults = true;
//  recognition.maxAlternatives = 1;
  recognition.lang = 'en-GB';  // set default language

  // Custom (per-speech element) config
  if (speechEl.lang) recognition.lang = speechEl.lang;

  // --- Helper (Speech) Functions ---
  function restartTimer() {
    timeout = setTimeout(function() {
      recognition.stop();
    }, patience * 1000);
  }


  // --- Speech Event Handlers ---
  recognition.onstart = function() {
    oldPlaceholder = speechEl.placeholder;
    speechEl.placeholder = speechEl.dataset.ready || defaultListeningPlaceholder;
    recognizing = true;
    micBtn.classList.add('listening');
    restartTimer();
  };

  recognition.onend = function() {
    micBtn.classList.remove('listening');
    if (oldPlaceholder !== null) speechEl.placeholder = oldPlaceholder;

    recognizing = false;
    clearTimeout(timeout);
  };

  recognition.onresult = function(event) {
      clearTimeout(timeout);

      // get SpeechRecognitionResultList object
      var resultList = event.results;

      // go through each SpeechRecognitionResult object in the list
      var interimTranscript = '';
      for (var i = event.resultIndex; i < resultList.length; ++i) {
          var result = resultList[i];

          // get this result's first SpeechRecognitionAlternative object
          var firstAlternative = result[0];

          if (result.isFinal) {
              finalTranscript += firstAlternative.transcript;
          } else {
              interimTranscript += firstAlternative.transcript;
          }
      }

      // capitalize transcript if start of new sentence
      var transcript = finalTranscript || interimTranscript;
      transcript = isSentence ? capitalize(transcript) : transcript;

      // append transcript to cached input value
//      speechEl.value = prefix + transcript;
      speechEl.value = transcript;

      // set cursor and scroll to end
      speechEl.focus();
      if (speechEl.tagName === 'INPUT') {
          speechEl.scrollLeft = speechEl.scrollWidth;
      } else {
          speechEl.scrollTop = speechEl.scrollHeight;
      }

      restartTimer();
  };

  // --- Event ---
  // Link button to SpeechRecognition
  micBtn.addEventListener('click', function(event) {
      event.preventDefault();

      // Stop and exit if already recognizing
      if (recognizing) {
          recognition.stop();
          return;
      }

      // Cache current input value which the new transcript will be appended to
//      var endsWithWhitespace = speechEl.value.slice(-1).match(/\s/);
//      prefix = !speechEl.value || endsWithWhitespace ? speechEl.value : speechEl.value + ' ';

      // check if value ends with a sentence
//      isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);

      // restart recognition
      finalTranscript = '';
      speechEl.value = '';
      recognition.start();
  }, false);
});