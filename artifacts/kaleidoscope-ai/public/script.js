(function () {
  'use strict';

  const LOADING_MESSAGE = 'Gemini is weaving your multiverse...';
  const topicForm = document.getElementById('topic-form');
  const topicInput = document.getElementById('topic-input');
  const generateButton = document.getElementById('generate-button');
  const retryButton = document.getElementById('retry-button');
  const newTopicButton = document.getElementById('new-topic-button');
  const readAloudButton = document.getElementById('read-aloud-button');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const results = document.getElementById('results');
  const errorMessage = document.getElementById('error-message');
  const resultsTitle = document.getElementById('results-title');
  const loadingMessage = document.getElementById('loading-message');
  const mindmap = document.getElementById('mindmap');
  const mindmapFallback = document.getElementById('mindmap-fallback');
  const analogyContent = document.getElementById('analogy-content');
  const rapContent = document.getElementById('rap-content');
  const quizList = document.getElementById('quiz-list');
  const quizProgress = document.getElementById('quiz-progress');
  const pageInput = document.getElementById('page-input');
  const pagePreviewWrap = document.getElementById('page-preview-wrap');
  const pagePreview = document.getElementById('page-preview');
  const fileName = document.getElementById('file-name');
  const clearPageButton = document.getElementById('clear-page-button');
  const scanButton = document.getElementById('scan-button');
  const scanStatus = document.getElementById('scan-status');

  let lastTopic = topicInput.value.trim();
  let activeRap = '';
  let mermaidCounter = 0;
  let pageFile = null;
  let pageObjectUrl = '';

  function showOnly(view) {
    [emptyState, loadingState, errorState, results].forEach(function (element) {
      element.hidden = element !== view;
    });
  }

  function setBusy(isBusy) {
    topicInput.disabled = isBusy;
    generateButton.disabled = isBusy;
    scanButton.disabled = isBusy || !pageFile;
    generateButton.querySelector('span').textContent = isBusy ? 'Mapping…' : 'Generate';
    generateButton.setAttribute('aria-busy', String(isBusy));
  }

  function setLoading() {
    loadingMessage.textContent = LOADING_MESSAGE;
    setBusy(true);
    showOnly(loadingState);
  }

  function setError(message) {
    errorMessage.textContent = message || 'Something unexpected happened. Try another topic.';
    setBusy(false);
    showOnly(errorState);
  }

  function setScanStatus(message, state) {
    scanStatus.textContent = message;
    scanStatus.className = 'scan-status' + (state ? ' is-' + state : '');
  }

  function clearPage() {
    pageFile = null;
    if (pageObjectUrl) {
      URL.revokeObjectURL(pageObjectUrl);
      pageObjectUrl = '';
    }
    pageInput.value = '';
    pagePreview.removeAttribute('src');
    pagePreviewWrap.hidden = true;
    fileName.textContent = 'Choose an image';
    setScanStatus('Your image stays in memory while it is read.');
    setBusy(false);
  }

  function handlePageSelected() {
    const selectedFile = pageInput.files && pageInput.files[0];
    if (!selectedFile) return;

    if (!/^image\/(jpeg|png|webp|gif)$/i.test(selectedFile.type)) {
      clearPage();
      setScanStatus('Choose a JPG, PNG, WEBP, or GIF image.', 'error');
      return;
    }
    if (selectedFile.size > 8 * 1024 * 1024) {
      clearPage();
      setScanStatus('That image is too large. Keep it under 8 MB.', 'error');
      return;
    }

    pageFile = selectedFile;
    pageObjectUrl = URL.createObjectURL(selectedFile);
    pagePreview.src = pageObjectUrl;
    pagePreviewWrap.hidden = false;
    fileName.textContent = selectedFile.name;
    setScanStatus('Ready to scan. We’ll identify the page’s main idea.');
    setBusy(false);
  }

  async function scanPage() {
    if (!pageFile) {
      setScanStatus('Choose a textbook image first.', 'error');
      pageInput.click();
      return;
    }

    scanButton.disabled = true;
    pageInput.disabled = true;
    clearPageButton.disabled = true;
    setScanStatus('Reading the page and finding its signal…');

    const formData = new FormData();
    formData.append('page', pageFile);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });
      let payload = {};
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = {};
      }
      if (!response.ok) {
        throw new Error(payload.error || 'The vision scanner returned an error.');
      }

      const topic = textValue(payload.topic, '');
      if (!topic) {
        throw new Error('No clear topic was found on that page.');
      }
      topicInput.value = topic;
      topicInput.dispatchEvent(new Event('input', { bubbles: true }));
      const confidence =
        typeof payload.confidence === 'number'
          ? ' · ' + Math.round(payload.confidence * 100) + '% confidence'
          : '';
      setScanStatus('Found “' + topic + '”' + confidence + '. Building your learning set…', 'success');
      await generate(topic);
    } catch (error) {
      setScanStatus(error.message || 'We could not read that page. Try another image.', 'error');
      scanButton.disabled = false;
      pageInput.disabled = false;
      clearPageButton.disabled = false;
    }
  }

  function textValue(value, fallback) {
    if (typeof value === 'string') return value.trim();
    if (value === null || value === undefined) return fallback || '';
    return String(value).trim();
  }

  function normalizeQuestion(question) {
    const item = question && typeof question === 'object' ? question : {};
    const rawOptions = Array.isArray(item.options)
      ? item.options.map(function (option) {
          return typeof option === 'object'
            ? textValue(option.text || option.label || option.value, '')
            : textValue(option, '');
        }).filter(Boolean)
      : [];
    let correctIndex = Number(item.correctIndex ?? item.answerIndex ?? item.correct_option);
    const correctValue = textValue(item.correctAnswer ?? item.answer ?? item.correct, '');

    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= rawOptions.length) {
      correctIndex = rawOptions.findIndex(function (option) {
        return /\(correct\)\s*$/i.test(option);
      });
    }

    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= rawOptions.length) {
      correctIndex = rawOptions.findIndex(function (option) {
        return option.toLowerCase() === correctValue.toLowerCase();
      });
    }

    return {
      question: textValue(item.question || item.prompt || item.text, 'Which pattern belongs here?'),
      options: rawOptions.map(function (option) {
        return option.replace(/\s*\(correct\)\s*$/i, '').trim();
      }).slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : null
    };
  }

  function normalizePayload(payload) {
    const data = payload && typeof payload === 'object' && payload.data
      ? payload.data
      : payload || {};
    const rawQuestions = Array.isArray(data.questions)
      ? data.questions
      : Array.isArray(data.quiz)
        ? data.quiz
        : [];

    return {
      mermaid: textValue(data.mermaid || data.mindmap || data.diagram, ''),
      analogy: textValue(data.analogy, 'The everyday connection is still coming into focus.'),
      rap: textValue(data.rap || data.memoryRap, 'Find the beat, then find the pattern.'),
      questions: rawQuestions.slice(0, 3).map(normalizeQuestion)
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderText(container, value) {
    container.textContent = value;
  }

  async function renderMermaid(source) {
    mindmap.innerHTML = '';
    mindmapFallback.hidden = true;
    if (!source) {
      mindmapFallback.textContent = 'No visual map was returned for this topic.';
      mindmapFallback.hidden = false;
      return;
    }

    const mermaidApi = window.mermaid;
    if (!mermaidApi) {
      mindmapFallback.textContent = source;
      mindmapFallback.hidden = false;
      return;
    }

    try {
      mermaidApi.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict',
        themeVariables: {
          darkMode: true,
          background: '#111632',
          primaryColor: '#28204b',
          primaryTextColor: '#eef0ff',
          primaryBorderColor: '#b39cff',
          lineColor: '#9ee8cd',
          secondaryColor: '#193b4b',
          tertiaryColor: '#47313e',
          fontFamily: 'Space Grotesk, sans-serif'
        }
      });
      mermaidCounter += 1;
      const rendered = await mermaidApi.render('kaleidoscope-map-' + mermaidCounter, source);
      mindmap.innerHTML = rendered.svg;
      if (typeof rendered.bindFunctions === 'function') {
        rendered.bindFunctions(mindmap);
      }
    } catch (error) {
      mindmapFallback.textContent = source;
      mindmapFallback.hidden = false;
    }
  }

  function renderQuiz(questions) {
    quizList.innerHTML = '';
    const visibleQuestions = questions.length ? questions : [{
      question: 'What would you like to test yourself on first?',
      options: ['The core idea', 'A surprising detail', 'The big connection', 'The vocabulary'],
      correctIndex: null
    }];

    visibleQuestions.forEach(function (item, questionIndex) {
      const card = document.createElement('article');
      card.className = 'quiz-card';
      card.dataset.question = String(questionIndex);

      const optionButtons = item.options.length
        ? item.options.map(function (option, optionIndex) {
            const letter = String.fromCharCode(65 + optionIndex);
            return '<button class="quiz-option" type="button" data-question="' + questionIndex + '" data-option="' + optionIndex + '">' +
              '<span class="option-letter" aria-hidden="true">' + letter + '</span>' +
              '<span>' + escapeHtml(option) + '</span>' +
              '</button>';
          }).join('')
        : '<p class="quiz-feedback">No options were returned for this question.</p>';

      card.innerHTML =
        '<div class="quiz-number">0' + (questionIndex + 1) + ' / 03</div>' +
        '<p class="quiz-question">' + escapeHtml(item.question) + '</p>' +
        '<div class="quiz-options">' + optionButtons + '</div>' +
        '<p class="quiz-feedback" aria-live="polite"></p>';
      card._questionData = item;
      quizList.appendChild(card);
    });

    updateQuizProgress();
  }

  function updateQuizProgress() {
    const answered = quizList.querySelectorAll('.quiz-card.is-answered').length;
    quizProgress.textContent = answered + ' / ' + quizList.querySelectorAll('.quiz-card').length + ' answered';
  }

  function handleQuizClick(event) {
    const button = event.target.closest('.quiz-option');
    if (!button || button.disabled) return;

    const card = button.closest('.quiz-card');
    if (!card) return;
    const question = card._questionData;
    const selected = Number(button.dataset.option);
    const isCorrect = question.correctIndex !== null && selected === question.correctIndex;
    const feedback = card.querySelector('.quiz-feedback');

    if (isCorrect) {
      card.classList.add('is-answered');
      card.querySelectorAll('.quiz-option').forEach(function (optionButton) {
        optionButton.disabled = true;
        if (optionButton === button) {
          optionButton.classList.add('is-correct');
        }
      });
    } else {
      button.disabled = true;
      button.classList.add('is-wrong');
    }
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'wrong');
    feedback.textContent = isCorrect
      ? '✅ Correct!'
      : '❌ Not quite. Try again!';
    updateQuizProgress();
  }

  function renderResults(topic, payload) {
    const data = normalizePayload(payload);
    resultsTitle.textContent = topic;
    renderText(analogyContent, data.analogy);
    renderText(rapContent, data.rap);
    activeRap = data.rap;
    renderQuiz(data.questions);
    showOnly(results);
    setBusy(false);
    renderMermaid(data.mermaid);
  }

  async function generate(topic) {
    const cleanTopic = textValue(topic, '');
    if (!cleanTopic) {
      topicInput.focus();
      topicInput.setCustomValidity('Enter a topic to explore.');
      topicInput.reportValidity();
      return;
    }
    topicInput.setCustomValidity('');
    lastTopic = cleanTopic;
    setLoading();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ topic: cleanTopic })
      });
      let payload = {};
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = {};
      }
      if (!response.ok) {
        throw new Error(payload.error || payload.message || 'The learning engine returned an error.');
      }
      renderResults(cleanTopic, payload);
    } catch (error) {
      setError(error.message || 'We could not reach the learning engine. Try again.');
    }
  }

  function stopReading() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    readAloudButton.setAttribute('aria-pressed', 'false');
    readAloudButton.querySelector('span:last-child').textContent = 'Read Aloud';
  }

  function toggleReadAloud() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      readAloudButton.querySelector('span:last-child').textContent = 'Audio unavailable';
      return;
    }
    if (window.speechSynthesis.speaking) {
      stopReading();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(activeRap);
    utterance.rate = 0.92;
    utterance.pitch = 1.04;
    utterance.onend = stopReading;
    utterance.onerror = stopReading;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    readAloudButton.setAttribute('aria-pressed', 'true');
    readAloudButton.querySelector('span:last-child').textContent = 'Stop Reading';
  }

  topicForm.addEventListener('submit', function (event) {
    event.preventDefault();
    generate(topicInput.value);
  });

  retryButton.addEventListener('click', function () {
    generate(lastTopic || topicInput.value);
  });

  newTopicButton.addEventListener('click', function () {
    stopReading();
    showOnly(emptyState);
    topicInput.disabled = false;
    topicInput.focus();
    topicInput.select();
  });

  readAloudButton.addEventListener('click', toggleReadAloud);
  quizList.addEventListener('click', handleQuizClick);
  pageInput.addEventListener('change', handlePageSelected);
  scanButton.addEventListener('click', scanPage);
  clearPageButton.addEventListener('click', clearPage);

  document.querySelectorAll('.suggestion').forEach(function (button) {
    button.addEventListener('click', function () {
      topicInput.value = button.dataset.topic || '';
      topicInput.focus();
      topicInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  topicInput.addEventListener('input', function () {
    topicInput.setCustomValidity('');
  });
})();