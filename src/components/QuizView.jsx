import { useMemo, useRef, useState } from 'react'
import { Alert, Button, Input, Progress, Radio, Space, Typography } from 'antd'
import { normalizeAnswer, shuffle } from '../data/vocab'

const { Title, Text } = Typography

const UMLAUTS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

function getPrompt(word, direction) {
  return direction === 'de-en' ? word.german : word.english
}

function getExpected(word, direction) {
  return direction === 'de-en' ? word.english : word.german
}

function buildMcqOptions(words, current, direction) {
  const correct = getExpected(current, direction)
  const distractors = shuffle(
    words
      .filter((w) => w !== current)
      .map((w) => getExpected(w, direction)),
  ).slice(0, 3)

  return shuffle([correct, ...distractors])
}

function gradeEntry(word, direction, format, entry) {
  if (!entry || entry.skipped) {
    return {
      ok: false,
      miss: {
        prompt: getPrompt(word, direction),
        expected: getExpected(word, direction),
        given: 'Skipped',
        skipped: true,
        german: word.german,
        english: word.english,
      },
    }
  }

  const expected = getExpected(word, direction)
  const ok =
    format === 'typed'
      ? normalizeAnswer(entry.value) === normalizeAnswer(expected)
      : entry.value === expected

  if (ok) return { ok: true, miss: null }

  return {
    ok: false,
    miss: {
      prompt: getPrompt(word, direction),
      expected,
      given: String(entry.value),
      skipped: false,
      german: word.german,
      english: word.english,
    },
  }
}

function scoreAll(words, direction, format, answers) {
  let correct = 0
  const wrong = []

  words.forEach((word, i) => {
    const { ok, miss } = gradeEntry(word, direction, format, answers[i])
    if (ok) correct += 1
    else if (miss) wrong.push(miss)
  })

  return { correct, total: words.length, wrong }
}

