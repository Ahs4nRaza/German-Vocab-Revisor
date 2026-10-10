import { useMemo, useState } from 'react'
import { Alert, Button, Input, Progress, Radio, Space, Typography } from 'antd'
import { normalizeAnswer, shuffle } from '../data/vocab'

const { Title, Text } = Typography

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

export default function QuizView({
  words,
  direction,
  format,
  immediateFeedback,
  onFinish,
}) {
  const [index, setIndex] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [mcqAnswer, setMcqAnswer] = useState(null)
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrong, setWrong] = useState([])

  const current = words[index]
  const expected = getExpected(current, direction)
  const prompt = getPrompt(current, direction)
  const isLast = index + 1 >= words.length

  const mcqOptions = useMemo(
    () => (format === 'mcq' ? buildMcqOptions(words, current, direction) : []),
    // Rebuild options when question changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, format, direction],
  )

  const progressPercent = Math.round(
    ((index + (checked ? 1 : 0)) / words.length) * 100,
  )

  function resetInputs() {
    setTypedAnswer('')
    setMcqAnswer(null)
    setChecked(false)
    setIsCorrect(false)
  }

  function finishOrAdvance(nextCorrect, nextWrong) {
    if (isLast) {
      onFinish({
        correct: nextCorrect,
        total: words.length,
        wrong: nextWrong,
      })
      return
    }

    setCorrectCount(nextCorrect)
    setWrong(nextWrong)
    setIndex((i) => i + 1)
    resetInputs()
  }

  function gradeAnswer(answer, skipped) {
    const ok =
      !skipped &&
      (format === 'typed'
        ? normalizeAnswer(answer) === normalizeAnswer(expected)
        : answer === expected)

    const nextCorrect = ok ? correctCount + 1 : correctCount
    const nextWrong =
      ok
        ? wrong
        : [
            ...wrong,
            {
              prompt,
              expected,
              given: skipped ? 'Skipped' : String(answer),
              skipped,
              german: current.german,
              english: current.english,
            },
          ]

    return { ok, nextCorrect, nextWrong }
  }

  function handleSubmit() {
    const answer = format === 'typed' ? typedAnswer : mcqAnswer
    if (answer == null || String(answer).trim() === '') return

    const { ok, nextCorrect, nextWrong } = gradeAnswer(answer, false)

    if (immediateFeedback) {
      setIsCorrect(ok)
      setChecked(true)
      setCorrectCount(nextCorrect)
      setWrong(nextWrong)
      return
    }

    finishOrAdvance(nextCorrect, nextWrong)
  }

  function handleSkip() {
    const { nextCorrect, nextWrong } = gradeAnswer(null, true)
    finishOrAdvance(nextCorrect, nextWrong)
  }

  function handleNextAfterFeedback() {
    if (isLast) {
      onFinish({
        correct: correctCount,
        total: words.length,
        wrong,
      })
      return
    }

    setIndex((i) => i + 1)
    resetInputs()
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
          <Input
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

      <Space className="quiz-actions">
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
