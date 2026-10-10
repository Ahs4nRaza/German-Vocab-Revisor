import { useMemo, useState } from 'react'
import { Button, Card, Layout, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ThemeSelect from './components/ThemeSelect'
import ModeSelect from './components/ModeSelect'
import ReviseView from './components/ReviseView'
import PracticeSetup from './components/PracticeSetup'
import QuizView from './components/QuizView'
import ResultsView from './components/ResultsView'
import { getWordsBySubcategory, shuffle } from './data/vocab'
import './App.css'

const { Header, Content } = Layout
const { Title, Paragraph } = Typography

export default function App() {
  const [step, setStep] = useState('select')
  const [subcategory, setSubcategory] = useState(null)
  const [mode, setMode] = useState('revise')
  const [direction, setDirection] = useState('de-en')
  const [format, setFormat] = useState('typed')
  const [immediateFeedback, setImmediateFeedback] = useState(false)
  const [quizWords, setQuizWords] = useState([])
  const [quizKey, setQuizKey] = useState(0)
  const [results, setResults] = useState(null)

  const wordCount = useMemo(
    () => (subcategory ? getWordsBySubcategory(subcategory).length : 0),
    [subcategory],
  )

  function resetToSelect() {
    setStep('select')
    setResults(null)
    setQuizWords([])
  }

  function handleContinue() {
    if (!subcategory) return
    if (mode === 'revise') {
      setStep('revise')
    } else {
      setStep('practice-setup')
    }
  }

  function startQuiz() {
    const words = shuffle(getWordsBySubcategory(subcategory))
    setQuizWords(words)
    setQuizKey((k) => k + 1)
    setResults(null)
    setStep('quiz')
  }

  function handleQuizFinish(data) {
    setResults(data)
    setStep('results')
  }

  function handleRetry() {
    startQuiz()
  }

  function showBack() {
    return step !== 'select'
  }

  function handleBack() {
    if (step === 'revise' || step === 'practice-setup') {
      resetToSelect()
    } else if (step === 'quiz') {
      setStep('practice-setup')
    } else if (step === 'results') {
      setStep('practice-setup')
      setResults(null)
    }
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={3} className="app-title">
          German Vocab Revisor
        </Title>
      </Header>
      <Content className="app-content">
        <Card className="app-card">
          {showBack() && (
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              className="back-button"
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {step === 'select' && (
            <div className="select-step">
              <Title level={4}>Choose a theme</Title>
              <Paragraph type="secondary">
                Pick a subcategory, then revise the list or practice with a quiz.
              </Paragraph>
              <Space direction="vertical" size="large" className="select-controls">
                <ThemeSelect value={subcategory} onChange={setSubcategory} />
                <ModeSelect value={mode} onChange={setMode} />
                {subcategory && (
                  <Paragraph type="secondary" className="word-count">
                    {wordCount} words in this subcategory
                  </Paragraph>
                )}
                <Button
                  type="primary"
                  size="large"
                  disabled={!subcategory}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </Space>
            </div>
          )}

          {step === 'revise' && subcategory && (
            <ReviseView subcategory={subcategory} />
          )}

          {step === 'practice-setup' && subcategory && (
            <PracticeSetup
              subcategory={subcategory}
              direction={direction}
              format={format}
              immediateFeedback={immediateFeedback}
              onDirectionChange={setDirection}
              onFormatChange={setFormat}
              onImmediateFeedbackChange={setImmediateFeedback}
              onStart={startQuiz}
            />
          )}

          {step === 'quiz' && quizWords.length > 0 && (
            <QuizView
              key={quizKey}
              words={quizWords}
              direction={direction}
              format={format}
              immediateFeedback={immediateFeedback}
              onFinish={handleQuizFinish}
            />
          )}

          {step === 'results' && results && (
            <ResultsView
              correct={results.correct}
              total={results.total}
              wrong={results.wrong}
              onRetry={handleRetry}
              onChangeTheme={resetToSelect}
            />
          )}
        </Card>
      </Content>
    </Layout>
  )
}