export default function QuizView({
  words,
  direction,
  format,
  immediateFeedback,
  onFinish,
}) {
  const inputRef = useRef(null)
  const mcqOptionsCache = useRef(new Map())
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => words.map(() => null))
  const [typedAnswer, setTypedAnswer] = useState('')
  const [mcqAnswer, setMcqAnswer] = useState(null)
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const current = words[index]
  const expected = getExpected(current, direction)
  const prompt = getPrompt(current, direction)
  const isLast = index + 1 >= words.length
  const canGoBack = index > 0 && !checked
  const showUmlauts = format === 'typed' && direction === 'en-de'

  const mcqOptions = useMemo(() => {
    if (format !== 'mcq') return []
    if (!mcqOptionsCache.current.has(index)) {
      mcqOptionsCache.current.set(
        index,
        buildMcqOptions(words, current, direction),
      )
    }
    return mcqOptionsCache.current.get(index)
    // Cache per question index so going back keeps the same options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, format, direction])

  const answeredCount = answers.filter((a) => a != null).length
  const progressPercent = Math.round((answeredCount / words.length) * 100)

  function readCurrentEntry() {
    if (format === 'typed') {
      if (typedAnswer.trim() === '') return null
      return { value: typedAnswer, skipped: false }
    }
    if (mcqAnswer == null) return null
    return { value: mcqAnswer, skipped: false }
  }

  function loadQuestion(nextIndex, nextAnswers = answers) {
    const saved = nextAnswers[nextIndex]
    setIndex(nextIndex)
    setChecked(false)
    setIsCorrect(false)

    if (!saved || saved.skipped) {
      setTypedAnswer('')
      setMcqAnswer(null)
      return
    }

    if (format === 'typed') {
      setTypedAnswer(String(saved.value ?? ''))
      setMcqAnswer(null)
    } else {
      setMcqAnswer(saved.value)
      setTypedAnswer('')
    }
  }

  function insertUmlaut(char) {
    if (checked) return

    const el = inputRef.current?.input
    const start = el?.selectionStart ?? typedAnswer.length
    const end = el?.selectionEnd ?? typedAnswer.length
    const next = typedAnswer.slice(0, start) + char + typedAnswer.slice(end)
    setTypedAnswer(next)

    requestAnimationFrame(() => {
      el?.focus()
      const pos = start + char.length
      el?.setSelectionRange(pos, pos)
    })
  }

  function finishWith(nextAnswers) {
    onFinish(scoreAll(words, direction, format, nextAnswers))
  }

  function goToNext(nextAnswers) {
    if (isLast) {
      finishWith(nextAnswers)
      return
    }
    loadQuestion(index + 1, nextAnswers)
  }

  function handleSubmit() {
    const entry = readCurrentEntry()
    if (!entry) return

    const nextAnswers = [...answers]
    nextAnswers[index] = entry
    setAnswers(nextAnswers)

    if (immediateFeedback) {
      const { ok } = gradeEntry(current, direction, format, entry)
      setIsCorrect(ok)
      setChecked(true)
      return
    }

    goToNext(nextAnswers)
  }

  function handleSkip() {
    const nextAnswers = [...answers]
    nextAnswers[index] = { value: null, skipped: true }
    setAnswers(nextAnswers)
    goToNext(nextAnswers)
  }

  function handleNextAfterFeedback() {
    goToNext(answers)
  }

  function handleBack() {
    if (!canGoBack) return

    const draft = readCurrentEntry()
    const nextAnswers = [...answers]
    if (draft) nextAnswers[index] = draft
    setAnswers(nextAnswers)
    loadQuestion(index - 1, nextAnswers)
  }

  const canSubmit =
    !checked &&
    (format === 'typed' ? typedAnswer.trim().length > 0 : mcqAnswer != null)

  const primaryLabel = immediateFeedback
    ? 'Check'
    : isLast
      ? 'Finish'
      : 'Next'

  return (
    <div className="quiz-view">
      <div className="quiz-progress">
        <Text>
          Question {index + 1} of {words.length}
        </Text>
        <Progress percent={progressPercent} showInfo={false} />
      </div>

      <Title level={3} className="quiz-prompt">
        {prompt}
      </Title>
      <Text type="secondary">
        {direction === 'de-en' ? 'Translate to English' : 'Translate to German'}
      </Text>

      <div className="quiz-answer">
        {format === 'typed' ? (
          <>
            <Input
              ref={inputRef}
              size="large"
              placeholder="Type your answer"
              value={typedAnswer}
              disabled={checked}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onPressEnter={() => {
                if (canSubmit) handleSubmit()
                else if (checked) handleNextAfterFeedback()
              }}
            />
            {showUmlauts && (
              <div className="umlaut-bar">
                {UMLAUTS.map((char) => (
                  <Button
                    key={char}
                    size="small"
                    disabled={checked}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertUmlaut(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            )}
          </>
        ) : (
          <Radio.Group
            className="mcq-group"
            value={mcqAnswer}
            disabled={checked}
            onChange={(e) => setMcqAnswer(e.target.value)}
          >
            {mcqOptions.map((opt) => (
              <Radio key={opt} value={opt}>
                {opt}
              </Radio>
            ))}
          </Radio.Group>
        )}
      </div>

      {immediateFeedback && checked && (
        <Alert
          className="quiz-feedback"
          type={isCorrect ? 'success' : 'error'}
          showIcon
          message={isCorrect ? 'Correct!' : 'Incorrect'}
          description={
            isCorrect ? null : (
              <span>
                Correct answer: <strong>{expected}</strong>
              </span>
            )
          }
        />
      )}

      <Space className="quiz-actions" wrap>
        <Button size="large" disabled={!canGoBack} onClick={handleBack}>
          Previous
        </Button>
        {!checked ? (
          <>
            <Button
              type="primary"
              size="large"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {primaryLabel}
            </Button>
            <Button size="large" onClick={handleSkip}>
              Skip
            </Button>
          </>
        ) : (
          <Button type="primary" size="large" onClick={handleNextAfterFeedback}>
            {isLast ? 'See results' : 'Next'}
          </Button>
        )}
      </Space>
    </div>
  )
}
