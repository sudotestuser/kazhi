
var langs =
[['Afrikaans', ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu', ['ms-MY']],
 ['Català', ['ca-ES']],
 ['Čeština', ['cs-CZ']],
 ['Deutsch', ['de-DE']],
 ['English', ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español', ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara', ['eu-ES']],
 ['Français', ['fr-FR']],
 ['Galego', ['gl-ES']],
 ['Hrvatski', ['hr_HR']],
 ['IsiZulu', ['zu-ZA']],
 ['Íslenska', ['is-IS']],
 ['Italiano', ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar', ['hu-HU']],
 ['Nederlands', ['nl-NL']],
 ['Norsk bokmål', ['nb-NO']],
 ['Polski', ['pl-PL']],
 ['Português', ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română', ['ro-RO']],
 ['Slovenčina', ['sk-SK']],
 ['Suomi', ['fi-FI']],
 ['Svenska', ['sv-SE']],
 ['Türkçe', ['tr-TR']],
 ['Български', ['bg-BG']],
 ['Pусский', ['ru-RU']],
 ['Српски', ['sr-RS']],
 ['한국어', ['ko-KR']],
 ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語', ['ja-JP']],
 ['Lingua latīna', ['la']]];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;
showInfo('info_start');

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.display = list[1].length == 1 ? 'none' : 'inline-block';
}

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.className = 'fa fa-microphone fa-2x fa-spin';
    results.style.display = 'block';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.className = 'fa fa-microphone fa-2x';
      showInfo('info_no_speech');
      info_no_speech.style.display = 'block';
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.className = 'fa fa-microphone fa-2x';
      showInfo('info_no_microphone');
      info_no_microphone.style.display = 'block';
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.className = 'fa fa-microphone fa-2x';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
      showInfo('copy_info');
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
  };
}

function upgrade() {
  start_button.style.visibility = 'hidden';
  div_language.style.display = 'none';
  showInfo('info_upgrade');
  info_upgrade.style.display = 'block';
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.className = 'fa fa-microphone fa-2x fa-spin';
  showInfo('info_allow');
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'block' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}
